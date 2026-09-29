import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  isValidAction,
  isValidPinggyUrl,
  isValidSessionId,
  buildCommandUrl,
} from "@/lib/validators";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    // 1. Limitação de taxa para evitar flooding no túnel e no servidor desktop
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`cmd:${clientIp}`, 15, 3000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições em pouco tempo. Aguarde um instante." },
        { status: 429 }
      );
    }

    // 2. Leitura e validação do payload
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corpo da requisição deve ser um JSON válido." },
        { status: 400 }
      );
    }

    const { action, sessionId, pinggyUrl } = body || {};

    // 3. Validação do comando/ação solicitada
    if (!action || !isValidAction(action)) {
      return NextResponse.json(
        {
          error:
            "Ação inválida. Ações permitidas: next, previous, fullscreen, exit-fullscreen.",
        },
        { status: 400 }
      );
    }

    let targetPinggyUrl = pinggyUrl;

    // 4. Se o sessionId foi fornecido, busca o túnel verificado diretamente no MongoDB
    // Isso previne SSRF de ponta a ponta e garante a integridade da sessão
    if (sessionId) {
      if (!isValidSessionId(sessionId)) {
        return NextResponse.json(
          { error: "Formato de Session ID inválido." },
          { status: 400 }
        );
      }

      try {
        const client = await clientPromise;
        const db = client.db();
        const session = await db.collection("sessions").findOne({ sessionId });

        if (!session) {
          return NextResponse.json(
            { error: "Sessão não encontrada ou já expirada." },
            { status: 404 }
          );
        }

        // Verifica se a sessão expirou
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
          return NextResponse.json(
            { error: "Sessão expirada. Reinicie o servidor no computador." },
            { status: 410 }
          );
        }

        targetPinggyUrl = session.pinggyUrl;
      } catch (dbError) {
        console.error("Erro ao buscar sessão no DB para comando:", dbError);
        // Se falhar o banco mas houver pinggyUrl fornecido pelo cliente, valida a URL do cliente como fallback
      }
    }

    // 5. Validação rigorosa contra SSRF da URL de destino
    if (!targetPinggyUrl || !isValidPinggyUrl(targetPinggyUrl)) {
      return NextResponse.json(
        {
          error:
            "URL de conexão não configurada, inválida ou de domínio não autorizado.",
        },
        { status: 400 }
      );
    }

    // 6. Constrói de forma segura a URL do endpoint no servidor desktop
    const finalUrl = buildCommandUrl(targetPinggyUrl, action);

    // 7. Envia o comando para o servidor com timeout de segurança (5 segundos)
    try {
      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "X-Pinggy-No-Screen": "true",
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "Servidor ocupado. Aguarde um instante entre os cliques.",
          },
          { status: 429 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          { error: "Token de segurança rejeitado pelo servidor local." },
          { status: 403 }
        );
      }

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `O servidor local retornou erro (HTTP ${response.status}).`,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        action,
        timestamp: Date.now(),
      });
    } catch (fetchError) {
      if (fetchError.name === "TimeoutError") {
        return NextResponse.json(
          {
            error:
              "Tempo limite esgotado: o computador não respondeu a tempo.",
          },
          { status: 504 }
        );
      }
      return NextResponse.json(
        {
          error:
            "Não foi possível conectar ao computador. Verifique se o piSlideControl está aberto.",
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Erro interno no proxy de comando:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar comando." },
      { status: 500 }
    );
  }
}

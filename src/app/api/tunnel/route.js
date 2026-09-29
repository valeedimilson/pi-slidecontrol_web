import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { isValidSessionId, isValidPinggyUrl } from "@/lib/validators";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

let ttlIndexEnsured = false;

async function ensureIndexes(db) {
  if (ttlIndexEnsured) return;
  try {
    await db.collection("sessions").createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, background: true }
    );
    await db.collection("sessions").createIndex(
      { sessionId: 1 },
      { unique: true, background: true }
    );
    ttlIndexEnsured = true;
  } catch (err) {
    // Silencia se já existir
  }
}

// GET: Responde com os dados do túnel ativo para uma dada sessão
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId || !isValidSessionId(sessionId)) {
    return NextResponse.json(
      { error: "Session ID ausente ou inválido." },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const session = await db.collection("sessions").findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 404 }
      );
    }

    // Validação de expiração da sessão
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Sessão expirada. Reinicie o aplicativo no computador." },
        { status: 410 }
      );
    }

    // Retorna apenas as propriedades públicas necessárias (sem _id interno)
    return NextResponse.json(
      {
        sessionId: session.sessionId,
        pinggyUrl: session.pinggyUrl,
        lastUpdated: session.lastUpdated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no GET /api/tunnel:", error);
    return NextResponse.json(
      { error: "Erro ao consultar o status da sessão." },
      { status: 500 }
    );
  }
}

// POST: Recebe do servidor desktop Python a URL do túnel Pinggy gerada
export async function POST(request) {
  try {
    // Rate limit para o endpoint de registro de túneis
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`tun_post:${clientIp}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Limite de sincronizações excedido. Aguarde." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Payload JSON inválido." },
        { status: 400 }
      );
    }

    const { sessionId, pinggyUrl } = body || {};

    if (!sessionId || !isValidSessionId(sessionId)) {
      return NextResponse.json(
        { error: "Formato de Session ID inválido." },
        { status: 400 }
      );
    }

    if (!pinggyUrl || !isValidPinggyUrl(pinggyUrl)) {
      return NextResponse.json(
        {
          error:
            "URL de túnel inválida, insegura ou de domínio não autorizado.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    await ensureIndexes(db);

    const now = new Date();
    // A sessão é configurada para expirar automaticamente em 6 horas se inativa
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    await db.collection("sessions").updateOne(
      { sessionId },
      {
        $set: {
          pinggyUrl,
          lastUpdated: now,
          expiresAt: expiresAt,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      { success: true, message: "Túnel sincronizado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no POST /api/tunnel:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar túnel no banco de dados." },
      { status: 500 }
    );
  }
}

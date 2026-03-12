import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Esta função vai RESPONDER ao celular do usuário com o link atual do Pinggy
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID é obrigatório" },
      { status: 400 },
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(); // Usa o banco definido na string de conexão

    const session = await db.collection("sessions").findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { error: "Sessão não encontrada ou expirada" },
        { status: 404 },
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar sessão" },
      { status: 500 },
    );
  }
}

// Esta função vai RECEBER do servidor Python a nova URL a cada 58 minutos
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, pinggyUrl } = body;

    if (!sessionId || !pinggyUrl) {
      return NextResponse.json(
        { error: "Faltam dados: sessionId ou pinggyUrl" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const now = new Date();
    // Adiciona 6 horas para expirar a sessão inteira
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // O "upsert" cria um documento novo se o sessionId não existir, ou atualiza se já existir
    const result = await db.collection("sessions").updateOne(
      { sessionId },
      {
        $set: {
          pinggyUrl,
          lastUpdated: now,
        },
        $setOnInsert: {
          createdAt: now,
          expiresAt: expiresAt,
        },
      },
      { upsert: true },
    );

    return NextResponse.json(
      { success: true, message: "Túnel atualizado!", data: result },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro no POST /api/tunnel:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar túnel" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { pinggyUrl, action } = body;

    if (!pinggyUrl || !action) {
      return NextResponse.json(
        { error: "Faltam parâmetros: pinggyUrl ou action" },
        { status: 400 },
      );
    }

    // Separa a base da URL do token, igual fizemos antes
    const urlObj = new URL(pinggyUrl);
    const finalUrl = `${urlObj.origin}/${action}${urlObj.search}`;

    // O servidor Vercel faz a requisição diretamente para o Pinggy.
    // Como é de servidor para servidor, o CORS não existe aqui!
    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "X-Pinggy-No-Screen": "true", // O Pinggy vai aceitar direto
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "O servidor local recusou o comando" },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no proxy de comando:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}

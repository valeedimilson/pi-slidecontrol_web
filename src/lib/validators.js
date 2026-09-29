/**
 * Utilitários de validação e sanitização para segurança do pi-slidecontrol_web
 */

export const ALLOWED_ACTIONS = new Set([
  "next",
  "previous",
  "fullscreen",
  "exit-fullscreen",
]);

/**
 * Valida se a ação informada está na lista segura de comandos suportados pelo servidor.
 */
export function isValidAction(action) {
  return typeof action === "string" && ALLOWED_ACTIONS.has(action.trim());
}

/**
 * Valida o sessionId gerado pelo Python secrets.token_urlsafe(16).
 * Deve ser alfanumérico, com hífens ou underscores, entre 10 e 64 caracteres.
 */
export function isValidSessionId(sessionId) {
  if (!sessionId || typeof sessionId !== "string") return false;
  return /^[a-zA-Z0-9_-]{10,64}$/.test(sessionId.trim());
}

/**
 * Valida a URL do túnel Pinggy para mitigar Server-Side Request Forgery (SSRF)
 * e injeção de endpoints arbitrários.
 */
export function isValidPinggyUrl(urlStr) {
  if (!urlStr || typeof urlStr !== "string") return false;

  try {
    const parsed = new URL(urlStr);

    // Em ambiente de desenvolvimento local, aceita localhost e 127.0.0.1
    if (process.env.NODE_ENV === "development") {
      if (
        parsed.protocol === "http:" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      ) {
        return Boolean(parsed.searchParams.get("token"));
      }
    }

    // Túneis remotos obrigam protocolo seguro HTTPS
    if (parsed.protocol !== "https:") {
      return false;
    }

    // Validação estrita de domínio oficial do Pinggy (*.pinggy.link, *.pinggy.io, *.pinggy.net, *.pinggy-free.link)
    // Exemplos reais do Pinggy: rnwbq-187-19-14-12.a.pinggy.link, xxx.free.pinggy.net ou xxx.run.pinggy-free.link
    const isPinggyHost = /^[a-zA-Z0-9-.]+\.pinggy(-free)?\.(link|io|net)$/i.test(
      parsed.hostname
    );
    if (!isPinggyHost) {
      return false;
    }

    // Prevenção de resolução para metadados ou IPs internos disfarçados
    if (
      parsed.hostname === "169.254.169.254" ||
      parsed.hostname === "metadata.google.internal" ||
      parsed.hostname === "localhost"
    ) {
      return false;
    }

    // O parâmetro token é obrigatório para autenticar no backend do piSlideControl
    const token = parsed.searchParams.get("token");
    if (!token || token.length < 8) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Constrói a URL final de comando de maneira segura, garantindo que o caminho
 * seja exatamente o endpoint permitido e preservando os parâmetros originais de autenticação (token).
 */
export function buildCommandUrl(pinggyUrl, action) {
  const urlObj = new URL(pinggyUrl);
  const safeTarget = new URL(urlObj.origin);
  safeTarget.pathname = `/${action.trim()}`;
  safeTarget.search = urlObj.search;
  return safeTarget.toString();
}

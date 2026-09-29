/**
 * Limitador de taxa simples baseado em janela deslizante em memória.
 * Ajuda a mitigar ataques de flooding, spam e negação de serviço nos endpoints da API.
 */

const tracker = new Map();

// Limpeza periódica de IPs inativos a cada 5 minutos
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of tracker.entries()) {
    if (now > record.resetTime) {
      tracker.delete(key);
    }
  }
}

/**
 * Verifica se a requisição de uma chave excede o limite.
 * @param {string} key Identificador (ex: IP ou sessionId)
 * @param {number} maxRequests Número máximo de requisições permitidas na janela
 * @param {number} windowMs Janela de tempo em milissegundos
 * @returns {{ allowed: boolean, remaining: number }}
 */
export function checkRateLimit(key, maxRequests = 20, windowMs = 5000) {
  cleanup();

  const now = Date.now();
  const record = tracker.get(key);

  if (!record || now > record.resetTime) {
    tracker.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

/**
 * Extrai o IP do cliente a partir dos cabeçalhos da requisição
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown-ip";
}

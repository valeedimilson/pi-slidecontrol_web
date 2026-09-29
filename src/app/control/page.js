"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ControlApp() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [pinggyUrl, setPinggyUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeCommand, setActiveCommand] = useState(null);
  const [toast, setToast] = useState(null); // { message, type: 'info' | 'error' | 'success' }

  const lastCommandTime = useRef(0);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  }, []);

  const fetchTunnelUrl = useCallback(async () => {
    if (!sessionId) {
      setError("ID de sessão ausente na URL. Por favor, escaneie o QR Code novamente.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/tunnel?sessionId=${encodeURIComponent(sessionId)}`);
      if (response.status === 410) {
        throw new Error("Sessão expirada. Gere um novo QR Code no computador.");
      }
      if (!response.ok) {
        throw new Error("Sessão não encontrada ou computador desconectado.");
      }
      const data = await response.json();
      setPinggyUrl(data.pinggyUrl);
      setLastUpdated(new Date(data.lastUpdated));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Polling com respeito à visibilidade da aba para economizar bateria
  useEffect(() => {
    fetchTunnelUrl();

    let intervalId = null;

    const startPolling = () => {
      if (!intervalId) {
        intervalId = setInterval(() => {
          if (document.visibilityState === "visible") {
            fetchTunnelUrl();
          }
        }, 12000);
      }
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTunnelUrl();
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [fetchTunnelUrl]);

  // Envio de comando com debounce client-side (250ms)
  const sendCommand = useCallback(
    async (action) => {
      const now = Date.now();
      if (now - lastCommandTime.current < 250) {
        return; // Debounce contra cliques acidentais ultra-rápidos
      }
      lastCommandTime.current = now;

      if (!pinggyUrl && !sessionId) {
        showToast("Aguarde a conexão com o computador...", "error");
        return;
      }

      // Feedback tátil no mobile
      if (typeof window !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(35);
        } catch {}
      }

      setIsExecuting(true);
      setActiveCommand(action);

      try {
        const response = await fetch("/api/command", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            pinggyUrl: pinggyUrl,
            action: action,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 429) {
          showToast("Comando muito rápido, aguarde um instante.", "info");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Erro ao comunicar com o PC");
        }

        // Feedback sutil para comandos de tela cheia
        if (action === "fullscreen") {
          showToast("Modo Apresentação (F5) ativado!", "success");
        } else if (action === "exit-fullscreen") {
          showToast("Saiu da Apresentação (ESC)", "info");
        }
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        setTimeout(() => {
          setIsExecuting(false);
          setActiveCommand(null);
        }, 150);
      }
    },
    [pinggyUrl, sessionId, showToast]
  );

  // Suporte a teclas de atalho do teclado para laptops e tablets
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isExecuting) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        sendCommand("next");
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        sendCommand("previous");
      } else if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        sendCommand("fullscreen");
      } else if (e.key === "Escape") {
        e.preventDefault();
        sendCommand("exit-fullscreen");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExecuting, sendCommand]);

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <h2>Conectando ao piSlideControl...</h2>
        <p>Sincronizando chave do túnel seguro</p>
        <style jsx>{stylesState}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container error">
        <div className="error-icon">⚠️</div>
        <h2>Não foi possível conectar</h2>
        <p>{error}</p>
        <button onClick={fetchTunnelUrl} className="retry-btn">
          Tentar novamente
        </button>
        <style jsx>{stylesState}</style>
      </div>
    );
  }

  return (
    <div className="control-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="title-bar">
        <div className="title-group">
          <span className="title-text">PiSlideControl</span>
          
        </div>

        <div className="social-links">
          <a
            href="https://www.linkedin.com/in/valeedimilson"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn de Edimilson"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.12 20H3.56V9h3.56v11zM5.34 7.43c-1.14 0-2.07-.94-2.07-2.09s.93-2.09 2.07-2.09 2.07.94 2.07 2.09-.93 2.09-2.07 2.09zM20.44 20h-3.56v-5.41c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V20H9.44V9h3.42v1.5h.05c.48-.9 1.66-1.84 3.42-1.84 3.66 0 4.34 2.41 4.34 5.54V20z" />
            </svg>
          </a>
          <a
            href="https://github.com/valeedimilson/piSlideControl"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub do projeto"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.113.793-.258.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.335-5.467-5.933 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 0 1 3.003-.403c1.02.005 2.047.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.63-5.48 5.922.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.192.694.8.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Barra de Ações Rápidas: Tela Cheia e Sair */}
        <section className="aux-controls">
          <button
            type="button"
            className={`aux-btn ${activeCommand === "fullscreen" ? "active" : ""}`}
            onClick={() => sendCommand("fullscreen")}
            disabled={isExecuting}
            title="Apresentar em Tela Cheia (F5)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
            <span>Tela Cheia (F5)</span>
          </button>

          <button
            type="button"
            className={`aux-btn aux-btn-secondary ${activeCommand === "exit-fullscreen" ? "active" : ""}`}
            onClick={() => sendCommand("exit-fullscreen")}
            disabled={isExecuting}
            title="Sair da Tela Cheia (ESC)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z" />
            </svg>
            <span>Sair (ESC)</span>
          </button>
        </section>

        {/* Botões Principais de Navegação */}
        <section className="slide-buttons-container">
          <button
            type="button"
            className={`nav-btn btn-prev ${activeCommand === "previous" ? "pressed" : ""}`}
            onClick={() => sendCommand("previous")}
            disabled={isExecuting}
            aria-label="Slide Anterior"
          >
            <svg viewBox="0 0 24 24" width="76" height="76" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
            <span className="nav-label">Anterior</span>
          </button>

          <button
            type="button"
            className={`nav-btn btn-next ${activeCommand === "next" ? "pressed" : ""}`}
            onClick={() => sendCommand("next")}
            disabled={isExecuting}
            aria-label="Próximo Slide"
          >
            <svg viewBox="0 0 24 24" width="76" height="76" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
            <span className="nav-label">Próximo</span>
          </button>
        </section>

        {/* Status de Sincronização */}
        <div className="status-footer-info">
          <span>Ponte criptografada ativa</span>
          {lastUpdated && (
            <span className="sync-time">
              Último sync: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </main>

      <footer className="footer">
        By{" "}
        <a
          href="https://github.com/valeedimilson"
          target="_blank"
          rel="noreferrer"
        >
          dyme (github.com/valeedimilson)
        </a>
      </footer>

      <style jsx>{`
        .control-screen {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background-color: #ffecce;
          font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          user-select: none;
          -webkit-user-select: none;
          touch-action: manipulation;
        }

        .toast {
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          padding: 10px 18px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          animation: slideDown 0.25s ease-out;
          text-align: center;
          max-width: 90%;
        }

        .toast-info {
          background-color: #2196f3;
          color: white;
        }

        .toast-success {
          background-color: #2e7d32;
          color: white;
        }

        .toast-error {
          background-color: #d32f2f;
          color: white;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -15px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .title-bar {
          height: 60px;
          background-color: #2196f3;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        }

        .title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-text {
          color: white;
          font-size: 1.15rem;
          font-weight: bold;
          letter-spacing: 0.3px;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }

        .dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #4caf50;
          box-shadow: 0 0 6px #4caf50;
        }

        .social-links {
          display: flex;
          gap: 14px;
        }

        .social-links a {
          color: white;
          opacity: 0.9;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
        }

        .social-links a:hover {
          opacity: 1;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        }

        .aux-controls {
          display: flex;
          gap: 12px;
          width: 100%;
          margin-top: 6px;
          margin-bottom: 12px;
        }

        .aux-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 12px;
          border: none;
          background: #ffffff;
          color: #1976d2;
          font-weight: 700;
          font-size: 0.85rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .aux-btn:active,
        .aux-btn.active {
          transform: scale(0.96);
          background: #e3f2fd;
        }

        .aux-btn-secondary {
          color: #d32f2f;
        }

        .aux-btn-secondary:active,
        .aux-btn-secondary.active {
          background: #ffebee;
        }

        .slide-buttons-container {
          display: flex;
          gap: 16px;
          width: 100%;
          flex: 1;
          align-items: center;
          justify-content: center;
          max-height: 420px;
          margin: 10px 0;
        }

        .nav-btn {
          flex: 1;
          height: 100%;
          max-height: 340px;
          min-height: 220px;
          border: none;
          border-radius: 20px;
          background: #2196f3;
          color: white;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 18px rgba(33, 150, 243, 0.35);
          transition: transform 0.1s, background-color 0.1s, box-shadow 0.1s;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-btn:active,
        .nav-btn.pressed {
          background-color: #1565c0;
          transform: scale(0.95);
          box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
        }

        .nav-label {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .status-footer-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          color: #777;
          font-size: 0.8rem;
          text-align: center;
          margin-top: 10px;
          margin-bottom: 6px;
        }

        .sync-time {
          font-size: 0.75rem;
          color: #999;
        }

        .footer {
          text-align: center;
          padding: 12px;
          font-size: 0.85rem;
          color: #666;
        }

        .footer a {
          color: #1976d2;
          text-decoration: none;
          font-weight: 600;
        }

        @media (orientation: landscape) and (max-height: 500px) {
          .slide-buttons-container {
            max-height: 200px;
          }
          .nav-btn {
            min-height: 140px;
          }
        }
      `}</style>
    </div>
  );
}

const stylesState = `
  .state-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100dvh;
    background-color: #ffecce;
    font-family: Arial, sans-serif;
    padding: 20px;
    text-align: center;
  }
  .state-container h2 {
    color: #1976d2;
    margin: 16px 0 8px;
    font-size: 1.4rem;
  }
  .state-container p {
    color: #666;
    font-size: 0.95rem;
  }
  .state-container.error h2 {
    color: #d32f2f;
  }
  .error-icon {
    font-size: 3rem;
  }
  .retry-btn {
    margin-top: 16px;
    padding: 10px 20px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }
  .spinner {
    width: 44px;
    height: 44px;
    border: 4px solid rgba(33, 150, 243, 0.2);
    border-top-color: #2196f3;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function ControlPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#ffecce",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h2>Carregando controle...</h2>
        </div>
      }
    >
      <ControlApp />
    </Suspense>
  );
}

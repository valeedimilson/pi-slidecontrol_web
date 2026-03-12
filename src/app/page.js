"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [pinggyUrl, setPinggyUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Função para buscar a URL atualizada do banco de dados
  const fetchTunnelUrl = useCallback(async () => {
    if (!sessionId) {
      setError("ID de sessão ausente na URL.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/tunnel?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error("Sessão inválida ou expirada.");
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

  // Busca a URL pela primeira vez e configura o "cronômetro" de 10 segundos
  useEffect(() => {
    fetchTunnelUrl();

    // Cria um intervalo para consultar a API da Vercel a cada 10 segundos
    const interval = setInterval(() => {
      fetchTunnelUrl();
    }, 10000); // 10.000 ms = 10 segundos

    return () => clearInterval(interval); // Limpa o intervalo ao fechar a página
  }, [fetchTunnelUrl]);

  // Função para enviar os comandos de tecla via Proxy do Next.js
  const sendCommand = async (action) => {
    if (!pinggyUrl) {
      alert("Aguarde a conexão com o servidor ser estabelecida.");
      return;
    }

    try {
      // Faz a requisição para a nossa PRÓPRIA API (mesmo domínio = zero CORS)
      const response = await fetch("/api/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinggyUrl: pinggyUrl, // Manda a URL base do Pinggy
          action: action, // 'next' ou 'previous'
        }),
      });

      if (!response.ok) throw new Error("Erro ao comunicar com o PC");
      console.log(`Comando ${action} enviado com sucesso!`);
    } catch (err) {
      alert(`Falha ao enviar comando: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#ffecce",
        }}
      >
        <h2>Conectando ao piSlideControl...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#ffecce",
          color: "red",
          flexDirection: "column",
        }}
      >
        <h2>Erro de Conexão</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.body}>
      <div style={styles.titleBar}>
        <div style={styles.titleText}>PiSlideControl v2.0</div>
        <div style={styles.socialIcons}>
          <a
            href="https://www.linkedin.com/in/valeedimilson"
            style={styles.socialIcon}
            target="_blank"
            rel="noreferrer"
          >
            {/* LinkedIn SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.12 20H3.56V9h3.56v11zM5.34 7.43c-1.14 0-2.07-.94-2.07-2.09s.93-2.09 2.07-2.09 2.07.94 2.07 2.09-.93 2.09-2.07 2.09zM20.44 20h-3.56v-5.41c0-1.29-.03-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V20H9.44V9h3.42v1.5h.05c.48-.9 1.66-1.84 3.42-1.84 3.66 0 4.34 2.41 4.34 5.54V20z" />
            </svg>
          </a>
          <a
            href="https://github.com/valeedimilson/piSlideControl"
            style={styles.socialIcon}
            target="_blank"
            rel="noreferrer"
          >
            {/* GitHub SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="24"
              height="24"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.113.793-.258.793-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.335-5.467-5.933 0-1.31.468-2.38 1.235-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 0 1 3.003-.403c1.02.005 2.047.137 3.003.403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.63-5.48 5.922.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.192.694.8.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={styles.logo}>
          {/* Como o logo agora está na Vercel, coloque a imagem logo.svg na pasta public/ do Next.js */}
          <img src="/logo.svg" width="250px" alt="Logo Patinho" />
        </div>
        <div style={styles.buttons}>
          <button
            style={styles.btn}
            onClick={() => sendCommand("previous")}
            onMouseDown={(e) => (e.target.style.backgroundColor = "#1976d2")}
            onMouseUp={(e) => (e.target.style.backgroundColor = "#2196f3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2196f3")}
          >
            <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
          </button>
          <button
            style={styles.btn}
            onClick={() => sendCommand("next")}
            onMouseDown={(e) => (e.target.style.backgroundColor = "#1976d2")}
            onMouseUp={(e) => (e.target.style.backgroundColor = "#2196f3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2196f3")}
          >
            <svg viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
          </button>
        </div>

        {/* Aviso de renovação sutil */}
        <div
          style={{
            marginTop: "40px",
            color: "#888",
            fontSize: "0.8rem",
            textAlign: "center",
          }}
        >
          Ponte segura ativa.
          <br />
          {lastUpdated &&
            `Último sync do túnel: ${lastUpdated.toLocaleTimeString()}`}
        </div>
      </div>

      <footer style={styles.footer}>
        By{" "}
        <a
          href="https://github.com/valeedimilson/piSlideControl"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#2196f3" }}
        >
          dimi (github.com/valeedimilson)
        </a>
      </footer>
    </div>
  );
}

// Transformei o seu CSS bruto em objetos JavaScript para o Next.js
const styles = {
  body: {
    fontFamily: "Arial, sans-serif",
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffecce",
    touchAction: "manipulation",
    margin: 0,
  },
  titleBar: {
    width: "100%",
    height: "60px",
    padding: "0 10px",
    backgroundColor: "#2196f3",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    zIndex: 100,
  },
  titleText: {
    color: "white",
    fontSize: "1.2em",
    fontWeight: "bold",
  },
  socialIcons: {
    display: "flex",
    gap: "15px",
  },
  socialIcon: {
    color: "white",
    textDecoration: "none",
    transition: "opacity 0.3s",
  },
  controls: {
    flex: 1,
    display: "flex",
    gap: "20px",
    padding: "0 20px",
    maxWidth: "400px",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    margin: "0 auto",
  },
  logo: {
    paddingLeft: "60px",
    paddingTop: "20px",
  },
  buttons: {
    paddingTop: "40px",
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },
  btn: {
    flex: 1,
    height: "160px",
    border: "none",
    borderRadius: "15px",
    backgroundColor: "#2196f3",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  footer: {
    textAlign: "right",
    paddingBottom: "5px",
    paddingRight: "10px",
    fontSize: "0.9em",
    color: "#555",
  },
};

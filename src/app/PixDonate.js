"use client";
import { useState, useEffect } from "react";

export default function PixDonate() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const pixKey = "pixdodyme@gmail.com";

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback para navegadores sem permissão de clipboard
      const input = document.getElementById("pix-input-key");
      if (input) {
        input.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <div className="donate-wrapper">
        <button
          className="donate-btn"
          onClick={() => setOpen(true)}
          title="Apoie o projeto"
          aria-label="Apoie o projeto com um café"
        >
          ☕
        </button>

        <span className="tooltip">Me compre um café</span>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="donate-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="donate-title">💖 Apoie o projeto</h2>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                pixKey
              )}`}
              alt="QR Code Pix para doação"
              width="180"
              height="180"
              className="pix-qr"
            />

            <p className="pix-label">Chave Pix (E-mail):</p>

            <div className="pix-box">
              <input
                id="pix-input-key"
                value={pixKey}
                readOnly
                aria-label="Chave Pix"
              />
              <button
                type="button"
                className={`copy-btn ${copied ? "copied" : ""}`}
                onClick={copyPix}
              >
                {copied ? "Copiado! ✓" : "Copiar"}
              </button>
            </div>

            <button
              type="button"
              className="close-btn"
              onClick={() => setOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .donate-wrapper {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 999;
        }

        .donate-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: #ff813f;
          font-size: 22px;
          cursor: pointer;
          color: white;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s, background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donate-btn:hover {
          transform: scale(1.1);
          background: #e66f2d;
        }

        .tooltip {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: #333;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .donate-wrapper:hover .tooltip {
          opacity: 1;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        .modal {
          background: white;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          flex-direction: column;
          width: 90%;
          max-width: 320px;
          color: #111;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          animation: popIn 0.2s ease-out;
        }

        .modal h2 {
          font-size: 1.25rem;
          margin-bottom: 12px;
          color: #1a1a1a;
          font-weight: 700;
        }

        .pix-qr {
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .pix-label {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 6px;
        }

        .pix-box {
          display: flex;
          gap: 6px;
          width: 100%;
          margin-top: 4px;
        }

        .pix-box input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          text-align: center;
          font-size: 0.85rem;
          background: #f8f8f8;
          color: #333;
        }

        .copy-btn {
          padding: 8px 12px;
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background-color: #1976d2;
        }

        .copy-btn.copied {
          background-color: #388e3c;
        }

        .close-btn {
          margin-top: 18px;
          padding: 8px 20px;
          border: 1px solid #ddd;
          background: #f1f1f1;
          color: #333;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: background-color 0.2s, color 0.2s;
        }

        .close-btn:hover {
          background-color: #e53935;
          border-color: #e53935;
          color: #fff;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popIn {
          from {
            transform: scale(0.92);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

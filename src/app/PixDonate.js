"use client";
import { useState } from "react";

export default function PixDonate() {
  const [open, setOpen] = useState(false);
  const pixKey = "pixdodyme@gmail.com";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave Pix copiada!");
  };

  return (
    <>
      <div className="donate-wrapper">
        <button className="donate-btn" onClick={() => setOpen(true)}>
          ☕
        </button>

        <span className="tooltip">Me compre um café</span>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>💖 Apoie o projeto</h2>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pixKey}`}
              alt="QR Code Pix"
            />

            <p>Chave Pix</p>

            <div className="pix-box">
              <input value={pixKey} readOnly />
            </div>

            <button className="close-btn" onClick={() => setOpen(false)}>
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
          transition: transform 0.2s;
        }

        .donate-btn:hover {
          transform: scale(1.1);
        }

        .tooltip {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: #333;
          color: white;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 14px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          white-space: nowrap;
        }

        .donate-wrapper:hover .tooltip {
          opacity: 1;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal {
          background: white;
          padding: 25px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          flex-direction: column;
          width: 300px;
          color: #000;
        }

        .pix-box {
          display: flex;
          gap: 5px;
          margin-top: 10px;
          text-align: center;
        }

        .pix-box input {
          flex: 1;
          padding: 6px;
          border: 1px solid #000;
          border-radius: 8px;
          text-align: center;
        }

        .close-btn {
          margin-top: 15px;
          padding: 8px 14px;
          border: none;
          cursor: pointer;
        }
        .close-btn:hover {
          background-color:#ff2020;
          color:#fff;
          border-radius:8px;
        }
      `}</style>
    </>
  );
}

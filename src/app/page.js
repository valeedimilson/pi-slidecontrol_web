import React from "react";

export default function LandingPage() {
  return (
    <div style={styles.body}>
      {/* Barra de Navegação */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>PiSlideControl</div>
        <div style={styles.socialIcons}></div>
      </nav>

      {/* Seção Principal (Hero) */}
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Controle seus slides na palma da mão.</h1>
          <p style={styles.description}>
            O PiSlideControl transforma o seu celular em um passador de slides
            profissional. Sem cabos, sem complicações de rede local e com
            alcance global.
          </p>

          <div style={styles.actionButtons}>
            {/* O link de download deve apontar para o .exe hospedado no seu GitHub Releases ou Google Drive */}
            <a
              href="https://www.mediafire.com/file/vqik77hr9f79mg6/piSlideControl.exe/file"
              target="_blank"
              rel="noreferrer"
              style={styles.downloadBtn}
            >
              Baixar para Windows (.exe)
            </a>

            <a href="#como-funciona" style={styles.secondaryBtn}>
              Como funciona?
            </a>
          </div>
        </div>

        {/* NOVA ÁREA DE IMAGENS (PRINTS) */}
        <div style={styles.imageContainer}>
          <img
            src="/server-print.png"
            alt="Print do Servidor Windows"
            style={styles.serverMockup}
            title="Servidor Desktop"
          />
          <img
            src="/mobile-print.png"
            alt="Print do Controle no Celular"
            style={styles.mobileMockup}
            title="Controle Web Mobile"
          />
        </div>
      </main>

      {/* Seção Como Funciona */}
      <section id="como-funciona" style={styles.featuresSection}>
        <h2 style={{ color: "#2196f3", marginBottom: "30px" }}>Como usar?</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3>Baixe o Servidor</h3>
            <p>
              Faça o download do executável e rode no computador onde a
              apresentação vai acontecer.
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3>Escaneie o QR Code</h3>
            <p>
              Abra a câmera do seu celular e leia o QR Code gerado pelo programa
              na tela do PC.
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3>Apresente!</h3>
            <p>
              Seu celular abrirá automaticamente o controle remoto. É só tocar
              nos botões e brilhar!
            </p>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer style={styles.footer}>
        <p>Desenvolvido por Edimilson (dyme)</p>
      </footer>
    </div>
  );
}

// Estilos
const styles = {
  body: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffecce",
    color: "#333",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding:0,
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 50px",
    backgroundColor: "#2196f3",
    color: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  navLogo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  socialIcons: {
    display: "flex",
    gap: "15px",
  },
  socialIcon: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
  main: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 50px",
    gap: "50px",
    flex: 1,
  },
  content: {
    maxWidth: "500px",
  },
  title: {
    fontSize: "3rem",
    color: "#1976d2",
    marginBottom: "20px",
    lineHeight: "1.2",
  },
  description: {
    fontSize: "1.2rem",
    color: "#555",
    marginBottom: "40px",
    lineHeight: "1.6",
  },
  actionButtons: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  downloadBtn: {
    padding: "15px 30px",
    backgroundColor: "#2196f3",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    transition: "background-color 0.3s",
    boxShadow: "0 4px 6px rgba(33, 150, 243, 0.3)",
  },
  secondaryBtn: {
    padding: "15px 30px",
    backgroundColor: "transparent",
    color: "#2196f3",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    border: "2px solid #2196f3",
    transition: "background-color 0.3s",
  },
  // --- NOVOS ESTILOS PARA OS PRINTS ---
  imageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px", // Espaço entre os dois prints
    flexWrap: "wrap",
  },
  serverMockup: {
    width: "100%",
    maxWidth: "280px", // Tamanho um pouco maior para o PC
    borderRadius: "12px", // Borda suave de janela do Windows
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)", // Sombra flutuante
    border: "1px solid rgba(0,0,0,0.1)",
    backgroundColor: "white",
  },
  mobileMockup: {
    width: "100%",
    maxWidth: "180px", // Mais estreito, formato de celular
    borderRadius: "24px", // Borda bem redonda imitando um smartphone
    boxShadow: "0 15px 35px rgba(0,0,0,0.3)", // Sombra um pouco mais forte
    border: "6px solid #333", // Simula a carcaça de um celular preto
    backgroundColor: "white",
    marginTop: "40px", // Desce o celular um pouquinho para dar um efeito de "cascata" bem moderno
  },
  // ------------------------------------
  featuresSection: {
    padding: "60px 50px",
    backgroundColor: "white",
    textAlign: "center",
  },
  stepsGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    flexWrap: "wrap",
    marginTop: "40px",
  },
  stepCard: {
    backgroundColor: "#ffecce",
    padding: "30px",
    borderRadius: "15px",
    maxWidth: "280px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  stepNumber: {
    width: "50px",
    height: "50px",
    backgroundColor: "#2196f3",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0 auto 20px auto",
  },
  footer: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
};

export default function Home() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      <style>{`
        :root {
          --bg-start: #0b2f1b;
          --bg-end: #0f3b22;
          --panel-bg: rgba(255, 255, 255, 0.95);
          --text-main: #0b2f1b;
          --text-muted: #1f7a3a;
          --border: rgba(148, 163, 184, 0.25);
          --shadow: 0 18px 45px rgba(15, 23, 42, 0.26);
          --color-whatsapp: #16a34a;
          --color-sms: #2563eb;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 1rem;
          background:
            radial-gradient(1200px 500px at 20% 10%, rgba(155,230,26,0.14), transparent 62%),
            radial-gradient(1000px 450px at 90% 95%, rgba(34,197,94,0.16), transparent 62%),
            linear-gradient(150deg, var(--bg-start), var(--bg-end));
          color: var(--text-main);
        }
        .panel {
          width: min(620px, 100%);
          background: var(--panel-bg);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        .banner {
          background: linear-gradient(180deg, rgba(10,45,25,0.98), rgba(14,59,34,0.98));
          padding: 0.9rem 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #9be61a;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .content {
          padding: clamp(1.3rem, 2vw, 2rem);
          position: relative;
        }
        h1 {
          font-size: clamp(1.5rem, 3vw, 2.05rem);
          font-weight: 800;
          color: var(--text-main);
          margin: 0.2rem 0 0.35rem;
          text-align: center;
        }
        .subtitle {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          text-align: center;
          font-size: 0.97rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.95rem;
        }
        .card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.2rem 1rem;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(15,23,42,0.12); }
        .card i { font-size: 1.8rem; }
        .cardTitle { font-size: 0.92rem; font-weight: 700; color: var(--text-main); text-align: center; }
        .cardText { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); text-align: center; line-height: 1.35; }
        .whatsapp i { color: var(--color-whatsapp); }
        .sms i { color: var(--color-sms); }
        .web i { color: #0b2f1b; }
        @media (max-width: 560px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <main className="panel">
        <div className="banner">African Development Conference (ADC)</div>
        <div className="content">
          <h1>Share Your Voice</h1>
          <p className="subtitle">
            Help shape policy: share your experience and feedback.
          </p>
          <div className="grid">
            <a className="card web" href="/survey">
              <i className="fas fa-globe"></i>
              <span className="cardTitle">Web Survey</span>
              <small className="cardText">Answer questions directly on this page.</small>
            </a>
            <a className="card whatsapp"
              href="https://wa.me/12024492944?text=I%20want%20to%20share%20my%20feedback%20with%20ADC"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i>
              <span className="cardTitle">WhatsApp</span>
              <small className="cardText">Send your message on WhatsApp.</small>
            </a>
            <a className="card sms" href="sms:+12024492944">
              <i className="fas fa-comment-sms"></i>
              <span className="cardTitle">SMS</span>
              <small className="cardText">Send a text message.</small>
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
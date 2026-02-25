export default function PaymentNotice() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "#050508",
        overflow: "hidden",
        fontFamily: "'Georgia', serif",
        padding: "2rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Montserrat:wght@300;400;500&display=swap');

        .notice-card {
          background: linear-gradient(135deg, rgba(17, 17, 24, 0.75) 0%, rgba(26, 26, 46, 0.75) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 2px;
          padding: 3.5rem 4rem;
          max-width: 580px;
          width: 100%;
          box-shadow: 0 0 60px rgba(212, 175, 55, 0.05), 0 20px 60px rgba(0,0,0,0.6);
          position: relative;
          z-index: 10;
          animation: fadeSlideIn 0.7s ease forwards;
          opacity: 0;
          transform: translateY(16px);
        }

        @keyframes fadeSlideIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .notice-card::before {
          content: '';
          position: absolute;
          top: 8px; left: 8px; right: 8px; bottom: 8px;
          border: 1px solid rgba(212, 175, 55, 0.08);
          border-radius: 1px;
          pointer-events: none;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #d4af37;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 2px;
          margin-bottom: 2rem;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #d4af37;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: #f0ece0;
          line-height: 1.4;
          margin: 0 0 1rem 0;
          letter-spacing: 0.01em;
        }

        .headline strong {
          font-weight: 600;
          color: #d4af37;
        }

        .divider {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, #d4af37, transparent);
          margin: 1.5rem 0;
        }

        .subtext {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.82rem;
          font-weight: 300;
          color: rgba(240, 236, 224, 0.55);
          line-height: 1.8;
          margin: 0 0 2.5rem 0;
          letter-spacing: 0.02em;
        }

        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #d4af37, #b8962e);
          color: #0a0a0f;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 14px 32px;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
        }

        .cta-button:hover {
          background: linear-gradient(135deg, #e0bc45, #c4a038);
          box-shadow: 0 6px 28px rgba(212, 175, 55, 0.4);
          transform: translateY(-1px);
        }

        .footer-note {
          margin-top: 1.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.68rem;
          color: rgba(240, 236, 224, 0.3);
          letter-spacing: 0.04em;
        }

        .aurora-bg {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.45;
          animation: blobFloat 25s infinite alternate cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }

        .blob-1 {
          top: -10%; left: -10%;
          width: 50vw; height: 50vw;
          background: rgba(212, 175, 55, 0.25);
        }

        .blob-2 {
          bottom: -20%; right: -10%;
          width: 60vw; height: 60vw;
          background: rgba(45, 35, 75, 0.4);
          animation-direction: alternate-reverse;
          animation-duration: 35s;
        }

        .blob-3 {
          top: 30%; left: 50%;
          width: 45vw; height: 45vw;
          background: rgba(25, 25, 45, 0.6);
          animation-delay: -10s;
          animation-duration: 40s;
        }

        .grid-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: 
            linear-gradient(rgba(212, 175, 55, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 1;
          pointer-events: none;
          mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
          -webkit-mask-image: radial-gradient(circle at center, black 35%, transparent 85%);
          animation: gridPan 60s linear infinite;
        }

        @keyframes blobFloat {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(8vw, 6vh) scale(1.1) rotate(45deg); }
          100% { transform: translate(-4vw, 12vh) scale(0.9) rotate(90deg); }
        }

        @keyframes gridPan {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }
      `}</style>

      <div className="aurora-bg">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="notice-card">
        <div className="badge">
          <span className="badge-dot" />
          Trial Period Concluded
        </div>

        <h1 className="headline">
          Your project was delivered <strong>on Time</strong> — as promised.
        </h1>

        <div className="divider" />

        <p className="subtext text-white!">
          Your complimentary 3-day trial has now come to an end. To retain full
          access and continue enjoying all features, please complete your
          remaining payment at your earliest convenience.
        </p>


        <p className="text-sm text-muted-foreground text-white!">Once you complete, you will automatically get access only by 7pm!!!</p>
        <p className="text-sm text-muted-foreground text-white! text-end mt-10"> - Aditya Sooraj</p>
      </div>
    </div>
  );
}
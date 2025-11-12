import { Link } from 'react-router-dom'

export default function Forgot() {
  return (
    <section className="auth-root">
      <div className="auth-card">
        <div className="logo">
          <span className="dot"></span>
          <h2>Reset password</h2>
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="you@company.com" />
        </div>

        <button className="btn primary">Send reset link</button>

        <div className="bottom-link">
          <Link to="/login">← Back to login</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-root {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          background: radial-gradient(1000px 600px at 20% 50%, #ecfff2 0%, #f5fbf7 40%, #eef6f1 100%);
          font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
        }

        .auth-card {
          width: 360px;
          max-width: calc(100vw - 32px);
          background: #fff;
          padding: 28px 24px;
          border-radius: 14px;
          box-shadow: 0 12px 30px rgba(20, 83, 45, 0.12);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .logo .dot {
          width: 12px;
          height: 12px;
          background: #16a34a;
          border-radius: 50%;
          box-shadow: 0 0 0 6px rgba(22, 163, 74, 0.12);
        }
        .logo h2 {
          font-size: 22px;
          margin: 0;
          color: #0f172a;
          letter-spacing: .2px;
        }

        .field { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 13px; color: #64748b; }
        input {
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #d7dfeb;
          border-radius: 8px;
          outline: none;
          background: #fafbff;
        }
        input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
          background: #fff;
        }

        .btn.primary {
          margin-top: 6px;
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 11px 0;
          font-weight: 600;
          cursor: pointer;
          transition: transform .02s ease, box-shadow .2s ease, background .2s ease;
          box-shadow: 0 6px 16px rgba(22, 163, 74, 0.22);
        }
        .btn.primary:hover { background: #15803d; }
        .btn.primary:active { transform: translateY(1px); box-shadow: 0 4px 12px rgba(22, 163, 74, 0.22); }

        .bottom-link {
          margin-top: 4px;
          text-align: right;
          font-size: 13px;
        }
        .bottom-link a { color: #15803d; text-decoration: none; }
        .bottom-link a:hover { text-decoration: underline; }

        @media (max-width: 420px) {
          .auth-card { padding: 22px 18px; border-radius: 12px; }
        }
      `}</style>
    </section>
  )
}

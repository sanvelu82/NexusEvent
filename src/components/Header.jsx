export default function Header({ title, subtitle, onLogout }) {
  return (
    <div className="dashboard-header">
      <img
        className="logo"
        src="https://i.ibb.co/dwP2BVYp/new-logo.png"
        alt="School Logo"
      />
      <div className="info">
        <h2>SVV HI TECH School</h2>
        <p><strong>{title}</strong></p>
        {subtitle && <p style={{ fontSize: '0.8rem', color: '#666' }}>{subtitle}</p>}
      </div>
      {onLogout && (
        <button className="danger-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      )}
    </div>
  );
}
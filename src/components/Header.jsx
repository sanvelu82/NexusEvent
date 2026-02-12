// src/components/Header.jsx
export default function Header({ title, subtitle, onLogout }) {
  return (
    <div className="dashboard-header">
      <div className="header-branding">
        <div className="school-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Logo First */}
          <img
            className="header-logo"
            src="https://i.ibb.co/dwP2BVYp/new-logo.png"
            alt="School Logo"
            style={{ height: '35px', width: 'auto' }}
          />
          {/* School Name Second */}
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>
            SVV HI TECH School
          </h2>
        </div>
        
        <p className="header-subtitle" style={{ marginTop: '5px' }}>{title}</p>
        {subtitle && <p className="user-subtitle">{subtitle}</p>}
      </div>

      {onLogout && (
        <button className="logout-btn-small" onClick={onLogout} title="Logout">
          🚪
        </button>
      )}
    </div>
  );
}
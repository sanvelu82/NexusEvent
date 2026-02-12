// src/components/Header.jsx
export default function Header({ title, subtitle, onLogout }) {
  return (
    <header className="dashboard-header">
      {/* Left Side - Logo & School Name */}
      <div className="header-left">
        <img
          src="https://i.ibb.co/dwP2BVYp/new-logo.png"
          alt="Logo"
          className="header-logo"
        />
        <span className="school-name">SVV HI TECH</span>
      </div>

      {/* Right Side - Title & Logout */}
      <div className="header-right">
        {onLogout && (
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        )}
        <div className="header-info">
          <span className="header-title">{title}</span>
          {subtitle && <span className="header-subtitle">{subtitle}</span>}
        </div>
      </div>
    </header>
  );
}
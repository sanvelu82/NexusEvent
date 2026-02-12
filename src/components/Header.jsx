export default function Header({ title, subtitle, onLogout }) {
  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <h1 className="school-name">SVV HI TECH School</h1>
        <img
          className="logo"
          src="https://i.ibb.co/dwP2BVYp/new-logo.png"
          alt="School Logo"
        />
      </div>
      
      {onLogout && (
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      )}
    </header>
  );
}
// src/components/Header.jsx
export default function Header({ title, subtitle, onLogout }) {
  return (
    <div className="dashboard-header">
      <img
        className="logo"
        src="https://i.ibb.co/dwP2BVYp/new-logo.png" // School Logo from previous repo
        alt="School Logo"
      />
      <div className="info" style={{ textAlign: 'right' }}>
        <h2 style={{ margin: 0, color: '#4a90e2' }}>SVV HI TECH School</h2>
        <p style={{ margin: '4px 0' }}>{title}</p>
        <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>{subtitle}</p>
      </div>
      <button 
        className="danger-btn" 
        onClick={onLogout}
        style={{ padding: '10px 15px', marginLeft: '20px' }}
      >
        🚪 Logout
      </button>
    </div>
  );
}
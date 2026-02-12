export default function Header({ title }) {
  return (
    <div className="dashboard-header">
      <div className="header-left">
        <img
          className="logo"
          src="https://i.ibb.co/dwP2BVYp/new-logo.png"
          alt="School Logo"
        />
      </div>

      <div className="header-center">
        <h2>SVV HI TECH School</h2>
        <p>{title}</p>
      </div>
    </div>
  );
}

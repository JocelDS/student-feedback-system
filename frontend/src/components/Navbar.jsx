import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark" aria-hidden="true">SF</span>
          Student Feedback
        </Link>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          &#9776;
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/submit" onClick={close}>Submit Feedback</NavLink>
          <NavLink to="/feedback" onClick={close}>View Feedback</NavLink>
          {isAdmin ? (
            <>
              <NavLink to="/admin" onClick={close}>Dashboard</NavLink>
              <button className="link-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <NavLink to="/admin/login" onClick={close}>Admin</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

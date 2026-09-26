import { NavLink, Outlet } from 'react-router-dom';
import { Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DashboardLayout({ title, navItems }) {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <Activity size={20} />
          </span>
          <div>
            <strong>HMS</strong>
            <small>{title}</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {Icon && <Icon size={18} />}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-ghost sidebar-logout" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-user">
            <span className="avatar">{initials(user?.name)}</span>
            <div>
              <strong>{user?.name}</strong>
              <small className="role-pill">{user?.role}</small>
            </div>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

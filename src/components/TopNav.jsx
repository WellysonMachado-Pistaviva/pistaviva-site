import React from 'react';
import { Menu, User, Bell, Search } from 'lucide-react';

const TopNav = ({ toggleDrawer, user, navigateTo, openAuthModal }) => {
  return (
    <nav className="top-nav glass">
      <div className="top-nav-container">
        <div className="top-nav-logo" onClick={() => navigateTo('home')}>
          PISTA<span>VIVA</span>
        </div>

        <div className="top-nav-links">
          <button className="nav-link" onClick={() => navigateTo('destinos')}>COMUNIDADE</button>
          <button className="nav-link" onClick={() => navigateTo('mapa')}>MAPA</button>
          <button className="nav-link" onClick={() => navigateTo('calculadora')}>PLANEJADOR</button>
          <button className="nav-link" onClick={() => navigateTo('pistaAoVivo')}>AO VIVO</button>
          <button className="nav-link" onClick={() => navigateTo('parceiros')}>PARCEIROS</button>
        </div>

        <div className="top-nav-actions">
          {user ? (
            <div className="nav-user" onClick={toggleDrawer}>
              <div className="nav-user-info">
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-user-city">{user.city}</span>
              </div>
              <div className="nav-avatar">
                {user.name.charAt(0)}
              </div>
            </div>
          ) : (
            <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '12px', width: 'auto' }} onClick={openAuthModal}>
              ENTRAR
            </button>
          )}
          <button className="menu-btn" onClick={toggleDrawer}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 1000;
          display: none; /* Hidden by default (mobile) */
          border-bottom: 1px solid var(--border);
        }
        .top-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
        }
        .top-nav-logo {
          font-family: var(--display);
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 4px;
          cursor: pointer;
        }
        .top-nav-logo span { color: var(--accent); }
        
        .top-nav-links {
          display: flex;
          gap: 30px;
        }
        .nav-link {
          background: none;
          border: none;
          color: var(--text);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: 0.3s;
          opacity: 0.7;
        }
        .nav-link:hover { opacity: 1; color: var(--accent); }

        .top-nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .nav-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .nav-user-name { font-size: 14px; font-weight: 700; }
        .nav-user-city { font-size: 11px; color: var(--muted); }
        .nav-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: white;
        }
        .menu-btn {
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
        }

        @media (min-width: 1024px) {
          .top-nav { display: block; }
        }
      `}</style>
    </nav>
  );
};

export default TopNav;

import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-symbol">◆</span>
            <span className="logo-text">풍동고 학생 자유 커뮤니티</span>
          </Link>
          <nav className="header-nav">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              게시판
            </Link>
            <button
              className="btn-write"
              onClick={() => navigate('/new')}
            >
              글쓰기
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <span>© 2025 Community. All rights reserved.</span>
      </footer>
    </div>
  );
}

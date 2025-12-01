import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiHome, FiPackage, FiChevronDown, FiUsers, FiSettings } from 'react-icons/fi';

function Sidebar({ sidebarOpen, pagesDropdownOpen, setPagesDropdownOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // Check if current path matches for active state
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Check if any child path is active for dropdown
  const isDropdownActive = () => {
    return isActivePath('/users') || isActivePath('/settings');
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2 className="logo">EAZYGO</h2>
        <button className="toggle-sidebar" onClick={() => {}}>
          <FiMenu />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {/* Dashboard Link - Active only when on /home */}
          <li className={isActivePath('/home') ? 'active' : ''}>
            <a href="/home">
              <FiHome />
              <span>Dashboard</span>
            </a>
          </li>

          {/* Pages Dropdown - Active when any child is active */}
          <li className={`has-dropdown ${isDropdownActive() ? 'active' : ''}`}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setPagesDropdownOpen(!pagesDropdownOpen);
            }}>
              <FiPackage />
              <span>Pages</span>
              <FiChevronDown className={`dropdown-icon ${pagesDropdownOpen ? 'open' : ''}`} />
            </a>
            <ul className={`dropdown ${pagesDropdownOpen ? 'open' : ''}`}>
              {/* User Data Link - Active only when on /users */}
              <li className={isActivePath('/users') ? 'active' : ''}>
                <a href="/users">User Data</a>
              </li>
              <li>
                <a href="#">Drive Data</a>
              </li>
              {/* Settings Link - Active only when on /settings */}
              <li className={isActivePath('/settings') ? 'active' : ''}>
                <a href="/settings">Setting</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      
      <style>{`
        .sidebar {
          width: 260px;
          background-color: #1e293b;
          color: #e2e8f0;
          transition: all 0.3s ease;
          position: relative;
          z-index: 100;
          height: 100vh;
          overflow-y: auto;
        }
        
        .sidebar.closed {
          width: 70px;
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid #334155;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #6366f1;
          transition: opacity 0.3s ease;
        }
        
        .sidebar.closed .logo {
          opacity: 0;
          pointer-events: none;
        }
        
        .toggle-sidebar {
          background: none;
          border: none;
          color: #e2e8f0;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }
        
        .toggle-sidebar:hover {
          background-color: #334155;
        }
        
        .sidebar-nav ul {
          list-style: none;
          padding: 1rem 0;
        }
        
        .sidebar-nav li {
          margin-bottom: 0.25rem;
        }
        
        .sidebar-nav a {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          color: #e2e8f0;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
        }
        
        .sidebar-nav a:hover {
          background-color: #334155;
        }
        
        .sidebar-nav li.active > a {
          background-color: #6366f1;
          color: white;
        }
        
        .sidebar-nav li.active > a::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background-color: #ec4899;
        }
        
        .sidebar-nav .dropdown li.active > a::before {
          display: none;
        }
        
        .sidebar-nav .dropdown li.active > a {
          background-color: #6366f1;
          color: white;
        }
        
        .sidebar-nav a svg {
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }
        
        .sidebar.closed a span {
          display: none;
        }
        
        .sidebar.closed a svg {
          margin-right: 0;
        }
        
        .has-dropdown {
          position: relative;
        }
        
        .dropdown-icon {
          margin-left: auto;
          transition: transform 0.3s ease;
        }
        
        .dropdown-icon.open {
          transform: rotate(180deg);
        }
        
        .sidebar.closed .dropdown-icon {
          display: none;
        }
        
        .dropdown {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .dropdown.open {
          max-height: 500px;
        }
        
        .dropdown li a {
          padding-left: 3.5rem;
        }
        
        .sidebar.closed .dropdown {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
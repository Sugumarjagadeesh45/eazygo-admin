import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FiMenu, FiSearch, FiMail, FiBell, FiSettings, FiUser, FiSun, FiMoon, 
  FiHome, FiUsers, FiTruck, FiShoppingCart, FiPackage, FiLogOut, FiChevronDown,
  FiActivity, FiTrendingUp, FiMapPin, FiShoppingBag, FiRefreshCw
} from 'react-icons/fi';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  
  // Default data structure
  const defaultData = {
    stats: {
      totalUsers: 0,
      usersChange: '+0%',
      drivers: 0,
      driversChange: '+0%',
      totalRides: 0,
      ridesChange: '+0%',
      productSales: 0,
      salesChange: '+0%'
    },
    weeklyPerformance: [
      { name: 'Mon', rides: 0, orders: 0 },
      { name: 'Tue', rides: 0, orders: 0 },
      { name: 'Wed', rides: 0, orders: 0 },
      { name: 'Thu', rides: 0, orders: 0 },
      { name: 'Fri', rides: 0, orders: 0 },
      { name: 'Sat', rides: 0, orders: 0 },
      { name: 'Sun', rides: 0, orders: 0 }
    ],
    yearlyTrends: [
      { month: 'Jan', rides: 0, orders: 0 },
      { month: 'Feb', rides: 0, orders: 0 },
      { month: 'Mar', rides: 0, orders: 0 },
      { month: 'Apr', rides: 0, orders: 0 },
      { month: 'May', rides: 0, orders: 0 },
      { month: 'Jun', rides: 0, orders: 0 },
      { month: 'Jul', rides: 0, orders: 0 },
      { month: 'Aug', rides: 0, orders: 0 },
      { month: 'Sep', rides: 0, orders: 0 },
      { month: 'Oct', rides: 0, orders: 0 },
      { month: 'Nov', rides: 0, orders: 0 },
      { month: 'Dec', rides: 0, orders: 0 }
    ],
    serviceDistribution: [
      { name: 'Rides', value: 65, color: '#6366f1' },
      { name: 'Grocery', value: 35, color: '#8b5cf6' }
    ],
    recentActivities: [],
    salesDistribution: { riders: 65, grocery: 35 }
  };

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:5001/api/admin/dashboard-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      
      if (result.success) {
        // Ensure all arrays exist with safe fallbacks
        const safeData = {
          stats: {
            totalUsers: result.data.stats?.totalUsers || 0,
            usersChange: result.data.stats?.usersChange || '+0%',
            drivers: result.data.stats?.drivers || 0,
            driversChange: result.data.stats?.driversChange || '+0%',
            totalRides: result.data.stats?.totalRides || 0,
            ridesChange: result.data.stats?.ridesChange || '+0%',
            productSales: result.data.stats?.productSales || 0,
            salesChange: result.data.stats?.salesChange || '+0%'
          },
          weeklyPerformance: result.data.weeklyPerformance || defaultData.weeklyPerformance,
          yearlyTrends: result.data.yearlyTrends || defaultData.yearlyTrends,
          serviceDistribution: result.data.serviceDistribution || defaultData.serviceDistribution,
          recentActivities: result.data.recentActivities || [],
          salesDistribution: result.data.salesDistribution || defaultData.salesDistribution
        };
        setDashboardData(safeData);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default data
      setDashboardData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const data = dashboardData || defaultData;
  
  const statsData = [
    { 
      title: 'Total Users', 
      value: data.stats.totalUsers.toLocaleString(), 
      change: data.stats.usersChange, 
      icon: <FiUsers />, 
      color: '#6366f1',
      onClick: () => navigate('/users')
    },
    { 
      title: 'Drivers', 
      value: data.stats.drivers.toLocaleString(), 
      change: data.stats.driversChange, 
      icon: <FiTruck />, 
      color: '#8b5cf6',
      onClick: () => navigate('/drivers')
    },
    { 
      title: 'Total Rides', 
      value: data.stats.totalRides.toLocaleString(), 
      change: data.stats.ridesChange, 
      icon: <FiShoppingCart />, 
      color: '#ec4899',
      onClick: () => navigate('/rides')
    },
    { 
      title: 'Product Sales', 
      value: `₹${data.stats.productSales.toLocaleString()}`, 
      change: data.stats.salesChange, 
      icon: <FiPackage />, 
      color: '#14b8a6',
      onClick: () => navigate('/sales-data')
    },
  ];
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };
  
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Check if current path matches for active state
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Check if pages dropdown should be active
  const isPagesActive = () => {
    return isActivePath('/products') || 
           isActivePath('/rides') || 
           isActivePath('/live-data') || 
           isActivePath('/sales-data');
  };

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="logo">EAZYGO</h2>
          <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={isActivePath('/dashboard') || isActivePath('/home') ? 'active' : ''}>
              <a href="/home">
                <FiHome />
                <span>Dashboard</span>
              </a>
            </li>
            <li className={isActivePath('/users') ? 'active' : ''}>
              <a href="/users">
                <FiUsers />
                <span>Users</span>
              </a>
            </li>
            <li className={isActivePath('/drivers') ? 'active' : ''}>
              <a href="/drivers">
                <FiTruck />
                <span>Drivers</span>
              </a>
            </li>
            <li className={`has-dropdown ${isPagesActive() ? 'active' : ''}`}>
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setPagesDropdownOpen(!pagesDropdownOpen);
              }}>
                <FiPackage />
                <span>Pages</span>
                <FiChevronDown className={`dropdown-icon ${pagesDropdownOpen ? 'open' : ''}`} />
              </a>
              <ul className={`dropdown ${pagesDropdownOpen ? 'open' : ''}`}>
                <li className={isActivePath('/products') ? 'active' : ''}>
                  <a href="/products">
                    <FiShoppingBag />
                    <span>Product</span>
                  </a>
                </li>
                <li className={isActivePath('/rides') ? 'active' : ''}>
                  <a href="/rides">
                    <FiShoppingCart />
                    <span>Ride</span>
                  </a>
                </li>
                <li className={isActivePath('/live-data') ? 'active' : ''}>
                  <a href="/live-data">
                    <FiMapPin />
                    <span>Live</span>
                  </a>
                </li>
                <li className={isActivePath('/sales-data') ? 'active' : ''}>
                  <a href="/sales-data">
                    <FiTrendingUp />
                    <span>Sales</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className={isActivePath('/settings') ? 'active' : ''}>
              <a href="/settings">
                <FiSettings />
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="topbar-actions">
            <button 
              className="topbar-btn refresh-btn"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
            </button>
            <button className="topbar-btn">
              <FiMail />
              <span className="badge">3</span>
            </button>
            <button className="topbar-btn">
              <FiBell />
              <span className="badge">5</span>
            </button>
            <button className="topbar-btn">
              <FiSettings />
            </button>
            <button className="topbar-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <div className="profile-dropdown">
              <button className="topbar-btn profile-btn" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <FiUser />
                <span>Admin</span>
                <FiChevronDown className={`dropdown-icon ${profileDropdownOpen ? 'open' : ''}`} />
              </button>
              <ul className={`dropdown ${profileDropdownOpen ? 'open' : ''}`}>
                <li><a href="#">Profile</a></li>
                <li><a href="#">Settings</a></li>
                <li><a href="#" onClick={handleLogout}><FiLogOut /> Logout</a></li>
              </ul>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div>
              <h1 className="welcome-title">Dashboard Overview</h1>
              <p className="welcome-subtitle">Welcome to EAZYGO Admin Panel. Manage your platform efficiently.</p>
            </div>
            <div className="last-updated">
              {loading ? 'Refreshing...' : `Last updated: ${new Date().toLocaleTimeString()}`}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div 
                className="stat-card" 
                key={index}
                onClick={stat.onClick}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-content">
                  <h3>{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-change positive">{stat.change}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Charts */}
          <div className="charts-container">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Weekly Performance</h3>
                <select 
                  className="year-selector"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rides" fill="#6366f1" name="Rides" />
                  <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-card">
              <div className="chart-header">
                <h3>Yearly Trends</h3>
                <select 
                  className="year-selector"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.yearlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rides" stroke="#6366f1" activeDot={{ r: 8 }} name="Rides" />
                  <Line type="monotone" dataKey="orders" stroke="#8b5cf6" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Bottom Charts Row */}
          <div className="charts-container">
            <div className="chart-card">
              <h3>Service Distribution</h3>
              <div className="service-distribution">
                <div className="pie-chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.serviceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="service-stats">
                  <div className="service-stat">
                    <span className="service-dot" style={{ backgroundColor: '#6366f1' }}></span>
                    <span>Riders: {data.salesDistribution.riders}%</span>
                  </div>
                  <div className="service-stat">
                    <span className="service-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                    <span>Grocery: {data.salesDistribution.grocery}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="chart-card">
              <div className="chart-header">
                <h3>Recent Activities</h3>
                <span className="activity-count">
                  {(data.recentActivities && data.recentActivities.length) || 0} activities
                </span>
              </div>
              <div className="activity-list">
                {data.recentActivities && data.recentActivities.length > 0 ? (
                  data.recentActivities.map((activity, index) => (
                    <div className="activity-item" key={index}>
                      <div className={`activity-icon ${activity.icon || 'ride'}`}>
                        {activity.icon === 'grocery' ? <FiPackage /> : <FiShoppingCart />}
                      </div>
                      <div className="activity-content">
                        <h4>{activity.title || 'Activity'}</h4>
                        <p>{activity.description || 'No description available'}</p>
                        <span className="activity-time">{activity.timeAgo || 'Just now'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-activities">
                    <FiActivity size={32} />
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        :root {
          --primary-color: #6366f1;
          --secondary-color: #8b5cf6;
          --accent-color: #ec4899;
          --success-color: #14b8a6;
          --sidebar-bg: #1e293b;
          --sidebar-text: #e2e8f0;
          --sidebar-active: #334155;
          --topbar-bg: #ffffff;
          --card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
          --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .dark {
          --sidebar-bg: #0f172a;
          --sidebar-text: #e2e8f0;
          --sidebar-active: #1e293b;
          --topbar-bg: #1e293b;
          --card-bg: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --border-color: #475569;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }
        
        .dark .admin-dashboard {
          background-color: #0f172a;
        }
        
        /* Sidebar Styles */
        .sidebar {
          width: 260px;
          background-color: var(--sidebar-bg);
          color: var(--sidebar-text);
          transition: all 0.3s ease;
          position: relative;
          z-index: 100;
        }
        
        .sidebar.closed {
          width: 70px;
        }
        
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--sidebar-active);
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color);
          transition: opacity 0.3s ease;
        }
        
        .sidebar.closed .logo {
          opacity: 0;
          pointer-events: none;
        }
        
        .toggle-sidebar {
          background: none;
          border: none;
          color: var(--sidebar-text);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }
        
        .toggle-sidebar:hover {
          background-color: var(--sidebar-active);
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
          color: var(--sidebar-text);
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
        }
        
        .sidebar-nav a:hover {
          background-color: var(--sidebar-active);
        }
        
        .sidebar-nav li.active a {
          background-color: var(--primary-color);
          color: white;
        }
        
        .sidebar-nav li.active a::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background-color: var(--accent-color);
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
        
        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }
        
        /* Topbar Styles */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background-color: var(--topbar-bg);
          box-shadow: var(--shadow);
          z-index: 50;
        }
        
        .search-container {
          display: flex;
          align-items: center;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          width: 300px;
        }
        
        .search-icon {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }
        
        .search-container input {
          border: none;
          background: none;
          outline: none;
          flex: 1;
          color: var(--text-primary);
        }
        
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .topbar-btn {
          position: relative;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.25rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
        }
        
        .topbar-btn:hover {
          background-color: var(--border-color);
        }
        
        .refresh-btn .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--accent-color);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
        }
        
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
        }
        
        .profile-dropdown {
          position: relative;
        }
        
        .profile-dropdown .dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          box-shadow: var(--shadow-lg);
          width: 200px;
          z-index: 100;
          margin-top: 0.5rem;
        }
        
        .profile-dropdown .dropdown li {
          list-style: none;
        }
        
        .profile-dropdown .dropdown li a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .profile-dropdown .dropdown li a:hover {
          background-color: var(--border-color);
        }
        
        /* Dashboard Content Styles */
        .dashboard-content {
          padding: 1.5rem;
          flex: 1;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        
        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .welcome-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        
        .last-updated {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background-color: var(--card-bg);
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-lg);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 1rem;
        }
        
        .stat-content h3 {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .stat-value {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .stat-change {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .stat-change.positive {
          color: var(--success-color);
        }
        
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .chart-card {
          background-color: var(--card-bg);
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .chart-card h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .year-selector {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          background-color: var(--card-bg);
          color: var(--text-primary);
        }
        
        .service-distribution {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .pie-chart-container {
          flex: 1;
        }
        
        .service-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .service-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .service-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .activity-count {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        
        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .activity-icon.ride {
          background-color: var(--primary-color);
        }
        
        .activity-icon.grocery {
          background-color: var(--secondary-color);
        }
        
        .activity-content h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }
        
        .activity-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .activity-time {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .no-activities {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: var(--text-secondary);
        }
        
        .no-activities svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
          }
          
          .sidebar.open {
            transform: translateX(0);
          }
          
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .search-container {
            width: 200px;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .service-distribution {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
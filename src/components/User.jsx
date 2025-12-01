// src/components/Pages/User.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FiMenu, FiSearch, FiMail, FiBell, FiSettings, FiUser, FiSun, FiMoon, FiHome, FiUsers, FiTruck, FiShoppingCart, FiPackage, FiLogOut, FiChevronDown, FiArrowLeft, FiArrowRight, FiEdit, FiTrash2, FiSave, FiX, FiArrowLeft as FiBack } from 'react-icons/fi';

// Notification Component
const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

function User() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // User data state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  // Edit form state
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Close notification manually
  const closeNotification = () => {
    setNotification(null);
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification('Authentication error. Please login again.', 'error');
      navigate("/");
      return null;
    }
    return token;
  };

  // Fetch users from backend
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch(`http://localhost:5001/api/users/registered?page=${page}&limit=${usersPerPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showNotification('Session expired. Please login again.', 'error');
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setTotalPages(Math.ceil(data.total / usersPerPage));
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to load users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single user details
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showNotification('Session expired. Please login again.', 'error');
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
          return;
        }
        throw new Error('Failed to fetch user details');
      }

      const data = await response.json();
      
      if (data) {
        setSelectedUser(data);
        setEditFormData({
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          address: data.address || '',
          altMobile: data.altMobile || '',
          gender: data.gender || '',
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          wallet: data.wallet || 0
        });
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showNotification('Failed to load user details: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails(id);
    } else {
      fetchUsers(currentPage);
    }
  }, [currentPage, id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // Edit User Functions
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch(`http://localhost:5001/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          showNotification('Session expired. Please login again.', 'error');
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
          return;
        }
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      
      if (data) {
        // Update the user in the local state
        setSelectedUser(prev => ({ ...prev, ...editFormData }));
        showNotification('User updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete User Functions
  const handleDeleteUser = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await fetch(`http://localhost:5001/api/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showNotification('Session expired. Please login again.', 'error');
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/");
          return;
        }
        throw new Error('Failed to delete user');
      }

      const data = await response.json();
      
      if (data) {
        showNotification('User deleted successfully!', 'success');
        navigate('/users'); // Navigate back to users list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user: ' + error.message, 'error');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle user row click
  const handleUserClick = (user) => {
    navigate(`/users/${user._id}`);
  };

  // Handle back to list
  const handleBackToList = () => {
    navigate('/users');
  };

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      
      {/* Main Content - Full Width */}
      <div className="main-content full-width">
        {/* Top Bar */}
        <header className="topbar">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search users..." />
          </div>
          
          <div className="topbar-actions">
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
        
        {/* User Management Content */}
        <div className="dashboard-content">
          {id ? (
            // Single User Detail View
            <div className="user-detail-view">
              <div className="page-header">
                <button className="back-btn" onClick={handleBackToList}>
                  <FiBack />
                  Back to Users
                </button>
                <h1 className="welcome-title">User Details</h1>
                <p className="page-subtitle">View and manage user information</p>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading user details...</p>
                </div>
              ) : selectedUser ? (
                <div className="user-detail-card">
                  <div className="user-detail-header">
                    <div className="user-avatar-large">
                      {selectedUser.profilePicture ? (
                        <img src={`http://localhost:5001${selectedUser.profilePicture}`} alt={selectedUser.name} />
                      ) : (
                        <div className="avatar-placeholder-large">
                          {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <h2>{selectedUser.name}</h2>
                      <p>{selectedUser.phoneNumber}</p>
                      <p>{selectedUser.email || 'No email provided'}</p>
                      <div className="user-meta">
                        <span className="meta-item">
                          <strong>Customer ID:</strong> {selectedUser.customerId}
                        </span>
                        <span className="meta-item">
                          <strong>Joined:</strong> {formatDate(selectedUser.createdAt)}
                        </span>
                        <span className="meta-item wallet">
                          <strong>Wallet:</strong> ₹{selectedUser.wallet || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="user-detail-form">
                    <h3>Edit User Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.name}
                          onChange={(e) => handleEditFormChange('name', e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.phoneNumber}
                          onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          value={editFormData.email}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Alternate Mobile</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editFormData.altMobile}
                          onChange={(e) => handleEditFormChange('altMobile', e.target.value)}
                          placeholder="Enter alternate mobile"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-input"
                          value={editFormData.gender}
                          onChange={(e) => handleEditFormChange('gender', e.target.value)}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-input"
                          value={editFormData.dob}
                          onChange={(e) => handleEditFormChange('dob', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group full-width">
                        <label className="form-label">Address</label>
                        <textarea
                          className="form-input"
                          rows="3"
                          value={editFormData.address}
                          onChange={(e) => handleEditFormChange('address', e.target.value)}
                          placeholder="Enter full address"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Wallet Balance (₹)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={editFormData.wallet}
                          onChange={(e) => handleEditFormChange('wallet', parseFloat(e.target.value) || 0)}
                          placeholder="Enter wallet balance"
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveUser}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="loading-spinner-small"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={handleDeleteUser}
                      >
                        <FiTrash2 />
                        Delete User
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <FiUsers size={48} />
                  <h3>User Not Found</h3>
                  <p>The requested user could not be found.</p>
                  <button className="btn btn-primary" onClick={handleBackToList}>
                    Back to Users
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Users List View
            <>
              <div className="page-header">
                <h1 className="welcome-title">User Management</h1>
                <p className="page-subtitle">Manage all registered users in the system</p>
              </div>
              
              {/* Users Table */}
              <div className="table-card">
                <div className="table-header">
                  <h3>Registered Users</h3>
                  <div className="table-actions">
                    <button className="btn btn-primary">Export</button>
                    <button className="btn btn-secondary" onClick={() => fetchUsers(currentPage)}>
                      Refresh
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : (
                  <>
                    <div className="table-container">
                      <table className="users-table">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Customer ID</th>
                            <th>Registration Date</th>
                            <th>Wallet Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user, index) => (
                            <tr 
                              key={user._id} 
                              onClick={() => handleUserClick(user)}
                              className="clickable-row"
                            >
                              <td>{(currentPage - 1) * usersPerPage + index + 1}</td>
                              <td className="user-id">{user._id?.substring(0, 8)}...</td>
                              <td className="user-name">
                                <div className="user-avatar">
                                  {user.profilePicture ? (
                                    <img src={`http://localhost:5001${user.profilePicture}`} alt={user.name} />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  )}
                                </div>
                                {user.name}
                              </td>
                              <td>{user.phoneNumber}</td>
                              <td>{user.email || 'N/A'}</td>
                              <td>{user.customerId}</td>
                              <td>{formatDate(user.createdAt)}</td>
                              <td className="wallet-balance">₹{user.wallet || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {users.length === 0 && (
                        <div className="empty-state">
                          <FiUsers size={48} />
                          <h3>No Users Found</h3>
                          <p>There are no registered users in the system yet.</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Pagination */}
                    {users.length > 0 && (
                      <div className="pagination">
                        <button 
                          className="pagination-btn" 
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                        >
                          <FiArrowLeft />
                          Previous
                        </button>
                        
                        <div className="page-indicator">
                          Page {currentPage} of {totalPages}
                        </div>
                        
                        <button 
                          className="pagination-btn" 
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <FiArrowRight />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <style jsx>{`
        :root {
          --primary-color: #6366f1;
          --secondary-color: #8b5cf6;
          --accent-color: #ec4899;
          --success-color: #10b981;
          --danger-color: #ef4444;
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
        
        /* Notification Styles */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 16px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          max-width: 400px;
          box-shadow: var(--shadow-lg);
          animation: slideIn 0.3s ease;
        }
        
        .notification-success {
          background-color: var(--success-color);
        }
        
        .notification-error {
          background-color: var(--danger-color);
        }
        
        .notification-info {
          background-color: var(--primary-color);
        }
        
        .notification-content {
          display: flex;
          align-items: center;
          justify-content: between;
        }
        
        .notification-message {
          flex: 1;
          margin-right: 10px;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        /* Main Content Styles */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }
        
        .main-content.full-width {
          width: 100%;
          max-width: 100%;
        }
        
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
        
        .dashboard-content {
          padding: 1.5rem;
          flex: 1;
        }
        
        .page-header {
          margin-bottom: 2rem;
        }
        
        .welcome-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .page-subtitle {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 1rem;
          padding: 0.5rem 0;
        }
        
        .table-card {
          background-color: var(--card-bg);
          border-radius: 0.75rem;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        
        .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .table-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .table-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-primary {
          background-color: var(--primary-color);
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #4f46e5;
        }
        
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background-color: var(--border-color);
          color: var(--text-primary);
        }
        
        .btn-secondary:hover {
          background-color: #e2e8f0;
        }
        
        .btn-danger {
          background-color: var(--danger-color);
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #dc2626;
        }
        
        .dark .btn-secondary:hover {
          background-color: #475569;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        
        .users-table th {
          background-color: var(--card-bg);
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .users-table td {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        
        .clickable-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .clickable-row:hover {
          background-color: rgba(99, 102, 241, 0.05);
        }
        
        .dark .clickable-row:hover {
          background-color: rgba(99, 102, 241, 0.1);
        }
        
        .user-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .user-id {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        
        .wallet-balance {
          font-weight: 600;
          color: var(--success-color);
        }
        
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-left: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .loading-spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-left: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
        }
        
        .empty-state svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background-color: var(--border-color);
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-indicator {
          font-weight: 500;
          color: var(--text-primary);
        }
        
        /* User Detail View Styles */
        .user-detail-view {
          width: 100%;
        }
        
        .user-detail-card {
          background-color: var(--card-bg);
          border-radius: 0.75rem;
          box-shadow: var(--shadow);
          overflow: hidden;
        }
        
        .user-detail-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .user-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .user-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder-large {
          width: 100%;
          height: 100%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 2rem;
        }
        
        .user-info {
          flex: 1;
        }
        
        .user-info h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }
        
        .user-info p {
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .user-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .meta-item.wallet {
          color: var(--success-color);
          font-weight: 600;
        }
        
        .user-detail-form {
          padding: 2rem;
        }
        
        .user-detail-form h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group.full-width {
          grid-column: 1 / -1;
        }
        
        .form-label {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 0.875rem;
        }
        
        .form-input {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          background-color: var(--card-bg);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .form-input::placeholder {
          color: var(--text-secondary);
        }
        
        textarea.form-input {
          resize: vertical;
          min-height: 80px;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .table-actions {
            width: 100%;
            justify-content: flex-end;
          }
          
          .search-container {
            width: 200px;
          }
          
          .pagination {
            flex-direction: column;
            gap: 1rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .user-detail-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
          }
          
          .user-meta {
            justify-content: center;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default User;


// // src/components/Pages/User.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { 
//   FiSearch, FiMail, FiBell, FiSettings, FiUser, FiSun, FiMoon, 
//   FiLogOut, FiChevronDown, FiArrowLeft, FiArrowRight, FiEdit, 
//   FiTrash2, FiSave, FiX, FiUsers 
// } from 'react-icons/fi';

// // Notification Component
// const Notification = ({ message, type, onClose }) => {
//   return (
//     <div className={`notification notification-${type}`}>
//       <div className="notification-content">
//         <span className="notification-message">{message}</span>
//         <button className="notification-close" onClick={onClose}>×</button>
//       </div>
//     </div>
//   );
// };

// function User() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [darkMode, setDarkMode] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
//   // User data state
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const usersPerPage = 10;

//   // Modal states
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [editFormData, setEditFormData] = useState({});
//   const [saving, setSaving] = useState(false);

//   // Notification state
//   const [notification, setNotification] = useState(null);

//   // Show notification function
//   const showNotification = (message, type = 'info') => {
//     setNotification({ message, type });
//     setTimeout(() => {
//       setNotification(null);
//     }, 4000);
//   };

//   // Close notification manually
//   const closeNotification = () => {
//     setNotification(null);
//   };

//   // Fix JWT token issue
//   const getValidToken = () => {
//     let token = localStorage.getItem("token");
    
//     // If token is malformed or doesn't exist, redirect to login
//     if (!token || token === 'undefined' || token === 'null') {
//       localStorage.removeItem("token");
//       localStorage.removeItem("role");
//       navigate("/");
//       return null;
//     }
    
//     // Ensure token is properly formatted
//     token = token.replace(/^"(.*)"$/, '$1'); // Remove quotes if present
//     return token;
//   };

//   // Fetch users from backend
//   const fetchUsers = async (page = 1) => {
//     try {
//       setLoading(true);
//       const token = getValidToken();
      
//       if (!token) {
//         showNotification('Please login again', 'error');
//         return;
//       }

//       const response = await fetch(`http://localhost:5001/api/users/registered?page=${page}&limit=${usersPerPage}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.status === 401) {
//         // Token is invalid, redirect to login
//         localStorage.removeItem("token");
//         localStorage.removeItem("role");
//         navigate("/");
//         showNotification('Session expired. Please login again.', 'error');
//         return;
//       }

//       if (!response.ok) {
//         throw new Error(`Failed to fetch users: ${response.status}`);
//       }

//       const data = await response.json();
      
//       if (data.success) {
//         setUsers(data.data || []);
//         setTotalPages(Math.ceil((data.total || 0) / usersPerPage) || 1);
//       } else {
//         throw new Error(data.error || 'Failed to fetch users');
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       showNotification('Failed to load users: ' + error.message, 'error');
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers(currentPage);
//   }, [currentPage]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     navigate("/");
//   };

//   // Edit User Functions
//   const handleEditClick = (user) => {
//     console.log("Edit clicked for user:", user);
//     setSelectedUser(user);
//     setEditFormData({
//       name: user.name || '',
//       phoneNumber: user.phoneNumber || '',
//       email: user.email || '',
//       address: user.address || '',
//       altMobile: user.altMobile || '',
//       gender: user.gender || '',
//       dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
//       wallet: user.wallet || 0
//     });
//     setEditModalOpen(true);
//   };

//   const handleEditFormChange = (field, value) => {
//     setEditFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSaveUser = async () => {
//     try {
//       setSaving(true);
//       const token = getValidToken();
      
//       if (!token) {
//         showNotification('Please login again', 'error');
//         return;
//       }

//       const response = await fetch(`http://localhost:5001/api/users/${selectedUser._id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(editFormData)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update user');
//       }

//       const data = await response.json();
      
//       if (data) {
//         // Update the user in the local state
//         setUsers(prevUsers => 
//           prevUsers.map(user => 
//             user._id === selectedUser._id ? { ...user, ...editFormData } : user
//           )
//         );
//         setEditModalOpen(false);
//         showNotification('User updated successfully!', 'success');
//       }
//     } catch (error) {
//       console.error('Error updating user:', error);
//       showNotification('Failed to update user: ' + error.message, 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Delete User Functions
//   const handleDeleteClick = (user) => {
//     console.log("Delete clicked for user:", user);
//     setSelectedUser(user);
//     setDeleteModalOpen(true);
//   };

//   const handleDeleteUser = async () => {
//     try {
//       const token = getValidToken();
      
//       if (!token) {
//         showNotification('Please login again', 'error');
//         return;
//       }

//       const response = await fetch(`http://localhost:5001/api/users/${selectedUser._id}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete user');
//       }

//       const data = await response.json();
      
//       if (data) {
//         // Remove the user from the local state
//         setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUser._id));
//         setDeleteModalOpen(false);
//         showNotification('User deleted successfully!', 'success');
        
//         // Refresh the list if this was the last user on the page
//         if (users.length === 1 && currentPage > 1) {
//           setCurrentPage(currentPage - 1);
//         } else {
//           fetchUsers(currentPage);
//         }
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       showNotification('Failed to delete user: ' + error.message, 'error');
//     }
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   // Format user ID for display
//   const formatUserId = (userId) => {
//     if (!userId) return 'N/A';
//     return userId.length > 8 ? `${userId.substring(0, 8)}...` : userId;
//   };

//   return (
//     <div className={`admin-dashboard full-screen ${darkMode ? 'dark' : ''}`}>
//       {/* Notification */}
//       {notification && (
//         <Notification
//           message={notification.message}
//           type={notification.type}
//           onClose={closeNotification}
//         />
//       )}
      
//       {/* Main Content - Full Width */}
//       <div className="main-content full-width">
//         {/* Top Bar */}
//         <header className="topbar">
//           <div className="search-container">
//             <FiSearch className="search-icon" />
//             <input type="text" placeholder="Search users..." />
//           </div>
          
//           <div className="topbar-actions">
//             <button className="topbar-btn">
//               <FiMail />
//               <span className="badge">3</span>
//             </button>
//             <button className="topbar-btn">
//               <FiBell />
//               <span className="badge">5</span>
//             </button>
//             <button className="topbar-btn">
//               <FiSettings />
//             </button>
//             <button className="topbar-btn" onClick={() => setDarkMode(!darkMode)}>
//               {darkMode ? <FiSun /> : <FiMoon />}
//             </button>
//             <div className="profile-dropdown">
//               <button 
//                 className="topbar-btn profile-btn" 
//                 onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//               >
//                 <FiUser />
//                 <span>Admin</span>
//                 <FiChevronDown className={`dropdown-icon ${profileDropdownOpen ? 'open' : ''}`} />
//               </button>
//               {profileDropdownOpen && (
//                 <ul className="dropdown open">
//                   <li><a href="#" onClick={(e) => e.preventDefault()}>Profile</a></li>
//                   <li><a href="#" onClick={(e) => e.preventDefault()}>Settings</a></li>
//                   <li><a href="#" onClick={handleLogout}><FiLogOut /> Logout</a></li>
//                 </ul>
//               )}
//             </div>
//           </div>
//         </header>
        
//         {/* User Management Content */}
//         <div className="dashboard-content full-width">
//           <div className="page-header">
//             <h1 className="welcome-title">User Management</h1>
//             <p className="page-subtitle">Manage all registered users in the system</p>
//           </div>
          
//           {/* Users Table */}
//           <div className="table-card">
//             <div className="table-header">
//               <h3>Registered Users</h3>
//               <div className="table-actions">
//                 <button className="btn btn-primary">Export</button>
//                 <button 
//                   className="btn btn-secondary" 
//                   onClick={() => fetchUsers(currentPage)}
//                   disabled={loading}
//                 >
//                   Refresh
//                 </button>
//               </div>
//             </div>
            
//             {loading ? (
//               <div className="loading-state">
//                 <div className="loading-spinner"></div>
//                 <p>Loading users...</p>
//               </div>
//             ) : (
//               <>
//                 <div className="table-container">
//                   <table className="users-table">
//                     <thead>
//                       <tr>
//                         <th>S.No</th>
//                         <th>User ID</th>
//                         <th>Name</th>
//                         <th>Phone Number</th>
//                         <th>Email</th>
//                         <th>Customer ID</th>
//                         <th>Registration Date</th>
//                         <th>Wallet Balance</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {users.length > 0 ? (
//                         users.map((user, index) => (
//                           <tr key={user._id || index}>
//                             <td>{(currentPage - 1) * usersPerPage + index + 1}</td>
//                             <td className="user-id">{formatUserId(user._id)}</td>
//                             <td className="user-name">
//                               <div className="user-avatar">
//                                 {user.profilePicture ? (
//                                   <img src={`http://localhost:5001${user.profilePicture}`} alt={user.name} />
//                                 ) : (
//                                   <div className="avatar-placeholder">
//                                     {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
//                                   </div>
//                                 )}
//                               </div>
//                               {user.name || 'N/A'}
//                             </td>
//                             <td>{user.phoneNumber || 'N/A'}</td>
//                             <td>{user.email || 'N/A'}</td>
//                             <td>{user.customerId || 'N/A'}</td>
//                             <td>{formatDate(user.createdAt)}</td>
//                             <td className="wallet-balance">₹{user.wallet || '0'}</td>
//                             <td className="actions">
//                               <button 
//                                 className="btn-icon edit" 
//                                 title="Edit User"
//                                 onClick={() => handleEditClick(user)}
//                               >
//                                 <FiEdit />
//                               </button>
//                               <button 
//                                 className="btn-icon delete" 
//                                 title="Delete User"
//                                 onClick={() => handleDeleteClick(user)}
//                               >
//                                 <FiTrash2 />
//                               </button>
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="9" className="empty-state-cell">
//                             <div className="empty-state">
//                               <FiUsers size={48} />
//                               <h3>No Users Found</h3>
//                               <p>There are no registered users in the system yet.</p>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
                
//                 {/* Pagination */}
//                 {users.length > 0 && (
//                   <div className="pagination">
//                     <button 
//                       className="pagination-btn" 
//                       onClick={handlePrevPage}
//                       disabled={currentPage === 1}
//                     >
//                       <FiArrowLeft />
//                       Previous
//                     </button>
                    
//                     <div className="page-indicator">
//                       Page {currentPage} of {totalPages || 1}
//                     </div>
                    
//                     <button 
//                       className="pagination-btn" 
//                       onClick={handleNextPage}
//                       disabled={currentPage === totalPages}
//                     >
//                       Next
//                       <FiArrowRight />
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Edit User Modal */}
//       {editModalOpen && (
//         <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Edit User</h2>
//               <button className="modal-close" onClick={() => setEditModalOpen(false)}>
//                 <FiX />
//               </button>
//             </div>
            
//             <div className="modal-body">
//               {selectedUser && (
//                 <div className="edit-user-form">
//                   <div className="form-grid">
//                     <div className="form-group">
//                       <label className="form-label">Full Name *</label>
//                       <input
//                         type="text"
//                         className="form-input"
//                         value={editFormData.name}
//                         onChange={(e) => handleEditFormChange('name', e.target.value)}
//                         placeholder="Enter full name"
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label className="form-label">Phone Number *</label>
//                       <input
//                         type="text"
//                         className="form-input"
//                         value={editFormData.phoneNumber}
//                         onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
//                         placeholder="Enter phone number"
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label className="form-label">Email Address</label>
//                       <input
//                         type="email"
//                         className="form-input"
//                         value={editFormData.email}
//                         onChange={(e) => handleEditFormChange('email', e.target.value)}
//                         placeholder="Enter email address"
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label className="form-label">Alternate Mobile</label>
//                       <input
//                         type="text"
//                         className="form-input"
//                         value={editFormData.altMobile}
//                         onChange={(e) => handleEditFormChange('altMobile', e.target.value)}
//                         placeholder="Enter alternate mobile"
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label className="form-label">Gender</label>
//                       <select
//                         className="form-input"
//                         value={editFormData.gender}
//                         onChange={(e) => handleEditFormChange('gender', e.target.value)}
//                       >
//                         <option value="">Select Gender</option>
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                         <option value="other">Other</option>
//                       </select>
//                     </div>
                    
//                     <div className="form-group">
//                       <label className="form-label">Date of Birth</label>
//                       <input
//                         type="date"
//                         className="form-input"
//                         value={editFormData.dob}
//                         onChange={(e) => handleEditFormChange('dob', e.target.value)}
//                       />
//                     </div>
                    
//                     <div className="form-group full-width">
//                       <label className="form-label">Address</label>
//                       <textarea
//                         className="form-input"
//                         rows="3"
//                         value={editFormData.address}
//                         onChange={(e) => handleEditFormChange('address', e.target.value)}
//                         placeholder="Enter full address"
//                       />
//                     </div>
                    
//                     <div className="form-group">
//                       <label className="form-label">Wallet Balance (₹)</label>
//                       <input
//                         type="number"
//                         className="form-input"
//                         value={editFormData.wallet}
//                         onChange={(e) => handleEditFormChange('wallet', parseFloat(e.target.value) || 0)}
//                         placeholder="Enter wallet balance"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             <div className="modal-footer">
//               <button
//                 className="btn btn-outline"
//                 onClick={() => setEditModalOpen(false)}
//                 disabled={saving}
//               >
//                 <FiX />
//                 Cancel
//               </button>
//               <button
//                 className="btn btn-primary"
//                 onClick={handleSaveUser}
//                 disabled={saving}
//               >
//                 {saving ? (
//                   <>
//                     <div className="loading-spinner-small"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <FiSave />
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteModalOpen && (
//         <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
//           <div className="modal-content modal-sm" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Confirm Deletion</h2>
//               <button className="modal-close" onClick={() => setDeleteModalOpen(false)}>
//                 <FiX />
//               </button>
//             </div>
            
//             <div className="modal-body">
//               {selectedUser && (
//                 <div className="delete-confirmation">
//                   <div className="warning-icon">
//                     <FiTrash2 size={32} />
//                   </div>
//                   <h3 className="confirmation-title">Are you sure you want to delete this user?</h3>
//                   <p className="confirmation-message">
//                     This will permanently delete <strong>{selectedUser.name}</strong> ({selectedUser.phoneNumber}) 
//                     from the system. This action cannot be undone.
//                   </p>
//                 </div>
//               )}
//             </div>
            
//             <div className="modal-footer">
//               <button
//                 className="btn btn-outline"
//                 onClick={() => setDeleteModalOpen(false)}
//               >
//                 <FiX />
//                 Cancel
//               </button>
//               <button
//                 className="btn btn-danger"
//                 onClick={handleDeleteUser}
//               >
//                 <FiTrash2 />
//                 Delete User
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       <style jsx>{`
//         /* Add this new style for empty state in table */
//         .empty-state-cell {
//           padding: 0 !important;
//         }
        
//         .empty-state-cell .empty-state {
//           padding: 3rem;
//           text-align: center;
//           color: var(--text-secondary);
//         }

//         /* Rest of your existing CSS remains the same */
//         :root {
//           --primary-color: #6366f1;
//           --secondary-color: #8b5cf6;
//           --accent-color: #ec4899;
//           --success-color: #10b981;
//           --danger-color: #ef4444;
//           --sidebar-bg: #1e293b;
//           --sidebar-text: #e2e8f0;
//           --sidebar-active: #334155;
//           --topbar-bg: #ffffff;
//           --card-bg: #ffffff;
//           --text-primary: #1e293b;
//           --text-secondary: #64748b;
//           --border-color: #e2e8f0;
//           --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
//           --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
//         }
        
//         .dark {
//           --sidebar-bg: #0f172a;
//           --sidebar-text: #e2e8f0;
//           --sidebar-active: #1e293b;
//           --topbar-bg: #1e293b;
//           --card-bg: #334155;
//           --text-primary: #f1f5f9;
//           --text-secondary: #cbd5e1;
//           --border-color: #475569;
//         }
        
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
//         }
        
//         .admin-dashboard {
//           min-height: 100vh;
//           background-color: #f8fafc;
//           color: var(--text-primary);
//           transition: all 0.3s ease;
//         }
        
//         .admin-dashboard.full-screen {
//           width: 100%;
//         }
        
//         .dark .admin-dashboard {
//           background-color: #0f172a;
//         }
        
//         /* Notification Styles */
//         .notification {
//           position: fixed;
//           top: 20px;
//           right: 20px;
//           padding: 16px 20px;
//           border-radius: 8px;
//           color: white;
//           font-weight: 500;
//           z-index: 10000;
//           max-width: 400px;
//           box-shadow: var(--shadow-lg);
//           animation: slideIn 0.3s ease;
//         }
        
//         .notification-success {
//           background-color: var(--success-color);
//         }
        
//         .notification-error {
//           background-color: var(--danger-color);
//         }
        
//         .notification-info {
//           background-color: var(--primary-color);
//         }
        
//         .notification-content {
//           display: flex;
//           align-items: center;
//           justify-content: between;
//         }
        
//         .notification-message {
//           flex: 1;
//           margin-right: 10px;
//         }
        
//         .notification-close {
//           background: none;
//           border: none;
//           color: white;
//           font-size: 18px;
//           cursor: pointer;
//           padding: 0;
//           width: 20px;
//           height: 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }
        
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
        
//         /* Main Content Styles */
//         .main-content {
//           flex: 1;
//           display: flex;
//           flex-direction: column;
//           overflow-x: hidden;
//         }
        
//         .main-content.full-width {
//           width: 100%;
//           max-width: 100%;
//         }
        
//         .topbar {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 1rem 1.5rem;
//           background-color: var(--topbar-bg);
//           box-shadow: var(--shadow);
//           z-index: 50;
//         }
        
//         .search-container {
//           display: flex;
//           align-items: center;
//           background-color: var(--card-bg);
//           border: 1px solid var(--border-color);
//           border-radius: 0.5rem;
//           padding: 0.5rem 1rem;
//           width: 300px;
//         }
        
//         .search-icon {
//           color: var(--text-secondary);
//           margin-right: 0.5rem;
//         }
        
//         .search-container input {
//           border: none;
//           background: none;
//           outline: none;
//           flex: 1;
//           color: var(--text-primary);
//         }
        
//         .topbar-actions {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }
        
//         .topbar-btn {
//           position: relative;
//           background: none;
//           border: none;
//           color: var(--text-primary);
//           font-size: 1.25rem;
//           padding: 0.5rem;
//           border-radius: 0.375rem;
//           cursor: pointer;
//           transition: background-color 0.2s;
//           display: flex;
//           align-items: center;
//         }
        
//         .topbar-btn:hover {
//           background-color: var(--border-color);
//         }
        
//         .badge {
//           position: absolute;
//           top: 0;
//           right: 0;
//           background-color: var(--accent-color);
//           color: white;
//           font-size: 0.75rem;
//           font-weight: 600;
//           padding: 0.125rem 0.375rem;
//           border-radius: 9999px;
//         }
        
//         .profile-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 0.75rem;
//         }
        
//         .profile-dropdown {
//           position: relative;
//         }
        
//         .profile-dropdown .dropdown {
//           position: absolute;
//           top: 100%;
//           right: 0;
//           background-color: var(--card-bg);
//           border: 1px solid var(--border-color);
//           border-radius: 0.5rem;
//           box-shadow: var(--shadow-lg);
//           width: 200px;
//           z-index: 100;
//           margin-top: 0.5rem;
//         }
        
//         .profile-dropdown .dropdown li {
//           list-style: none;
//         }
        
//         .profile-dropdown .dropdown li a {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.75rem 1rem;
//           color: var(--text-primary);
//           text-decoration: none;
//           transition: background-color 0.2s;
//         }
        
//         .profile-dropdown .dropdown li a:hover {
//           background-color: var(--border-color);
//         }
        
//         .dashboard-content {
//           padding: 1.5rem;
//           flex: 1;
//         }
        
//         .page-header {
//           margin-bottom: 2rem;
//         }
        
//         .welcome-title {
//           font-size: 2rem;
//           font-weight: 700;
//           margin-bottom: 0.5rem;
//           color: var(--text-primary);
//         }
        
//         .page-subtitle {
//           color: var(--text-secondary);
//           font-size: 1rem;
//         }
        
//         .back-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           background: none;
//           border: none;
//           color: var(--primary-color);
//           font-size: 1rem;
//           font-weight: 500;
//           cursor: pointer;
//           margin-bottom: 1rem;
//           padding: 0.5rem 0;
//         }
        
//         .table-card {
//           background-color: var(--card-bg);
//           border-radius: 0.75rem;
//           box-shadow: var(--shadow);
//           overflow: hidden;
//         }
        
//         .table-header {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 1.5rem;
//           border-bottom: 1px solid var(--border-color);
//         }
        
//         .table-header h3 {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: var(--text-primary);
//         }
        
//         .table-actions {
//           display: flex;
//           gap: 0.75rem;
//         }
        
//         .btn {
//           padding: 0.5rem 1rem;
//           border: none;
//           border-radius: 0.375rem;
//           font-weight: 500;
//           cursor: pointer;
//           transition: all 0.2s;
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//         }
        
//         .btn-primary {
//           background-color: var(--primary-color);
//           color: white;
//         }
        
//         .btn-primary:hover {
//           background-color: #4f46e5;
//         }
        
//         .btn-primary:disabled {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }
        
//         .btn-secondary {
//           background-color: var(--border-color);
//           color: var(--text-primary);
//         }
        
//         .btn-secondary:hover {
//           background-color: #e2e8f0;
//         }
        
//         .btn-danger {
//           background-color: var(--danger-color);
//           color: white;
//         }
        
//         .btn-danger:hover {
//           background-color: #dc2626;
//         }
        
//         .dark .btn-secondary:hover {
//           background-color: #475569;
//         }
        
//         .table-container {
//           overflow-x: auto;
//         }
        
//         .users-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
        
//         .users-table th,
//         .users-table td {
//           padding: 1rem;
//           text-align: left;
//           border-bottom: 1px solid var(--border-color);
//         }
        
//         .users-table th {
//           background-color: var(--card-bg);
//           font-weight: 600;
//           color: var(--text-primary);
//           font-size: 0.875rem;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//         }
        
//         .users-table td {
//           color: var(--text-secondary);
//           font-size: 0.875rem;
//         }
        
//         .clickable-row {
//           cursor: pointer;
//           transition: background-color 0.2s;
//         }
        
//         .clickable-row:hover {
//           background-color: rgba(99, 102, 241, 0.05);
//         }
        
//         .dark .clickable-row:hover {
//           background-color: rgba(99, 102, 241, 0.1);
//         }
        
//         .user-name {
//           display: flex;
//           align-items: center;
//           gap: 0.75rem;
//         }
        
//         .user-avatar {
//           width: 32px;
//           height: 32px;
//           border-radius: 50%;
//           overflow: hidden;
//         }
        
//         .user-avatar img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
        
//         .avatar-placeholder {
//           width: 100%;
//           height: 100%;
//           background-color: var(--primary-color);
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 600;
//           font-size: 0.875rem;
//         }
        
//         .user-id {
//           font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
//           font-size: 0.75rem;
//           color: var(--text-secondary);
//         }
        
//         .wallet-balance {
//           font-weight: 600;
//           color: var(--success-color);
//         }
        
//         .loading-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//           color: var(--text-secondary);
//         }
        
//         .loading-spinner {
//           width: 40px;
//           height: 40px;
//           border: 4px solid var(--border-color);
//           border-left: 4px solid var(--primary-color);
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//           margin-bottom: 1rem;
//         }
        
//         .loading-spinner-small {
//           width: 16px;
//           height: 16px;
//           border: 2px solid transparent;
//           border-left: 2px solid white;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }
        
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         .empty-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 3rem;
//           text-align: center;
//           color: var(--text-secondary);
//         }
        
//         .empty-state svg {
//           margin-bottom: 1rem;
//           opacity: 0.5;
//         }
        
//         .empty-state h3 {
//           margin-bottom: 0.5rem;
//           color: var(--text-primary);
//         }
        
//         .pagination {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 1.5rem;
//           border-top: 1px solid var(--border-color);
//         }
        
//         .pagination-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 1rem;
//           background-color: var(--card-bg);
//           border: 1px solid var(--border-color);
//           border-radius: 0.375rem;
//           color: var(--text-primary);
//           cursor: pointer;
//           transition: all 0.2s;
//         }
        
//         .pagination-btn:hover:not(:disabled) {
//           background-color: var(--border-color);
//         }
        
//         .pagination-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }
        
//         .page-indicator {
//           font-weight: 500;
//           color: var(--text-primary);
//         }
        
//         /* User Detail View Styles */
//         .user-detail-view {
//           width: 100%;
//         }
        
//         .user-detail-card {
//           background-color: var(--card-bg);
//           border-radius: 0.75rem;
//           box-shadow: var(--shadow);
//           overflow: hidden;
//         }
        
//         .user-detail-header {
//           display: flex;
//           align-items: center;
//           gap: 2rem;
//           padding: 2rem;
//           border-bottom: 1px solid var(--border-color);
//         }
        
//         .user-avatar-large {
//           width: 100px;
//           height: 100px;
//           border-radius: 50%;
//           overflow: hidden;
//           flex-shrink: 0;
//         }
        
//         .user-avatar-large img {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }
        
//         .avatar-placeholder-large {
//           width: 100%;
//           height: 100%;
//           background-color: var(--primary-color);
//           color: white;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-weight: 600;
//           font-size: 2rem;
//         }
        
//         .user-info {
//           flex: 1;
//         }
        
//         .user-info h2 {
//           font-size: 1.75rem;
//           font-weight: 700;
//           margin-bottom: 0.5rem;
//           color: var(--text-primary);
//         }
        
//         .user-info p {
//           color: var(--text-secondary);
//           margin-bottom: 0.25rem;
//         }
        
//         .user-meta {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 1rem;
//           margin-top: 1rem;
//         }
        
//         .meta-item {
//           display: flex;
//           align-items: center;
//           gap: 0.25rem;
//         }
        
//         .meta-item.wallet {
//           color: var(--success-color);
//           font-weight: 600;
//         }
        
//         .user-detail-form {
//           padding: 2rem;
//         }
        
//         .user-detail-form h3 {
//           font-size: 1.25rem;
//           font-weight: 600;
//           margin-bottom: 1.5rem;
//           color: var(--text-primary);
//         }
        
//         .form-grid {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 1rem;
//           margin-bottom: 2rem;
//         }
        
//         .form-group {
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//         }
        
//         .form-group.full-width {
//           grid-column: 1 / -1;
//         }
        
//         .form-label {
//           font-weight: 500;
//           color: var(--text-primary);
//           font-size: 0.875rem;
//         }
        
//         .form-input {
//           padding: 0.75rem;
//           border: 1px solid var(--border-color);
//           border-radius: 0.375rem;
//           background-color: var(--card-bg);
//           color: var(--text-primary);
//           font-size: 0.875rem;
//           transition: all 0.2s;
//         }
        
//         .form-input:focus {
//           outline: none;
//           border-color: var(--primary-color);
//           box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
//         }
        
//         .form-input::placeholder {
//           color: var(--text-secondary);
//         }
        
//         textarea.form-input {
//           resize: vertical;
//           min-height: 80px;
//         }
        
//         .form-actions {
//           display: flex;
//           gap: 1rem;
//           justify-content: flex-end;
//         }
        
//         @media (max-width: 768px) {
//           .table-header {
//             flex-direction: column;
//             gap: 1rem;
//             align-items: flex-start;
//           }
          
//           .table-actions {
//             width: 100%;
//             justify-content: flex-end;
//           }
          
//           .search-container {
//             width: 200px;
//           }
          
//           .pagination {
//             flex-direction: column;
//             gap: 1rem;
//           }
          
//           .form-grid {
//             grid-template-columns: 1fr;
//           }
          
//           .user-detail-header {
//             flex-direction: column;
//             align-items: center;
//             text-align: center;
//             gap: 1rem;
//           }
          
//           .user-meta {
//             justify-content: center;
//           }
          
//           .form-actions {
//             flex-direction: column;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default User;
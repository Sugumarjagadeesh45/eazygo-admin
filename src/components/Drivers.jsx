import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck, FiSearch, FiUserPlus, FiEye, FiRefreshCw,
  FiMail, FiBell, FiSettings, FiUser, FiSun, FiMoon,
  FiLogOut, FiChevronDown, FiArrowLeft, FiArrowRight,
  FiPhone, FiMapPin, FiStar, FiDollarSign, FiFileText,
  FiCheckCircle, FiXCircle, FiX, FiEdit, FiFilter,
  FiUpload, FiClock, FiCreditCard, FiFile, FiCalendar, FiSave
} from 'react-icons/fi';

const Notification = ({ message, type, onClose }) => (
  <div className={`notification notification-${type}`}>
    <div className="notification-content">
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  </div>
);

// Regex patterns for Indian validation
const mobileRegex = /^[6-9]\d{9}$/;
const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
const licenseRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function Drivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showDriverDetails, setShowDriverDetails] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    driverId: '',
    vehicleNumber: ''
  });

  // Wallet editing states
  const [walletEditMode, setWalletEditMode] = useState(false);
  const [tempWalletAmount, setTempWalletAmount] = useState(0);
  const [walletAddAmount, setWalletAddAmount] = useState(0);
  const [walletSaving, setWalletSaving] = useState(false);

  const driversPerPage = 10;

  // File input refs
  const licenseRef = useRef(null);
  const aadhaarRef = useRef(null);
  const panRef = useRef(null);
  const rcRef = useRef(null);
  const bankRef = useRef(null);

  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    vehicleType: 'taxi',
    vehicleNumber: '',
    licenseNumber: '',
    aadharNumber: '',
    panNumber: '',
    ifscCode: '',
    bankAccountNumber: '',
    workingHours: '12',
    minWalletAmount: '',
    // Files
    licenseFiles: [],
    aadhaarFiles: [],
    panFiles: [],
    rcFiles: [],
    bankFile: null
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification('Authentication error. Please login again.', 'error');
      navigate("/");
      return null;
    }
    return token;
  };

  const fetchDrivers = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5001/api/admin/drivers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate("/");
          return;
        }
        throw new Error('Failed to fetch drivers');
      }

      const data = await response.json();
      if (data.success) {
        // Handle pagination on frontend if backend doesn't support it
        const allDrivers = data.data || [];
        const startIndex = (page - 1) * driversPerPage;
        const endIndex = startIndex + driversPerPage;
        
        setDrivers(allDrivers);
        setTotalPages(Math.ceil(allDrivers.length / driversPerPage));
      } else {
        throw new Error(data.message || 'Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showNotification('Failed to load drivers: ' + error.message, 'error');
      setDrivers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(currentPage);
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Toggle driver status function
  const toggleDriverStatus = async (id, currentStatus) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5001/api/admin/driver/${id}/toggle`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        fetchDrivers(currentPage);
        showNotification(`Driver is now ${currentStatus === 'Live' ? 'Offline' : 'Online'}`, 'success');
      } else {
        showNotification(result.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error('Error toggling driver status:', err);
      showNotification('Failed to update status', 'error');
    }
  };

  // Helper functions for input formatting
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  const formatVehicleNumber = (value) => {
    return value.toUpperCase().replace(/\s/g, '');
  };

  const formatLicenseNumber = (value) => {
    return value.toUpperCase().replace(/\s/g, '');
  };

  const formatAadhaarNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 12);
  };

  const formatPANNumber = (value) => {
    return value.toUpperCase().replace(/\s/g, '');
  };

  const formatIFSCCode = (value) => {
    return value.toUpperCase().replace(/\s/g, '');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!newDriver.name.trim()) newErrors.name = 'Name is required';
    
    // Phone validation
    if (!newDriver.phone.trim()) newErrors.phone = 'Phone number is required';
    if (newDriver.phone && !mobileRegex.test(newDriver.phone)) {
      newErrors.phone = 'Enter valid 10-digit Indian mobile number';
    }
    
    // Email validation (optional)
    if (newDriver.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newDriver.email)) {
      newErrors.email = 'Enter valid email address';
    }
    
    // Vehicle validation
    if (!newDriver.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (newDriver.vehicleNumber && !vehicleRegex.test(newDriver.vehicleNumber.toUpperCase())) {
      newErrors.vehicleNumber = 'Enter valid Indian vehicle number (e.g., TN01AB1234)';
    }
    
    // License validation
    if (!newDriver.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
    if (newDriver.licenseNumber && !licenseRegex.test(newDriver.licenseNumber.toUpperCase())) {
      newErrors.licenseNumber = 'Enter valid Indian license number (e.g., TN0120123456789)';
    }
    
    // Aadhaar validation
    if (!newDriver.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhaar number is required';
    if (newDriver.aadharNumber && !aadhaarRegex.test(newDriver.aadharNumber)) {
      newErrors.aadharNumber = 'Enter valid 12-digit Aadhaar number';
    }
    
    // PAN validation (optional)
    if (newDriver.panNumber && !panRegex.test(newDriver.panNumber.toUpperCase())) {
      newErrors.panNumber = 'Enter valid PAN number (e.g., ABCDE1234F)';
    }
    
    // IFSC validation (optional)
    if (newDriver.ifscCode && !ifscRegex.test(newDriver.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Enter valid IFSC code (e.g., SBIN0001234)';
    }
    
    // Document validation
    if (newDriver.licenseFiles.length === 0) newErrors.licenseFiles = 'License images are required (max 2)';
    if (newDriver.aadhaarFiles.length === 0) newErrors.aadhaarFiles = 'Aadhaar images are required (max 2)';
    if (newDriver.rcFiles.length === 0) newErrors.rcFiles = 'Vehicle RC images are required (max 7)';
    
    // Min wallet amount validation
    if (!newDriver.minWalletAmount || newDriver.minWalletAmount < 1000) {
      newErrors.minWalletAmount = 'Minimum wallet amount must be 1000 or above';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (e, fileType) => {
    const files = Array.from(e.target.files);
    let maxFiles = 1;
    
    switch(fileType) {
      case 'license':
        maxFiles = 2;
        break;
      case 'aadhaar':
        maxFiles = 2;
        break;
      case 'pan':
        maxFiles = 2;
        break;
      case 'rc':
        maxFiles = 7;
        break;
      case 'bank':
        maxFiles = 1;
        break;
    }
    
    if (files.length > maxFiles) {
      showNotification(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed for ${fileType}`, 'error');
      return;
    }
    
    // Check file types (images only)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      showNotification('Only JPG, PNG, and PDF files are allowed', 'error');
      return;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      showNotification('File size should be less than 5MB', 'error');
      return;
    }
    
    setNewDriver(prev => ({
      ...prev,
      [fileType + 'Files']: fileType === 'bank' ? files[0] : files
    }));
  };

  const removeFile = (fileType, index) => {
    setNewDriver(prev => {
      if (fileType === 'bank') {
        return { ...prev, bankFile: null };
      }
      const files = [...prev[fileType + 'Files']];
      files.splice(index, 1);
      return { ...prev, [fileType + 'Files']: files };
    });
  };


  const handleAddDriver = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    setSaving(true);
    const token = getAuthToken();
    if (!token) return;

    // Create FormData
    const formData = new FormData();
    
    // Add all text fields
    const textFields = [
      'name', 'phone', 'email', 'dob', 'vehicleType', 'vehicleNumber',
      'licenseNumber', 'aadharNumber', 'panNumber', 'ifscCode', 
      'bankAccountNumber', 'workingHours', 'minWalletAmount'
    ];
    
    textFields.forEach(field => {
      if (newDriver[field] !== undefined && newDriver[field] !== null) {
        formData.append(field, newDriver[field]);
      }
    });
    
    // Add files
    newDriver.licenseFiles.forEach((file) => {
      formData.append('licenseFiles', file);
    });
    
    newDriver.aadhaarFiles.forEach((file) => {
      formData.append('aadhaarFiles', file);
    });
    
    if (newDriver.panFiles.length > 0) {
      newDriver.panFiles.forEach((file) => {
        formData.append('panFiles', file);
      });
    }
    
    newDriver.rcFiles.forEach((file) => {
      formData.append('rcFiles', file);
    });
    
    if (newDriver.bankFile) {
      formData.append('bankFile', newDriver.bankFile);
    }

    console.log('📤 Sending FormData with:', {
      name: newDriver.name,
      phone: newDriver.phone,
      vehicleNumber: newDriver.vehicleNumber,
      licenseNumber: newDriver.licenseNumber,
      files: {
        license: newDriver.licenseFiles.length,
        aadhaar: newDriver.aadhaarFiles.length,
        rc: newDriver.rcFiles.length
      }
    });

    const response = await fetch('http://localhost:5001/api/admin/drivers/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type when sending FormData, let the browser set it with the boundary
      },
      body: formData
    });

    const result = await response.json();
    console.log('Add driver response:', result);

    if (result.success) {
      showNotification('Driver added successfully!', 'success');
      setShowAddDriverModal(false);
      
      // Reset form
      setNewDriver({
        name: '',
        phone: '',
        email: '',
        dob: '',
        vehicleType: 'taxi',
        vehicleNumber: '',
        licenseNumber: '',
        aadharNumber: '',
        panNumber: '',
        ifscCode: '',
        bankAccountNumber: '',
        workingHours: '12',
        minWalletAmount: '',
        licenseFiles: [],
        aadhaarFiles: [],
        panFiles: [],
        rcFiles: [],
        bankFile: null
      });
      
      // Refresh the drivers list
      await fetchDrivers(currentPage);
    } else {
      // Extract error message safely
      const errorMessage = result.message || result.error || 'Failed to add driver';
      showNotification(errorMessage, 'error');
    }
  } catch (err) {
    console.error('Error adding driver:', err);
    showNotification('Server error. Please try again.', 'error');
  } finally {
    setSaving(false);
  }
};




const updateDriverWallet = async (driverId, amount) => {
  try {
    setWalletSaving(true);
    const token = getAuthToken();
    if (!token) return;

    console.log(`💰 Sending wallet update request for driver: ${driverId} with amount: ${amount}`);

    const response = await fetch(`http://localhost:5001/api/admin/driver/${driverId}/wallet`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Wallet update failed with status ${response.status}:`, errorText);
      throw new Error(`Failed to update wallet: ${response.status}`);
    }

    const result = await response.json();
    console.log('Wallet update response:', result);

    if (result.success) {
      // Update the selected driver's wallet in the state
      setSelectedDriver(prev => ({
        ...prev,
        wallet: result.data.wallet
      }));
      
      // Update the driver in the drivers list
      setDrivers(prev => prev.map(driver => 
        driver._id === driverId || driver.driverId === driverId
          ? { ...driver, wallet: result.data.wallet }
          : driver
      ));
      
      // Show a more informative notification
      showNotification(
        `Wallet updated successfully! Added ${formatCurrency(result.data.addedAmount)} to wallet. New balance: ${formatCurrency(result.data.wallet)}`, 
        'success'
      );
      
      setWalletEditMode(false);
      setWalletAddAmount(0);
    } else {
      showNotification(result.message || 'Failed to update wallet', 'error');
    }
  } catch (err) {
    console.error('Error updating wallet:', err);
    showNotification('Failed to update wallet', 'error');
  } finally {
    setWalletSaving(false);
  }
};




  // Apply filters and search
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = searchTerm === '' || 
      driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.driverId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.includes(searchTerm) ||
      driver.vehicleNumber?.includes(searchTerm);

    const matchesFilters = 
      (filters.name === '' || driver.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.phone === '' || driver.phone?.includes(filters.phone)) &&
      (filters.driverId === '' || driver.driverId?.toLowerCase().includes(filters.driverId.toLowerCase())) &&
      (filters.vehicleNumber === '' || driver.vehicleNumber?.includes(filters.vehicleNumber));

    return matchesSearch && matchesFilters;
  });

  // Paginate filtered drivers
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * driversPerPage,
    currentPage * driversPerPage
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getVehicleIcon = (type) => {
    switch(type) {
      case 'bike': return '🏍️';
      case 'auto': return '🛺';
      case 'sedan': return '🚗';
      case 'mini': return '🚙';
      case 'port': return '🚢';
      default: return '🚕';
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      phone: '',
      driverId: '',
      vehicleNumber: ''
    });
    setSearchTerm('');
  };

  const FilePreview = ({ files, fileType, onRemove }) => {
    if (!files || files.length === 0) return null;
    
    if (fileType === 'bank') {
      return (
        <div className="file-preview">
          <span>{files.name}</span>
          <button type="button" onClick={() => onRemove('bank', 0)} className="remove-file">
            <FiX size={14} />
          </button>
        </div>
      );
    }
    
    return (
      <div className="files-preview">
        {files.map((file, index) => (
          <div key={index} className="file-preview">
            <span>{file.name}</span>
            <button type="button" onClick={() => onRemove(fileType, index)} className="remove-file">
              <FiX size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Handle opening driver details modal
  const openDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setTempWalletAmount(driver.wallet || 0);
    setWalletAddAmount(0);
    setWalletEditMode(false);
    setShowDriverDetails(true);
  };

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="main-content full-width">
        <header className="topbar">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search drivers by name, ID, phone, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn"><FiMail /><span className="badge">3</span></button>
            <button className="topbar-btn"><FiBell /><span className="badge">5</span></button>
            <button className="topbar-btn"><FiSettings /></button>
            <button className="topbar-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <div className="profile-dropdown">
              <button className="topbar-btn profile-btn" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <FiUser /><span>Admin</span><FiChevronDown className={`dropdown-icon ${profileDropdownOpen ? 'open' : ''}`} />
              </button>
              <ul className={`dropdown ${profileDropdownOpen ? 'open' : ''}`}>
                <li><a href="#">Profile</a></li>
                <li><a href="#">Settings</a></li>
                <li><a href="#" onClick={handleLogout}><FiLogOut /> Logout</a></li>
              </ul>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h1 className="welcome-title">Driver Management</h1>
              <p className="page-subtitle">Manage all registered drivers and monitor performance</p>
            </div>
            <div className="header-stats">
              <div className="stat-card online">
                <div className="stat-icon"><FiCheckCircle /></div>
                <div className="stat-content">
                  <div className="stat-number">{drivers.filter(d => d.status === 'Live').length}</div>
                  <div className="stat-label">Online</div>
                </div>
              </div>
              <div className="stat-card offline">
                <div className="stat-icon"><FiXCircle /></div>
                <div className="stat-content">
                  <div className="stat-number">{drivers.filter(d => d.status !== 'Live').length}</div>
                  <div className="stat-label">Offline</div>
                </div>
              </div>
              <div className="stat-card total">
                <div className="stat-icon"><FiTruck /></div>
                <div className="stat-content">
                  <div className="stat-number">{drivers.length}</div>
                  <div className="stat-label">Total Drivers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="filters-section">
            <div className="filters-header">
              <h3>Advanced Filters</h3>
              <button className="btn btn-text" onClick={clearFilters}>
                Clear All
              </button>
            </div>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Driver Name</label>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={filters.name}
                  onChange={(e) => setFilters({...filters, name: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  placeholder="Filter by phone..."
                  value={filters.phone}
                  onChange={(e) => setFilters({...filters, phone: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>Driver ID</label>
                <input
                  type="text"
                  placeholder="Filter by ID..."
                  value={filters.driverId}
                  onChange={(e) => setFilters({...filters, driverId: e.target.value})}
                />
              </div>
              <div className="filter-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  placeholder="Filter by vehicle..."
                  value={filters.vehicleNumber}
                  onChange={(e) => setFilters({...filters, vehicleNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="content-actions">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table View
              </button>
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
            </div>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => setShowAddDriverModal(true)}>
                <FiUserPlus /> Add Driver
              </button>
              <button className="btn btn-secondary" onClick={() => fetchDrivers(currentPage)}>
                <FiRefreshCw /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading drivers...</p>
            </div>
          ) : (
            <>
              {viewMode === 'table' ? (
                <div className="table-card">
                  <div className="table-container">
                    <table className="drivers-table">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Driver ID</th>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Vehicle</th>
                          <th>Rating</th>
                          <th>Rides</th>
                          <th>Wallet</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedDrivers.map((driver, index) => (
                          <tr key={driver._id} className="driver-row">
                            <td className="serial-number">{(currentPage - 1) * driversPerPage + index + 1}</td>
                            <td className="driver-id">{driver.driverId || driver._id.slice(-8)}</td>
                            <td className="driver-name-cell">
                              <div className="driver-name-wrapper">
                                <div className="driver-avatar">
                                  <div className="avatar-placeholder">
                                    {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                                  </div>
                                </div>
                                <span className="driver-name-text">{driver.name}</span>
                              </div>
                            </td>
                            <td className="contact-info">{driver.phone}</td>
                            <td>
                              <div className="vehicle-info">
                                <span className="vehicle-icon">{getVehicleIcon(driver.vehicleType)}</span>
                                <div className="vehicle-details">
                                  <div className="vehicle-type">{driver.vehicleType}</div>
                                  <div className="vehicle-number">{driver.vehicleNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="rating">
                                <FiStar className="rating-icon" />
                                {driver.rating || 'N/A'}
                              </div>
                            </td>
                            <td className="rides-count">{driver.totalRides || 0}</td>
                            <td className="wallet">{formatCurrency(driver.wallet)}</td>
                            <td>
                              <span className={`status-badge ${driver.status === 'Live' ? 'online' : 'offline'}`}>
                                {driver.status === 'Live' ? <FiCheckCircle /> : <FiXCircle />}
                                {driver.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-action view" 
                                  onClick={() => openDriverDetails(driver)}
                                  title="View Details"
                                >
                                  <FiEye />
                                </button>
                                <button
                                  className={`btn-action status ${driver.status === 'Live' ? 'offline' : 'online'}`}
                                  onClick={() => toggleDriverStatus(driver._id, driver.status)}
                                  title={driver.status === 'Live' ? 'Go Offline' : 'Go Online'}
                                >
                                  {driver.status === 'Live' ? <FiXCircle /> : <FiCheckCircle />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="drivers-grid">
                  {paginatedDrivers.map((driver) => (
                    <div key={driver._id} className="driver-card">
                      <div className="driver-card-header">
                        <div className="driver-avatar">
                          <div className="avatar-placeholder">
                            {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                          </div>
                        </div>
                        <div className="driver-info">
                          <h3 className="driver-name">{driver.name}</h3>
                          <p className="driver-id">ID: {driver.driverId || driver._id.slice(-8)}</p>
                        </div>
                        <div className={`status-badge ${driver.status === 'Live' ? 'online' : 'offline'}`}>
                          {driver.status === 'Live' ? <FiCheckCircle /> : <FiXCircle />}
                          {driver.status}
                        </div>
                      </div>
                      
                      <div className="driver-details">
                        <div className="detail-item">
                          <FiPhone className="detail-icon" />
                          <span>{driver.phone}</span>
                        </div>
                        <div className="detail-item">
                          <span className="vehicle-icon">{getVehicleIcon(driver.vehicleType)}</span>
                          <span>{driver.vehicleType} • {driver.vehicleNumber}</span>
                        </div>
                        <div className="detail-item">
                          <FiStar className="detail-icon" />
                          <span>{driver.rating || 'N/A'} Rating</span>
                        </div>
                        <div className="detail-item">
                          <FiMapPin className="detail-icon" />
                          <span>{driver.totalRides || 0} Rides</span>
                        </div>
                      </div>
                      
                      <div className="driver-wallet">
                        <div className="wallet-label">Total Wallet</div>
                        <div className="wallet-amount">{formatCurrency(driver.wallet)}</div>
                      </div>
                      
                      <div className="driver-actions">
                        <button 
                          className="btn-action view"
                          onClick={() => openDriverDetails(driver)}
                          title="View Details"
                        >
                          <FiEye />
                          Details
                        </button>
                        <button 
                          className={`btn-action status ${driver.status === 'Live' ? 'offline' : 'online'}`}
                          onClick={() => toggleDriverStatus(driver._id, driver.status)}
                          title={`Mark as ${driver.status === 'Live' ? 'Offline' : 'Online'}`}
                        >
                          {driver.status === 'Live' ? <FiXCircle /> : <FiCheckCircle />}
                          {driver.status === 'Live' ? 'Go Offline' : 'Go Online'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredDrivers.length === 0 && !loading && (
                <div className="empty-state">
                  <FiTruck size={64} />
                  <h3>No Drivers Found</h3>
                  <p>No drivers match your search criteria.</p>
                  <button className="btn btn-primary" onClick={() => setShowAddDriverModal(true)}>
                    <FiUserPlus /> Add First Driver
                  </button>
                </div>
              )}

              {filteredDrivers.length > 0 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                    disabled={currentPage === 1}
                  >
                    <FiArrowLeft /> Previous
                  </button>
                  <div className="page-indicator">Page {currentPage} of {totalPages}</div>
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                    disabled={currentPage === totalPages}
                  >
                    Next <FiArrowRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add Driver Modal */}
        {showAddDriverModal && (
          <div className="modal-overlay">
            <div className="modal-content large">
              <div className="modal-header">
                <h2>Add New Driver</h2>
                <button className="close-btn" onClick={() => setShowAddDriverModal(false)}><FiX /></button>
              </div>
              <form onSubmit={handleAddDriver}>
                <div className="form-sections">
                  {/* Personal Information */}
                  <div className="form-section">
                    <h3 className="section-title">Personal Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input 
                          type="text" 
                          value={newDriver.name} 
                          onChange={e => setNewDriver({...newDriver, name: e.target.value})} 
                          className={`form-input ${errors.name ? 'error' : ''}`} 
                          placeholder="Enter full name"
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input 
                          type="tel" 
                          value={newDriver.phone} 
                          onChange={e => setNewDriver({...newDriver, phone: formatPhoneNumber(e.target.value)})} 
                          className={`form-input ${errors.phone ? 'error' : ''}`} 
                          placeholder="10-digit mobile number"
                          maxLength="10"
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email (Optional)</label>
                        <input 
                          type="email" 
                          value={newDriver.email} 
                          onChange={e => setNewDriver({...newDriver, email: e.target.value})} 
                          className={`form-input ${errors.email ? 'error' : ''}`} 
                          placeholder="Email address"
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input 
                          type="date" 
                          value={newDriver.dob} 
                          onChange={e => setNewDriver({...newDriver, dob: e.target.value})} 
                          className="form-input" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Vehicle Information */}
                  <div className="form-section">
                    <h3 className="section-title">Vehicle Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Vehicle Type *</label>
                        <select 
                          value={newDriver.vehicleType} 
                          onChange={e => setNewDriver({...newDriver, vehicleType: e.target.value})} 
                          className="form-input"
                        >
                          <option value="port">Port</option>
                          <option value="taxi">Taxi/Auto</option>
                          <option value="bike">Bike</option>
                          <option value="sedan">Sedan</option>
                          <option value="mini">Mini</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Vehicle Number *</label>
                        <input 
                          type="text" 
                          value={newDriver.vehicleNumber} 
                          onChange={e => setNewDriver({...newDriver, vehicleNumber: formatVehicleNumber(e.target.value)})} 
                          className={`form-input ${errors.vehicleNumber ? 'error' : ''}`} 
                          placeholder="e.g. TN01AB1234" 
                        />
                        {errors.vehicleNumber && <span className="error-text">{errors.vehicleNumber}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Working Hours *</label>
                        <div className="radio-group">
                          <label className="radio-label">
                            <input 
                              type="radio" 
                              name="workingHours"
                              value="12"
                              checked={newDriver.workingHours === '12'}
                              onChange={e => setNewDriver({...newDriver, workingHours: e.target.value})}
                            />
                            <span>12 Hours</span>
                          </label>
                          <label className="radio-label">
                            <input 
                              type="radio" 
                              name="workingHours"
                              value="24"
                              checked={newDriver.workingHours === '24'}
                              onChange={e => setNewDriver({...newDriver, workingHours: e.target.value})}
                            />
                            <span>24 Hours</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Minimum Wallet Amount *</label>
                        <input
                          type="number"
                          value={newDriver.minWalletAmount}
                          onChange={e => {
                            const raw = e.target.value;
                            if (raw === "") {
                              setNewDriver({ ...newDriver, minWalletAmount: "" });
                              return;
                            }
                            const value = Number(raw);
                            setNewDriver({ ...newDriver, minWalletAmount: value });
                          }}
                          className={`form-input ${
                            newDriver.minWalletAmount === ""
                              ? ""
                              : newDriver.minWalletAmount < 1000
                              ? "error"
                              : newDriver.minWalletAmount === 1000
                              ? "success"
                              : ""
                          }`}
                          placeholder="Minimum wallet amount"
                        />
                        {newDriver.minWalletAmount !== "" &&
                          newDriver.minWalletAmount < 1000 && (
                            <span className="error-text">
                              Minimum wallet amount must be 1000 or above
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Verification */}
                  <div className="form-section">
                    <h3 className="section-title">Document Verification</h3>
                    
                    {/* License */}
                    <div className="form-group document-group">
                      <label className="form-label">Driving License *</label>
                      <div className="document-input">
                        <input 
                          type="text" 
                          value={newDriver.licenseNumber} 
                          onChange={e => setNewDriver({...newDriver, licenseNumber: formatLicenseNumber(e.target.value)})} 
                          className={`form-input ${errors.licenseNumber ? 'error' : ''}`} 
                          placeholder="License number (e.g., TN0120123456789)"
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => licenseRef.current.click()}
                        >
                          <FiUpload /> Upload (Max 2 files)
                        </button>
                        <input 
                          type="file" 
                          ref={licenseRef}
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'license')}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
                      {errors.licenseFiles && <span className="error-text">{errors.licenseFiles}</span>}
                      <FilePreview 
                        files={newDriver.licenseFiles} 
                        fileType="license" 
                        onRemove={removeFile}
                      />
                      <div className="help-text">Upload front and back of license (JPG, PNG, PDF, max 5MB each)</div>
                    </div>
                    
                    {/* Aadhaar */}
                    <div className="form-group document-group">
                      <label className="form-label">Aadhaar Card *</label>
                      <div className="document-input">
                        <input 
                          type="text" 
                          value={newDriver.aadharNumber} 
                          onChange={e => setNewDriver({...newDriver, aadharNumber: formatAadhaarNumber(e.target.value)})} 
                          className={`form-input ${errors.aadharNumber ? 'error' : ''}`} 
                          placeholder="12-digit Aadhaar number"
                          maxLength="12"
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => aadhaarRef.current.click()}
                        >
                          <FiUpload /> Upload (Max 2 files)
                        </button>
                        <input 
                          type="file" 
                          ref={aadhaarRef}
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'aadhaar')}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {errors.aadharNumber && <span className="error-text">{errors.aadharNumber}</span>}
                      {errors.aadhaarFiles && <span className="error-text">{errors.aadhaarFiles}</span>}
                      <FilePreview 
                        files={newDriver.aadhaarFiles} 
                        fileType="aadhaar" 
                        onRemove={removeFile}
                      />
                      <div className="help-text">Upload front and back of Aadhaar (JPG, PNG, PDF, max 5MB each)</div>
                    </div>
                    
                    {/* PAN */}
                    <div className="form-group document-group">
                      <label className="form-label">PAN Card</label>
                      <div className="document-input">
                        <input 
                          type="text" 
                          value={newDriver.panNumber} 
                          onChange={e => setNewDriver({...newDriver, panNumber: formatPANNumber(e.target.value)})} 
                          className={`form-input ${errors.panNumber ? 'error' : ''}`} 
                          placeholder="PAN number (e.g., ABCDE1234F)"
                          maxLength="10"
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => panRef.current.click()}
                        >
                          <FiUpload /> Upload (Max 2 files)
                        </button>
                        <input 
                          type="file" 
                          ref={panRef}
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'pan')}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {errors.panNumber && <span className="error-text">{errors.panNumber}</span>}
                      <FilePreview 
                        files={newDriver.panFiles} 
                        fileType="pan" 
                        onRemove={removeFile}
                      />
                      <div className="help-text">Upload front and back of PAN card (Optional)</div>
                    </div>
                    
                    {/* Vehicle RC */}
                    <div className="form-group document-group">
                      <label className="form-label">Vehicle RC *</label>
                      <div className="document-input">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => rcRef.current.click()}
                        >
                          <FiUpload /> Upload (Max 7 files)
                        </button>
                        <input 
                          type="file" 
                          ref={rcRef}
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'rc')}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {errors.rcFiles && <span className="error-text">{errors.rcFiles}</span>}
                      <FilePreview 
                        files={newDriver.rcFiles} 
                        fileType="rc" 
                        onRemove={removeFile}
                      />
                      <div className="help-text">Upload all pages of Vehicle RC (Required)</div>
                    </div>
                  </div>
                  
                  {/* Bank Details */}
                  <div className="form-section">
                    <h3 className="section-title">Bank Details</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">IFSC Code</label>
                        <input 
                          type="text" 
                          value={newDriver.ifscCode} 
                          onChange={e => setNewDriver({...newDriver, ifscCode: formatIFSCCode(e.target.value)})} 
                          className={`form-input ${errors.ifscCode ? 'error' : ''}`} 
                          placeholder="Bank IFSC code (e.g., SBIN0001234)"
                          maxLength="11"
                        />
                        {errors.ifscCode && <span className="error-text">{errors.ifscCode}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input 
                          type="text" 
                          value={newDriver.bankAccountNumber} 
                          onChange={e => setNewDriver({...newDriver, bankAccountNumber: e.target.value})} 
                          className="form-input" 
                          placeholder="Account number"
                        />
                      </div>
                    </div>
                    
                    {/* Bank Proof */}
                    <div className="form-group document-group">
                      <label className="form-label">Bank Proof (Passbook/Cheque)</label>
                      <div className="document-input">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => bankRef.current.click()}
                        >
                          <FiUpload /> Upload (Max 1 file)
                        </button>
                        <input 
                          type="file" 
                          ref={bankRef}
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => handleFileUpload(e, 'bank')}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <FilePreview 
                        files={newDriver.bankFile} 
                        fileType="bank" 
                        onRemove={removeFile}
                      />
                      <div className="help-text">Upload bank passbook or cancelled cheque (Optional)</div>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddDriverModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="loading-spinner-small"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Driver'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Driver Details Modal */}
        {showDriverDetails && selectedDriver && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Driver Details</h2>
                <button className="close-btn" onClick={() => setShowDriverDetails(false)}><FiX /></button>
              </div>
              <div className="driver-detail-card">
                <div className="driver-detail-header">
                  <div className="driver-avatar-large">
                    <div className="avatar-placeholder-large">
                      {selectedDriver.name?.charAt(0)?.toUpperCase() || 'D'}
                    </div>
                  </div>
                  <div className="driver-info">
                    <h2>{selectedDriver.name}</h2>
                    <p>ID: {selectedDriver.driverId || selectedDriver._id}</p>
                    <div className={`status-badge large ${selectedDriver.status === 'Live' ? 'online' : 'offline'}`}>
                      {selectedDriver.status === 'Live' ? <FiCheckCircle /> : <FiXCircle />}
                      {selectedDriver.status}
                    </div>
                  </div>
                </div>
                <div className="details-grid">
                  <div className="detail-card">
                    <FiPhone className="detail-card-icon" />
                    <div className="detail-card-content">
                      <label>Phone</label>
                      <p>{selectedDriver.phone}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <span className="vehicle-icon large">{getVehicleIcon(selectedDriver.vehicleType)}</span>
                    <div className="detail-card-content">
                      <label>Vehicle</label>
                      <p>{selectedDriver.vehicleType} • {selectedDriver.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiStar className="detail-card-icon" />
                    <div className="detail-card-content">
                      <label>Rating</label>
                      <p>{selectedDriver.rating || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiMapPin className="detail-card-icon" />
                    <div className="detail-card-content">
                      <label>Total Rides</label>
                      <p>{selectedDriver.totalRides || 0}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiDollarSign className="detail-card-icon" />
                    <div className="detail-card-content">
                      <label>Total Wallet</label>
                      <p>{formatCurrency(selectedDriver.wallet)}</p>
                    </div>
                  </div>
                  <div className="detail-card">
                    <FiClock className="detail-card-icon" />
                    <div className="detail-card-content">
                      <label>Working Hours</label>
                      <p>{selectedDriver.workingHours || '12'} Hours</p>
                    </div>
                  </div>
                </div>

                {/* Wallet Section */}
                <div className="wallet-section">
                  <h3 className="section-title">Wallet Management</h3>
                  <div className="wallet-card">
                    <div className="wallet-current">
                      <div className="wallet-label">Current Balance</div>
                      <div className="wallet-amount">{formatCurrency(selectedDriver.wallet)}</div>
                    </div>
                    
               
{walletEditMode ? (
  <div className="wallet-edit-form">
    <div className="form-group">
      <label className="form-label">Add Amount to Wallet</label>
      <div className="wallet-input-group">
        <span className="currency-symbol">₹</span>
        <input
          type="number"
          value={walletAddAmount}
          onChange={(e) => setWalletAddAmount(e.target.value)}
          className="form-input"
          placeholder="Enter amount to add"
          min="0"
        />
      </div>
      <div className="help-text">
        This amount will be added to the current wallet balance of {formatCurrency(selectedDriver.wallet)}
      </div>
    </div>
    <div className="wallet-actions">
      <button 
        className="btn btn-secondary" 
        onClick={() => {
          setWalletEditMode(false);
          setWalletAddAmount(0);
        }}
        disabled={walletSaving}
      >
        Cancel
      </button>
      <button 
        className="btn btn-primary" 
        onClick={() => updateDriverWallet(selectedDriver.driverId || selectedDriver._id, walletAddAmount)}
        disabled={walletSaving || !walletAddAmount || walletAddAmount <= 0}
      >
        {walletSaving ? (
          <>
            <div className="loading-spinner-small"></div>
            Saving...
          </>
        ) : (
          <>
            <FiSave /> Add to Wallet
          </>
        )}
      </button>
    </div>
  </div>
) : (
  <div className="wallet-actions">
    <button 
      className="btn btn-primary" 
      onClick={() => setWalletEditMode(true)}
    >
      <FiEdit /> Add to Wallet
    </button>
  </div>
)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        :root {
          --primary-color: #6366f1;
          --secondary-color: #8b5cf6;
          --accent-color: #ec4899;
          --success-color: #10b981;
          --danger-color: #ef4444;
          --warning-color: #f59e0b;
          --sidebar-bg: #1e293b;
          --topbar-bg: #ffffff;
          --card-bg: #ffffff;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --border-color: #e2e8f0;
          --shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        }
        .dark { 
          --sidebar-bg: #0f172a; 
          --topbar-bg: #1e293b; 
          --card-bg: #334155; 
          --text-primary: #f1f5f9; 
          --text-secondary: #cbd5e1; 
          --border-color: #475569; 
        }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
        .admin-dashboard { display:flex; min-height:100vh; background:#f8fafc; color:var(--text-primary); transition:all .3s; }
        .dark .admin-dashboard { background:#0f172a; }

        /* Notification */
        .notification { position:fixed; top:20px; right:20px; padding:16px 20px; border-radius:8px; color:#fff; font-weight:500; z-index:10000; max-width:400px; box-shadow:var(--shadow-lg); animation:slideIn .3s; }
        .notification-success { background:var(--success-color); }
        .notification-error { background:var(--danger-color); }
        .notification-info { background:var(--primary-color); }
        .notification-content { display:flex; align-items:center; justify-content:space-between; }
        .notification-close { background:none; border:none; color:#fff; font-size:18px; cursor:pointer; }
        @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }

        /* Main Content */
        .main-content.full-width { width:100%; max-width:100%; }
        .topbar { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; background:var(--topbar-bg); box-shadow:var(--shadow); z-index:50; }
        .search-container { display:flex; align-items:center; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.5rem; padding:.5rem 1rem; width:300px; }
        .search-icon { color:var(--text-secondary); margin-right:.5rem; }
        .search-container input { border:none; background:none; outline:none; flex:1; color:var(--text-primary); }
        .topbar-actions { display:flex; gap:.5rem; align-items:center; }
        .topbar-btn { background:none; border:none; color:var(--text-primary); font-size:1.25rem; padding:.5rem; border-radius:.375rem; cursor:pointer; position:relative; }
        .topbar-btn:hover { background:var(--border-color); }
        .badge { position:absolute; top:0; right:0; background:var(--accent-color); color:#fff; font-size:.75rem; padding:0.125rem .375rem; border-radius:9999px; }

        /* Dashboard Content */
        .dashboard-content { padding:1.5rem; flex:1; }
        .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
        .welcome-title { font-size:2rem; font-weight:700; color:var(--text-primary); }
        .page-subtitle { color:var(--text-secondary); }
        .header-stats { display:flex; gap:1rem; }
        .stat-card { display:flex; align-items:center; gap:1rem; padding:1rem 1.5rem; background:var(--card-bg); border-radius:.75rem; box-shadow:var(--shadow); border:1px solid var(--border-color); }
        .stat-icon { width:48px; height:48px; border-radius:.5rem; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
        .stat-card.online .stat-icon { background:rgba(16,185,129,0.1); color:var(--success-color); }
        .stat-card.offline .stat-icon { background:rgba(100,116,139,0.1); color:var(--text-secondary); }
        .stat-card.total .stat-icon { background:rgba(99,102,241,0.1); color:var(--primary-color); }
        .stat-number { font-size:1.5rem; font-weight:700; color:var(--text-primary); }
        .stat-label { font-size:.875rem; color:var(--text-secondary); }

        /* Filters Section */
        .filters-section { background:var(--card-bg); border-radius:.75rem; padding:1.5rem; margin-bottom:2rem; box-shadow:var(--shadow); border:1px solid var(--border-color); }
        .filters-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
        .filters-header h3 { font-size:1.125rem; font-weight:600; color:var(--text-primary); }
        .btn-text { background:none; border:none; color:var(--primary-color); cursor:pointer; font-weight:500; }
        .filters-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
        .filter-group { display:flex; flex-direction:column; gap:.5rem; }
        .filter-group label { font-size:.875rem; font-weight:500; color:var(--text-primary); }
        .filter-group input { padding:.75rem; border:1px solid var(--border-color); border-radius:.375rem; background:var(--card-bg); color:var(--text-primary); font-size:.875rem; }
        .filter-group input:focus { outline:none; border-color:var(--primary-color); }

        /* Content Actions */
        .content-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
        .view-toggle { display:flex; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.5rem; overflow:hidden; }
        .view-btn { padding:.75rem 1.5rem; background:none; border:none; color:var(--text-secondary); cursor:pointer; font-weight:500; transition:all .2s; }
        .view-btn.active { background:var(--primary-color); color:#fff; }
        .action-buttons { display:flex; gap:1rem; }

        /* Buttons */
        .btn { padding:.75rem 1.5rem; border:none; border-radius:.5rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:.5rem; transition:all .2s; }
        .btn-primary { background:var(--primary-color); color:#fff; }
        .btn-primary:hover { background:#4f46e5; }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .btn-secondary { background:var(--border-color); color:var(--text-primary); }
        .btn-secondary:hover { background:#e2e8f0; }

        /* Table View - FIXED ALIGNMENT */
        .table-card { background:var(--card-bg); border-radius:.75rem; box-shadow:var(--shadow); overflow:hidden; }
        .table-container { overflow-x:auto; }
        .drivers-table { width:100%; border-collapse:collapse; }
        .drivers-table th, .drivers-table td { padding:1rem; text-align:left; border-bottom:1px solid var(--border-color); vertical-align:middle; }
        .drivers-table th { background:var(--card-bg); font-weight:600; color:var(--text-primary); font-size:.875rem; text-transform:uppercase; letter-spacing:.05em; }
        .driver-row:hover { background:rgba(99,102,241,.05); }
        
        /* FIXED: Name column alignment */
        .driver-name-cell { vertical-align:middle; }
        .driver-name-wrapper { display:flex; align-items:center; gap:.75rem; height:100%; }
        .driver-avatar { width:40px; height:40px; border-radius:50%; overflow:hidden; flex-shrink:0; }
        .avatar-placeholder { width:100%; height:100%; background:var(--primary-color); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:.875rem; }
        .driver-name-text { font-weight:500; color:var(--text-primary); }
        
        .serial-number, .driver-id, .contact-info, .rides-count { color:var(--text-secondary); font-size:.875rem; }
        .vehicle-info { display:flex; align-items:center; gap:.5rem; }
        .vehicle-icon { font-size:1.25rem; flex-shrink:0; }
        .vehicle-details { display:flex; flex-direction:column; }
        .vehicle-type { font-weight:500; font-size:.875rem; }
        .vehicle-number { font-size:.75rem; color:var(--text-secondary); }
        .rating { display:flex; align-items:center; gap:.25rem; font-weight:500; }
        .rating-icon { color:var(--warning-color); font-size:.875rem; }
        .Wallet { font-weight:600; color:var(--success-color); font-size:.875rem; }
        .status-badge { display:flex; align-items:center; gap:.25rem; padding:.25rem .75rem; border-radius:9999px; font-size:.75rem; font-weight:500; width:fit-content; }
        .status-badge.online { background:rgba(16,185,129,0.1); color:var(--success-color); }
        .status-badge.offline { background:rgba(100,116,139,0.1); color:var(--text-secondary); }
        .action-buttons { display:flex; gap:.5rem; }
        .btn-action { padding:.5rem; border:none; border-radius:.375rem; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; }
        .btn-action.view { background:rgba(59,130,246,0.1); color:#3b82f6; }
        .btn-action.status { background:rgba(16,185,129,0.1); color:var(--success-color); }
        .btn-action.status.offline { background:rgba(245,158,11,0.1); color:var(--warning-color); }

        /* Grid View */
        .drivers-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(350px,1fr)); gap:1.5rem; margin-bottom:2rem; }
        .driver-card { background:var(--card-bg); border-radius:.75rem; padding:1.5rem; box-shadow:var(--shadow); border:1px solid var(--border-color); transition:all .3s; }
        .driver-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-lg); }
        .driver-card-header { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1rem; }
        .driver-info { flex:1; }
        .driver-info h3 { font-size:1.125rem; font-weight:600; color:var(--text-primary); margin-bottom:.25rem; }
        .driver-info p { font-size:.875rem; color:var(--text-secondary); }
        .driver-details { display:flex; flex-direction:column; gap:.75rem; margin-bottom:1rem; }
        .detail-item { display:flex; align-items:center; gap:.75rem; font-size:.875rem; color:var(--text-secondary); }
        .detail-icon { color:var(--primary-color); }
        .driver-Wallet { background:linear-gradient(135deg,#f8fafc,#e2e8f0); padding:1rem; border-radius:.5rem; margin-bottom:1.5rem; text-align:center; }
        .Wallet-label { font-size:.75rem; color:var(--text-secondary); margin-bottom:.25rem; }
        .Wallet-amount { font-size:1.25rem; font-weight:700; color:var(--success-color); }
        .driver-actions { display:flex; gap:.5rem; }
        .btn-action { flex:1; display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.5rem; font-size:.75rem; }

        /* Loading and Empty States */
        .loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem; color:var(--text-secondary); }
        .loading-spinner { width:40px; height:40px; border:4px solid var(--border-color); border-left:4px solid var(--primary-color); border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem; }
        .loading-spinner-small { width:16px; height:16px; border:2px solid transparent; border-left:2px solid white; border-radius:50%; animation:spin 1s linear infinite; }
        @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem; text-align:center; color:var(--text-secondary); }
        .empty-state h3 { margin-bottom:.5rem; color:var(--text-primary); }

        /* Pagination */
        .pagination { display:flex; align-items:center; justify-content:space-between; padding:1.5rem; border-top:1px solid var(--border-color); }
        .pagination-btn { display:flex; align-items:center; gap:.5rem; padding:.5rem 1rem; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.375rem; color:var(--text-primary); cursor:pointer; transition:all .2s; }
        .pagination-btn:hover:not(:disabled) { background:var(--border-color); }
        .pagination-btn:disabled { opacity:.5; cursor:not-allowed; }
        .page-indicator { font-weight:500; color:var(--text-primary); }

        /* Modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; justify-content:center; align-items:center; z-index:1000; }
        .modal-content { background:var(--card-bg); border-radius:.75rem; max-width:900px; width:90%; max-height:90vh; overflow-y:auto; }
        .modal-content.large { max-width:800px; }
        .modal-header { display:flex; justify-content:space-between; padding:1.5rem; border-bottom:1px solid var(--border-color); }
        .modal-header h2 { font-size:1.5rem; font-weight:600; color:var(--text-primary); }
        .close-btn { background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-secondary); }
        .form-sections { padding:1.5rem; }
        .form-section { margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-color); }
        .form-section:last-child { border-bottom:none; }
        .section-title { font-size:1.125rem; font-weight:600; color:var(--text-primary); margin-bottom:1rem; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .form-group { display:flex; flex-direction:column; gap:.5rem; margin-bottom:1.5rem; }
        .form-label { font-weight:500; font-size:.875rem; color:var(--text-primary); }
        .form-input { padding:.75rem; border:1px solid var(--border-color); border-radius:.375rem; background:var(--card-bg); color:var(--text-primary); font-size:.875rem; }
        .form-input:focus { outline:none; border-color:var(--primary-color); }
        .form-input.error { border-color:var(--danger-color); }
        .error-text { color:var(--danger-color); font-size:.75rem; }
        .form-actions { display:flex; justify-content:flex-end; gap:1rem; padding:1.5rem; border-top:1px solid var(--border-color); }

        /* Radio Group */
        .radio-group { display:flex; gap:2rem; margin-top:.5rem; }
        .radio-label { display:flex; align-items:center; gap:.5rem; cursor:pointer; font-size:.875rem; color:var(--text-primary); }
        .radio-label input[type="radio"] { width:16px; height:16px; cursor:pointer; }

        /* Document Upload Styles */
        .document-group { margin-bottom:1.5rem; }
        .document-input { display:flex; gap:1rem; }
        .document-input .btn-secondary { white-space:nowrap; }
        .files-preview { display:flex; flex-direction:column; gap:.5rem; margin-top:.5rem; }
        .file-preview { display:flex; justify-content:space-between; align-items:center; padding:.5rem .75rem; background:var(--border-color); border-radius:.375rem; font-size:.75rem; }
        .remove-file { background:none; border:none; color:var(--danger-color); cursor:pointer; padding:0; }

        /* Driver Details Modal */
        .driver-detail-card { padding:1.5rem; }
        .driver-detail-header { display:flex; align-items:center; gap:1.5rem; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-color); }
        .driver-avatar-large { width:80px; height:80px; border-radius:50%; overflow:hidden; }
        .avatar-placeholder-large { width:100%; height:100%; background:var(--primary-color); color:#fff; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:600; }
        .driver-info h2 { font-size:1.5rem; font-weight:700; color:var(--text-primary); margin-bottom:.5rem; }
        .driver-info p { color:var(--text-secondary); margin-bottom:.5rem; }
        .status-badge.large { font-size:.875rem; padding:.5rem 1rem; }
        .details-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
        .detail-card { display:flex; align-items:center; gap:1rem; padding:1rem; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.5rem; }
        .detail-card-icon { width:24px; height:24px; color:var(--primary-color); }
        .vehicle-icon.large { font-size:1.5rem; }
        .detail-card-content { flex:1; }
        .detail-card-content label { display:block; font-size:.75rem; color:var(--text-secondary); margin-bottom:.25rem; }
        .detail-card-content p { font-size:.875rem; font-weight:500; color:var(--text-primary); }

        /* Wallet Section */
        .wallet-section { margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-color); }
        .wallet-card { background:linear-gradient(135deg, #f8fafc, #e2e8f0); border-radius:.75rem; padding:1.5rem; margin-top:1rem; }
        .wallet-current { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
        .wallet-label { font-size:.875rem; color:var(--text-secondary); }
        .wallet-amount { font-size:1.5rem; font-weight:700; color:var(--success-color); }
        .wallet-edit-form { display:flex; flex-direction:column; gap:1rem; }
        .wallet-input-group { display:flex; align-items:center; border:1px solid var(--border-color); border-radius:.375rem; background:var(--card-bg); }
        .currency-symbol { padding:.75rem; color:var(--text-secondary); font-weight:500; }
        .wallet-input-group .form-input { border:none; flex:1; padding:.75rem; }
        .wallet-actions { display:flex; gap:1rem; justify-content:flex-end; }

        /* Responsive */
        @media (max-width:768px) {
          .page-header { flex-direction:column; align-items:flex-start; gap:1rem; }
          .header-stats { width:100%; justify-content:space-between; }
          .content-actions { flex-direction:column; gap:1rem; align-items:stretch; }
          .filters-grid { grid-template-columns:1fr; }
          .form-grid { grid-template-columns:1fr; }
          .drivers-grid { grid-template-columns:1fr; }
          .driver-detail-header { flex-direction:column; text-align:center; }
          .details-grid { grid-template-columns:1fr; }
          .document-input { flex-direction:column; }
          .radio-group { flex-direction:column; gap:1rem; }
          .wallet-current { flex-direction:column; align-items:flex-start; gap:.5rem; }
          .wallet-actions { flex-direction:column; }
        }

        .form-input {
          border: 1px solid #ccc;
          padding: 10px;
          border-radius: 6px;
          outline: none;
        }

        .form-input.error {
          border-color: red !important;
        }

        .form-input.success {
          border-color: green !important;
        }
      `}</style>
    </div>
  );
}

export default Drivers;




// // src/components/Drivers.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FiTruck, FiSearch, FiUserPlus, FiEye, FiRefreshCw,
//   FiMail, FiBell, FiSettings, FiUser, FiSun, FiMoon,
//   FiLogOut, FiChevronDown, FiArrowLeft, FiArrowRight,
//   FiPhone, FiMapPin, FiStar, FiDollarSign, FiFileText,
//   FiCheckCircle, FiXCircle, FiX, FiEdit, FiFilter,
//   FiUpload, FiClock
// } from 'react-icons/fi';

// const Notification = ({ message, type, onClose }) => (
//   <div className={`notification notification-${type}`}>
//     <div className="notification-content">
//       <span className="notification-message">{message}</span>
//       <button className="notification-close" onClick={onClose}>×</button>
//     </div>
//   </div>
// );

// function Drivers() {
//   const navigate = useNavigate();
//   const [drivers, setDrivers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [darkMode, setDarkMode] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const [showAddDriverModal, setShowAddDriverModal] = useState(false);
//   const [showDriverDetails, setShowDriverDetails] = useState(false);
//   const [selectedDriver, setSelectedDriver] = useState(null);
//   const [notification, setNotification] = useState(null);
//   const [viewMode, setViewMode] = useState('table');
//   const [filters, setFilters] = useState({
//     name: '',
//     phone: '',
//     driverId: '',
//     vehicleNumber: ''
//   });

//   const driversPerPage = 10;

//   const [newDriver, setNewDriver] = useState({
//     name: '', phone: '', email: '', 
//     vehicleType: 'taxi', vehicleNumber: '', 
//     licenseNumber: '', licenseFiles: [],
//     aadharNumber: '', aadharFiles: [],
//     panNumber: '', panFiles: [],
//     vehicleRC: '', vehicleRCFiles: [],
//     bankAccountNumber: '', bankAccountFile: null,
//     ifscCode: '', dob: '',
//     workingHours: '12h'
//   });

//   const [errors, setErrors] = useState({});
//   const [saving, setSaving] = useState(false);

//   const showNotification = (message, type = 'info') => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   const getAuthToken = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       showNotification('Authentication error. Please login again.', 'error');
//       navigate("/");
//       return null;
//     }
//     return token;
//   };

//   const fetchDrivers = async (page = 1) => {
//     try {
//       setLoading(true);
//       const token = getAuthToken();
//       if (!token) return;

//       const response = await fetch(`http://localhost:5001/api/admin/drivers?page=${page}&limit=${driversPerPage}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           localStorage.clear();
//           navigate("/");
//           return;
//         }
//         throw new Error('Failed to fetch drivers');
//       }

//       const data = await response.json();
//       if (data.success) {
//         setDrivers(data.data || []);
//         setTotalPages(data.pagination?.totalPages || 1);
//       } else {
//         throw new Error(data.message || 'Failed to fetch drivers');
//       }
//     } catch (error) {
//       console.error('Error fetching drivers:', error);
//       showNotification('Failed to load drivers: ' + error.message, 'error');
//       setDrivers([]);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDrivers(currentPage);
//   }, [currentPage]);

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate("/");
//   };

//   // Indian vehicle number format validation
//   const validateVehicleNumber = (vehicleNumber) => {
//     const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
//     return regex.test(vehicleNumber);
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!newDriver.name.trim()) newErrors.name = 'Name is required';
//     if (!newDriver.phone.trim()) newErrors.phone = 'Phone is required';
//     if (!newDriver.vehicleNumber.trim()) {
//       newErrors.vehicleNumber = 'Vehicle number is required';
//     } else if (!validateVehicleNumber(newDriver.vehicleNumber)) {
//       newErrors.vehicleNumber = 'Invalid vehicle number format (e.g. TN01AB1234)';
//     }
//     if (!newDriver.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
//     if (!newDriver.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhaar number is required';
//     if (!newDriver.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
//     if (!newDriver.vehicleRC.trim()) newErrors.vehicleRC = 'Vehicle RC is required';
//     if (!newDriver.bankAccountNumber.trim()) newErrors.bankAccountNumber = 'Bank account number is required';
//     if (!newDriver.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleAddDriver = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       setSaving(true);
//       const token = getAuthToken();
//       if (!token) return;

//       // Create FormData for file uploads
//       const formData = new FormData();
//       formData.append('name', newDriver.name);
//       formData.append('phone', newDriver.phone);
//       formData.append('email', newDriver.email);
//       formData.append('vehicleType', newDriver.vehicleType);
//       formData.append('vehicleNumber', newDriver.vehicleNumber);
//       formData.append('licenseNumber', newDriver.licenseNumber);
//       formData.append('aadharNumber', newDriver.aadharNumber);
//       formData.append('panNumber', newDriver.panNumber);
//       formData.append('vehicleRC', newDriver.vehicleRC);
//       formData.append('bankAccountNumber', newDriver.bankAccountNumber);
//       formData.append('ifscCode', newDriver.ifscCode);
//       formData.append('dob', newDriver.dob);
//       formData.append('workingHours', newDriver.workingHours);

//       // Append files
//       newDriver.licenseFiles.forEach((file, index) => {
//         formData.append(`licenseFiles`, file);
//       });
      
//       newDriver.aadharFiles.forEach((file, index) => {
//         formData.append(`aadharFiles`, file);
//       });
      
//       newDriver.panFiles.forEach((file, index) => {
//         formData.append(`panFiles`, file);
//       });
      
//       newDriver.vehicleRCFiles.forEach((file, index) => {
//         formData.append(`vehicleRCFiles`, file);
//       });
      
//       if (newDriver.bankAccountFile) {
//         formData.append('bankAccountFile', newDriver.bankAccountFile);
//       }

//       const response = await fetch('http://localhost:5001/api/admin/drivers/create', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });

//       const result = await response.json();
//       console.log('Add driver response:', result); // Debug log

//       if (result.success) {
//         showNotification('Driver added successfully!', 'success');
//         setShowAddDriverModal(false);
//         setNewDriver({
//           name: '', phone: '', email: '', 
//           vehicleType: 'taxi', vehicleNumber: '', 
//           licenseNumber: '', licenseFiles: [],
//           aadharNumber: '', aadharFiles: [],
//           panNumber: '', panFiles: [],
//           vehicleRC: '', vehicleRCFiles: [],
//           bankAccountNumber: '', bankAccountFile: null,
//           ifscCode: '', dob: '',
//           workingHours: '12h'
//         });
//         // Refresh the drivers list immediately
//         await fetchDrivers(currentPage);
//       } else {
//         showNotification(result.message || 'Failed to add driver', 'error');
//       }
//     } catch (err) {
//       console.error('Error adding driver:', err);
//       showNotification('Server error. Please try again.', 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleDriverStatus = async (id, currentStatus) => {
//     try {
//       const token = getAuthToken();
//       if (!token) return;

//       const response = await fetch(`http://localhost:5001/api/admin/driver/${id}/toggle`, {
//         method: 'PUT',
//         headers: { 'Authorization': `Bearer ${token}` }
//       });

//       const result = await response.json();
//       if (result.success) {
//         fetchDrivers(currentPage);
//         showNotification(`Driver is now ${currentStatus === 'Live' ? 'Offline' : 'Online'}`, 'success');
//       } else {
//         showNotification(result.message || 'Failed to update status', 'error');
//       }
//     } catch (err) {
//       console.error('Error toggling driver status:', err);
//       showNotification('Failed to update status', 'error');
//     }
//   };

//   // Apply filters and search
//   const filteredDrivers = drivers.filter(driver => {
//     const matchesSearch = searchTerm === '' || 
//       driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       driver.driverId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       driver.phone?.includes(searchTerm) ||
//       driver.vehicleNumber?.includes(searchTerm);

//     const matchesFilters = 
//       (filters.name === '' || driver.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
//       (filters.phone === '' || driver.phone?.includes(filters.phone)) &&
//       (filters.driverId === '' || driver.driverId?.toLowerCase().includes(filters.driverId.toLowerCase())) &&
//       (filters.vehicleNumber === '' || driver.vehicleNumber?.includes(filters.vehicleNumber));

//     return matchesSearch && matchesFilters;
//   });

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const getVehicleIcon = (type) => {
//     switch(type) {
//       case 'bike': return '🏍️';
//       case 'auto': return '🛺';
//       case 'sedan': return '🚗';
//       case 'mini': return '🚙';
//       case 'port': return '🚢';
//       default: return '🚕';
//     }
//   };

//   const clearFilters = () => {
//     setFilters({
//       name: '',
//       phone: '',
//       driverId: '',
//       vehicleNumber: ''
//     });
//     setSearchTerm('');
//   };

//   // File upload handlers
//   const handleFileUpload = (e, fieldName, maxFiles) => {
//     const files = Array.from(e.target.files);
    
//     if (maxFiles === 1) {
//       // For single file upload
//       setNewDriver({...newDriver, [fieldName]: files[0]});
//     } else {
//       // For multiple files upload
//       if (files.length > maxFiles) {
//         showNotification(`Maximum ${maxFiles} files allowed`, 'error');
//         return;
//       }
      
//       setNewDriver({...newDriver, [fieldName]: files});
//     }
//   };

//   const removeFile = (fieldName, index) => {
//     if (fieldName === 'bankAccountFile') {
//       setNewDriver({...newDriver, [fieldName]: null});
//     } else {
//       const updatedFiles = [...newDriver[fieldName]];
//       updatedFiles.splice(index, 1);
//       setNewDriver({...newDriver, [fieldName]: updatedFiles});
//     }
//   };

//   return (
//     <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
//       {notification && (
//         <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
//       )}

//       <div className="main-content full-width">
//         <header className="topbar">
//           <div className="search-container">
//             <FiSearch className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search drivers by name, ID, phone, vehicle..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="topbar-actions">
//             <button className="topbar-btn"><FiMail /><span className="badge">3</span></button>
//             <button className="topbar-btn"><FiBell /><span className="badge">5</span></button>
//             <button className="topbar-btn"><FiSettings /></button>
//             <button className="topbar-btn" onClick={() => setDarkMode(!darkMode)}>
//               {darkMode ? <FiSun /> : <FiMoon />}
//             </button>
//             <div className="profile-dropdown">
//               <button className="topbar-btn profile-btn" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
//                 <FiUser /><span>Admin</span><FiChevronDown className={`dropdown-icon ${profileDropdownOpen ? 'open' : ''}`} />
//               </button>
//               <ul className={`dropdown ${profileDropdownOpen ? 'open' : ''}`}>
//                 <li><a href="#">Profile</a></li>
//                 <li><a href="#">Settings</a></li>
//                 <li><a href="#" onClick={handleLogout}><FiLogOut /> Logout</a></li>
//               </ul>
//             </div>
//           </div>
//         </header>

//         <div className="dashboard-content">
//           <div className="page-header">
//             <div>
//               <h1 className="welcome-title">Driver Management</h1>
//               <p className="page-subtitle">Manage all registered drivers and monitor performance</p>
//             </div>
//             <div className="header-stats">
//               <div className="stat-card online">
//                 <div className="stat-icon"><FiCheckCircle /></div>
//                 <div className="stat-content">
//                   <div className="stat-number">{drivers.filter(d => d.status === 'Live').length}</div>
//                   <div className="stat-label">Online</div>
//                 </div>
//               </div>
//               <div className="stat-card offline">
//                 <div className="stat-icon"><FiXCircle /></div>
//                 <div className="stat-content">
//                   <div className="stat-number">{drivers.filter(d => d.status !== 'Live').length}</div>
//                   <div className="stat-label">Offline</div>
//                 </div>
//               </div>
//               <div className="stat-card total">
//                 <div className="stat-icon"><FiTruck /></div>
//                 <div className="stat-content">
//                   <div className="stat-number">{drivers.length}</div>
//                   <div className="stat-label">Total Drivers</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Advanced Filters */}
//           <div className="filters-section">
//             <div className="filters-header">
//               <h3>Advanced Filters</h3>
//               <button className="btn btn-text" onClick={clearFilters}>
//                 Clear All
//               </button>
//             </div>
//             <div className="filters-grid">
//               <div className="filter-group">
//                 <label>Driver Name</label>
//                 <input
//                   type="text"
//                   placeholder="Filter by name..."
//                   value={filters.name}
//                   onChange={(e) => setFilters({...filters, name: e.target.value})}
//                 />
//               </div>
//               <div className="filter-group">
//                 <label>Contact Number</label>
//                 <input
//                   type="text"
//                   placeholder="Filter by phone..."
//                   value={filters.phone}
//                   onChange={(e) => setFilters({...filters, phone: e.target.value})}
//                 />
//               </div>
//               <div className="filter-group">
//                 <label>Driver ID</label>
//                 <input
//                   type="text"
//                   placeholder="Filter by ID..."
//                   value={filters.driverId}
//                   onChange={(e) => setFilters({...filters, driverId: e.target.value})}
//                 />
//               </div>
//               <div className="filter-group">
//                 <label>Vehicle Number</label>
//                 <input
//                   type="text"
//                   placeholder="Filter by vehicle..."
//                   value={filters.vehicleNumber}
//                   onChange={(e) => setFilters({...filters, vehicleNumber: e.target.value})}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="content-actions">
//             <div className="view-toggle">
//               <button 
//                 className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
//                 onClick={() => setViewMode('table')}
//               >
//                 Table View
//               </button>
//               <button 
//                 className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
//                 onClick={() => setViewMode('grid')}
//               >
//                 Grid View
//               </button>
//             </div>
//             <div className="action-buttons">
//               <button className="btn btn-primary" onClick={() => setShowAddDriverModal(true)}>
//                 <FiUserPlus /> Add Driver
//               </button>
//               <button className="btn btn-secondary" onClick={() => fetchDrivers(currentPage)}>
//                 <FiRefreshCw /> Refresh
//               </button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="loading-state">
//               <div className="loading-spinner"></div>
//               <p>Loading drivers...</p>
//             </div>
//           ) : (
//             <>
//               {viewMode === 'table' ? (
//                 <div className="table-card">
//                   <div className="table-container">
//                     <table className="drivers-table">
//                       <thead>
//                         <tr>
//                           <th>S.No</th>
//                           <th>Driver ID</th>
//                           <th>Name</th>
//                           <th>Contact</th>
//                           <th>Vehicle</th>
//                           <th>Rating</th>
//                           <th>Rides</th>
//                           <th>Wallet</th>
//                           <th>Status</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {filteredDrivers.map((driver, index) => (
//                           <tr key={driver._id} className="driver-row">
//                             <td className="serial-number">{(currentPage - 1) * driversPerPage + index + 1}</td>
//                             <td className="driver-id">{driver.driverId || driver._id.slice(-8)}</td>
//                             <td className="driver-name-cell">
//                               <div className="driver-name-wrapper">
//                                 <div className="driver-avatar">
//                                   <div className="avatar-placeholder">
//                                     {driver.name?.charAt(0)?.toUpperCase() || 'D'}
//                                   </div>
//                                 </div>
//                                 <span className="driver-name-text">{driver.name}</span>
//                               </div>
//                             </td>
//                             <td className="contact-info">{driver.phone}</td>
//                             <td>
//                               <div className="vehicle-info">
//                                 <span className="vehicle-icon">{getVehicleIcon(driver.vehicleType)}</span>
//                                 <div className="vehicle-details">
//                                   <div className="vehicle-type">{driver.vehicleType}</div>
//                                   <div className="vehicle-number">{driver.vehicleNumber}</div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td>
//                               <div className="rating">
//                                 <FiStar className="rating-icon" />
//                                 {driver.rating || 'N/A'}
//                               </div>
//                             </td>
//                             <td className="rides-count">{driver.totalRides || 0}</td>
//                             <td className="Wallet">{formatCurrency(driver.Wallet)}</td>
//                             <td>
//                               <span className={`status-badge ${driver.status === 'Live' ? 'online' : 'offline'}`}>
//                                 {driver.status === 'Live' ? <FiCheckCircle /> : <FiXCircle />}
//                                 {driver.status}
//                               </span>
//                             </td>
//                             <td>
//                               <div className="action-buttons">
//                                 <button 
//                                   className="btn-action view" 
//                                   onClick={() => { setSelectedDriver(driver); setShowDriverDetails(true); }}
//                                   title="View Details"
//                                 >
//                                   <FiEye />
//                                 </button>
//                                 <button
//                                   className={`btn-action status ${driver.status === 'Live' ? 'offline' : 'online'}`}
//                                   onClick={() => toggleDriverStatus(driver._id, driver.status)}
//                                   title={driver.status === 'Live' ? 'Go Offline' : 'Go Online'}
//                                 >
//                                   {driver.status === 'Live' ? <FiXCircle /> : <FiCheckCircle />}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="drivers-grid">
//                   {filteredDrivers.map((driver) => (
//                     <div key={driver._id} className="driver-card">
//                       <div className="driver-card-header">
//                         <div className="driver-avatar">
//                           <div className="avatar-placeholder">
//                             {driver.name?.charAt(0)?.toUpperCase() || 'D'}
//                           </div>
//                         </div>
//                         <div className="driver-info">
//                           <h3 className="driver-name">{driver.name}</h3>
//                           <p className="driver-id">ID: {driver.driverId || driver._id.slice(-8)}</p>
//                         </div>
//                         <div className={`status-badge ${driver.status === 'Live' ? 'online' : 'offline'}`}>
//                           {driver.status === 'Live' ? <FiCheckCircle /> : <FiXCircle />}
//                           {driver.status}
//                         </div>
//                       </div>
                      
//                       <div className="driver-details">
//                         <div className="detail-item">
//                           <FiPhone className="detail-icon" />
//                           <span>{driver.phone}</span>
//                         </div>
//                         <div className="detail-item">
//                           <span className="vehicle-icon">{getVehicleIcon(driver.vehicleType)}</span>
//                           <span>{driver.vehicleType} • {driver.vehicleNumber}</span>
//                         </div>
//                         <div className="detail-item">
//                           <FiStar className="detail-icon" />
//                           <span>{driver.rating || 'N/A'} Rating</span>
//                         </div>
//                         <div className="detail-item">
//                           <FiMapPin className="detail-icon" />
//                           <span>{driver.totalRides || 0} Rides</span>
//                         </div>
//                       </div>
                      
//                       <div className="driver-Wallet">
//                         <div className="Wallet-label">Total Wallet</div>
//                         <div className="Wallet-amount">{formatCurrency(driver.Wallet)}</div>
//                       </div>
                      
//                       <div className="driver-actions">
//                         <button 
//                           className="btn-action view"
//                           onClick={() => { setSelectedDriver(driver); setShowDriverDetails(true); }}
//                           title="View Details"
//                         >
//                           <FiEye />
//                           Details
//                         </button>
//                         <button 
//                           className={`btn-action status ${driver.status === 'Live' ? 'offline' : 'online'}`}
//                           onClick={() => toggleDriverStatus(driver._id, driver.status)}
//                           title={`Mark as ${driver.status === 'Live' ? 'Offline' : 'Online'}`}
//                         >
//                           {driver.status === 'Live' ? <FiXCircle /> : <FiCheckCircle />}
//                           {driver.status === 'Live' ? 'Go Offline' : 'Go Online'}
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {filteredDrivers.length === 0 && !loading && (
//                 <div className="empty-state">
//                   <FiTruck size={64} />
//                   <h3>No Drivers Found</h3>
//                   <p>No drivers match your search criteria.</p>
//                   <button className="btn btn-primary" onClick={() => setShowAddDriverModal(true)}>
//                     <FiUserPlus /> Add First Driver
//                   </button>
//                 </div>
//               )}

//               {filteredDrivers.length > 0 && (
//                 <div className="pagination">
//                   <button 
//                     className="pagination-btn" 
//                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
//                     disabled={currentPage === 1}
//                   >
//                     <FiArrowLeft /> Previous
//                   </button>
//                   <div className="page-indicator">Page {currentPage} of {totalPages}</div>
//                   <button 
//                     className="pagination-btn" 
//                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
//                     disabled={currentPage === totalPages}
//                   >
//                     Next <FiArrowRight />
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>

//         {/* Add Driver Modal */}
//         {showAddDriverModal && (
//           <div className="modal-overlay">
//             <div className="modal-content large">
//               <div className="modal-header">
//                 <h2>Add New Driver</h2>
//                 <button className="close-btn" onClick={() => setShowAddDriverModal(false)}><FiX /></button>
//               </div>
//               <form onSubmit={handleAddDriver}>
//                 <div className="form-sections">
//                   <div className="form-section">
//                     <h3 className="section-title">Personal Information</h3>
//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label className="form-label">Full Name *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.name} 
//                           onChange={e => setNewDriver({...newDriver, name: e.target.value})} 
//                           className={`form-input ${errors.name ? 'error' : ''}`} 
//                         />
//                         {errors.name && <span className="error-text">{errors.name}</span>}
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">Phone Number *</label>
//                         <input 
//                           type="tel" 
//                           value={newDriver.phone} 
//                           onChange={e => setNewDriver({...newDriver, phone: e.target.value})} 
//                           className={`form-input ${errors.phone ? 'error' : ''}`} 
//                         />
//                         {errors.phone && <span className="error-text">{errors.phone}</span>}
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">Email (Optional)</label>
//                         <input 
//                           type="email" 
//                           value={newDriver.email} 
//                           onChange={e => setNewDriver({...newDriver, email: e.target.value})} 
//                           className="form-input" 
//                         />
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">Date of Birth</label>
//                         <input 
//                           type="date" 
//                           value={newDriver.dob} 
//                           onChange={e => setNewDriver({...newDriver, dob: e.target.value})} 
//                           className="form-input" 
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="form-section">
//                     <h3 className="section-title">Vehicle Information</h3>
//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label className="form-label">Vehicle Type</label>
//                         <select 
//                           value={newDriver.vehicleType} 
//                           onChange={e => setNewDriver({...newDriver, vehicleType: e.target.value})} 
//                           className="form-input"
//                         >
//                           <option value="port">Port</option>
//                           <option value="taxi">Taxi</option>
//                           <option value="auto">Auto</option>
//                           <option value="bike">Bike</option>
//                           <option value="mini">Mini</option>
//                           <option value="sedan">Sedan</option>
//                         </select>
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">Vehicle Number *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.vehicleNumber} 
//                           onChange={e => setNewDriver({...newDriver, vehicleNumber: e.target.value.toUpperCase()})} 
//                           className={`form-input ${errors.vehicleNumber ? 'error' : ''}`} 
//                           placeholder="e.g. TN01AB1234" 
//                         />
//                         {errors.vehicleNumber && <span className="error-text">{errors.vehicleNumber}</span>}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="form-section">
//                     <h3 className="section-title">Document Verification</h3>
//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label className="form-label">License Number *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.licenseNumber} 
//                           onChange={e => setNewDriver({...newDriver, licenseNumber: e.target.value})} 
//                           className={`form-input ${errors.licenseNumber ? 'error' : ''}`} 
//                         />
//                         {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
//                         <div className="file-upload-container">
//                           <label className="file-upload-label">
//                             <FiUpload /> Upload License Documents (Max 2)
//                           </label>
//                           <input 
//                             type="file" 
//                             multiple 
//                             accept="image/*,application/pdf" 
//                             onChange={(e) => handleFileUpload(e, 'licenseFiles', 2)} 
//                             className="file-input" 
//                           />
//                           <div className="file-list">
//                             {newDriver.licenseFiles.map((file, index) => (
//                               <div key={index} className="file-item">
//                                 <span>{file.name}</span>
//                                 <button type="button" className="remove-file" onClick={() => removeFile('licenseFiles', index)}>
//                                   <FiX />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">Aadhaar Number *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.aadharNumber} 
//                           onChange={e => setNewDriver({...newDriver, aadharNumber: e.target.value})} 
//                           className={`form-input ${errors.aadharNumber ? 'error' : ''}`} 
//                         />
//                         {errors.aadharNumber && <span className="error-text">{errors.aadharNumber}</span>}
//                         <div className="file-upload-container">
//                           <label className="file-upload-label">
//                             <FiUpload /> Upload Aadhaar Documents (Max 2)
//                           </label>
//                           <input 
//                             type="file" 
//                             multiple 
//                             accept="image/*,application/pdf" 
//                             onChange={(e) => handleFileUpload(e, 'aadharFiles', 2)} 
//                             className="file-input" 
//                           />
//                           <div className="file-list">
//                             {newDriver.aadharFiles.map((file, index) => (
//                               <div key={index} className="file-item">
//                                 <span>{file.name}</span>
//                                 <button type="button" className="remove-file" onClick={() => removeFile('aadharFiles', index)}>
//                                   <FiX />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">PAN Number *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.panNumber} 
//                           onChange={e => setNewDriver({...newDriver, panNumber: e.target.value})} 
//                           className={`form-input ${errors.panNumber ? 'error' : ''}`} 
//                         />
//                         {errors.panNumber && <span className="error-text">{errors.panNumber}</span>}
//                         <div className="file-upload-container">
//                           <label className="file-upload-label">
//                             <FiUpload /> Upload PAN Documents (Max 2)
//                           </label>
//                           <input 
//                             type="file" 
//                             multiple 
//                             accept="image/*,application/pdf" 
//                             onChange={(e) => handleFileUpload(e, 'panFiles', 2)} 
//                             className="file-input" 
//                           />
//                           <div className="file-list">
//                             {newDriver.panFiles.map((file, index) => (
//                               <div key={index} className="file-item">
//                                 <span>{file.name}</span>
//                                 <button type="button" className="remove-file" onClick={() => removeFile('panFiles', index)}>
//                                   <FiX />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">Vehicle RC *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.vehicleRC} 
//                           onChange={e => setNewDriver({...newDriver, vehicleRC: e.target.value})} 
//                           className={`form-input ${errors.vehicleRC ? 'error' : ''}`} 
//                         />
//                         {errors.vehicleRC && <span className="error-text">{errors.vehicleRC}</span>}
//                         <div className="file-upload-container">
//                           <label className="file-upload-label">
//                             <FiUpload /> Upload Vehicle RC Documents (Max 7)
//                           </label>
//                           <input 
//                             type="file" 
//                             multiple 
//                             accept="image/*,application/pdf" 
//                             onChange={(e) => handleFileUpload(e, 'vehicleRCFiles', 7)} 
//                             className="file-input" 
//                           />
//                           <div className="file-list">
//                             {newDriver.vehicleRCFiles.map((file, index) => (
//                               <div key={index} className="file-item">
//                                 <span>{file.name}</span>
//                                 <button type="button" className="remove-file" onClick={() => removeFile('vehicleRCFiles', index)}>
//                                   <FiX />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="form-section">
//                     <h3 className="section-title">Bank Details</h3>
//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label className="form-label">Bank Account Number *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.bankAccountNumber} 
//                           onChange={e => setNewDriver({...newDriver, bankAccountNumber: e.target.value})} 
//                           className={`form-input ${errors.bankAccountNumber ? 'error' : ''}`} 
//                         />
//                         {errors.bankAccountNumber && <span className="error-text">{errors.bankAccountNumber}</span>}
//                         <div className="file-upload-container">
//                           <label className="file-upload-label">
//                             <FiUpload /> Upload Bank Account Document (Max 1)
//                           </label>
//                           <input 
//                             type="file" 
//                             accept="image/*,application/pdf" 
//                             onChange={(e) => handleFileUpload(e, 'bankAccountFile', 1)} 
//                             className="file-input" 
//                           />
//                           {newDriver.bankAccountFile && (
//                             <div className="file-list">
//                               <div className="file-item">
//                                 <span>{newDriver.bankAccountFile.name}</span>
//                                 <button type="button" className="remove-file" onClick={() => removeFile('bankAccountFile')}>
//                                   <FiX />
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="form-group">
//                         <label className="form-label">IFSC Code *</label>
//                         <input 
//                           type="text" 
//                           value={newDriver.ifscCode} 
//                           onChange={e => setNewDriver({...newDriver, ifscCode: e.target.value})} 
//                           className={`form-input ${errors.ifscCode ? 'error' : ''}`} 
//                         />
//                         {errors.ifscCode && <span className="error-text">{errors.ifscCode}</span>}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="form-section">
//                     <h3 className="section-title">Working Hours</h3>
//                     <div className="form-grid">
//                       <div className="form-group">
//                         <label className="form-label">Driver Working Hours</label>
//                         <div className="radio-group">
//                           <label className="radio-label">
//                             <input 
//                               type="radio" 
//                               name="workingHours" 
//                               value="12h" 
//                               checked={newDriver.workingHours === '12h'} 
//                               onChange={e => setNewDriver({...newDriver, workingHours: e.target.value})} 
//                             />
//                             <span>12 Hours</span>
//                           </label>
//                           <label className="radio-label">
//                             <input 
//                               type="radio" 
//                               name="workingHours" 
//                               value="24h" 
//                               checked={newDriver.workingHours === '24h'} 
//                               onChange={e => setNewDriver({...newDriver, workingHours: e.target.value})} 
//                             />
//                             <span>24 Hours</span>
//                           </label>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="form-actions">
//                   <button type="button" className="btn btn-secondary" onClick={() => setShowAddDriverModal(false)} disabled={saving}>Cancel</button>
//                   <button type="submit" className="btn btn-primary" disabled={saving}>
//                     {saving ? (
//                       <>
//                         <div className="loading-spinner-small"></div>
//                         Adding...
//                       </>
//                     ) : (
//                       'Add Driver'
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Driver Details Modal */}
//         {showDriverDetails && selectedDriver && (
//           <div className="modal-overlay">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h2>Driver Details</h2>
//                 <button className="close-btn" onClick={() => setShowDriverDetails(false)}><FiX /></button>
//               </div>
//               <div className="driver-detail-card">
//                 <div className="driver-detail-header">
//                   <div className="driver-avatar-large">
//                     <div className="avatar-placeholder-large">
//                       {selectedDriver.name?.charAt(0)?.toUpperCase() || 'D'}
//                     </div>
//                   </div>
//                   <div className="driver-info">
//                     <h2>{selectedDriver.name}</h2>
//                     <p>ID: {selectedDriver.driverId || selectedDriver._id}</p>
//                     <div className={`status-badge large ${selectedDriver.status === 'Live' ? 'online' : 'offline'}`}>
//                       {selectedDriver.status === 'Live' ? <FiCheckCircle /> : <FiXCircle />}
//                       {selectedDriver.status}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="details-grid">
//                   <div className="detail-card">
//                     <FiPhone className="detail-card-icon" />
//                     <div className="detail-card-content">
//                       <label>Phone</label>
//                       <p>{selectedDriver.phone}</p>
//                     </div>
//                   </div>
//                   <div className="detail-card">
//                     <span className="vehicle-icon large">{getVehicleIcon(selectedDriver.vehicleType)}</span>
//                     <div className="detail-card-content">
//                       <label>Vehicle</label>
//                       <p>{selectedDriver.vehicleType} • {selectedDriver.vehicleNumber}</p>
//                     </div>
//                   </div>
//                   <div className="detail-card">
//                     <FiStar className="detail-card-icon" />
//                     <div className="detail-card-content">
//                       <label>Rating</label>
//                       <p>{selectedDriver.rating || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <div className="detail-card">
//                     <FiMapPin className="detail-card-icon" />
//                     <div className="detail-card-content">
//                       <label>Total Rides</label>
//                       <p>{selectedDriver.totalRides || 0}</p>
//                     </div>
//                   </div>
//                   <div className="detail-card">
//                     <FiDollarSign className="detail-card-icon" />
//                     <div className="detail-card-content">
//                       <label>Total Wallet</label>
//                       <p>{formatCurrency(selectedDriver.Wallet)}</p>
//                     </div>
//                   </div>
//                   <div className="detail-card">
//                     <FiFileText className="detail-card-icon" />
//                     <div className="detail-card-content">
//                       <label>License</label>
//                       <p>{selectedDriver.licenseNumber || 'N/A'}</p>
//                     </div>
//                   </div>
//                   <div className="detail-card">
//                     <FiClock className="detail-card-icon" />
//                     <div className="detail-card-content">
//                       <label>Working Hours</label>
//                       <p>{selectedDriver.workingHours || '12h'}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         :root {
//           --primary-color: #6366f1;
//           --secondary-color: #8b5cf6;
//           --accent-color: #ec4899;
//           --success-color: #10b981;
//           --danger-color: #ef4444;
//           --warning-color: #f59e0b;
//           --sidebar-bg: #1e293b;
//           --topbar-bg: #ffffff;
//           --card-bg: #ffffff;
//           --text-primary: #1e293b;
//           --text-secondary: #64748b;
//           --border-color: #e2e8f0;
//           --shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
//           --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
//         }
//         .dark { 
//           --sidebar-bg: #0f172a; 
//           --topbar-bg: #1e293b; 
//           --card-bg: #334155; 
//           --text-primary: #f1f5f9; 
//           --text-secondary: #cbd5e1; 
//           --border-color: #475569; 
//         }
//         * { margin:0; padding:0; box-sizing:border-box; font-family:'Inter',sans-serif; }
//         .admin-dashboard { display:flex; min-height:100vh; background:#f8fafc; color:var(--text-primary); transition:all .3s; }
//         .dark .admin-dashboard { background:#0f172a; }

//         /* Notification */
//         .notification { position:fixed; top:20px; right:20px; padding:16px 20px; border-radius:8px; color:#fff; font-weight:500; z-index:10000; max-width:400px; box-shadow:var(--shadow-lg); animation:slideIn .3s; }
//         .notification-success { background:var(--success-color); }
//         .notification-error { background:var(--danger-color); }
//         .notification-info { background:var(--primary-color); }
//         .notification-content { display:flex; align-items:center; justify-content:space-between; }
//         .notification-close { background:none; border:none; color:#fff; font-size:18px; cursor:pointer; }
//         @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }

//         /* Main Content */
//         .main-content.full-width { width:100%; max-width:100%; }
//         .topbar { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; background:var(--topbar-bg); box-shadow:var(--shadow); z-index:50; }
//         .search-container { display:flex; align-items:center; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.5rem; padding:.5rem 1rem; width:300px; }
//         .search-icon { color:var(--text-secondary); margin-right:.5rem; }
//         .search-container input { border:none; background:none; outline:none; flex:1; color:var(--text-primary); }
//         .topbar-actions { display:flex; gap:.5rem; align-items:center; }
//         .topbar-btn { background:none; border:none; color:var(--text-primary); font-size:1.25rem; padding:.5rem; border-radius:.375rem; cursor:pointer; position:relative; }
//         .topbar-btn:hover { background:var(--border-color); }
//         .badge { position:absolute; top:0; right:0; background:var(--accent-color); color:#fff; font-size:.75rem; padding:0.125rem .375rem; border-radius:9999px; }

//         /* Dashboard Content */
//         .dashboard-content { padding:1.5rem; flex:1; }
//         .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
//         .welcome-title { font-size:2rem; font-weight:700; color:var(--text-primary); }
//         .page-subtitle { color:var(--text-secondary); }
//         .header-stats { display:flex; gap:1rem; }
//         .stat-card { display:flex; align-items:center; gap:1rem; padding:1rem 1.5rem; background:var(--card-bg); border-radius:.75rem; box-shadow:var(--shadow); border:1px solid var(--border-color); }
//         .stat-icon { width:48px; height:48px; border-radius:.5rem; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
//         .stat-card.online .stat-icon { background:rgba(16,185,129,0.1); color:var(--success-color); }
//         .stat-card.offline .stat-icon { background:rgba(100,116,139,0.1); color:var(--text-secondary); }
//         .stat-card.total .stat-icon { background:rgba(99,102,241,0.1); color:var(--primary-color); }
//         .stat-number { font-size:1.5rem; font-weight:700; color:var(--text-primary); }
//         .stat-label { font-size:.875rem; color:var(--text-secondary); }

//         /* Filters Section */
//         .filters-section { background:var(--card-bg); border-radius:.75rem; padding:1.5rem; margin-bottom:2rem; box-shadow:var(--shadow); border:1px solid var(--border-color); }
//         .filters-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
//         .filters-header h3 { font-size:1.125rem; font-weight:600; color:var(--text-primary); }
//         .btn-text { background:none; border:none; color:var(--primary-color); cursor:pointer; font-weight:500; }
//         .filters-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
//         .filter-group { display:flex; flex-direction:column; gap:.5rem; }
//         .filter-group label { font-size:.875rem; font-weight:500; color:var(--text-primary); }
//         .filter-group input { padding:.75rem; border:1px solid var(--border-color); border-radius:.375rem; background:var(--card-bg); color:var(--text-primary); font-size:.875rem; }
//         .filter-group input:focus { outline:none; border-color:var(--primary-color); }

//         /* Content Actions */
//         .content-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
//         .view-toggle { display:flex; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.5rem; overflow:hidden; }
//         .view-btn { padding:.75rem 1.5rem; background:none; border:none; color:var(--text-secondary); cursor:pointer; font-weight:500; transition:all .2s; }
//         .view-btn.active { background:var(--primary-color); color:#fff; }
//         .action-buttons { display:flex; gap:1rem; }

//         /* Buttons */
//         .btn { padding:.75rem 1.5rem; border:none; border-radius:.5rem; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:.5rem; transition:all .2s; }
//         .btn-primary { background:var(--primary-color); color:#fff; }
//         .btn-primary:hover { background:#4f46e5; }
//         .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
//         .btn-secondary { background:var(--border-color); color:var(--text-primary); }
//         .btn-secondary:hover { background:#e2e8f0; }

//         /* Table View - FIXED ALIGNMENT */
//         .table-card { background:var(--card-bg); border-radius:.75rem; box-shadow:var(--shadow); overflow:hidden; }
//         .table-container { overflow-x:auto; }
//         .drivers-table { width:100%; border-collapse:collapse; }
//         .drivers-table th, .drivers-table td { padding:1rem; text-align:left; border-bottom:1px solid var(--border-color); vertical-align:middle; }
//         .drivers-table th { background:var(--card-bg); font-weight:600; color:var(--text-primary); font-size:.875rem; text-transform:uppercase; letter-spacing:.05em; }
//         .driver-row:hover { background:rgba(99,102,241,.05); }
        
//         /* FIXED: Name column alignment */
//         .driver-name-cell { vertical-align:middle; }
//         .driver-name-wrapper { display:flex; align-items:center; gap:.75rem; height:100%; }
//         .driver-avatar { width:40px; height:40px; border-radius:50%; overflow:hidden; flex-shrink:0; }
//         .avatar-placeholder { width:100%; height:100%; background:var(--primary-color); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:.875rem; }
//         .driver-name-text { font-weight:500; color:var(--text-primary); }
        
//         .serial-number, .driver-id, .contact-info, .rides-count { color:var(--text-secondary); font-size:.875rem; }
//         .vehicle-info { display:flex; align-items:center; gap:.5rem; }
//         .vehicle-icon { font-size:1.25rem; flex-shrink:0; }
//         .vehicle-details { display:flex; flex-direction:column; }
//         .vehicle-type { font-weight:500; font-size:.875rem; }
//         .vehicle-number { font-size:.75rem; color:var(--text-secondary); }
//         .rating { display:flex; align-items:center; gap:.25rem; font-weight:500; }
//         .rating-icon { color:var(--warning-color); font-size:.875rem; }
//         .Wallet { font-weight:600; color:var(--success-color); font-size:.875rem; }
//         .status-badge { display:flex; align-items:center; gap:.25rem; padding:.25rem .75rem; border-radius:9999px; font-size:.75rem; font-weight:500; width:fit-content; }
//         .status-badge.online { background:rgba(16,185,129,0.1); color:var(--success-color); }
//         .status-badge.offline { background:rgba(100,116,139,0.1); color:var(--text-secondary); }
//         .action-buttons { display:flex; gap:.5rem; }
//         .btn-action { padding:.5rem; border:none; border-radius:.375rem; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; }
//         .btn-action.view { background:rgba(59,130,246,0.1); color:#3b82f6; }
//         .btn-action.status { background:rgba(16,185,129,0.1); color:var(--success-color); }
//         .btn-action.status.offline { background:rgba(245,158,11,0.1); color:var(--warning-color); }

//         /* Grid View */
//         .drivers-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(350px,1fr)); gap:1.5rem; margin-bottom:2rem; }
//         .driver-card { background:var(--card-bg); border-radius:.75rem; padding:1.5rem; box-shadow:var(--shadow); border:1px solid var(--border-color); transition:all .3s; }
//         .driver-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-lg); }
//         .driver-card-header { display:flex; align-items:flex-start; gap:1rem; margin-bottom:1rem; }
//         .driver-info { flex:1; }
//         .driver-info h3 { font-size:1.125rem; font-weight:600; color:var(--text-primary); margin-bottom:.25rem; }
//         .driver-info p { font-size:.875rem; color:var(--text-secondary); }
//         .driver-details { display:flex; flex-direction:column; gap:.75rem; margin-bottom:1rem; }
//         .detail-item { display:flex; align-items:center; gap:.75rem; font-size:.875rem; color:var(--text-secondary); }
//         .detail-icon { color:var(--primary-color); }
//         .driver-Wallet { background:linear-gradient(135deg,#f8fafc,#e2e8f0); padding:1rem; border-radius:.5rem; margin-bottom:1.5rem; text-align:center; }
//         .Wallet-label { font-size:.75rem; color:var(--text-secondary); margin-bottom:.25rem; }
//         .Wallet-amount { font-size:1.25rem; font-weight:700; color:var(--success-color); }
//         .driver-actions { display:flex; gap:.5rem; }
//         .btn-action { flex:1; display:flex; align-items:center; justify-content:center; gap:.5rem; padding:.5rem; font-size:.75rem; }

//         /* Loading and Empty States */
//         .loading-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem; color:var(--text-secondary); }
//         .loading-spinner { width:40px; height:40px; border:4px solid var(--border-color); border-left:4px solid var(--primary-color); border-radius:50%; animation:spin 1s linear infinite; margin-bottom:1rem; }
//         .loading-spinner-small { width:16px; height:16px; border:2px solid transparent; border-left:2px solid white; border-radius:50%; animation:spin 1s linear infinite; }
//         @keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
//         .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3rem; text-align:center; color:var(--text-secondary); }
//         .empty-state h3 { margin-bottom:.5rem; color:var(--text-primary); }

//         /* Pagination */
//         .pagination { display:flex; align-items:center; justify-content:space-between; padding:1.5rem; border-top:1px solid var(--border-color); }
//         .pagination-btn { display:flex; align-items:center; gap:.5rem; padding:.5rem 1rem; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.375rem; color:var(--text-primary); cursor:pointer; transition:all .2s; }
//         .pagination-btn:hover:not(:disabled) { background:var(--border-color); }
//         .pagination-btn:disabled { opacity:.5; cursor:not-allowed; }
//         .page-indicator { font-weight:500; color:var(--text-primary); }

//         /* Modal */
//         .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; justify-content:center; align-items:center; z-index:1000; }
//         .modal-content { background:var(--card-bg); border-radius:.75rem; max-width:900px; width:90%; max-height:90vh; overflow-y:auto; }
//         .modal-content.large { max-width:800px; }
//         .modal-header { display:flex; justify-content:space-between; padding:1.5rem; border-bottom:1px solid var(--border-color); }
//         .modal-header h2 { font-size:1.5rem; font-weight:600; color:var(--text-primary); }
//         .close-btn { background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--text-secondary); }
//         .form-sections { padding:1.5rem; }
//         .form-section { margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-color); }
//         .form-section:last-child { border-bottom:none; }
//         .section-title { font-size:1.125rem; font-weight:600; color:var(--text-primary); margin-bottom:1rem; }
//         .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
//         .form-group { display:flex; flex-direction:column; gap:.5rem; }
//         .form-label { font-weight:500; font-size:.875rem; color:var(--text-primary); }
//         .form-input { padding:.75rem; border:1px solid var(--border-color); border-radius:.375rem; background:var(--card-bg); color:var(--text-primary); font-size:.875rem; }
//         .form-input:focus { outline:none; border-color:var(--primary-color); }
//         .form-input.error { border-color:var(--danger-color); }
//         .error-text { color:var(--danger-color); font-size:.75rem; }
//         .form-actions { display:flex; justify-content:flex-end; gap:1rem; padding:1.5rem; border-top:1px solid var(--border-color); }

//         /* File Upload Styles */
//         .file-upload-container { margin-top:.5rem; }
//         .file-upload-label { display:flex; align-items:center; gap:.5rem; padding:.75rem; border:1px dashed var(--border-color); border-radius:.375rem; background:var(--card-bg); color:var(--text-secondary); cursor:pointer; font-size:.875rem; transition:all .2s; }
//         .file-upload-label:hover { border-color:var(--primary-color); color:var(--primary-color); }
//         .file-input { display:none; }
//         .file-list { margin-top:.5rem; }
//         .file-item { display:flex; align-items:center; justify-content:space-between; padding:.5rem; background:rgba(99,102,241,0.05); border-radius:.375rem; margin-bottom:.25rem; }
//         .file-item span { font-size:.875rem; color:var(--text-primary); }
//         .remove-file { background:none; border:none; color:var(--danger-color); cursor:pointer; }
        
//         /* Radio Button Styles */
//         .radio-group { display:flex; gap:1rem; margin-top:.5rem; }
//         .radio-label { display:flex; align-items:center; gap:.5rem; cursor:pointer; font-size:.875rem; color:var(--text-primary); }
//         .radio-label input[type="radio"] { accent-color:var(--primary-color); }

//         /* Driver Details Modal */
//         .driver-detail-card { padding:1.5rem; }
//         .driver-detail-header { display:flex; align-items:center; gap:1.5rem; margin-bottom:2rem; padding-bottom:1.5rem; border-bottom:1px solid var(--border-color); }
//         .driver-avatar-large { width:80px; height:80px; border-radius:50%; overflow:hidden; }
//         .avatar-placeholder-large { width:100%; height:100%; background:var(--primary-color); color:#fff; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:600; }
//         .driver-info h2 { font-size:1.5rem; font-weight:700; color:var(--text-primary); margin-bottom:.5rem; }
//         .driver-info p { color:var(--text-secondary); margin-bottom:.5rem; }
//         .status-badge.large { font-size:.875rem; padding:.5rem 1rem; }
//         .details-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
//         .detail-card { display:flex; align-items:center; gap:1rem; padding:1rem; background:var(--card-bg); border:1px solid var(--border-color); border-radius:.5rem; }
//         .detail-card-icon { width:24px; height:24px; color:var(--primary-color); }
//         .vehicle-icon.large { font-size:1.5rem; }
//         .detail-card-content { flex:1; }
//         .detail-card-content label { display:block; font-size:.75rem; color:var(--text-secondary); margin-bottom:.25rem; }
//         .detail-card-content p { font-size:.875rem; font-weight:500; color:var(--text-primary); }

//         /* Responsive */
//         @media (max-width:768px) {
//           .page-header { flex-direction:column; align-items:flex-start; gap:1rem; }
//           .header-stats { width:100%; justify-content:space-between; }
//           .content-actions { flex-direction:column; gap:1rem; align-items:stretch; }
//           .filters-grid { grid-template-columns:1fr; }
//           .form-grid { grid-template-columns:1fr; }
//           .drivers-grid { grid-template-columns:1fr; }
//           .driver-detail-header { flex-direction:column; text-align:center; }
//           .details-grid { grid-template-columns:1fr; }
//         }
//       `}</style>
//     </div>
//   );
// }


// export default Drivers;
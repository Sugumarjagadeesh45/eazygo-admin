// src/components/Pages/Orders.jsx
// src/components/Pages/Orders.jsx
import React, { useState, useEffect } from "react";
import { 
  FiShoppingBag, 
  FiDollarSign, 
  FiUsers, 
  FiTrendingUp, 
  FiSearch, 
  FiEdit, 
  FiSave, 
  FiX, 
  FiUser, 
  FiPackage,
  FiDownload,
  FiRefreshCw,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiChevronUp,
  FiChevronDown,
  FiGrid,
  FiList,
  FiCreditCard,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShoppingCart,
  FiEye,
  FiMoreVertical
} from 'react-icons/fi';
import axios from 'axios';

// Status Timeline Component
const StatusTimeline = ({ currentStatus }) => {
  const statusFlow = [
    { value: 'pending', label: 'Pending', icon: FiClock, color: '#f59e0b' },
    { value: 'order_confirmed', label: 'Confirmed', icon: FiCheckCircle, color: '#6366f1' },
    { value: 'processing', label: 'Processing', icon: FiPackage, color: '#8b5cf6' },
    { value: 'preparing', label: 'Preparing', icon: FiPackage, color: '#8b5cf6' },
    { value: 'packed', label: 'Packed', icon: FiPackage, color: '#f97316' },
    { value: 'shipped', label: 'Shipped', icon: FiTruck, color: '#f97316' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck, color: '#f97316' },
    { value: 'delivered', label: 'Delivered', icon: FiCheckCircle, color: '#10b981' }
  ];

  const currentIndex = statusFlow.findIndex(status => status.value === currentStatus);
  
  if (currentIndex === -1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      position: 'relative'
    }}>
      {statusFlow.map((status, index) => {
        const IconComponent = status.icon;
        const isActive = index <= currentIndex;
        const isCompleted = index < currentIndex;
        
        return (
          <div key={status.value} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            position: 'relative'
          }}>
            {/* Connector Line */}
            {index > 0 && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '-50%',
                right: '50%',
                height: '2px',
                backgroundColor: isCompleted ? status.color : '#e2e8f0',
                zIndex: 1,
                transition: 'all 0.3s ease'
              }} />
            )}
            
            {/* Status Dot */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? status.color : '#f8fafc',
              border: `2px solid ${isActive ? status.color : '#e2e8f0'}`,
              color: isActive ? '#ffffff' : '#94a3b8',
              zIndex: 2,
              transition: 'all 0.3s ease',
              position: 'relative'
            }}>
              {isActive && <IconComponent size={12} />}
            </div>
            
            {/* Status Label */}
            <span style={{
              fontSize: '10px',
              fontWeight: '500',
              color: isActive ? status.color : '#94a3b8',
              marginTop: '4px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              {status.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Hover Tooltip Component
const HoverTooltip = ({ content, position = 'right', children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '100%',
          [position]: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '400',
          zIndex: 1000,
          minWidth: '200px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fadeInUp 0.2s ease-out',
          lineHeight: '1.4'
        }}>
          {content}
          <div style={{
            position: 'absolute',
            top: '-4px',
            [position]: '12px',
            width: '8px',
            height: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            transform: 'rotate(45deg)'
          }} />
        </div>
      )}
    </div>
  );
};

// Edit Order Modal Component
const EditOrderModal = ({ order, onSave, onClose }) => {
  const [editedOrder, setEditedOrder] = useState(order);
  const [saving, setSaving] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'order_confirmed', label: 'Order Confirmed', color: '#6366f1' },
    { value: 'processing', label: 'Processing', color: '#8b5cf6' },
    { value: 'preparing', label: 'Preparing', color: '#8b5cf6' },
    { value: 'packed', label: 'Packed', color: '#f97316' },
    { value: 'shipped', label: 'Shipped', color: '#f97316' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#f97316' },
    { value: 'delivered', label: 'Delivered', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
    { value: 'returned', label: 'Returned', color: '#f97316' },
    { value: 'refunded', label: 'Refunded', color: '#84cc16' }
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(editedOrder);
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Edit Order #{order.orderId}</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            {/* Order Info */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Order Information</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Order ID</label>
                  <input
                    type="text"
                    value={order.orderId}
                    disabled
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Customer Name</label>
                  <input
                    type="text"
                    value={order.customerName}
                    disabled
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Total Amount</label>
                  <input
                    type="text"
                    value={`₹${order.totalAmount.toLocaleString()}`}
                    disabled
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Order Date</label>
                  <input
                    type="text"
                    value={new Date(order.createdAt).toLocaleString()}
                    disabled
                    style={styles.formInput}
                  />
                </div>
              </div>
            </div>

            {/* Status & Payment */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Status & Payment</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Status</label>
                  <select
                    value={editedOrder.status}
                    onChange={(e) => setEditedOrder({...editedOrder, status: e.target.value})}
                    style={styles.formSelect}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Payment Method</label>
                  <select
                    value={editedOrder.paymentMethod}
                    onChange={(e) => setEditedOrder({...editedOrder, paymentMethod: e.target.value})}
                    style={styles.formSelect}
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Products ({order.products?.length || 0})</h3>
              <div style={styles.productsList}>
                {order.products?.map((product, index) => (
                  <div key={index} style={styles.productItem}>
                    <div style={styles.productInfo}>
                      <span style={styles.productName}>{product.name}</span>
                      <span style={styles.productQuantity}>× {product.quantity}</span>
                    </div>
                    <div style={styles.productPrice}>
                      ₹{(product.price * product.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Orders() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    customers: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const ordersPerPage = 10;

  // ✅ CORRECTED: Use the correct base URL
  const baseURL = "http://localhost:5001";

  // Order status options - MATCHING BACKEND ENUM
  const statusOptions = [
    { value: 'all', label: 'All Status', icon: FiPackage, color: '#64748b' },
    { value: 'pending', label: 'Pending', icon: FiClock, color: '#f59e0b' },
    { value: 'order_confirmed', label: 'Order Confirmed', icon: FiCheckCircle, color: '#6366f1' },
    { value: 'processing', label: 'Processing', icon: FiPackage, color: '#8b5cf6' },
    { value: 'preparing', label: 'Preparing', icon: FiPackage, color: '#8b5cf6' },
    { value: 'packed', label: 'Packed', icon: FiPackage, color: '#f97316' },
    { value: 'shipped', label: 'Shipped', icon: FiTruck, color: '#f97316' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck, color: '#f97316' },
    { value: 'delivered', label: 'Delivered', icon: FiCheckCircle, color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', icon: FiX, color: '#ef4444' },
    { value: 'returned', label: 'Returned', icon: FiRefreshCw, color: '#f97316' },
    { value: 'refunded', label: 'Refunded', icon: FiDollarSign, color: '#84cc16' }
  ];

  // Fetch real orders data
  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  // ✅ FIXED: Fetch orders from correct endpoint
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching orders from backend...');

      const response = await axios.get(`${baseURL}/api/orders/admin/orders`, {
        params: {
          page: currentPage,
          limit: ordersPerPage,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      
      if (response.data.success) {
        const orders = response.data.data || [];
        console.log(`✅ Loaded ${orders.length} orders from API`);
        
        // Transform orders to match expected format
        const transformedOrders = orders.map(order => ({
          _id: order._id,
          orderId: order.orderId,
          status: order.status || 'order_confirmed',
          totalAmount: order.totalAmount || 0,
          createdAt: order.createdAt || order.orderDate || new Date().toISOString(),
          paymentMethod: order.paymentMethod || 'cash',
          
          // Customer data
          user: {
            name: order.customerName || 'Unknown Customer',
            email: order.customerEmail || '',
            phoneNumber: order.customerPhone || '',
            address: order.customerAddress || '',
            customerId: order.customerId || 'UNKNOWN'
          },
          
          customerId: order.customerId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          products: order.products || [],
          
          // Additional fields
          subtotal: order.subtotal || order.totalAmount,
          shipping: order.shipping || 0,
          tax: order.tax || 0,
          deliveryAddress: order.deliveryAddress || {}
        }));
        
        setOrdersData(transformedOrders);
      }

    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      // Fallback to mock data
      if (error.response?.status === 404) {
        console.log('📋 Using mock data');
        const mockOrders = generateMockOrders();
        setOrdersData(mockOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Fetch order stats
  const fetchOrderStats = async () => {
    try {
      console.log('📊 Fetching order stats...');
      
      const response = await axios.get(`${baseURL}/api/orders/admin/order-stats`);
      
      if (response.data.success) {
        const statsData = response.data.data;
        console.log('✅ Stats loaded from API');
        
        setStats({
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
          customers: statsData.customerCount || 0,
          avgOrderValue: statsData.avgOrderValue || 0,
          pendingOrders: statsData.pendingOrders || 0,
          deliveredOrders: statsData.deliveredOrders || 0
        });
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // Calculate from local data
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
      const uniqueCustomers = new Set(ordersData.map(order => order.customerId)).size;
      
      setStats({
        totalOrders,
        totalRevenue,
        customers: uniqueCustomers,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        pendingOrders: ordersData.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
        deliveredOrders: ordersData.filter(o => o.status === 'delivered').length
      });
    }
  };

  // ✅ FIXED: Update order status using CORRECT endpoint
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      const response = await axios.put(
        `${baseURL}/api/orders/admin/update-status/${orderId}`,
        { status: newStatus }
      );

      if (response.data.success) {
        // Update local state
        setOrdersData(prev =>
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        // Refresh stats
        fetchOrderStats();
        
        console.log(`✅ Order ${orderId} updated successfully`);
        return true;
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert(`Failed to update order: ${error.response?.data?.error || error.message}`);
      return false;
    }
  };

  // ✅ NEW: Update entire order (for modal)
  const updateOrder = async (updatedOrder) => {
    try {
      console.log(`🔄 Updating order ${updatedOrder._id}`);
      
      const response = await axios.put(
        `${baseURL}/api/orders/admin/order/update-by-id/${updatedOrder._id}`,
        {
          status: updatedOrder.status,
          paymentMethod: updatedOrder.paymentMethod
        }
      );

      if (response.data.success) {
        // Update local state
        setOrdersData(prev =>
          prev.map(order => 
            order._id === updatedOrder._id 
              ? { ...order, ...updatedOrder }
              : order
          )
        );
        
        console.log(`✅ Order ${updatedOrder.orderId} updated successfully`);
        return true;
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
      alert(`Failed to update order: ${error.response?.data?.error || error.message}`);
      throw error;
    }
  };

  // Generate mock orders
  const generateMockOrders = () => {
    const mockProducts = [
      { name: 'Smartphone X', price: 29999, quantity: 1, category: 'Electronics' },
      { name: 'Wireless Headphones', price: 4999, quantity: 2, category: 'Electronics' },
      { name: 'Casual Shirt', price: 1999, quantity: 3, category: 'Clothing' },
      { name: 'Running Shoes', price: 5999, quantity: 1, category: 'Footwear' },
      { name: 'Coffee Maker', price: 8999, quantity: 1, category: 'Home Appliances' }
    ];

    const statuses = ['order_confirmed', 'processing', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
    const paymentMethods = ['card', 'upi', 'cash', 'wallet'];
    const names = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Wilson'];
    
    return Array.from({ length: 25 }, (_, index) => ({
      _id: `mock_${Date.now()}_${index}`,
      orderId: `ORD${Date.now()}${index}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalAmount: Math.floor(Math.random() * 50000) + 1000,
      subtotal: Math.floor(Math.random() * 45000) + 1000,
      shipping: 0,
      tax: Math.floor(Math.random() * 5000) + 100,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      user: {
        name: names[index % names.length],
        email: `customer${index + 1}@example.com`,
        phoneNumber: `98765432${index.toString().padStart(2, '0')}`,
        address: `Address ${index + 1}, City, State, 6000${index}`,
        customerId: `CUST${1000 + index}`
      },
      customerId: `CUST${1000 + index}`,
      customerName: names[index % names.length],
      customerPhone: `98765432${index.toString().padStart(2, '0')}`,
      customerEmail: `customer${index + 1}@example.com`,
      products: mockProducts.slice(0, Math.floor(Math.random() * 3) + 2),
      deliveryAddress: {
        name: names[index % names.length],
        phone: `98765432${index.toString().padStart(2, '0')}`,
        addressLine1: `Street ${index + 1}`,
        addressLine2: 'Area',
        city: 'City',
        state: 'State',
        pincode: `6000${index}`,
        country: 'India'
      }
    }));
  };

  const bulkStatusUpdate = async (newStatus) => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to update');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.put(
        `${baseURL}/api/orders/admin/bulk-update`,
        {
          orderIds: selectedOrders,
          status: newStatus
        }
      );

      if (response.data.success) {
        // Update local state
        setOrdersData(prev =>
          prev.map(order =>
            selectedOrders.includes(order._id)
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        // Clear selection
        setSelectedOrders([]);
        
        // Refresh
        fetchOrders();
        fetchOrderStats();
        
        alert(`Successfully updated ${response.data.data.modifiedCount} orders`);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert('Some orders failed to update');
    } finally {
      setLoading(false);
    }
  };

  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    const headers = ['Order ID', 'Customer', 'Customer ID', 'Status', 'Total Amount', 'Date', 'Payment Method', 'Products'];
    const csvData = filteredOrders.map(order => [
      order.orderId,
      order.customerName,
      order.customerId,
      order.status,
      order.totalAmount,
      new Date(order.createdAt).toLocaleDateString(),
      order.paymentMethod,
      order.products?.map(p => `${p.name} (${p.quantity})`).join('; ') || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedOrders = [...ordersData].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case 'amount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'orderId':
        aValue = a.orderId;
        bValue = b.orderId;
        break;
      default:
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredOrders = sortedOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerPhone || '').includes(searchTerm);
    
    const orderDate = new Date(order.createdAt);
    const matchesDateRange = 
      (!dateRange.start || orderDate >= new Date(dateRange.start)) &&
      (!dateRange.end || orderDate <= new Date(dateRange.end));
    
    return matchesStatus && matchesSearch && matchesDateRange;
  });

  const handleEdit = (order) => {
    setEditingOrder(order);
  };

  const handleSave = async (updatedOrder) => {
    await updateOrder(updatedOrder);
  };

  const showCustomerProfile = (customer) => {
    setSelectedCustomer(customer);
  };

  const showOrderProducts = (products) => {
    setSelectedProducts(products);
  };

  const showOrderDetails = (order) => {
    setSelectedOrderDetails(order);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setSelectedProducts(null);
    setSelectedOrderDetails(null);
    setEditingOrder(null);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id));
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : '#64748b';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : FiPackage;
  };

  if (loading && ordersData.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading orders data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Orders Management</h1>
            <p style={styles.subtitle}>Manage and track all customer orders efficiently</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.primaryButton} onClick={() => { fetchOrders(); fetchOrderStats(); }}>
              <FiRefreshCw size={16} />
              Refresh
            </button>
            <button style={styles.secondaryButton} onClick={exportOrders}>
              <FiDownload size={16} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsOverview}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(99, 102, 241, 0.1)'}}>
            <FiShoppingBag size={24} color="#6366f1" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Orders</h3>
            <div style={styles.statValue}>{stats.totalOrders.toLocaleString()}</div>
            <div style={styles.statSubtitle}>
              Pending: {stats.pendingOrders} | Delivered: {stats.deliveredOrders}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
            <FiDollarSign size={24} color="#10b981" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Revenue</h3>
            <div style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
            <div style={{...styles.statChange, color: '#10b981'}}>
              Avg: {formatCurrency(stats.avgOrderValue)}
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
            <FiUsers size={24} color="#8b5cf6" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Customers</h3>
            <div style={styles.statValue}>{stats.customers.toLocaleString()}</div>
            <div style={styles.statSubtitle}>Active customers</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
            <FiTrendingUp size={24} color="#f59e0b" />
          </div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Avg. Order Value</h3>
            <div style={styles.statValue}>{formatCurrency(stats.avgOrderValue)}</div>
            <div style={{...styles.statChange, color: '#10b981'}}>Active</div>
          </div>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div style={styles.quickStatus}>
        {statusOptions.filter(opt => opt.value !== 'all').map((option) => {
          const IconComponent = option.icon;
          const count = ordersData.filter(order => order.status === option.value).length;
          return (
            <div 
              key={option.value}
              style={{
                ...styles.statusQuickCard,
                borderLeft: `4px solid ${option.color}`,
                cursor: 'pointer',
                opacity: statusFilter === option.value ? 1 : 0.8,
                transform: statusFilter === option.value ? 'translateY(-2px)' : 'none',
                boxShadow: statusFilter === option.value ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onClick={() => setStatusFilter(option.value)}
            >
              <IconComponent size={20} color={option.color} />
              <div style={styles.statusQuickContent}>
                <div style={styles.statusQuickCount}>{count}</div>
                <div style={styles.statusQuickLabel}>{option.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Section */}
      <div style={styles.controlsSection}>
        <div style={styles.controlsLeft}>
          <div style={styles.searchContainer}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search orders by ID, customer, phone, or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.statusFilterContainer}>
            <label style={styles.filterLabel}>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.statusSelect}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.controlsRight}>
          <button 
            style={styles.controlButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            Filters
          </button>
          
          <div style={styles.viewToggle}>
            <button 
              style={{
                ...styles.viewButton,
                ...(viewMode === 'table' ? styles.activeViewButton : {})
              }}
              onClick={() => setViewMode('table')}
            >
              <FiList size={16} />
            </button>
            <button 
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid' ? styles.activeViewButton : {})
              }}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div style={styles.advancedFilters}>
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Date Range</label>
              <div style={styles.dateInputs}>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  style={styles.dateInput}
                />
                <span style={styles.dateSeparator}>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  style={styles.dateInput}
                />
              </div>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={styles.sortSelect}
              >
                <option value="date">Order Date</option>
                <option value="amount">Total Amount</option>
                <option value="status">Status</option>
                <option value="orderId">Order ID</option>
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Order</label>
              <button 
                style={styles.sortOrderButton}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                {sortOrder === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div style={styles.bulkActionsBar}>
          <div style={styles.bulkInfo}>
            <span style={styles.bulkCount}>{selectedOrders.length} orders selected</span>
          </div>
          <div style={styles.bulkControls}>
            <select
              onChange={(e) => bulkStatusUpdate(e.target.value)}
              style={styles.bulkSelect}
              defaultValue=""
            >
              <option value="" disabled>Update Status</option>
              {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button 
              style={styles.bulkClearButton}
              onClick={() => setSelectedOrders([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Orders Content */}
      <div style={styles.ordersContent}>
        {viewMode === 'table' ? (
          <div style={styles.tableContainer}>
            <div style={styles.tableHeader}>
              <div style={styles.tableRow}>
                <div style={{...styles.tableCell, width: '50px'}}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={selectAllOrders}
                    style={styles.checkbox}
                  />
                </div>
                <div 
                  style={{...styles.tableCell, width: '120px', cursor: 'pointer'}}
                  onClick={() => handleSort('orderId')}
                >
                  Order ID {sortBy === 'orderId' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
                </div>
                <div style={{...styles.tableCell, width: '180px'}}>Customer</div>
                <div style={{...styles.tableCell, width: '100px'}}>Customer ID</div>
                <div 
                  style={{...styles.tableCell, width: '120px', cursor: 'pointer'}}
                  onClick={() => handleSort('status')}
                >
                  Status {sortBy === 'status' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
                </div>
                <div 
                  style={{...styles.tableCell, width: '120px', cursor: 'pointer'}}
                  onClick={() => handleSort('amount')}
                >
                  Total {sortBy === 'amount' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
                </div>
                <div 
                  style={{...styles.tableCell, width: '150px', cursor: 'pointer'}}
                  onClick={() => handleSort('date')}
                >
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
                </div>
                <div style={{...styles.tableCell, width: '100px'}}>Payment</div>
                <div style={{...styles.tableCell, width: '180px'}}>Actions</div>
              </div>
            </div>

            <div style={styles.tableBody}>
              {currentOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status);
                return (
                  <div 
                    key={order._id} 
                    style={styles.tableRow}
                  >
                    <div style={{...styles.tableCell, width: '50px'}}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        style={styles.checkbox}
                      />
                    </div>
                    
                    <div style={{...styles.tableCell, width: '120px'}}>
                      <HoverTooltip
                        content={
                          <div>
                            <strong>Order Details</strong><br/>
                            ID: {order.orderId}<br/>
                            Date: {formatDate(order.createdAt)}<br/>
                            Items: {order.products?.length || 0}<br/>
                            Status: {order.status}
                          </div>
                        }
                      >
                        <span style={styles.orderId} onClick={() => showOrderDetails(order)}>#{order.orderId}</span>
                      </HoverTooltip>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '180px'}}>
                      <HoverTooltip
                        content={
                          <div>
                            <strong>Customer Details</strong><br/>
                            Name: {order.customerName}<br/>
                            Phone: {order.customerPhone}<br/>
                            Email: {order.customerEmail || 'Not provided'}<br/>
                            Address: {order.user?.address}
                          </div>
                        }
                      >
                        <div style={styles.customerCell} onClick={() => showCustomerProfile(order.user)}>
                          <div style={styles.customerAvatar}>
                            {order.customerName?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div style={styles.customerName}>{order.customerName}</div>
                            <div style={styles.customerPhone}>{order.customerPhone}</div>
                          </div>
                        </div>
                      </HoverTooltip>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '100px'}}>
                      <span style={styles.customerId}>{order.customerId}</span>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '120px'}}>
                      <div style={styles.statusCell}>
                        <div style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusColor(order.status) + '20',
                          color: getStatusColor(order.status),
                          cursor: 'pointer'
                        }}
                        onClick={() => handleEdit(order)}
                        >
                          <StatusIcon size={12} />
                          {order.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '120px'}}>
                      <span style={styles.amount}>{formatCurrency(order.totalAmount)}</span>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '150px'}}>
                      <span style={styles.date}>{formatDate(order.createdAt)}</span>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '100px'}}>
                      <span style={{
                        ...styles.paymentBadge,
                        backgroundColor: order.paymentMethod === 'upi' ? '#6366f120' : 
                                       order.paymentMethod === 'card' ? '#10b98120' : 
                                       order.paymentMethod === 'wallet' ? '#f59e0b20' : '#64748b20',
                        color: order.paymentMethod === 'upi' ? '#6366f1' : 
                              order.paymentMethod === 'card' ? '#10b981' : 
                              order.paymentMethod === 'wallet' ? '#f59e0b' : '#64748b'
                      }}>
                        {order.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    
                    <div style={{...styles.tableCell, width: '180px'}}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.editBtn}
                          onClick={() => handleEdit(order)}
                          title="Edit Order"
                        >
                          <FiEdit size={14} />
                          Edit
                        </button>
                        <button 
                          style={styles.viewBtn}
                          onClick={() => showOrderDetails(order)}
                          title="View Details"
                        >
                          <FiEye size={14} />
                        </button>
                        <button 
                          style={styles.productsBtn}
                          onClick={() => showOrderProducts(order.products)}
                          title="View Products"
                        >
                          <FiPackage size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={styles.gridContainer}>
            {currentOrders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <div key={order._id} style={styles.orderGridCard}>
                  <div style={styles.gridCardHeader}>
                    <div style={styles.gridOrderInfo}>
                      <span style={styles.gridOrderId} onClick={() => showOrderDetails(order)}>#{order.orderId}</span>
                      <span style={styles.gridDate}>{formatDate(order.createdAt)}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order._id)}
                      onChange={() => toggleOrderSelection(order._id)}
                      style={styles.checkbox}
                    />
                  </div>
                  
                  <div style={styles.gridCardBody}>
                    <div style={styles.gridCustomer} onClick={() => showCustomerProfile(order.user)}>
                      <div style={styles.customerAvatar}>
                        {order.customerName?.charAt(0) || 'C'}
                      </div>
                      <div style={styles.gridCustomerInfo}>
                        <div style={styles.gridCustomerName}>{order.customerName}</div>
                        <div style={styles.gridCustomerId}>{order.customerId}</div>
                        <div style={styles.gridCustomerPhone}>{order.customerPhone}</div>
                      </div>
                    </div>
                    
                    <div style={styles.gridStatus}>
                      <div style={{
                        ...styles.gridStatusBadge,
                        backgroundColor: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status),
                        cursor: 'pointer'
                      }}
                      onClick={() => handleEdit(order)}
                      >
                        <StatusIcon size={12} />
                        {order.status.replace(/_/g, ' ')}
                      </div>
                      <div style={styles.gridAmount}>{formatCurrency(order.totalAmount)}</div>
                    </div>
                    
                    <div style={styles.gridPayment}>
                      <span style={styles.paymentText}>Paid via {order.paymentMethod.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div style={styles.gridCardFooter}>
                    <button 
                      style={styles.gridActionBtn}
                      onClick={() => handleEdit(order)}
                    >
                      <FiEdit size={14} />
                      Edit
                    </button>
                    <button 
                      style={styles.gridActionBtn}
                      onClick={() => showCustomerProfile(order.user)}
                    >
                      <FiUser size={14} />
                      Profile
                    </button>
                    <button 
                      style={styles.gridActionBtn}
                      onClick={() => showOrderProducts(order.products)}
                    >
                      <FiPackage size={14} />
                      Products
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FiChevronLeft size={16} />
            Previous
          </button>
          
          <div style={styles.paginationPages}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                style={{
                  ...styles.paginationPage,
                  ...(currentPage === page ? styles.activePaginationPage : {})
                }}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            style={styles.paginationButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <FiChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Customer Profile</h2>
              <button style={styles.closeButton} onClick={closeModal}>
                <FiX size={24} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.profileSection}>
                <div style={styles.profileHeader}>
                  <div style={styles.profileAvatar}>
                    {selectedCustomer.name?.charAt(0) || 'C'}
                  </div>
                  <div style={styles.profileInfo}>
                    <h3 style={styles.profileName}>{selectedCustomer.name}</h3>
                    <p style={styles.profileCustomerId}>ID: {selectedCustomer.customerId}</p>
                  </div>
                </div>
                
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <FiMail size={18} color="#6366f1" />
                    <div>
                      <label style={styles.detailLabel}>Email</label>
                      <p style={styles.detailValue}>{selectedCustomer.email || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <FiPhone size={18} color="#6366f1" />
                    <div>
                      <label style={styles.detailLabel}>Phone</label>
                      <p style={styles.detailValue}>{selectedCustomer.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <FiMapPin size={18} color="#6366f1" />
                    <div>
                      <label style={styles.detailLabel}>Address</label>
                      <p style={styles.detailValue}>{selectedCustomer.address}</p>
                    </div>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <FiShoppingCart size={18} color="#6366f1" />
                    <div>
                      <label style={styles.detailLabel}>Total Orders</label>
                      <p style={styles.detailValue}>
                        {ordersData.filter(order => order.customerId === selectedCustomer.customerId).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Modal */}
      {selectedProducts && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Order Products</h2>
              <button style={styles.closeButton} onClick={closeModal}>
                <FiX size={24} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.productsList}>
                {selectedProducts.map((item, index) => (
                  <div key={index} style={styles.productItem}>
                    <div style={styles.productImage}>
                      <div style={styles.productPlaceholder}>
                        <FiPackage size={32} color="#64748b" />
                      </div>
                    </div>
                    <div style={styles.productDetails}>
                      <h4 style={styles.productName}>{item.name}</h4>
                      <p style={styles.productCategory}>{item.category || 'General'}</p>
                      <div style={styles.productMeta}>
                        <span style={styles.productPrice}>
                          {formatCurrency(item.price)} × {item.quantity}
                        </span>
                        <span style={styles.productTotal}>
                          Total: {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={styles.productsTotal}>
                  <div style={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span>Total Items:</span>
                    <span>{selectedProducts.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Order Details</h2>
              <button style={styles.closeButton} onClick={closeModal}>
                <FiX size={24} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.orderDetailsSection}>
                <div style={styles.orderDetailHeader}>
                  <div style={styles.orderDetailInfo}>
                    <h3 style={styles.orderDetailTitle}>Order #{selectedOrderDetails.orderId}</h3>
                    <p style={styles.orderDetailDate}>{formatDate(selectedOrderDetails.createdAt)}</p>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(selectedOrderDetails.status) + '20',
                    color: getStatusColor(selectedOrderDetails.status),
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}>
                    {React.createElement(getStatusIcon(selectedOrderDetails.status), { size: 16 })}
                    {selectedOrderDetails.status.replace(/_/g, ' ')}
                  </div>
                </div>
                
                <div style={styles.orderDetailsGrid}>
                  <div style={styles.orderDetailItem}>
                    <label style={styles.detailLabel}>Customer</label>
                    <p style={styles.detailValue}>{selectedOrderDetails.customerName}</p>
                  </div>
                  
                  <div style={styles.orderDetailItem}>
                    <label style={styles.detailLabel}>Customer ID</label>
                    <p style={styles.detailValue}>{selectedOrderDetails.customerId}</p>
                  </div>
                  
                  <div style={styles.orderDetailItem}>
                    <label style={styles.detailLabel}>Phone</label>
                    <p style={styles.detailValue}>{selectedOrderDetails.customerPhone}</p>
                  </div>
                  
                  <div style={styles.orderDetailItem}>
                    <label style={styles.detailLabel}>Email</label>
                    <p style={styles.detailValue}>{selectedOrderDetails.customerEmail || 'Not provided'}</p>
                  </div>
                  
                  <div style={styles.orderDetailItem}>
                    <label style={styles.detailLabel}>Payment Method</label>
                    <p style={styles.detailValue}>{selectedOrderDetails.paymentMethod.toUpperCase()}</p>
                  </div>
                  
                  <div style={styles.orderDetailItem}>
                    <label style={styles.detailLabel}>Total Amount</label>
                    <p style={styles.detailValue}>{formatCurrency(selectedOrderDetails.totalAmount)}</p>
                  </div>
                </div>
                
                <div style={styles.orderDetailAddress}>
                  <label style={styles.detailLabel}>Delivery Address</label>
                  <p style={styles.detailValue}>
                    {selectedOrderDetails.deliveryAddress?.name || selectedOrderDetails.customerName}<br/>
                    {selectedOrderDetails.deliveryAddress?.addressLine1}<br/>
                    {selectedOrderDetails.deliveryAddress?.addressLine2 && (
                      <>{selectedOrderDetails.deliveryAddress.addressLine2}<br/></>
                    )}
                    {selectedOrderDetails.deliveryAddress?.city}, {selectedOrderDetails.deliveryAddress?.state}<br/>
                    {selectedOrderDetails.deliveryAddress?.pincode}<br/>
                    Phone: {selectedOrderDetails.deliveryAddress?.phone || selectedOrderDetails.customerPhone}
                  </p>
                </div>
                
                <div style={styles.orderDetailProducts}>
                  <label style={styles.detailLabel}>Products ({selectedOrderDetails.products?.length || 0})</label>
                  {selectedOrderDetails.products?.map((item, index) => (
                    <div key={index} style={styles.orderProductItem}>
                      <div style={styles.orderProductImage}>
                        <div style={styles.productPlaceholder}>
                          <FiPackage size={24} color="#64748b" />
                        </div>
                      </div>
                      <div style={styles.orderProductDetails}>
                        <h4 style={styles.orderProductName}>{item.name}</h4>
                        <p style={styles.orderProductCategory}>{item.category || 'General'}</p>
                        <div style={styles.orderProductMeta}>
                          <span style={styles.orderProductPrice}>
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>
                          <span style={styles.orderProductTotal}>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={styles.orderSummary}>
                    <div style={styles.summaryRow}>
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrderDetails.subtotal || selectedOrderDetails.totalAmount)}</span>
                    </div>
                    {selectedOrderDetails.tax > 0 && (
                      <div style={styles.summaryRow}>
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedOrderDetails.tax)}</span>
                      </div>
                    )}
                    {selectedOrderDetails.shipping > 0 && (
                      <div style={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span>{formatCurrency(selectedOrderDetails.shipping)}</span>
                      </div>
                    )}
                    <div style={{...styles.summaryRow, fontWeight: 'bold', fontSize: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '10px'}}>
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrderDetails.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Complete Enhanced Styles
const styles = {
  container: {
    padding: '0',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    width: '100%',
    maxWidth: '100vw',
    overflowX: 'hidden',
  },
  













 
  // Add these new styles for the edit modal:
  formSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e2e8f0'
  },
  
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem'
  },
  
  formGroup: {
    marginBottom: '1rem'
  },
  
  formLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '0.5rem'
  },
  
  formInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: 'white'
  },
  
  formSelect: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  
  productItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    borderBottom: '1px solid #e2e8f0'
  },
  
  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  productName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1e293b'
  },
  
  productQuantity: {
    fontSize: '0.875rem',
    color: '#64748b'
  },
  
  productPrice: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#10b981'
  },
  
  modalFooter: {
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem'
  },
  
  cancelButton: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  
  saveButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  
  // Update existing styles for better buttons:
  editBtn: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease'
  },
  















  











  // Header
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.5rem 2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.25rem 0',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    margin: '0',
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  
  // Stats Overview
  statsOverview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    padding: '2rem',
    maxWidth: '100%',
    margin: '0 auto',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #f1f5f9',
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    margin: '0 0 0.5rem 0',
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.25rem 0',
  },
  statChange: {
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  
  // Quick Status
  quickStatus: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '0 2rem 2rem',
    maxWidth: '100%',
    margin: '0 auto',
  },
  statusQuickCard: {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  statusQuickContent: {
    flex: 1,
  },
  statusQuickCount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  statusQuickLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  
  // Controls Section
  controlsSection: {
    backgroundColor: 'white',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
    maxWidth: '100%',
    margin: '0 auto',
  },
  controlsLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
  },
  statusFilterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#475569',
  },
  statusSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    minWidth: '150px',
    cursor: 'pointer',
  },
  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  controlButton: {
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    padding: '4px',
  },
  viewButton: {
    padding: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  activeViewButton: {
    backgroundColor: 'white',
    color: '#6366f1',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  
  // Advanced Filters
  advancedFilters: {
    backgroundColor: 'white',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e2e8f0',
    maxWidth: '100%',
    margin: '0 auto',
  },
  filterRow: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'flex-end',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  dateInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dateInput: {
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
  },
  dateSeparator: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  sortSelect: {
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    minWidth: '150px',
  },
  sortOrderButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Bulk Actions
  bulkActionsBar: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '100%',
    margin: '0 auto',
  },
  bulkInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  bulkCount: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#0369a1',
  },
  bulkControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  bulkSelect: {
    padding: '0.5rem',
    border: '1px solid #bae6fd',
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    minWidth: '150px',
  },
  bulkClearButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ef4444',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  
  // Orders Content
  ordersContent: {
    padding: '0 2rem 2rem',
    maxWidth: '100%',
    margin: '0 auto',
    width: '100%',
  },
  
  // Table View
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
    minHeight: '80px',
  },
  tableBody: {
    '& > div:hover': {
      backgroundColor: '#f8fafc',
    },
  },
  tableCell: {
    padding: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    flex: 1,
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  orderId: {
    fontWeight: '600',
    color: '#6366f1',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  customerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  customerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  customerName: {
    fontWeight: '500',
    color: '#1e293b',
    fontSize: '0.875rem',
    marginBottom: '2px',
  },
  customerPhone: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  customerId: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },
  statusCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    width: 'fit-content',
  },
  amount: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '0.875rem',
  },
  date: {
    color: '#64748b',
    fontSize: '0.875rem',
  },
  paymentBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    padding: '8px',
    border: '1px solid #10b981',
    backgroundColor: '#10b981',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  cancelBtn: {
    padding: '8px',
    border: '1px solid #ef4444',
    backgroundColor: '#ef4444',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  viewBtn: {
    padding: '8px',
    border: '1px solid #6366f1',
    backgroundColor: '#6366f1',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  productsBtn: {
    padding: '8px',
    border: '1px solid #8b5cf6',
    backgroundColor: '#8b5cf6',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  
  // Grid View
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  orderGridCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #f1f5f9',
  },
  gridCardHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridOrderInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridOrderId: {
    fontWeight: '600',
    color: '#6366f1',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  gridDate: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  gridCardBody: {
    padding: '1.5rem',
  },
  gridCustomer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  gridCustomerInfo: {
    flex: 1,
  },
  gridCustomerName: {
    fontWeight: '500',
    color: '#1e293b',
    fontSize: '0.875rem',
    marginBottom: '2px',
  },
  gridCustomerId: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  gridCustomerPhone: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  gridStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  gridStatusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  gridAmount: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '1rem',
  },
  gridPayment: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  paymentText: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  gridCardFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    gap: '0.5rem',
  },
  gridActionBtn: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
  },
  
  // No Data
  noData: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    color: '#64748b',
    textAlign: 'center',
    gridColumn: '1 / -1',
  },
  noDataText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#475569',
    margin: '1rem 0 0.5rem 0',
  },
  noDataSubtext: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
  },
  
  // Pagination
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    maxWidth: '100%',
    margin: '0 auto',
  },
  paginationButton: {
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  paginationPages: {
    display: 'flex',
    gap: '0.5rem',
  },
  paginationPage: {
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  activePaginationPage: {
    backgroundColor: '#6366f1',
    color: 'white',
    borderColor: '#6366f1',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '2rem',
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
    animation: 'modalSlideIn 0.3s ease-out',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  },
  modalBody: {
    padding: '2rem',
  },
  
  // Profile Modal
  profileSection: {
    
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#6366f1',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.25rem 0',
  },
  profileCustomerId: {
    color: '#64748b',
    fontSize: '0.875rem',
    margin: 0,
  },
  detailsGrid: {
    display: 'grid',
    gap: '1.5rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  detailLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#64748b',
    margin: '0 0 0.25rem 0',
    display: 'block',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#1e293b',
    margin: 0,
  },
  
  // Products Modal
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  productItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  productImage: {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  productCategory: {
    fontSize: '0.875rem',
    color: '#6366f1',
    fontWeight: '500',
    margin: '0 0 0.5rem 0',
  },
  productDescription: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0 0 1rem 0',
    lineHeight: '1.5',
  },
  productMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  productPrice: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#10b981',
  },
  productTotal: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  productsTotal: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '1rem',
  },
  
  // Order Details Modal
  orderDetailsSection: {
    
  },
  orderDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  orderDetailInfo: {
    flex: 1,
  },
  orderDetailTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  orderDetailDate: {
    color: '#64748b',
    fontSize: '0.875rem',
    margin: 0,
  },
  orderDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  orderDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  orderDetailAddress: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  orderDetailProducts: {
    
  },
  orderProductItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '1rem',
  },
  orderProductImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  orderProductImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  orderProductDetails: {
    flex: 1,
  },
  orderProductName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  orderProductCategory: {
    fontSize: '0.875rem',
    color: '#6366f1',
    fontWeight: '500',
    margin: '0 0 0.5rem 0',
  },
  orderProductMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderProductPrice: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#10b981',
  },
  orderProductTotal: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  orderSummary: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '1rem',
  },
  
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    color: '#64748b',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f1f5f9',
    borderTop: '4px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    fontSize: '1rem',
    color: '#64748b',
  },
};

// Add CSS animations
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`, styleSheet.cssRules.length);

// Add hover effects
styleSheet.insertRule(`
  .statCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .orderGridCard:hover {
    transform: translateY(-2px);
    boxShadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .primaryButton:hover {
    background-color: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .secondaryButton:hover {
    border-color: #6366f1;
    color: #6366f1;
    transform: translateY(-1px);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  .closeButton:hover {
    background-color: #f1f5f9;
    color: #1e293b;
  }
`, styleSheet.cssRules.length);

export default Orders;





// // src/components/Pages/Orders.jsx
// import React, { useState, useEffect } from "react";
// import { 
//   FiShoppingBag, 
//   FiDollarSign, 
//   FiUsers, 
//   FiTrendingUp, 
//   FiSearch, 
//   FiEdit, 
//   FiSave, 
//   FiX, 
//   FiUser, 
//   FiPackage,
//   FiDownload,
//   FiRefreshCw,
//   FiClock,
//   FiTruck,
//   FiCheckCircle,
//   FiAlertCircle,
//   FiFilter,
//   FiChevronRight,
//   FiChevronLeft,
//   FiChevronUp,
//   FiChevronDown,
//   FiGrid,
//   FiList,
//   FiCreditCard,
//   FiMail,
//   FiPhone,
//   FiMapPin,
//   FiShoppingCart,
//   FiEye,
//   FiMoreVertical
// } from 'react-icons/fi';
// import axios from 'axios';

// // Status Timeline Component
// const StatusTimeline = ({ currentStatus }) => {
//   const statusFlow = [
//     { value: 'pending', label: 'Pending', icon: FiClock, color: '#f59e0b' },
//     { value: 'order_confirmed', label: 'Confirmed', icon: FiCheckCircle, color: '#6366f1' },
//     { value: 'preparing', label: 'Preparing', icon: FiPackage, color: '#8b5cf6' },
//     { value: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck, color: '#f97316' },
//     { value: 'delivered', label: 'Delivered', icon: FiCheckCircle, color: '#10b981' }
//   ];

//   const currentIndex = statusFlow.findIndex(status => status.value === currentStatus);
  
//   if (currentIndex === -1) return null;

//   return (
//     <div style={{
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       padding: '8px 0',
//       position: 'relative'
//     }}>
//       {statusFlow.map((status, index) => {
//         const IconComponent = status.icon;
//         const isActive = index <= currentIndex;
//         const isCompleted = index < currentIndex;
        
//         return (
//           <div key={status.value} style={{
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             flex: 1,
//             position: 'relative'
//           }}>
//             {/* Connector Line */}
//             {index > 0 && (
//               <div style={{
//                 position: 'absolute',
//                 top: '12px',
//                 left: '-50%',
//                 right: '50%',
//                 height: '2px',
//                 backgroundColor: isCompleted ? status.color : '#e2e8f0',
//                 zIndex: 1,
//                 transition: 'all 0.3s ease'
//               }} />
//             )}
            
//             {/* Status Dot */}
//             <div style={{
//               width: '24px',
//               height: '24px',
//               borderRadius: '50%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               backgroundColor: isActive ? status.color : '#f8fafc',
//               border: `2px solid ${isActive ? status.color : '#e2e8f0'}`,
//               color: isActive ? '#ffffff' : '#94a3b8',
//               zIndex: 2,
//               transition: 'all 0.3s ease',
//               position: 'relative'
//             }}>
//               {isActive && <IconComponent size={12} />}
//             </div>
            
//             {/* Status Label */}
//             <span style={{
//               fontSize: '10px',
//               fontWeight: '500',
//               color: isActive ? status.color : '#94a3b8',
//               marginTop: '4px',
//               textAlign: 'center',
//               transition: 'all 0.3s ease'
//             }}>
//               {status.label}
//             </span>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// // Hover Tooltip Component
// const HoverTooltip = ({ content, position = 'right', children }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   return (
//     <div style={{ position: 'relative', display: 'inline-block' }}>
//       <div
//         onMouseEnter={() => setIsVisible(true)}
//         onMouseLeave={() => setIsVisible(false)}
//       >
//         {children}
//       </div>
//       {isVisible && (
//         <div style={{
//           position: 'absolute',
//           top: '100%',
//           [position]: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.9)',
//           color: 'white',
//           padding: '12px',
//           borderRadius: '8px',
//           fontSize: '12px',
//           fontWeight: '400',
//           zIndex: 1000,
//           minWidth: '200px',
//           boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
//           backdropFilter: 'blur(10px)',
//           border: '1px solid rgba(255, 255, 255, 0.1)',
//           animation: 'fadeInUp 0.2s ease-out',
//           lineHeight: '1.4'
//         }}>
//           {content}
//           <div style={{
//             position: 'absolute',
//             top: '-4px',
//             [position]: '12px',
//             width: '8px',
//             height: '8px',
//             backgroundColor: 'rgba(0, 0, 0, 0.9)',
//             transform: 'rotate(45deg)'
//           }} />
//         </div>
//       )}
//     </div>
//   );
// };

// function Orders() {
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editingOrder, setEditingOrder] = useState(null);
//   const [ordersData, setOrdersData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalOrders: 0,
//     orderValue: 0,
//     customers: 0,
//     avgOrderValue: 0
//   });
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [selectedProducts, setSelectedProducts] = useState(null);
//   const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedOrders, setSelectedOrders] = useState([]);
//   const [showFilters, setShowFilters] = useState(false);
//   const [dateRange, setDateRange] = useState({ start: '', end: '' });
//   const [sortBy, setSortBy] = useState('date');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [viewMode, setViewMode] = useState('table');
//   const [hoveredOrder, setHoveredOrder] = useState(null);
//   const [hoveredCustomer, setHoveredCustomer] = useState(null);
//   const ordersPerPage = 10;

//   // FIX: Set the correct baseURL to point to your backend
//   const baseURL = "http://localhost:5001";

//   // Order status flow
//   const statusOptions = [
//     { value: 'all', label: 'All Status', icon: FiPackage, color: '#64748b' },
//     { value: 'pending', label: 'Pending', icon: FiClock, color: '#f59e0b' },
//     { value: 'order_confirmed', label: 'Confirmed', icon: FiCheckCircle, color: '#6366f1' },
//     { value: 'preparing', label: 'Preparing', icon: FiPackage, color: '#8b5cf6' },
//     { value: 'out_for_delivery', label: 'Out for Delivery', icon: FiTruck, color: '#f97316' },
//     { value: 'delivered', label: 'Delivered', icon: FiCheckCircle, color: '#10b981' },
//     { value: 'cancelled', label: 'Cancelled', icon: FiX, color: '#ef4444' },
//     { value: 'returned', label: 'Returned', icon: FiRefreshCw, color: '#f97316' },
//     { value: 'refunded', label: 'Refunded', icon: FiDollarSign, color: '#84cc16' }
//   ];

//   // Fetch real orders data
//   useEffect(() => {
//     fetchOrders();
//     fetchOrderStats();
//   }, []);

//   // FIXED: Updated fetchOrders function to use correct endpoints
//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       console.log('📦 Fetching orders from backend...');

//       // Use the correct endpoint for fetching admin orders
//       const response = await axios.get(`${baseURL}/api/orders/admin/orders`, {
//         timeout: 10000,
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         const orders = response.data.data || [];
//         console.log(`✅ Loaded ${orders.length} orders`);
        
//         // Process orders to ensure they have the correct structure
//         const processedOrders = orders.map(order => ({
//           _id: order._id,
//           orderId: order.orderId,
//           status: order.status || 'order_confirmed',
//           totalAmount: order.totalAmount || 0,
//           createdAt: order.orderDate || order.createdAt || new Date().toISOString(),
//           paymentMethod: order.paymentMethod || 'cash',
          
//           // Customer data
//           user: {
//             name: order.customerName || 'Unknown Customer',
//             email: order.customerEmail || '',
//             phoneNumber: order.customerPhone || '',
//             address: order.customerAddress || '',
//             customerId: order.customerId || 'UNKNOWN'
//           },
          
//           customerId: order.customerId || 'UNKNOWN',
//           customerName: order.customerName || 'Unknown Customer',
//           products: order.products || []
//         }));
        
//         setOrdersData(processedOrders);
//       } else {
//         console.error('❌ API returned unsuccessful response');
//         // Use mock data for development
//         const mockOrders = generateMockOrders();
//         setOrdersData(mockOrders);
//       }
//     } catch (error) {
//       console.error('❌ Error fetching orders:', error);
      
//       // Use mock data for development
//       const mockOrders = generateMockOrders();
//       console.log('📋 Using mock data for development');
//       setOrdersData(mockOrders);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // FIXED: Updated fetchOrderStats function to use correct endpoint
//   const fetchOrderStats = async () => {
//     try {
//       const response = await axios.get(`${baseURL}/api/orders/admin/order-stats`, {
//         timeout: 10000,
//         headers: {
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.data.success) {
//         const statsData = response.data.data;
//         console.log('✅ Stats loaded from API');
        
//         setStats({
//           totalOrders: statsData.totalOrders || 0,
//           orderValue: statsData.totalRevenue || 0,
//           customers: statsData.customerCount || 0,
//           avgOrderValue: statsData.avgOrderValue || 0,
//         });
//       } else {
//         console.log('❌ Stats API returned unsuccessful response');
//         // Use mock data if API fails
//         setStats({
//           totalOrders: ordersData.length || 10,
//           orderValue: ordersData.reduce((sum, order) => sum + order.totalAmount, 0) || 50000,
//           customers: new Set(ordersData.map(order => order.customerId)).size || 8,
//           avgOrderValue: ordersData.reduce((sum, order) => sum + order.totalAmount, 0) / (ordersData.length || 1) || 2500
//         });
//       }
//     } catch (error) {
//       console.error('❌ Error fetching stats:', error);
//       // Set default stats
//       setStats({
//         totalOrders: ordersData.length,
//         orderValue: ordersData.reduce((sum, order) => sum + order.totalAmount, 0),
//         customers: new Set(ordersData.map(order => order.customerId)).size,
//         avgOrderValue: ordersData.reduce((sum, order) => sum + order.totalAmount, 0) / (ordersData.length || 1)
//       });
//     }
//   };

//   // FIXED: Updated updateOrderStatus function to use correct endpoint
//   const updateOrderStatus = async (orderId, newStatus) => {
//     try {
//       const response = await axios.put(
//         `${baseURL}/api/orders/admin/orders/update/${orderId}`,
//         { status: newStatus },
//         {
//           headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       if (response.data.success) {
//         // Update local state
//         setOrdersData(prev =>
//           prev.map(order => 
//             order._id === orderId 
//               ? { ...order, status: newStatus }
//               : order
//           )
//         );
        
//         // Send real-time update via WebSocket
//         const order = ordersData.find(o => o._id === orderId);
//         if (order && order.user?.customerId) {
//           // Emit to backend WebSocket
//           console.log(`📡 Emitting real-time update for order ${orderId}`);
          
//           // You can also make a POST request to trigger the update
//           axios.post(`${baseURL}/api/notify-order-update`, {
//             orderId,
//             customerId: order.user.customerId,
//             status: newStatus,
//             timestamp: new Date().toISOString()
//           });
//         }
        
//         setEditingOrder(null);
//       }
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       // Update locally for demo
//       setOrdersData(prev =>
//         prev.map(order => 
//           order._id === orderId 
//             ? { ...order, status: newStatus }
//             : order
//         )
//       );
//       setEditingOrder(null);
//     }
//   };

//   const bulkStatusUpdate = async (newStatus) => {
//     if (selectedOrders.length === 0) {
//       alert('Please select orders to update');
//       return;
//     }

//     try {
//       setLoading(true);
//       const updatePromises = selectedOrders.map(orderId =>
//         axios.put(`${baseURL}/api/orders/admin/orders/update/${orderId}`, {
//           status: newStatus
//         })
//       );

//       await Promise.all(updatePromises);
//       setOrdersData(prev =>
//         prev.map(order =>
//           selectedOrders.includes(order._id)
//             ? { ...order, status: newStatus }
//             : order
//         )
//       );
//       setSelectedOrders([]);
//     } catch (error) {
//       console.error('Error in bulk update:', error);
//       // Update locally for demo
//       setOrdersData(prev =>
//         prev.map(order =>
//           selectedOrders.includes(order._id)
//             ? { ...order, status: newStatus }
//             : order
//         )
//       );
//       setSelectedOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportOrders = () => {
//     if (filteredOrders.length === 0) {
//       alert('No orders to export');
//       return;
//     }

//     const headers = ['Order ID', 'Customer', 'Status', 'Total Amount', 'Date', 'Payment Method'];
//     const csvData = filteredOrders.map(order => [
//       order.orderId,
//       order.user?.name || order.customerName,
//       order.status,
//       order.totalAmount,
//       new Date(order.createdAt).toLocaleDateString(),
//       order.paymentMethod
//     ]);

//     const csvContent = [headers, ...csvData]
//       .map(row => row.map(field => `"${field}"`).join(','))
//       .join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleSort = (field) => {
//     if (sortBy === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortBy(field);
//       setSortOrder('asc');
//     }
//   };

//   const sortedOrders = [...ordersData].sort((a, b) => {
//     let aValue, bValue;
    
//     switch (sortBy) {
//       case 'date':
//         aValue = new Date(a.createdAt);
//         bValue = new Date(b.createdAt);
//         break;
//       case 'amount':
//         aValue = a.totalAmount;
//         bValue = b.totalAmount;
//         break;
//       case 'status':
//         aValue = a.status;
//         bValue = b.status;
//         break;
//       case 'orderId':
//         aValue = a.orderId;
//         bValue = b.orderId;
//         break;
//       default:
//         aValue = new Date(a.createdAt);
//         bValue = new Date(b.createdAt);
//     }
    
//     if (sortOrder === 'asc') {
//       return aValue > bValue ? 1 : -1;
//     } else {
//       return aValue < bValue ? 1 : -1;
//     }
//   });

//   const filteredOrders = sortedOrders.filter(order => {
//     const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
//     const matchesSearch = searchTerm === '' || 
//       order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.user?.phoneNumber.includes(searchTerm);
    
//     const orderDate = new Date(order.createdAt);
//     const matchesDateRange = 
//       (!dateRange.start || orderDate >= new Date(dateRange.start)) &&
//       (!dateRange.end || orderDate <= new Date(dateRange.end));
    
//     return matchesStatus && matchesSearch && matchesDateRange;
//   });

//   const handleEdit = (order) => {
//     setEditingOrder({
//       id: order._id,
//       status: order.status,
//       date: order.createdAt
//     });
//   };

//   const handleSave = () => {
//     if (editingOrder) {
//       updateOrderStatus(editingOrder.id, editingOrder.status);
//     }
//   };

//   const handleCancel = () => {
//     setEditingOrder(null);
//   };

//   const showCustomerProfile = (customer) => {
//     setSelectedCustomer(customer);
//   };

//   const showOrderProducts = (products) => {
//     setSelectedProducts(products);
//   };

//   const showOrderDetails = (order) => {
//     setSelectedOrderDetails(order);
//   };

//   const closeModal = () => {
//     setSelectedCustomer(null);
//     setSelectedProducts(null);
//     setSelectedOrderDetails(null);
//   };

//   const toggleOrderSelection = (orderId) => {
//     setSelectedOrders(prev =>
//       prev.includes(orderId)
//         ? prev.filter(id => id !== orderId)
//         : [...prev, orderId]
//     );
//   };

//   const selectAllOrders = () => {
//     if (selectedOrders.length === filteredOrders.length) {
//       setSelectedOrders([]);
//     } else {
//       setSelectedOrders(filteredOrders.map(order => order._id));
//     }
//   };

//   // Pagination
//   const indexOfLastOrder = currentPage * ordersPerPage;
//   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
//   const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
//   const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

//   const getStatusColor = (status) => {
//     const statusOption = statusOptions.find(opt => opt.value === status);
//     return statusOption ? statusOption.color : '#64748b';
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const getStatusIcon = (status) => {
//     const statusOption = statusOptions.find(opt => opt.value === status);
//     return statusOption ? statusOption.icon : FiPackage;
//   };

//   // Add this mock data generator function
//   const generateMockOrders = () => {
//     const mockProducts = [
//       { name: 'Product 1', price: 500, quantity: 2, category: 'Electronics' },
//       { name: 'Product 2', price: 300, quantity: 1, category: 'Clothing' },
//       { name: 'Product 3', price: 200, quantity: 3, category: 'Food' }
//     ];

//     const statuses = ['order_confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
//     return Array.from({ length: 10 }, (_, index) => ({
//       _id: `mock_${index + 1}`,
//       orderId: `ORD${Date.now()}${index}`,
//       status: statuses[Math.floor(Math.random() * statuses.length)],
//       totalAmount: Math.floor(Math.random() * 5000) + 1000,
//       createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
//       paymentMethod: ['card', 'upi', 'cash'][Math.floor(Math.random() * 3)],
//       user: {
//         name: `Customer ${index + 1}`,
//         email: `customer${index + 1}@example.com`,
//         phoneNumber: `98765432${index.toString().padStart(2, '0')}`,
//         address: `Address ${index + 1}, City, State`,
//         customerId: `CUST${1000 + index}`
//       },
//       customerId: `CUST${1000 + index}`,
//       customerName: `Customer ${index + 1}`,
//       products: mockProducts.slice(0, Math.floor(Math.random() * 3) + 1)
//     }));
//   };

//   if (loading) {
//     return (
//       <div style={styles.loadingContainer}>
//         <div style={styles.spinner}></div>
//         <p style={styles.loadingText}>Loading orders data...</p>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       {/* Header Section */}
//       <div style={styles.header}>
//         <div style={styles.headerContent}>
//           <div>
//             <h1 style={styles.title}>Orders Management</h1>
//             <p style={styles.subtitle}>Manage and track all customer orders efficiently</p>
//           </div>
//           <div style={styles.headerActions}>
//             <button style={styles.primaryButton} onClick={fetchOrders}>
//               <FiRefreshCw size={16} />
//               Refresh
//             </button>
//             <button style={styles.secondaryButton} onClick={exportOrders}>
//               <FiDownload size={16} />
//               Export CSV
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Stats Overview */}
//       <div style={styles.statsOverview}>
//         <div style={styles.statCard}>
//           <div style={{...styles.statIcon, backgroundColor: 'rgba(99, 102, 241, 0.1)'}}>
//             <FiShoppingBag size={24} color="#6366f1" />
//           </div>
//           <div style={styles.statContent}>
//             <h3 style={styles.statTitle}>Total Orders</h3>
//             <div style={styles.statValue}>{stats.totalOrders.toLocaleString()}</div>
//             <div style={{...styles.statChange, color: '#10b981'}}>↑ 12% from last month</div>
//           </div>
//         </div>

//         <div style={styles.statCard}>
//           <div style={{...styles.statIcon, backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
//             <FiDollarSign size={24} color="#10b981" />
//           </div>
//           <div style={styles.statContent}>
//             <h3 style={styles.statTitle}>Order Value</h3>
//             <div style={styles.statValue}>{formatCurrency(stats.orderValue)}</div>
//             <div style={{...styles.statChange, color: '#10b981'}}>↑ 8% from last month</div>
//           </div>
//         </div>

//         <div style={styles.statCard}>
//           <div style={{...styles.statIcon, backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
//             <FiUsers size={24} color="#8b5cf6" />
//           </div>
//           <div style={styles.statContent}>
//             <h3 style={styles.statTitle}>Customers</h3>
//             <div style={styles.statValue}>{stats.customers.toLocaleString()}</div>
//             <div style={{...styles.statChange, color: '#10b981'}}>↑ 5% from last month</div>
//           </div>
//         </div>

//         <div style={styles.statCard}>
//           <div style={{...styles.statIcon, backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
//             <FiTrendingUp size={24} color="#f59e0b" />
//           </div>
//           <div style={styles.statContent}>
//             <h3 style={styles.statTitle}>Avg. Order Value</h3>
//             <div style={styles.statValue}>{formatCurrency(stats.avgOrderValue)}</div>
//             <div style={{...styles.statChange, color: '#10b981'}}>↑ 3% from last month</div>
//           </div>
//         </div>
//       </div>

//       {/* Quick Status Overview */}
//       <div style={styles.quickStatus}>
//         {statusOptions.filter(opt => opt.value !== 'all').map((option) => {
//           const IconComponent = option.icon;
//           const count = ordersData.filter(order => order.status === option.value).length;
//           return (
//             <div 
//               key={option.value}
//               style={{
//                 ...styles.statusQuickCard,
//                 borderLeft: `4px solid ${option.color}`
//               }}
//               onClick={() => setStatusFilter(option.value)}
//             >
//               <IconComponent size={20} color={option.color} />
//               <div style={styles.statusQuickContent}>
//                 <div style={styles.statusQuickCount}>{count}</div>
//                 <div style={styles.statusQuickLabel}>{option.label}</div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Controls Section */}
//       <div style={styles.controlsSection}>
//         <div style={styles.controlsLeft}>
//           <div style={styles.searchContainer}>
//             <FiSearch style={styles.searchIcon} />
//             <input
//               type="text"
//               placeholder="Search orders by ID, customer, or phone..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={styles.searchInput}
//             />
//           </div>
          
//           <div style={styles.statusFilterContainer}>
//             <label style={styles.filterLabel}>Status:</label>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               style={styles.statusSelect}
//             >
//               {statusOptions.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div style={styles.controlsRight}>
//           <button 
//             style={styles.controlButton}
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             <FiFilter size={16} />
//             Filters
//           </button>
          
//           <div style={styles.viewToggle}>
//             <button 
//               style={{
//                 ...styles.viewButton,
//                 ...(viewMode === 'table' ? styles.activeViewButton : {})
//               }}
//               onClick={() => setViewMode('table')}
//             >
//               <FiList size={16} />
//             </button>
//             <button 
//               style={{
//                 ...styles.viewButton,
//                 ...(viewMode === 'grid' ? styles.activeViewButton : {})
//               }}
//               onClick={() => setViewMode('grid')}
//             >
//               <FiGrid size={16} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Advanced Filters */}
//       {showFilters && (
//         <div style={styles.advancedFilters}>
//           <div style={styles.filterRow}>
//             <div style={styles.filterGroup}>
//               <label style={styles.filterLabel}>Date Range</label>
//               <div style={styles.dateInputs}>
//                 <input
//                   type="date"
//                   value={dateRange.start}
//                   onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
//                   style={styles.dateInput}
//                 />
//                 <span style={styles.dateSeparator}>to</span>
//                 <input
//                   type="date"
//                   value={dateRange.end}
//                   onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
//                   style={styles.dateInput}
//                 />
//               </div>
//             </div>
            
//             <div style={styles.filterGroup}>
//               <label style={styles.filterLabel}>Sort By</label>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 style={styles.sortSelect}
//               >
//                 <option value="date">Order Date</option>
//                 <option value="amount">Total Amount</option>
//                 <option value="status">Status</option>
//                 <option value="orderId">Order ID</option>
//               </select>
//             </div>
            
//             <div style={styles.filterGroup}>
//               <label style={styles.filterLabel}>Order</label>
//               <button 
//                 style={styles.sortOrderButton}
//                 onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//               >
//                 {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
//                 {sortOrder === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Bulk Actions */}
//       {selectedOrders.length > 0 && (
//         <div style={styles.bulkActionsBar}>
//           <div style={styles.bulkInfo}>
//             <span style={styles.bulkCount}>{selectedOrders.length} orders selected</span>
//           </div>
//           <div style={styles.bulkControls}>
//             <select
//               onChange={(e) => bulkStatusUpdate(e.target.value)}
//               style={styles.bulkSelect}
//               defaultValue=""
//             >
//               <option value="" disabled>Update Status</option>
//               {statusOptions.filter(opt => opt.value !== 'all').map(option => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//             <button 
//               style={styles.bulkClearButton}
//               onClick={() => setSelectedOrders([])}
//             >
//               Clear Selection
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Orders Content */}
//       <div style={styles.ordersContent}>
//         {viewMode === 'table' ? (
//           <div style={styles.tableContainer}>
//             <div style={styles.tableHeader}>
//               <div style={styles.tableRow}>
//                 <div style={{...styles.tableCell, width: '50px'}}>
//                   <input
//                     type="checkbox"
//                     checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
//                     onChange={selectAllOrders}
//                     style={styles.checkbox}
//                   />
//                 </div>
//                 <div 
//                   style={{...styles.tableCell, width: '150px', cursor: 'pointer'}}
//                   onClick={() => handleSort('orderId')}
//                 >
//                   Order ID {sortBy === 'orderId' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
//                 </div>
//                 <div style={{...styles.tableCell, width: '200px'}}>Customer</div>
//                 <div 
//                   style={{...styles.tableCell, width: '150px', cursor: 'pointer'}}
//                   onClick={() => handleSort('status')}
//                 >
//                   Status {sortBy === 'status' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
//                 </div>
//                 <div 
//                   style={{...styles.tableCell, width: '150px', cursor: 'pointer'}}
//                   onClick={() => handleSort('amount')}
//                 >
//                   Total {sortBy === 'amount' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
//                 </div>
//                 <div 
//                   style={{...styles.tableCell, width: '180px', cursor: 'pointer'}}
//                   onClick={() => handleSort('date')}
//                 >
//                   Date {sortBy === 'date' && (sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />)}
//                 </div>
//                 <div style={{...styles.tableCell, width: '120px'}}>Payment</div>
//                 <div style={{...styles.tableCell, width: '150px'}}>Actions</div>
//               </div>
//             </div>

//             <div style={styles.tableBody}>
//               {currentOrders.map((order) => {
//                 const StatusIcon = getStatusIcon(order.status);
//                 return (
//                   <div 
//                     key={order._id} 
//                     style={styles.tableRow}
//                     onMouseEnter={() => setHoveredOrder(order)}
//                     onMouseLeave={() => setHoveredOrder(null)}
//                   >
//                     <div style={{...styles.tableCell, width: '50px'}}>
//                       <input
//                         type="checkbox"
//                         checked={selectedOrders.includes(order._id)}
//                         onChange={() => toggleOrderSelection(order._id)}
//                         style={styles.checkbox}
//                       />
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '150px'}}>
//                       <HoverTooltip
//                         content={
//                           <div>
//                             <strong>Order Details</strong><br/>
//                             ID: {order.orderId}<br/>
//                             Date: {formatDate(order.createdAt)}<br/>
//                             Items: {order.products?.length || 0}<br/>
//                             Status: {order.status}
//                           </div>
//                         }
//                       >
//                         <span style={styles.orderId} onClick={() => showOrderDetails(order)}>#{order.orderId}</span>
//                       </HoverTooltip>
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '200px'}}>
//                       <HoverTooltip
//                         content={
//                           <div>
//                             <strong>Customer Details</strong><br/>
//                             Name: {order.user?.name}<br/>
//                             Phone: {order.user?.phoneNumber}<br/>
//                             Email: {order.user?.email}<br/>
//                             ID: {order.user?.customerId}
//                           </div>
//                         }
//                       >
//                         <div style={styles.customerCell} onClick={() => showCustomerProfile(order.user)}>
//                           <div style={styles.customerAvatar}>
//                             {order.user?.name?.charAt(0) || 'C'}
//                           </div>
//                           <div>
//                             <div style={styles.customerName}>{order.user?.name}</div>
//                             <div style={styles.customerId}>{order.user?.customerId}</div>
//                           </div>
//                         </div>
//                       </HoverTooltip>
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '150px'}}>
//                       <div style={styles.statusCell}>
//                         <div style={{
//                           ...styles.statusBadge,
//                           backgroundColor: getStatusColor(order.status) + '20',
//                           color: getStatusColor(order.status)
//                         }}>
//                           <StatusIcon size={12} />
//                           {order.status.replace(/_/g, ' ')}
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '150px'}}>
//                       <span style={styles.amount}>{formatCurrency(order.totalAmount)}</span>
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '180px'}}>
//                       {editingOrder?.id === order._id ? (
//                         <input
//                           type="date"
//                           value={new Date(editingOrder.date).toISOString().split('T')[0]}
//                           onChange={(e) => setEditingOrder({...editingOrder, date: e.target.value})}
//                           style={styles.dateEditInput}
//                         />
//                       ) : (
//                         <span style={styles.date}>{formatDate(order.createdAt)}</span>
//                       )}
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '120px'}}>
//                       <span style={{
//                         ...styles.paymentBadge,
//                         backgroundColor: order.paymentMethod === 'upi' ? '#6366f120' : 
//                                        order.paymentMethod === 'card' ? '#10b98120' : '#f59e0b20',
//                         color: order.paymentMethod === 'upi' ? '#6366f1' : 
//                               order.paymentMethod === 'card' ? '#10b981' : '#f59e0b'
//                       }}>
//                         {order.paymentMethod.toUpperCase()}
//                       </span>
//                     </div>
                    
//                     <div style={{...styles.tableCell, width: '150px'}}>
//                       <div style={styles.actionButtons}>
//                         {editingOrder?.id === order._id ? (
//                           <>
//                             <button style={styles.saveBtn} onClick={handleSave}>
//                               <FiSave size={14} />
//                             </button>
//                             <button style={styles.cancelBtn} onClick={handleCancel}>
//                               <FiX size={14} />
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button 
//                               style={styles.editBtn}
//                               onClick={() => handleEdit(order)}
//                               title="Edit Order"
//                             >
//                               <FiEdit size={14} />
//                             </button>
//                             <button 
//                               style={styles.viewBtn}
//                               onClick={() => showCustomerProfile(order.user)}
//                               title="View Customer"
//                             >
//                               <FiUser size={14} />
//                             </button>
//                             <button 
//                               style={styles.productsBtn}
//                               onClick={() => showOrderProducts(order.products)}
//                               title="View Products"
//                             >
//                               <FiPackage size={14} />
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ) : (
//           <div style={styles.gridContainer}>
//             {currentOrders.map((order) => {
//               const StatusIcon = getStatusIcon(order.status);
//               return (
//                 <div key={order._id} style={styles.orderGridCard}>
//                   <div style={styles.gridCardHeader}>
//                     <div style={styles.gridOrderInfo}>
//                       <span style={styles.gridOrderId} onClick={() => showOrderDetails(order)}>#{order.orderId}</span>
//                       <span style={styles.gridDate}>{formatDate(order.createdAt)}</span>
//                     </div>
//                     <input
//                       type="checkbox"
//                       checked={selectedOrders.includes(order._id)}
//                       onChange={() => toggleOrderSelection(order._id)}
//                       style={styles.checkbox}
//                     />
//                   </div>
                  
//                   <div style={styles.gridCardBody}>
//                     <div style={styles.gridCustomer} onClick={() => showCustomerProfile(order.user)}>
//                       <div style={styles.customerAvatar}>
//                         {order.user?.name?.charAt(0) || 'C'}
//                       </div>
//                       <div style={styles.gridCustomerInfo}>
//                         <div style={styles.gridCustomerName}>{order.user?.name}</div>
//                         <div style={styles.gridCustomerId}>{order.user?.customerId}</div>
//                       </div>
//                     </div>
                    
//                     <div style={styles.gridStatus}>
//                       <div style={{
//                         ...styles.gridStatusBadge,
//                         backgroundColor: getStatusColor(order.status) + '20',
//                         color: getStatusColor(order.status)
//                       }}>
//                         <StatusIcon size={12} />
//                         {order.status.replace(/_/g, ' ')}
//                       </div>
//                       <div style={styles.gridAmount}>{formatCurrency(order.totalAmount)}</div>
//                     </div>
                    
//                     <StatusTimeline currentStatus={order.status} />
                    
//                     <div style={styles.gridPayment}>
//                       <span style={styles.paymentText}>Paid via {order.paymentMethod.toUpperCase()}</span>
//                     </div>
//                   </div>
                  
//                   <div style={styles.gridCardFooter}>
//                     <button 
//                       style={styles.gridActionBtn}
//                       onClick={() => handleEdit(order)}
//                     >
//                       <FiEdit size={14} />
//                       Edit
//                     </button>
//                     <button 
//                       style={styles.gridActionBtn}
//                       onClick={() => showCustomerProfile(order.user)}
//                     >
//                       <FiUser size={14} />
//                       Profile
//                     </button>
//                     <button 
//                       style={styles.gridActionBtn}
//                       onClick={() => showOrderProducts(order.products)}
//                     >
//                       <FiPackage size={14} />
//                       Products
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div style={styles.pagination}>
//           <button
//             style={styles.paginationButton}
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//           >
//             <FiChevronLeft size={16} />
//             Previous
//           </button>
          
//           <div style={styles.paginationPages}>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//               <button
//                 key={page}
//                 style={{
//                   ...styles.paginationPage,
//                   ...(currentPage === page ? styles.activePaginationPage : {})
//                 }}
//                 onClick={() => setCurrentPage(page)}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
          
//           <button
//             style={styles.paginationButton}
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             disabled={currentPage === totalPages}
//           >
//             Next
//             <FiChevronRight size={16} />
//           </button>
//         </div>
//       )}

//       {/* Customer Profile Modal */}
//       {selectedCustomer && (
//         <div style={styles.modalOverlay} onClick={closeModal}>
//           <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.modalHeader}>
//               <h2 style={styles.modalTitle}>Customer Profile</h2>
//               <button style={styles.closeButton} onClick={closeModal}>
//                 <FiX size={24} />
//               </button>
//             </div>
//             <div style={styles.modalBody}>
//               <div style={styles.profileSection}>
//                 <div style={styles.profileHeader}>
//                   <div style={styles.profileAvatar}>
//                     {selectedCustomer.name?.charAt(0) || 'C'}
//                   </div>
//                   <div style={styles.profileInfo}>
//                     <h3 style={styles.profileName}>{selectedCustomer.name}</h3>
//                     <p style={styles.profileCustomerId}>ID: {selectedCustomer.customerId}</p>
//                   </div>
//                 </div>
                
//                 <div style={styles.detailsGrid}>
//                   <div style={styles.detailItem}>
//                     <FiMail size={18} color="#6366f1" />
//                     <div>
//                       <label style={styles.detailLabel}>Email</label>
//                       <p style={styles.detailValue}>{selectedCustomer.email}</p>
//                     </div>
//                   </div>
                  
//                   <div style={styles.detailItem}>
//                     <FiPhone size={18} color="#6366f1" />
//                     <div>
//                       <label style={styles.detailLabel}>Phone</label>
//                       <p style={styles.detailValue}>{selectedCustomer.phoneNumber}</p>
//                     </div>
//                   </div>
                  
//                   <div style={styles.detailItem}>
//                     <FiMapPin size={18} color="#6366f1" />
//                     <div>
//                       <label style={styles.detailLabel}>Address</label>
//                       <p style={styles.detailValue}>{selectedCustomer.address}</p>
//                     </div>
//                   </div>
                  
//                   <div style={styles.detailItem}>
//                     <FiShoppingCart size={18} color="#6366f1" />
//                     <div>
//                       <label style={styles.detailLabel}>Total Orders</label>
//                       <p style={styles.detailValue}>
//                         {ordersData.filter(order => order.user?.customerId === selectedCustomer.customerId).length}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Products Modal */}
//       {selectedProducts && (
//         <div style={styles.modalOverlay} onClick={closeModal}>
//           <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.modalHeader}>
//               <h2 style={styles.modalTitle}>Order Products</h2>
//               <button style={styles.closeButton} onClick={closeModal}>
//                 <FiX size={24} />
//               </button>
//             </div>
//             <div style={styles.modalBody}>
//               <div style={styles.productsList}>
//                 {selectedProducts.map((item, index) => (
//                   <div key={index} style={styles.productItem}>
//                     <div style={styles.productImage}>
//                       {item.images && item.images.length > 0 ? (
//                         <img 
//                           src={item.images[0]} 
//                           alt={item.name}
//                           style={styles.productImg}
//                         />
//                       ) : (
//                         <div style={styles.productPlaceholder}>
//                           <FiPackage size={32} color="#64748b" />
//                         </div>
//                       )}
//                     </div>
//                     <div style={styles.productDetails}>
//                       <h4 style={styles.productName}>{item.name}</h4>
//                       <p style={styles.productCategory}>{item.category}</p>
//                       <p style={styles.productDescription}>
//                         {item.description}
//                       </p>
//                       <div style={styles.productMeta}>
//                         <span style={styles.productPrice}>
//                           {formatCurrency(item.price)} × {item.quantity}
//                         </span>
//                         <span style={styles.productTotal}>
//                           Total: {formatCurrency(item.price * item.quantity)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Order Details Modal */}
//       {selectedOrderDetails && (
//         <div style={styles.modalOverlay} onClick={closeModal}>
//           <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.modalHeader}>
//               <h2 style={styles.modalTitle}>Order Details</h2>
//               <button style={styles.closeButton} onClick={closeModal}>
//                 <FiX size={24} />
//               </button>
//             </div>
//             <div style={styles.modalBody}>
//               <div style={styles.orderDetailsSection}>
//                 <div style={styles.orderDetailHeader}>
//                   <div style={styles.orderDetailInfo}>
//                     <h3 style={styles.orderDetailTitle}>Order #{selectedOrderDetails.orderId}</h3>
//                     <p style={styles.orderDetailDate}>{formatDate(selectedOrderDetails.createdAt)}</p>
//                   </div>
//                   <div style={{
//                     ...styles.statusBadge,
//                     backgroundColor: getStatusColor(selectedOrderDetails.status) + '20',
//                     color: getStatusColor(selectedOrderDetails.status)
//                   }}>
//                     {React.createElement(getStatusIcon(selectedOrderDetails.status), { size: 16 })}
//                     {selectedOrderDetails.status.replace(/_/g, ' ')}
//                   </div>
//                 </div>
                
//                 <div style={styles.orderDetailsGrid}>
//                   <div style={styles.orderDetailItem}>
//                     <label style={styles.detailLabel}>Customer</label>
//                     <p style={styles.detailValue}>{selectedOrderDetails.user?.name}</p>
//                   </div>
                  
//                   <div style={styles.orderDetailItem}>
//                     <label style={styles.detailLabel}>Customer ID</label>
//                     <p style={styles.detailValue}>{selectedOrderDetails.user?.customerId}</p>
//                   </div>
                  
//                   <div style={styles.orderDetailItem}>
//                     <label style={styles.detailLabel}>Phone</label>
//                     <p style={styles.detailValue}>{selectedOrderDetails.user?.phoneNumber}</p>
//                   </div>
                  
//                   <div style={styles.orderDetailItem}>
//                     <label style={styles.detailLabel}>Email</label>
//                     <p style={styles.detailValue}>{selectedOrderDetails.user?.email}</p>
//                   </div>
                  
//                   <div style={styles.orderDetailItem}>
//                     <label style={styles.detailLabel}>Payment Method</label>
//                     <p style={styles.detailValue}>{selectedOrderDetails.paymentMethod.toUpperCase()}</p>
//                   </div>
                  
//                   <div style={styles.orderDetailItem}>
//                     <label style={styles.detailLabel}>Total Amount</label>
//                     <p style={styles.detailValue}>{formatCurrency(selectedOrderDetails.totalAmount)}</p>
//                   </div>
//                 </div>
                
//                 <div style={styles.orderDetailAddress}>
//                   <label style={styles.detailLabel}>Delivery Address</label>
//                   <p style={styles.detailValue}>{selectedOrderDetails.user?.address}</p>
//                 </div>
                
//                 <div style={styles.orderDetailProducts}>
//                   <label style={styles.detailLabel}>Products</label>
//                   {selectedOrderDetails.products?.map((item, index) => (
//                     <div key={index} style={styles.orderProductItem}>
//                       <div style={styles.orderProductImage}>
//                         {item.images && item.images.length > 0 ? (
//                           <img 
//                             src={item.images[0]} 
//                             alt={item.name}
//                             style={styles.orderProductImg}
//                           />
//                         ) : (
//                           <div style={styles.productPlaceholder}>
//                             <FiPackage size={24} color="#64748b" />
//                           </div>
//                         )}
//                       </div>
//                       <div style={styles.orderProductDetails}>
//                         <h4 style={styles.orderProductName}>{item.name}</h4>
//                         <p style={styles.orderProductCategory}>{item.category}</p>
//                         <div style={styles.orderProductMeta}>
//                           <span style={styles.orderProductPrice}>
//                             {formatCurrency(item.price)} × {item.quantity}
//                           </span>
//                           <span style={styles.orderProductTotal}>
//                             Total: {formatCurrency(item.price * item.quantity)}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Complete Enhanced Styles
// const styles = {
//   container: {
//     padding: '0',
//     backgroundColor: '#f8fafc',
//     minHeight: '100vh',
//     fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
//     width: '100%',
//     maxWidth: '100vw',
//     overflowX: 'hidden',
//   },
  
//   // Header
//   header: {
//     backgroundColor: 'white',
//     borderBottom: '1px solid #e2e8f0',
//     padding: '1.5rem 2rem',
//     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
//     width: '100%',
//   },
//   headerContent: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   title: {
//     fontSize: '1.875rem',
//     fontWeight: '700',
//     color: '#1e293b',
//     margin: '0 0 0.25rem 0',
//     background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//     WebkitBackgroundClip: 'text',
//     WebkitTextFillColor: 'transparent',
//   },
//   subtitle: {
//     color: '#64748b',
//     fontSize: '1rem',
//     margin: '0',
//   },
//   headerActions: {
//     display: 'flex',
//     gap: '0.75rem',
//   },
//   primaryButton: {
//     padding: '0.75rem 1.5rem',
//     backgroundColor: '#6366f1',
//     color: 'white',
//     border: 'none',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//     transition: 'all 0.2s ease',
//     boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
//   },
//   secondaryButton: {
//     padding: '0.75rem 1.5rem',
//     backgroundColor: 'white',
//     color: '#64748b',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//     transition: 'all 0.2s ease',
//   },
  
//   // Stats Overview
//   statsOverview: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//     gap: '1.5rem',
//     padding: '2rem',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   statCard: {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     padding: '1.5rem',
//     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '1rem',
//     transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//     border: '1px solid #f1f5f9',
//   },
//   statIcon: {
//     width: '60px',
//     height: '60px',
//     borderRadius: '12px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   statContent: {
//     flex: 1,
//   },
//   statTitle: {
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     color: '#64748b',
//     margin: '0 0 0.5rem 0',
//   },
//   statValue: {
//     fontSize: '1.875rem',
//     fontWeight: '700',
//     color: '#1e293b',
//     margin: '0 0 0.25rem 0',
//   },
//   statChange: {
//     fontSize: '0.75rem',
//     fontWeight: '500',
//   },
  
//   // Quick Status
//   quickStatus: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//     gap: '1rem',
//     padding: '0 2rem 2rem',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   statusQuickCard: {
//     backgroundColor: 'white',
//     padding: '1rem',
//     borderRadius: '8px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '1rem',
//     cursor: 'pointer',
//     transition: 'all 0.2s ease',
//     boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
//   },
//   statusQuickContent: {
//     flex: 1,
//   },
//   statusQuickCount: {
//     fontSize: '1.5rem',
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   statusQuickLabel: {
//     fontSize: '0.875rem',
//     color: '#64748b',
//   },
  
//   // Controls Section
//   controlsSection: {
//     backgroundColor: 'white',
//     padding: '1.5rem 2rem',
//     borderBottom: '1px solid #e2e8f0',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     gap: '2rem',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   controlsLeft: {
//     flex: 1,
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '1rem',
//   },
//   searchContainer: {
//     position: 'relative',
//     maxWidth: '400px',
//   },
//   searchIcon: {
//     position: 'absolute',
//     left: '12px',
//     top: '50%',
//     transform: 'translateY(-50%)',
//     color: '#64748b',
//   },
//   searchInput: {
//     width: '100%',
//     padding: '0.75rem 1rem 0.75rem 2.5rem',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     fontSize: '0.875rem',
//     backgroundColor: '#f8fafc',
//     transition: 'all 0.2s ease',
//   },
//   statusFilterContainer: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//   },
//   filterLabel: {
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     color: '#475569',
//   },
//   statusSelect: {
//     padding: '0.5rem 1rem',
//     border: '1px solid #e2e8f0',
//     borderRadius: '8px',
//     fontSize: '0.875rem',
//     backgroundColor: 'white',
//     minWidth: '150px',
//     cursor: 'pointer',
//   },
//   controlsRight: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '1rem',
//   },
//   controlButton: {
//     padding: '0.75rem 1rem',
//     border: '1px solid #e2e8f0',
//     backgroundColor: 'white',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     color: '#64748b',
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//     transition: 'all 0.2s ease',
//   },
//   viewToggle: {
//     display: 'flex',
//     backgroundColor: '#f1f5f9',
//     borderRadius: '8px',
//     padding: '4px',
//   },
//   viewButton: {
//     padding: '0.5rem',
//     border: 'none',
//     backgroundColor: 'transparent',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: '#64748b',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'all 0.2s ease',
//   },
//   activeViewButton: {
//     backgroundColor: 'white',
//     color: '#6366f1',
//     boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
//   },
  
//   // Advanced Filters
//   advancedFilters: {
//     backgroundColor: 'white',
//     padding: '1.5rem 2rem',
//     borderBottom: '1px solid #e2e8f0',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   filterRow: {
//     display: 'flex',
//     gap: '2rem',
//     alignItems: 'flex-end',
//   },
//   filterGroup: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '0.5rem',
//   },
//   dateInputs: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//   },
//   dateInput: {
//     padding: '0.5rem',
//     border: '1px solid #e2e8f0',
//     borderRadius: '4px',
//     fontSize: '0.875rem',
//     backgroundColor: 'white',
//   },
//   dateSeparator: {
//     color: '#64748b',
//     fontSize: '0.875rem',
//   },
//   sortSelect: {
//     padding: '0.5rem',
//     border: '1px solid #e2e8f0',
//     borderRadius: '4px',
//     fontSize: '0.875rem',
//     backgroundColor: 'white',
//     minWidth: '150px',
//   },
//   sortOrderButton: {
//     padding: '0.5rem 1rem',
//     border: '1px solid #e2e8f0',
//     backgroundColor: 'white',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     color: '#64748b',
//     fontSize: '0.875rem',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//   },
  
//   // Bulk Actions
//   bulkActionsBar: {
//     backgroundColor: '#f0f9ff',
//     border: '1px solid #bae6fd',
//     padding: '1rem 2rem',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   bulkInfo: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '1rem',
//   },
//   bulkCount: {
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     color: '#0369a1',
//   },
//   bulkControls: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '1rem',
//   },
//   bulkSelect: {
//     padding: '0.5rem',
//     border: '1px solid #bae6fd',
//     borderRadius: '4px',
//     fontSize: '0.875rem',
//     backgroundColor: 'white',
//     minWidth: '150px',
//   },
//   bulkClearButton: {
//     padding: '0.5rem 1rem',
//     border: '1px solid #ef4444',
//     backgroundColor: 'transparent',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     color: '#ef4444',
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     transition: 'all 0.2s ease',
//   },
  
//   // Orders Content - Full Width Table
//   ordersContent: {
//     padding: '0 2rem 2rem',
//     maxWidth: '100%',
//     margin: '0 auto',
//     width: '100%',
//   },
  
//   // Table View - Full Width
//   tableContainer: {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
//     overflow: 'hidden',
//     width: '100%',
//   },
//   tableHeader: {
//     backgroundColor: '#f8fafc',
//     borderBottom: '1px solid #e2e8f0',
//   },
//   tableRow: {
//     display: 'flex',
//     alignItems: 'center',
//     borderBottom: '1px solid #f1f5f9',
//     transition: 'background-color 0.2s ease',
//     minHeight: '80px',
//   },
//   tableBody: {
//     '& > div:hover': {
//       backgroundColor: '#f8fafc',
//     },
//   },
//   tableCell: {
//     padding: '1rem',
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     color: '#475569',
//     display: 'flex',
//     alignItems: 'center',
//     height: '100%',
//     flex: 1,
//   },
//   checkbox: {
//     width: '16px',
//     height: '16px',
//     cursor: 'pointer',
//   },
//   orderId: {
//     fontWeight: '600',
//     color: '#6366f1',
//     fontSize: '0.875rem',
//     cursor: 'pointer',
//   },
//   customerCell: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.75rem',
//   },
//   customerAvatar: {
//     width: '40px',
//     height: '40px',
//     borderRadius: '50%',
//     backgroundColor: '#6366f1',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     flexShrink: 0,
//   },
//   customerName: {
//     fontWeight: '500',
//     color: '#1e293b',
//     fontSize: '0.875rem',
//     marginBottom: '2px',
//   },
//   customerId: {
//     fontSize: '0.75rem',
//     color: '#64748b',
//   },
//   statusCell: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '0.5rem',
//   },
//   statusBadge: {
//     padding: '4px 8px',
//     borderRadius: '12px',
//     fontSize: '11px',
//     fontWeight: '600',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '4px',
//     width: 'fit-content',
//   },
//   amount: {
//     fontWeight: '600',
//     color: '#1e293b',
//     fontSize: '0.875rem',
//   },
//   date: {
//     color: '#64748b',
//     fontSize: '0.875rem',
//   },
//   paymentBadge: {
//     padding: '6px 12px',
//     borderRadius: '12px',
//     fontSize: '11px',
//     fontWeight: '600',
//     display: 'inline-block',
//   },
//   actionButtons: {
//     display: 'flex',
//     gap: '0.5rem',
//   },
//   editBtn: {
//     padding: '8px',
//     border: '1px solid #e2e8f0',
//     backgroundColor: 'white',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: '#64748b',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'all 0.2s ease',
//   },
//   saveBtn: {
//     padding: '8px',
//     border: '1px solid #10b981',
//     backgroundColor: '#10b981',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'all 0.2s ease',
//   },
//   cancelBtn: {
//     padding: '8px',
//     border: '1px solid #ef4444',
//     backgroundColor: '#ef4444',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'all 0.2s ease',
//   },
//   viewBtn: {
//     padding: '8px',
//     border: '1px solid #6366f1',
//     backgroundColor: '#6366f1',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'all 0.2s ease',
//   },
//   productsBtn: {
//     padding: '8px',
//     border: '1px solid #8b5cf6',
//     backgroundColor: '#8b5cf6',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     transition: 'all 0.2s ease',
//   },
  
//   // Grid View
//   gridContainer: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
//     gap: '1.5rem',
//   },
//   orderGridCard: {
//     backgroundColor: 'white',
//     borderRadius: '12px',
//     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
//     overflow: 'hidden',
//     transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//     border: '1px solid #f1f5f9',
//   },
//   gridCardHeader: {
//     padding: '1rem 1.5rem',
//     borderBottom: '1px solid #f1f5f9',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   gridOrderInfo: {
//     display: 'flex',
//     flexDirection: 'column',
//   },
//   gridOrderId: {
//     fontWeight: '600',
//     color: '#6366f1',
//     fontSize: '0.875rem',
//     cursor: 'pointer',
//   },
//   gridDate: {
//     fontSize: '0.75rem',
//     color: '#64748b',
//   },
//   gridCardBody: {
//     padding: '1.5rem',
//   },
//   gridCustomer: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.75rem',
//     marginBottom: '1rem',
//   },
//   gridCustomerInfo: {
//     flex: 1,
//   },
//   gridCustomerName: {
//     fontWeight: '500',
//     color: '#1e293b',
//     fontSize: '0.875rem',
//     marginBottom: '2px',
//   },
//   gridCustomerId: {
//     fontSize: '0.75rem',
//     color: '#64748b',
//   },
//   gridStatus: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '1rem',
//   },
//   gridStatusBadge: {
//     padding: '6px 12px',
//     borderRadius: '12px',
//     fontSize: '12px',
//     fontWeight: '600',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '4px',
//   },
//   gridAmount: {
//     fontWeight: '600',
//     color: '#1e293b',
//     fontSize: '1rem',
//   },
//   gridPayment: {
//     marginTop: '1rem',
//     paddingTop: '1rem',
//     borderTop: '1px solid #f1f5f9',
//   },
//   paymentText: {
//     fontSize: '0.75rem',
//     color: '#64748b',
//   },
//   gridCardFooter: {
//     padding: '1rem 1.5rem',
//     borderTop: '1px solid #f1f5f9',
//     display: 'flex',
//     gap: '0.5rem',
//   },
//   gridActionBtn: {
//     flex: 1,
//     padding: '8px 12px',
//     border: '1px solid #e2e8f0',
//     backgroundColor: 'white',
//     borderRadius: '6px',
//     cursor: 'pointer',
//     color: '#64748b',
//     fontSize: '0.75rem',
//     fontWeight: '500',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '4px',
//     transition: 'all 0.2s ease',
//   },
  
//   // No Data
//   noData: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: '4rem 2rem',
//     color: '#64748b',
//     textAlign: 'center',
//     gridColumn: '1 / -1',
//   },
//   noDataText: {
//     fontSize: '1.125rem',
//     fontWeight: '600',
//     color: '#475569',
//     margin: '1rem 0 0.5rem 0',
//   },
//   noDataSubtext: {
//     fontSize: '0.875rem',
//     color: '#64748b',
//     margin: 0,
//   },
  
//   // Pagination
//   pagination: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '1.5rem 2rem',
//     maxWidth: '100%',
//     margin: '0 auto',
//   },
//   paginationButton: {
//     padding: '0.75rem 1rem',
//     border: '1px solid #e2e8f0',
//     backgroundColor: 'white',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     color: '#64748b',
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '0.5rem',
//     transition: 'all 0.2s ease',
//   },
//   paginationPages: {
//     display: 'flex',
//     gap: '0.5rem',
//   },
//   paginationPage: {
//     padding: '0.75rem 1rem',
//     border: '1px solid #e2e8f0',
//     backgroundColor: 'white',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     color: '#64748b',
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     transition: 'all 0.2s ease',
//   },
//   activePaginationPage: {
//     backgroundColor: '#6366f1',
//     color: 'white',
//     borderColor: '#6366f1',
//   },
  
//   // Modal Styles
//   modalOverlay: {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//     padding: '2rem',
//     backdropFilter: 'blur(4px)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     borderRadius: '16px',
//     width: '100%',
//     maxWidth: '600px',
//     maxHeight: '80vh',
//     overflow: 'auto',
//     boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
//     animation: 'modalSlideIn 0.3s ease-out',
//   },
//   modalHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: '1.5rem 2rem',
//     borderBottom: '1px solid #e2e8f0',
//   },
//   modalTitle: {
//     fontSize: '1.5rem',
//     fontWeight: '600',
//     color: '#1e293b',
//     margin: 0,
//   },
//   closeButton: {
//     background: 'none',
//     border: 'none',
//     cursor: 'pointer',
//     color: '#64748b',
//     padding: '4px',
//     borderRadius: '4px',
//     transition: 'all 0.2s ease',
//   },
//   modalBody: {
//     padding: '2rem',
//   },
  
//   // Profile Modal
//   profileSection: {
    
//   },
//   profileHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '1rem',
//     marginBottom: '2rem',
//   },
//   profileAvatar: {
//     width: '80px',
//     height: '80px',
//     borderRadius: '50%',
//     backgroundColor: '#6366f1',
//     color: 'white',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '2rem',
//     fontWeight: '600',
//   },
//   profileInfo: {
//     flex: 1,
//   },
//   profileName: {
//     fontSize: '1.5rem',
//     fontWeight: '600',
//     color: '#1e293b',
//     margin: '0 0 0.25rem 0',
//   },
//   profileCustomerId: {
//     color: '#64748b',
//     fontSize: '0.875rem',
//     margin: 0,
//   },
//   detailsGrid: {
//     display: 'grid',
//     gap: '1.5rem',
//   },
//   detailItem: {
//     display: 'flex',
//     alignItems: 'flex-start',
//     gap: '1rem',
//   },
//   detailLabel: {
//     fontSize: '0.875rem',
//     fontWeight: '500',
//     color: '#64748b',
//     margin: '0 0 0.25rem 0',
//     display: 'block',
//   },
//   detailValue: {
//     fontSize: '1rem',
//     color: '#1e293b',
//     margin: 0,
//   },
  
//   // Products Modal
//   productsList: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '1.5rem',
//   },
//   productItem: {
//     display: 'flex',
//     gap: '1rem',
//     padding: '1.5rem',
//     backgroundColor: '#f8fafc',
//     borderRadius: '12px',
//     border: '1px solid #e2e8f0',
//   },
//   productImage: {
//     width: '80px',
//     height: '80px',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     flexShrink: 0,
//   },
//   productImg: {
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover',
//   },
//   productPlaceholder: {
//     width: '100%',
//     height: '100%',
//     backgroundColor: '#e2e8f0',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: '8px',
//   },
//   productDetails: {
//     flex: 1,
//   },
//   productName: {
//     fontSize: '1.125rem',
//     fontWeight: '600',
//     color: '#1e293b',
//     margin: '0 0 0.5rem 0',
//   },
//   productCategory: {
//     fontSize: '0.875rem',
//     color: '#6366f1',
//     fontWeight: '500',
//     margin: '0 0 0.5rem 0',
//   },
//   productDescription: {
//     fontSize: '0.875rem',
//     color: '#64748b',
//     margin: '0 0 1rem 0',
//     lineHeight: '1.5',
//   },
//   productMeta: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '0.5rem',
//   },
//   productPrice: {
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     color: '#10b981',
//   },
//   productQuantity: {
//     fontSize: '0.875rem',
//     color: '#64748b',
//   },
//   productTotal: {
//     fontSize: '1rem',
//     fontWeight: '600',
//     color: '#1e293b',
//   },
  
//   // Order Details Modal
//   orderDetailsSection: {
    
//   },
//   orderDetailHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: '2rem',
//   },
//   orderDetailInfo: {
//     flex: 1,
//   },
//   orderDetailTitle: {
//     fontSize: '1.5rem',
//     fontWeight: '600',
//     color: '#1e293b',
//     margin: '0 0 0.5rem 0',
//   },
//   orderDetailDate: {
//     color: '#64748b',
//     fontSize: '0.875rem',
//     margin: 0,
//   },
//   orderDetailsGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(2, 1fr)',
//     gap: '1.5rem',
//     marginBottom: '2rem',
//   },
//   orderDetailItem: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '0.5rem',
//   },
//   orderDetailAddress: {
//     marginBottom: '2rem',
//   },
//   orderDetailProducts: {
    
//   },
//   orderProductItem: {
//     display: 'flex',
//     gap: '1rem',
//     padding: '1.5rem',
//     backgroundColor: '#f8fafc',
//     borderRadius: '12px',
//     border: '1px solid #e2e8f0',
//     marginBottom: '1rem',
//   },
//   orderProductImage: {
//     width: '60px',
//     height: '60px',
//     borderRadius: '8px',
//     overflow: 'hidden',
//     flexShrink: 0,
//   },
//   orderProductImg: {
//     width: '100%',
//     height: '100%',
//     objectFit: 'cover',
//   },
//   orderProductDetails: {
//     flex: 1,
//   },
//   orderProductName: {
//     fontSize: '1rem',
//     fontWeight: '600',
//     color: '#1e293b',
//     margin: '0 0 0.5rem 0',
//   },
//   orderProductCategory: {
//     fontSize: '0.875rem',
//     color: '#6366f1',
//     fontWeight: '500',
//     margin: '0 0 0.5rem 0',
//   },
//   orderProductMeta: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   orderProductPrice: {
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     color: '#10b981',
//   },
//   orderProductTotal: {
//     fontSize: '0.875rem',
//     fontWeight: '600',
//     color: '#1e293b',
//   },
  
//   // Loading
//   loadingContainer: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: '50vh',
//     color: '#64748b',
//   },
//   spinner: {
//     width: '48px',
//     height: '48px',
//     border: '4px solid #f1f5f9',
//     borderTop: '4px solid #6366f1',
//     borderRadius: '50%',
//     animation: 'spin 1s linear infinite',
//     marginBottom: '1rem',
//   },
//   loadingText: {
//     fontSize: '1rem',
//     color: '#64748b',
//   },
// };


// // Add CSS animations
// const styleSheet = document.styleSheets[0];
// styleSheet.insertRule(`
//   @keyframes spin {
//     0% { transform: rotate(0deg); }
//     100% { transform: rotate(360deg); }
//   }
// `, styleSheet.cssRules.length);

// styleSheet.insertRule(`
//   @keyframes fadeInUp {
//     from {
//       opacity: 0;
//       transform: translateY(10px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
// `, styleSheet.cssRules.length);

// styleSheet.insertRule(`
//   @keyframes modalSlideIn {
//     from {
//       opacity: 0;
//       transform: scale(0.9) translateY(-20px);
//     }
//     to {
//       opacity: 1;
//       transform: scale(1) translateY(0);
//     }
//   }
// `, styleSheet.cssRules.length);

// // Add hover effects
// styleSheet.insertRule(`
//   .statCard:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//   }
// `, styleSheet.cssRules.length);

// styleSheet.insertRule(`
//   .orderGridCard:hover {
//     transform: translateY(-2px);
//     boxShadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//   }
// `, styleSheet.cssRules.length);

// styleSheet.insertRule(`
//   .primaryButton:hover {
//     background-color: #4f46e5;
//     transform: translateY(-1px);
//     box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
//   }
// `, styleSheet.cssRules.length);

// styleSheet.insertRule(`
//   .secondaryButton:hover {
//     border-color: #6366f1;
//     color: #6366f1;
//     transform: translateY(-1px);
//   }
// `, styleSheet.cssRules.length);

// styleSheet.insertRule(`
//   .closeButton:hover {
//     background-color: #f1f5f9;
//     color: #1e293b;
//   }
// `, styleSheet.cssRules.length);

// // Format currency function
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// export default Orders;




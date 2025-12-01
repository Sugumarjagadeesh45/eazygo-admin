import React, { useState, useEffect } from "react";
import { FiPackage, FiSearch, FiEdit, FiTrash2, FiPlus, FiFilter, FiTag, FiChevronDown } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

// Top 10 e-commerce categories
const ECOMMERCE_CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Furniture',
  'Groceries & Food',
  'Beauty & Personal Care',
  'Books & Media',
  'Sports & Outdoors',
  'Toys & Games',
  'Health & Wellness',
  'Automotive'
];

function ProductData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState(ECOMMERCE_CATEGORIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBannerList, setShowBannerList] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [banners, setBanners] = useState([]);
  const [productsForDropdown, setProductsForDropdown] = useState([]);
  const [categoriesForDropdown, setCategoriesForDropdown] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    stock: ''
  });
  const [images, setImages] = useState([]);
  const [offerData, setOfferData] = useState({
    bannerImage: null,
    targetType: 'product',
    targetId: '',
    isActive: true
  });

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchProductsForDropdown();
    fetchCategoriesForDropdown();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/groceries`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_BASE}/banners/admin/all`);
      setBanners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchProductsForDropdown = async () => {
    try {
      const response = await axios.get(`${API_BASE}/banners/products`);
      setProductsForDropdown(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products for dropdown:', error);
    }
  };

  const fetchCategoriesForDropdown = async () => {
    try {
      const response = await axios.get(`${API_BASE}/banners/categories`);
      setCategoriesForDropdown(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories for dropdown:', error);
    }
  };

  const fetchProductsByCategory = async (category) => {
    try {
      const response = await axios.get(`${API_BASE}/groceries?category=${category}`);
      setCategoryProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      setCategoryProducts([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields with correct field names
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice || formData.price);
      formDataToSend.append('discount', formData.discount || '0');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      // Append images - make sure the field name is 'images' (plural)
      if (images && images.length > 0) {
        images.forEach(image => {
          formDataToSend.append('images', image); // Field name must be 'images'
        });
      }

      console.log('📤 Sending form data with fields:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'images') {
          console.log(`  ${key}: File - ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await axios.post(`${API_BASE}/groceries`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ Product added successfully:', response.data);
      
      setShowAddModal(false);
      resetForm();
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      console.error('❌ Error adding product:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      alert('Failed to add product: ' + errorMessage);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice || formData.price);
      formDataToSend.append('discount', formData.discount || '0');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      
      // Only append images if new ones are selected
      if (images && images.length > 0) {
        images.forEach(image => {
          formDataToSend.append('images', image);
        });
        console.log(`📤 Appending ${images.length} new images`);
      } else {
        console.log('ℹ️  No new images selected, keeping existing ones');
      }

      console.log('📤 Sending update form data:');
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'images') {
          console.log(`  ${key}: File - ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const response = await axios.put(`${API_BASE}/groceries/${selectedProduct._id}`, formDataToSend, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Product updated successfully:', response.data);
      
      setShowEditModal(false);
      resetForm();
      fetchProducts();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('❌ Error updating product:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      alert('Failed to update product: ' + errorMessage);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE}/groceries/${productId}`);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      if (offerData.bannerImage) {
        formDataToSend.append('bannerImage', offerData.bannerImage);
      }
      
      formDataToSend.append('targetType', offerData.targetType);
      
      if (offerData.targetType !== 'custom') {
        formDataToSend.append('targetId', offerData.targetId);
      }
      
      formDataToSend.append('isActive', offerData.isActive);

      await axios.post(`${API_BASE}/banners`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowOfferModal(false);
      resetOfferForm();
      fetchBanners();
      alert('Banner created successfully!');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await axios.delete(`${API_BASE}/banners/${bannerId}`);
        fetchBanners();
        alert('Banner deleted successfully!');
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Failed to delete banner');
      }
    }
  };

  const handleToggleBannerStatus = async (bannerId, isActive) => {
    try {
      await axios.put(`${API_BASE}/banners/${bannerId}`, { isActive });
      fetchBanners();
      alert(`Banner ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating banner status:', error);
      alert('Failed to update banner status');
    }
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOfferData({...offerData, bannerImage: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTargetTypeChange = (targetType) => {
    setOfferData({
      ...offerData,
      targetType,
      targetId: ''
    });
    
    if (targetType === 'category' && categoriesForDropdown.length > 0) {
      fetchProductsByCategory(categoriesForDropdown[0]);
    }
  };

  const handleCategoryChange = (category) => {
    setOfferData({...offerData, targetId: category});
    fetchProductsByCategory(category);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discount: '',
      category: '',
      stock: ''
    });
    setImages([]);
    setSelectedProduct(null);
  };

  const resetOfferForm = () => {
    setOfferData({
      bannerImage: null,
      targetType: 'product',
      targetId: '',
      isActive: true
    });
    setBannerImagePreview(null);
    setCategoryProducts([]);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      category: product.category,
      stock: product.stock
    });
    setShowEditModal(true);
  };

  const openOfferModal = () => {
    resetOfferForm();
    setShowOfferModal(true);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', color: '#ef4444', bgColor: '#ef444420' };
    if (stock <= 5) return { text: 'Low Stock', color: '#f59e0b', bgColor: '#f59e0b20' };
    return { text: 'In Stock', color: '#10b981', bgColor: '#10b98120' };
  };

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  console.log('🖼️ Processing image path:', imagePath);
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle relative paths - ensure they start with /uploads/
  let cleanPath = imagePath;
  if (!imagePath.startsWith('/uploads/') && imagePath.startsWith('uploads/')) {
    cleanPath = '/' + imagePath;
  }
  
  // Use the correct backend URL
  const fullUrl = `http://localhost:5001${cleanPath}`;
  console.log('🖼️ Final image URL:', fullUrl);
  
  return fullUrl;
};


  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Product Data Management</h1>
        <p style={styles.subtitle}>Manage your product inventory and categories</p>
      </div>

      <div style={styles.actions}>
        <div style={styles.searchFilterContainer}>
          <div style={styles.searchContainer}>
            <FiSearch style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={handleSearch}
              style={styles.searchInput} 
            />
          </div>
          <div style={styles.filterContainer}>
            <FiFilter style={styles.filterIcon} />
            <select 
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.actionButtonsContainer}>
          <div style={styles.bannerDropdown}>
            <button 
              style={styles.offerButton}
              onClick={() => setShowBannerList(!showBannerList)}
            >
              <FiTag /> Limited-Time Offer <FiChevronDown />
            </button>
            {showBannerList && (
              <div style={styles.dropdownContent}>
                <button 
                  style={styles.dropdownItem}
                  onClick={() => {
                    setShowBannerList(false);
                    openOfferModal();
                  }}
                >
                  Add New Banner
                </button>
                {banners.length > 0 && (
                  <button 
                    style={styles.dropdownItem}
                    onClick={() => setShowBannerList(false)}
                  >
                    Manage Banners ({banners.length})
                  </button>
                )}
              </div>
            )}
          </div>
          <button 
            style={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Banner Management Section */}
      {showBannerList && (
        <div style={styles.bannerManagement}>
          <h3 style={styles.sectionTitle}>Banner Management</h3>
          {banners.length === 0 ? (
            <div style={styles.noBanners}>
              <p>No banners created yet. Click "Add New Banner" to create one.</p>
            </div>
          ) : (
            <div style={styles.bannerList}>
              {banners.map(banner => (
                <div key={banner._id} style={styles.bannerItem}>
                  <img 
                    src={getImageUrl(banner.bannerImage)} 
                    alt="Banner"
                    style={styles.bannerImage}
                  />
                  <div style={styles.bannerInfo}>
                    <p><strong>Type:</strong> {banner.targetType}</p>
                    {banner.targetType === 'custom' ? (
                      <p><strong>URL:</strong> {banner.customUrl}</p>
                    ) : (
                      <p><strong>Target ID:</strong> {banner.targetId}</p>
                    )}
                    <p><strong>Status:</strong> {banner.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                  <div style={styles.bannerActions}>
                    <button 
                      style={styles.statusButton}
                      onClick={() => handleToggleBannerStatus(banner._id, !banner.isActive)}
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button 
                      style={styles.deleteButton}
                      onClick={() => handleDeleteBanner(banner._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Product Image</th>
              <th style={styles.th}>Product Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product.stock);
              const firstImageUrl = product.images && product.images.length > 0 
                ? getImageUrl(product.images[0]) 
                : null;
              
              return (
                <tr key={product._id} style={styles.tr}>
                  <td style={styles.td}>{product.productId}</td>
                  <td style={styles.td}>
                  {firstImageUrl ? (
  <img 
    src={firstImageUrl} 
    alt={product.name}
    style={styles.productImage}
    onError={(e) => {
      console.error('❌ Image failed to load:', firstImageUrl);
      console.error('🖼️ Original image path:', product.images?.[0]);
      e.target.onerror = null;
      e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
    }}
    onLoad={() => console.log('✅ Image loaded successfully:', firstImageUrl)}
  />
) : (
  <div style={styles.noImagePlaceholder}>
    <FiPackage />
  </div>
)}
                  </td>
                  <td style={styles.td}>{product.name}</td>
                  <td style={styles.td}>{product.category}</td>
                  <td style={styles.td}>
                    <div style={styles.priceContainer}>
                      <span style={styles.currentPrice}>${product.price}</span>
                      {product.originalPrice > product.price && (
                        <span style={styles.originalPrice}>${product.originalPrice}</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{product.stock}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.status,
                      backgroundColor: stockStatus.bgColor,
                      color: stockStatus.color
                    }}>
                      {stockStatus.text}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.editButton}
                        onClick={() => openEditModal(product)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div style={styles.noProducts}>
            No products found
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  rows="3"
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={styles.input}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  style={styles.input}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton}>
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Edit Product</h2>
            <form onSubmit={handleEditProduct}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={styles.textarea}
                  rows="3"
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    style={styles.input}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  style={styles.input}
                />
                {selectedProduct?.images && selectedProduct.images.length > 0 && (
                  <div style={styles.currentImages}>
                    <p>Current Images:</p>
                    {selectedProduct.images.map((img, index) => (
                      <img 
                        key={index}
                        src={getImageUrl(img)}
                        alt={`Current ${index}`}
                        style={styles.currentImage}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton}>
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showOfferModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.offerModal}>
            <h2 style={styles.offerModalTitle}>Create Limited-Time Offer Banner</h2>
            <form onSubmit={handleSaveBanner}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Banner Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleBannerImageChange}
                  style={styles.input}
                />
                {bannerImagePreview && (
                  <div style={styles.imagePreviewContainer}>
                    <img 
                      src={bannerImagePreview} 
                      alt="Banner preview"
                      style={styles.imagePreview}
                    />
                  </div>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Type *</label>
                <select
                  required
                  value={offerData.targetType}
                  onChange={(e) => handleTargetTypeChange(e.target.value)}
                  style={styles.input}
                >
                  <option value="product">Product</option>
                  <option value="category">Category</option>
                </select>
              </div>
              {offerData.targetType === 'product' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Product *</label>
                  <div style={styles.productDropdown}>
                    {productsForDropdown.map(product => {
                      const productImageUrl = product.images && product.images.length > 0 
                        ? getImageUrl(product.images[0]) 
                        : null;
                      
                      return (
                        <div 
                          key={product._id} 
                          style={{
                            ...styles.productOption,
                            ...(offerData.targetId === product._id ? styles.selectedProductOption : {})
                          }}
                          onClick={() => setOfferData({...offerData, targetId: product._id})}
                        >
                          {productImageUrl ? (
                            <img 
                              src={productImageUrl} 
                              alt={product.name}
                              style={styles.productThumbnail}
                            />
                          ) : (
                            <div style={styles.productPlaceholder}>
                              <FiPackage />
                            </div>
                          )}
                          <div style={styles.productInfo}>
                            <div style={styles.productName}>{product.name}</div>
                            <div style={styles.productPrice}>${product.price}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {offerData.targetType === 'category' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Category *</label>
                    <select
                      required
                      value={offerData.targetId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      style={styles.input}
                    >
                      <option value="">Select a category</option>
                      {categoriesForDropdown.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  {categoryProducts.length > 0 && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Products in this Category</label>
                      <div style={styles.productGrid}>
                        {categoryProducts.map(product => {
                          const productImageUrl = product.images && product.images.length > 0 
                            ? getImageUrl(product.images[0]) 
                            : null;
                            
                          return (
                            <div key={product._id} style={styles.productCard}>
                              {productImageUrl ? (
                                <img 
                                  src={productImageUrl} 
                                  alt={product.name}
                                  style={styles.productCardImage}
                                />
                              ) : (
                                <div style={styles.productCardPlaceholder}>
                                  <FiPackage />
                                </div>
                              )}
                              <div style={styles.productCardInfo}>
                                <div style={styles.productCardName}>{product.name}</div>
                                <div style={styles.productCardPrice}>${product.price}</div>
                                <div style={styles.productCardStock}>Stock: {product.stock}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={offerData.isActive}
                    onChange={(e) => setOfferData({...offerData, isActive: e.target.checked})}
                    style={styles.checkbox}
                  />
                  Active
                </label>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={() => setShowOfferModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.offerSaveButton}>
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem'
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  actionButtonsContainer: {
    display: 'flex',
    gap: '1rem',
    position: 'relative'
  },
  searchFilterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    width: '300px'
  },
  searchIcon: {
    color: '#64748b',
    marginRight: '0.5rem'
  },
  searchInput: {
    border: 'none',
    background: 'none',
    outline: 'none',
    flex: 1,
    color: '#1e293b'
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem'
  },
  filterIcon: {
    color: '#64748b',
    marginRight: '0.5rem'
  },
  filterSelect: {
    border: 'none',
    background: 'none',
    outline: 'none',
    color: '#1e293b'
  },
  bannerDropdown: {
    position: 'relative'
  },
  offerButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500'
  },
  dropdownContent: {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    marginTop: '0.5rem'
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: 'white',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    width: '100%',
    '&:last-child': {
      borderBottom: 'none'
    },
    '&:hover': {
      backgroundColor: '#f1f5f9'
    }
  },
  addButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500'
  },
  bannerManagement: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1rem'
  },
  noBanners: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b'
  },
  bannerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  bannerItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    gap: '1rem'
  },
  bannerImage: {
    width: '100px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '0.375rem'
  },
  bannerInfo: {
    flex: 1
  },
  bannerActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  statusButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb'
  },
  tr: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '1rem',
    color: '#6b7280'
  },
  productImage: {
    width: '40px',
    height: '40px',
    borderRadius: '0.375rem',
    objectFit: 'cover'
  },
  noImagePlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '0.375rem',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af'
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  currentPrice: {
    fontWeight: '600',
    color: '#1e293b'
  },
  originalPrice: {
    fontSize: '0.875rem',
    color: '#64748b',
    textDecoration: 'line-through'
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    cursor: 'pointer'
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b'
  },
  noProducts: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b'
  },
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
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  offerModal: {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '2px solid #f59e0b'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1e293b'
  },
  offerModalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#f59e0b',
    borderBottom: '1px solid #f59e0b',
    paddingBottom: '0.5rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  formRow: {
    display: 'flex',
    gap: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#374151'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    color: '#374151'
  },
  checkbox: {
    width: '1rem',
    height: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    resize: 'vertical'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    color: '#374151',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#6366f1',
    color: 'white',
    cursor: 'pointer'
  },
  offerSaveButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.375rem',
    backgroundColor: '#f59e0b',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600'
  },
  currentImages: {
    marginTop: '0.5rem'
  },
  currentImage: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '0.375rem',
    marginRight: '0.5rem'
  },
  imagePreviewContainer: {
    marginTop: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    display: 'inline-block'
  },
  imagePreview: {
    width: '200px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '0.375rem'
  },
  productDropdown: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem'
  },
  productOption: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    borderBottom: '1px solid #e2e8f0',
    cursor: 'pointer'
  },
  selectedProductOption: {
    backgroundColor: '#fef3c7',
    borderLeft: '3px solid #f59e0b'
  },
  productThumbnail: {
    width: '40px',
    height: '40px',
    borderRadius: '0.25rem',
    objectFit: 'cover',
    marginRight: '0.75rem'
  },
  productPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '0.25rem',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
    color: '#9ca3af'
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontWeight: '500',
    color: '#1f2937'
  },
  productPrice: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '0.5rem'
  },
  productCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    backgroundColor: 'white'
  },
  productCardImage: {
    width: '100%',
    height: '120px',
    borderRadius: '0.375rem',
    objectFit: 'cover',
    marginBottom: '0.5rem'
  },
  productCardPlaceholder: {
    width: '100%',
    height: '120px',
    borderRadius: '0.375rem',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
    color: '#9ca3af'
  },
  productCardInfo: {
    padding: '0.25rem 0'
  },
  productCardName: {
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  productCardPrice: {
    color: '#f59e0b',
    fontWeight: '600',
    marginBottom: '0.25rem'
  },
  productCardStock: {
    fontSize: '0.75rem',
    color: '#6b7280'
  }
};

export default ProductData;

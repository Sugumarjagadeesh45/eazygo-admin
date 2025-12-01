import React, { useState, useEffect } from "react";
import axios from "axios";

function Settings() {
  const [prices, setPrices] = useState({
    bike: 0,
    taxi: 0,
    port: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Styles
  const styles = {
    settingsContainer: {
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    settingsHeader: {
      textAlign: "center",
      marginBottom: "30px"
    },
    settingsHeaderH1: {
      color: "#333",
      marginBottom: "10px",
      fontSize: "2rem",
      fontWeight: "600"
    },
    settingsHeaderP: {
      color: "#666",
      fontSize: "16px",
      margin: "0"
    },
    priceSettingsCard: {
      background: "white",
      borderRadius: "12px",
      padding: "30px",
      boxShadow: "0 2px 20px rgba(0, 0, 0, 0.1)",
      marginBottom: "30px",
      border: "1px solid #e1e5e9"
    },
    priceItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 0",
      borderBottom: "1px solid #eee"
    },
    lastPriceItem: {
      borderBottom: "none"
    },
    vehicleInfo: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      flex: "1"
    },
    vehicleIcon: {
      fontSize: "2.5rem",
      width: "60px",
      textAlign: "center"
    },
    vehicleDetails: {
      flex: "1"
    },
    vehicleDetailsH3: {
      margin: "0 0 5px 0",
      color: "#333",
      fontSize: "1.3rem",
      fontWeight: "600"
    },
    vehicleDetailsP: {
      margin: "0",
      color: "#666",
      fontSize: "14px"
    },
    priceInputContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "#f8f9fa",
      padding: "8px 12px",
      borderRadius: "8px",
      border: "2px solid #e9ecef",
      transition: "all 0.3s ease"
    },
    priceInputContainerFocus: {
      borderColor: "#4CAF50",
      boxShadow: "0 0 0 3px rgba(76, 175, 80, 0.1)"
    },
    currencySymbol: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#333"
    },
    priceInput: {
      width: "120px",
      padding: "10px",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "bold",
      textAlign: "center",
      background: "transparent",
      color: "#333"
    },
    priceUnit: {
      color: "#666",
      fontSize: "14px",
      minWidth: "40px"
    },
    actionButtons: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "15px",
      marginTop: "30px",
      paddingTop: "20px",
      borderTop: "1px solid #eee"
    },
    btn: {
      padding: "12px 24px",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      minWidth: "140px"
    },
    btnPrimary: {
      backgroundColor: "#4CAF50",
      color: "white"
    },
    btnSecondary: {
      backgroundColor: "#6c757d",
      color: "white"
    },
    btnDisabled: {
      backgroundColor: "#ccc",
      cursor: "not-allowed",
      transform: "none",
      boxShadow: "none"
    },
    alert: {
      padding: "15px 20px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontWeight: "600",
      fontSize: "14px"
    },
    alertSuccess: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb"
    },
    alertError: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb"
    },
    infoSection: {
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      padding: "25px",
      borderRadius: "12px",
      borderLeft: "4px solid #4CAF50",
      marginTop: "20px"
    },
    infoSectionH3: {
      marginTop: "0",
      color: "#333",
      fontSize: "1.2rem",
      fontWeight: "600",
      marginBottom: "15px"
    },
    infoSectionUl: {
      paddingLeft: "20px",
      color: "#555",
      margin: "0"
    },
    infoSectionLi: {
      marginBottom: "10px",
      lineHeight: "1.6",
      fontSize: "14px"
    }
  };

  // Fetch current prices on component mount - FIXED ENDPOINT
  useEffect(() => {
    fetchCurrentPrices();
  }, []);

  const fetchCurrentPrices = async () => {
    try {
      console.log('🔄 Fetching current prices from backend...');
      const response = await axios.get("http://localhost:5001/api/admin/ride-prices");
      console.log('💰 Prices response:', response.data);
      
      if (response.data.success) {
        setPrices(response.data.prices);
        console.log('✅ Prices loaded successfully:', response.data.prices);
      } else {
        console.log('❌ Failed to fetch prices:', response.data.message);
        setError("Failed to fetch current prices");
      }
    } catch (error) {
      console.error("❌ Error fetching prices:", error);
      setError("Failed to fetch current prices. Please check if server is running.");
    }
  };

  const handlePriceChange = (vehicleType, value) => {
    const priceValue = parseFloat(value);
    if (!isNaN(priceValue) && priceValue >= 0) {
      setPrices(prev => ({
        ...prev,
        [vehicleType]: priceValue
      }));
    }
  };

  // Save prices - FIXED ENDPOINT
  const savePrices = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      console.log('💾 Saving prices:', prices);
      const response = await axios.post(
        "http://localhost:5001/api/admin/ride-prices", 
        { prices: prices },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
      
      console.log('💾 Save response:', response.data);
      
      if (response.data.success) {
        setMessage("Prices updated successfully!");
        setTimeout(() => setMessage(""), 5000);
      } else {
        setError("Failed to update prices: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error saving prices:", error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Please try again.'}`);
      } else if (error.request) {
        setError("Network error: Unable to connect to server. Please check if backend is running.");
      } else {
        setError("Failed to save prices. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setPrices({
      bike: 7,
      taxi: 30,
      port: 60
    });
    setMessage("Prices reset to default values!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleInputFocus = (e) => {
    e.target.parentElement.style.borderColor = "#4CAF50";
    e.target.parentElement.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.1)";
  };

  const handleInputBlur = (e) => {
    e.target.parentElement.style.borderColor = "#e9ecef";
    e.target.parentElement.style.boxShadow = "none";
  };

  const handleButtonMouseEnter = (e, isPrimary) => {
    if (loading) return;
    
    if (isPrimary) {
      e.target.style.backgroundColor = "#45a049";
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
    } else {
      e.target.style.backgroundColor = "#5a6268";
      e.target.style.transform = "translateY(-2px)";
      e.target.style.boxShadow = "0 4px 12px rgba(108, 117, 125, 0.3)";
    }
  };

  const handleButtonMouseLeave = (e, isPrimary) => {
    if (loading) return;
    
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = "none";
    
    if (isPrimary) {
      e.target.style.backgroundColor = "#4CAF50";
    } else {
      e.target.style.backgroundColor = "#6c757d";
    }
  };

  return (
    <div style={styles.settingsContainer}>
      <div style={styles.settingsHeader}>
        <h1 style={styles.settingsHeaderH1}>🚗 Ride Price Settings</h1>
        <p style={styles.settingsHeaderP}>Set the price per kilometer for each ride type</p>
      </div>

      {message && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          ✅ {message}
        </div>
      )}
      {error && (
        <div style={{...styles.alert, ...styles.alertError}}>
          ❌ {error}
        </div>
      )}

      <div style={styles.priceSettingsCard}>
        {/* Bike Price */}
        <div style={styles.priceItem}>
          <div style={styles.vehicleInfo}>
            <div style={styles.vehicleIcon}>🏍️</div>
            <div style={styles.vehicleDetails}>
              <h3 style={styles.vehicleDetailsH3}>Bike</h3>
              <p style={styles.vehicleDetailsP}>Motorcycle rides - Quick and affordable</p>
            </div>
          </div>
          <div style={styles.priceInputContainer}>
            <span style={styles.currencySymbol}>₹</span>
            <input
              type="number"
              style={styles.priceInput}
              value={prices.bike}
              onChange={(e) => handlePriceChange("bike", e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              min="0"
              step="0.5"
              disabled={loading}
            />
            <span style={styles.priceUnit}>/ km</span>
          </div>
        </div>

        {/* Taxi Price */}
        <div style={styles.priceItem}>
          <div style={styles.vehicleInfo}>
            <div style={styles.vehicleIcon}>🚖</div>
            <div style={styles.vehicleDetails}>
              <h3 style={styles.vehicleDetailsH3}>Taxi</h3>
              <p style={styles.vehicleDetailsP}>Car rides - Comfort and convenience</p>
            </div>
          </div>
          <div style={styles.priceInputContainer}>
            <span style={styles.currencySymbol}>₹</span>
            <input
              type="number"
              style={styles.priceInput}
              value={prices.taxi}
              onChange={(e) => handlePriceChange("taxi", e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              min="0"
              step="0.5"
              disabled={loading}
            />
            <span style={styles.priceUnit}>/ km</span>
          </div>
        </div>

        {/* Port Price */}
        <div style={{...styles.priceItem, ...styles.lastPriceItem}}>
          <div style={styles.vehicleInfo}>
            <div style={styles.vehicleIcon}>🚚</div>
            <div style={styles.vehicleDetails}>
              <h3 style={styles.vehicleDetailsH3}>Port</h3>
              <p style={styles.vehicleDetailsP}>Goods transportation - Reliable delivery</p>
            </div>
          </div>
          <div style={styles.priceInputContainer}>
            <span style={styles.currencySymbol}>₹</span>
            <input
              type="number"
              style={styles.priceInput}
              value={prices.port}
              onChange={(e) => handlePriceChange("port", e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              min="0"
              step="0.5"
              disabled={loading}
            />
            <span style={styles.priceUnit}>/ km</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button 
            style={{
              ...styles.btn, 
              ...styles.btnSecondary,
              ...(loading ? styles.btnDisabled : {})
            }}
            onClick={resetToDefault}
            onMouseEnter={(e) => handleButtonMouseEnter(e, false)}
            onMouseLeave={(e) => handleButtonMouseLeave(e, false)}
            disabled={loading}
          >
            🔄 Reset to Default
          </button>
          <button 
            style={{
              ...styles.btn, 
              ...styles.btnPrimary,
              ...(loading ? styles.btnDisabled : {})
            }}
            onClick={savePrices}
            onMouseEnter={(e) => handleButtonMouseEnter(e, true)}
            onMouseLeave={(e) => handleButtonMouseLeave(e, true)}
            disabled={loading}
          >
            {loading ? "💾 Saving..." : "💾 Save Prices"}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div style={styles.infoSection}>
        <h3 style={styles.infoSectionH3}>📊 How Pricing Works:</h3>
        <ul style={styles.infoSectionUl}>
          <li style={styles.infoSectionLi}>
            <strong>Dynamic Pricing:</strong> Prices are set per kilometer for each vehicle type
          </li>
          <li style={styles.infoSectionLi}>
            <strong>Fare Calculation:</strong> Total fare = Distance (km) × Price per km
          </li>
          <li style={styles.infoSectionLi}>
            <strong>Instant Updates:</strong> Changes take effect immediately after saving
          </li>
          <li style={styles.infoSectionLi}>
            <strong>Flexible Management:</strong> Update prices anytime based on demand, season, or operational costs
          </li>
          <li style={styles.infoSectionLi}>
            <strong>Default Rates:</strong> Bike: ₹7/km, Taxi: ₹30/km, Port: ₹60/km
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Settings;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./Settings.css";

// function Settings() {
//   const [prices, setPrices] = useState({
//     bike: 7,
//     taxi: 30,
//     port: 60
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // Fetch current prices on component mount
//   useEffect(() => {
//     fetchCurrentPrices();
//   }, []);

//   const fetchCurrentPrices = async () => {
//     try {
//       const response = await axios.get("http://localhost:5001/api/admin/ride-prices");
//       if (response.data.success) {
//         setPrices(response.data.prices);
//       }
//     } catch (error) {
//       console.error("Error fetching prices:", error);
//       setError("Failed to fetch current prices");
//     }
//   };

//   const handlePriceChange = (vehicleType, value) => {
//     const priceValue = parseFloat(value);
//     if (priceValue >= 0) {
//       setPrices(prev => ({
//         ...prev,
//         [vehicleType]: priceValue
//       }));
//     }
//   };

//   const savePrices = async () => {
//     setLoading(true);
//     setMessage("");
//     setError("");
//     try {
//       const response = await axios.post("https://backendddcode-1.onrender.com/api/admin/ride-prices", {
//         prices: prices
//       });

      
      
//       if (response.data.success) {
//         setMessage("Prices updated successfully!");
//         // Clear message after 3 seconds
//         setTimeout(() => setMessage(""), 3000);
//       } else {
//         setError("Failed to update prices");
//       }
//     } catch (error) {
//       console.error("Error saving prices:", error);
//       setError("Failed to save prices. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetToDefault = () => {
//     setPrices({
//       bike: 7,
//       taxi: 30,
//       port: 60
//     });
//   };

//   return (
//     <div className="settings-container">
//       <div className="settings-header">
//         <h1>Ride Price Settings</h1>
//         <p>Set the price per kilometer for each ride type</p>
//       </div>

//       {message && <div className="alert alert-success">{message}</div>}
//       {error && <div className="alert alert-error">{error}</div>}

//       <div className="price-settings-card">
//         <div className="price-item">
//           <div className="vehicle-info">
//             <div className="vehicle-icon">🏍️</div>
//             <div className="vehicle-details">
//               <h3>Bike</h3>
//               <p>Motorcycle rides</p>
//             </div>
//           </div>
//           <div className="price-input-container">
//             <span className="currency-symbol">₹</span>
//             <input
//               type="number"
//               className="price-input"
//               value={prices.bike}
//               onChange={(e) => handlePriceChange("bike", e.target.value)}
//               min="0"
//               step="0.5"
//             />
//             <span className="price-unit">/ km</span>
//           </div>
//         </div>

//         <div className="price-item">
//           <div className="vehicle-info">
//             <div className="vehicle-icon">🚖</div>
//             <div className="vehicle-details">
//               <h3>Taxi</h3>
//               <p>Car rides</p>
//             </div>
//           </div>
//           <div className="price-input-container">
//             <span className="currency-symbol">₹</span>
//             <input
//               type="number"
//               className="price-input"
//               value={prices.taxi}
//               onChange={(e) => handlePriceChange("taxi", e.target.value)}
//               min="0"
//               step="0.5"
//             />
//             <span className="price-unit">/ km</span>
//           </div>
//         </div>

//         <div className="price-item">
//           <div className="vehicle-info">
//             <div className="vehicle-icon">🚚</div>
//             <div className="vehicle-details">
//               <h3>Port</h3>
//               <p>Goods transportation</p>
//             </div>
//           </div>
//           <div className="price-input-container">
//             <span className="currency-symbol">₹</span>
//             <input
//               type="number"
//               className="price-input"
//               value={prices.port}
//               onChange={(e) => handlePriceChange("port", e.target.value)}
//               min="0"
//               step="0.5"
//             />
//             <span className="price-unit">/ km</span>
//           </div>
//         </div>

//         <div className="action-buttons">
//           <button 
//             className="btn btn-secondary" 
//             onClick={resetToDefault}
//             disabled={loading}
//           >
//             Reset to Default
//           </button>
//           <button 
//             className="btn btn-primary" 
//             onClick={savePrices}
//             disabled={loading}
//           >
//             {loading ? "Saving..." : "Save Prices"}
//           </button>
//         </div>
//       </div>

//       <div className="info-section">
//         <h3>How it works:</h3>
//         <ul>
//           <li>Prices are set per kilometer for each vehicle type</li>
//           <li>When users book a ride, the total fare is calculated as: Distance × Price per km</li>
//           <li>Changes take effect immediately after saving</li>
//           <li>You can update prices anytime based on demand, season, or other factors</li>
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default Settings;
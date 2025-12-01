import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Settings.css";

function Settings() {
  const [prices, setPrices] = useState({
    bike: 7,
    taxi: 30,
    port: 60
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch current prices on component mount
  useEffect(() => {
    fetchCurrentPrices();
  }, []);

  const fetchCurrentPrices = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/admin/ride-prices");
      if (response.data.success) {
        setPrices(response.data.prices);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
      setError("Failed to fetch current prices");
    }
  };

  const handlePriceChange = (vehicleType, value) => {
    const priceValue = parseFloat(value);
    if (priceValue >= 0) {
      setPrices(prev => ({
        ...prev,
        [vehicleType]: priceValue
      }));
    }
  };

  const savePrices = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await axios.post("https://dummbackend-1extraaaaa.onrender.com/api/admin/ride-prices", {
        prices: prices
      });

      
      
      if (response.data.success) {
        setMessage("Prices updated successfully!");
        // Clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to update prices");
      }
    } catch (error) {
      console.error("Error saving prices:", error);
      setError("Failed to save prices. Please try again.");
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
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Ride Price Settings</h1>
        <p>Set the price per kilometer for each ride type</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="price-settings-card">
        <div className="price-item">
          <div className="vehicle-info">
            <div className="vehicle-icon">🏍️</div>
            <div className="vehicle-details">
              <h3>Bike</h3>
              <p>Motorcycle rides</p>
            </div>
          </div>
          <div className="price-input-container">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="price-input"
              value={prices.bike}
              onChange={(e) => handlePriceChange("bike", e.target.value)}
              min="0"
              step="0.5"
            />
            <span className="price-unit">/ km</span>
          </div>
        </div>

        <div className="price-item">
          <div className="vehicle-info">
            <div className="vehicle-icon">🚖</div>
            <div className="vehicle-details">
              <h3>Taxi</h3>
              <p>Car rides</p>
            </div>
          </div>
          <div className="price-input-container">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="price-input"
              value={prices.taxi}
              onChange={(e) => handlePriceChange("taxi", e.target.value)}
              min="0"
              step="0.5"
            />
            <span className="price-unit">/ km</span>
          </div>
        </div>

        <div className="price-item">
          <div className="vehicle-info">
            <div className="vehicle-icon">🚚</div>
            <div className="vehicle-details">
              <h3>Port</h3>
              <p>Goods transportation</p>
            </div>
          </div>
          <div className="price-input-container">
            <span className="currency-symbol">₹</span>
            <input
              type="number"
              className="price-input"
              value={prices.port}
              onChange={(e) => handlePriceChange("port", e.target.value)}
              min="0"
              step="0.5"
            />
            <span className="price-unit">/ km</span>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-secondary" 
            onClick={resetToDefault}
            disabled={loading}
          >
            Reset to Default
          </button>
          <button 
            className="btn btn-primary" 
            onClick={savePrices}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Prices"}
          </button>
        </div>
      </div>

      <div className="info-section">
        <h3>How it works:</h3>
        <ul>
          <li>Prices are set per kilometer for each vehicle type</li>
          <li>When users book a ride, the total fare is calculated as: Distance × Price per km</li>
          <li>Changes take effect immediately after saving</li>
          <li>You can update prices anytime based on demand, season, or other factors</li>
        </ul>
      </div>
    </div>
  );
}

export default Settings;
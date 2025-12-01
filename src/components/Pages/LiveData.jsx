// src/components/Pages/LiveData.jsx
import React, { useState, useEffect } from "react";
import { FiMapPin, FiUser, FiNavigation, FiClock } from 'react-icons/fi';

function LiveData() {
  const [liveRides, setLiveRides] = useState([]);

  useEffect(() => {
    // Simulate live data
    const rides = [
      { id: 1, customer: "John Doe", driver: "Mike Johnson", location: "Downtown", status: "On the way", eta: "5 min" },
      { id: 2, customer: "Jane Smith", driver: "Sarah Wilson", location: "City Center", status: "Pickup", eta: "2 min" },
      { id: 3, customer: "Bob Brown", driver: "Alex Chen", location: "Airport", status: "Completed", eta: "0 min" }
    ];
    setLiveRides(rides);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Live Data Tracking</h1>
        <p style={styles.subtitle}>Real-time monitoring of active rides and deliveries</p>
      </div>

      <div style={styles.liveStats}>
        <div style={styles.liveStat}>
          <FiNavigation style={styles.liveStatIcon} />
          <div>
            <h3 style={styles.liveStatValue}>24</h3>
            <p style={styles.liveStatLabel}>Active Rides</p>
          </div>
        </div>
        <div style={styles.liveStat}>
          <FiUser style={styles.liveStatIcon} />
          <div>
            <h3 style={styles.liveStatValue}>156</h3>
            <p style={styles.liveStatLabel}>Online Drivers</p>
          </div>
        </div>
        <div style={styles.liveStat}>
          <FiClock style={styles.liveStatIcon} />
          <div>
            <h3 style={styles.liveStatValue}>3.2 min</h3>
            <p style={styles.liveStatLabel}>Avg. Wait Time</p>
          </div>
        </div>
      </div>

      <div style={styles.liveRides}>
        <h2 style={styles.sectionTitle}>Active Rides</h2>
        <div style={styles.ridesGrid}>
          {liveRides.map(ride => (
            <div key={ride.id} style={styles.rideCard}>
              <div style={styles.rideHeader}>
                <FiMapPin style={styles.rideIcon} />
                <span style={styles.rideId}>Ride #{ride.id}</span>
              </div>
              <div style={styles.rideDetails}>
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>Customer:</span>
                  <span style={styles.detailValue}>{ride.customer}</span>
                </div>
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>Driver:</span>
                  <span style={styles.detailValue}>{ride.driver}</span>
                </div>
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>Location:</span>
                  <span style={styles.detailValue}>{ride.location}</span>
                </div>
                <div style={styles.detail}>
                  <span style={styles.detailLabel}>ETA:</span>
                  <span style={styles.detailValue}>{ride.eta}</span>
                </div>
              </div>
              <div style={{
                ...styles.statusBadge,
                backgroundColor: 
                  ride.status === "Completed" ? '#10b98120' : 
                  ride.status === "On the way" ? '#f59e0b20' : '#6366f120',
                color: 
                  ride.status === "Completed" ? '#10b981' : 
                  ride.status === "On the way" ? '#f59e0b' : '#6366f1'
              }}>
                {ride.status}
              </div>
            </div>
          ))}
        </div>
      </div>
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
  liveStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  liveStat: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  liveStatIcon: {
    fontSize: '2rem',
    color: '#6366f1'
  },
  liveStatValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  liveStatLabel: {
    color: '#64748b',
    margin: 0
  },
  liveRides: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1e293b'
  },
  ridesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  rideCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '1rem',
    position: 'relative'
  },
  rideHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  rideIcon: {
    color: '#6366f1'
  },
  rideId: {
    fontWeight: '600',
    color: '#1e293b'
  },
  rideDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  detail: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  detailLabel: {
    color: '#64748b',
    fontSize: '0.875rem'
  },
  detailValue: {
    color: '#1e293b',
    fontWeight: '500'
  },
  statusBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '500'
  }
};

export default LiveData;
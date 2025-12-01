// src/components/Pages/RideData.jsx
import React, { useState } from "react";
import { FiMapPin, FiSearch, FiUser, FiNavigation } from 'react-icons/fi';

function RideData() {
  const [rides] = useState([
    { id: 1, customer: "John Doe", driver: "Mike Johnson", pickup: "Downtown", dropoff: "Airport", fare: "$25.50", status: "Completed" },
    { id: 2, customer: "Jane Smith", driver: "Sarah Wilson", pickup: "Mall", dropoff: "Home", fare: "$18.75", status: "In Progress" },
    { id: 3, customer: "Bob Brown", driver: "Alex Chen", pickup: "Office", dropoff: "Restaurant", fare: "$12.00", status: "Cancelled" }
  ]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Ride Data Management</h1>
        <p style={styles.subtitle}>Monitor and manage all ride bookings</p>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <FiNavigation style={styles.statIcon} />
          <div>
            <h3 style={styles.statValue}>24,563</h3>
            <p style={styles.statLabel}>Total Rides</p>
          </div>
        </div>
        <div style={styles.statCard}>
          <FiUser style={styles.statIcon} />
          <div>
            <h3 style={styles.statValue}>1,842</h3>
            <p style={styles.statLabel}>Active Drivers</p>
          </div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ride ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Driver</th>
              <th style={styles.th}>Pickup</th>
              <th style={styles.th}>Dropoff</th>
              <th style={styles.th}>Fare</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rides.map(ride => (
              <tr key={ride.id} style={styles.tr}>
                <td style={styles.td}>#{ride.id}</td>
                <td style={styles.td}>{ride.customer}</td>
                <td style={styles.td}>{ride.driver}</td>
                <td style={styles.td}>
                  <div style={styles.location}>
                    <FiMapPin style={styles.locationIcon} />
                    {ride.pickup}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.location}>
                    <FiMapPin style={styles.locationIcon} />
                    {ride.dropoff}
                  </div>
                </td>
                <td style={styles.td}>{ride.fare}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.status,
                    backgroundColor: 
                      ride.status === "Completed" ? '#10b98120' : 
                      ride.status === "In Progress" ? '#f59e0b20' : '#ef444420',
                    color: 
                      ride.status === "Completed" ? '#10b981' : 
                      ride.status === "In Progress" ? '#f59e0b' : '#ef4444'
                  }}>
                    {ride.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statIcon: {
    fontSize: '2rem',
    color: '#6366f1'
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  statLabel: {
    color: '#64748b',
    margin: 0
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
  location: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  locationIcon: {
    color: '#6366f1'
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500'
  }
};

export default RideData;
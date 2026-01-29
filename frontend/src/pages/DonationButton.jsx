

//paypal

import React from 'react';

const DonationButton = ({ className = "", showMessage = false }) => {
  // Your actual PayPal.me link
  const paypalUrl = "https://www.paypal.me/ABHISHEKYADAV396";

  return (
    <div className={`donation-container ${className}`}>
      {showMessage && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: '0',
            textAlign: 'center'
          }}>
            Enjoying the file sharing service? Support the project! ☕
          </p>
        </div>
      )}
      
      <a
        href={paypalUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#0070BA', // PayPal blue color
          color: '#FFFFFF',
          fontWeight: '600',
          padding: '10px 20px',
          borderRadius: '8px',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#005ea6';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#0070BA';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }}
      >
        <span style={{ fontSize: '18px' }}>💖</span>
        Support via PayPal
      </a>
    </div>
  );
};

export default DonationButton;
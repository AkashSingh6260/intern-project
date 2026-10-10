import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#3b82f6', bg = '#eff6ff' }) => (
  <div className="stat-card">
    <div>
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
      {subtitle && <p className="stat-sub">{subtitle}</p>}
    </div>
    <div className="stat-icon" style={{ background: bg }}>
      {Icon && <Icon size={24} color={color} />}
    </div>
  </div>
);

export default StatCard;

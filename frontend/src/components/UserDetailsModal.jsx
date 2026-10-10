import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StarRating from './StarRating';
import { X, User, Mail, MapPin, Calendar, Store, Star } from 'lucide-react';

const UserDetailsModal = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUserDetails(userId)
      .then(res => res.success && setData(res.user))
      .catch(err => setError(err.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const roleLabels = { admin: 'Administrator', normal_user: 'Normal User', store_owner: 'Store Owner' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#3b82f6" />
            <h3>User Details</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ marginTop: '1rem', color: '#9ca3af' }}>Loading...</p>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          {data && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Profile block */}
              <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h4 style={{ color: '#1e293b' }}>{data.name}</h4>
                  <span className={`badge badge-${data.role}`}>{roleLabels[data.role]}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}>
                    <Mail size={15} color="#3b82f6" />
                    {data.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}>
                    <MapPin size={15} color="#ef4444" />
                    {data.address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151' }}>
                    <Calendar size={15} color="#6b7280" />
                    Joined: {new Date(data.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Store Owner: show their store's average rating */}
              {data.role === 'store_owner' && (
                <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Store size={18} color="#d97706" />
                    <h4 style={{ color: '#92400e' }}>Store Owner's Rating</h4>
                  </div>
                  {data.storeOwnerRating ? (
                    <div>
                      <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                        {data.storeOwnerRating.storeName}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.65rem' }}>
                        {data.storeOwnerRating.storeAddress}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <StarRating rating={data.storeOwnerRating.averageRating} size={18} showValue />
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          ({data.storeOwnerRating.totalRatings} customer ratings)
                        </span>
                      </div>

                      {/* Ratings list */}
                      {data.storeOwnerRating.ratingsReceived?.length > 0 && (
                        <div style={{ marginTop: '0.75rem', maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {data.storeOwnerRating.ratingsReceived.map(r => (
                            <div key={r.ratingId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: '0.8rem' }}>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.userName}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <StarRating rating={r.rating} size={12} />
                                <span style={{ fontWeight: 700, color: '#d97706' }}>{r.rating}/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No store assigned yet.</p>
                  )}
                </div>
              )}

              {/* Normal user: ratings given */}
              {data.role === 'normal_user' && (
                <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <h4 style={{ color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} color="#f59e0b" fill="#f59e0b" />
                    Ratings Given ({data.ratingsGiven?.length || 0})
                  </h4>
                  {data.ratingsGiven?.length > 0 ? (
                    <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {data.ratingsGiven.map(r => (
                        <div key={r.ratingId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.65rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: '0.8rem' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{r.storeName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <StarRating rating={r.rating} size={12} />
                            <span style={{ fontWeight: 700, color: '#d97706' }}>{r.rating}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>No ratings submitted yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;

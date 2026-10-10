import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import StatCard from '../components/StatCard';
import { Store, Star, Users, TrendingUp, AlertCircle } from 'lucide-react';

const StoreOwnerDashboard = () => {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerStore();
      if (res.success) setStoreData(res);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const dist = storeData?.ratingDistribution || {};
  const totalRatings = storeData?.store?.totalRatings || 0;

  const barColor = { 5: '#22c55e', 4: '#84cc16', 3: '#f59e0b', 2: '#f97316', 1: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Navbar />

      <div className="container" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: '#9ca3af' }}>Loading your store data…</p>
          </div>
        ) : !storeData?.store ? (
          <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <AlertCircle size={28} color="#f59e0b" />
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>No Store Assigned</h2>
            <p>You don't have a store linked to your account yet. Please contact an administrator.</p>
          </div>
        ) : (
          <>
            {/* Store header */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Store size={26} color="#3b82f6" />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ marginBottom: '0.25rem' }}>{storeData.store.name}</h2>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>{storeData.store.address}</p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>{storeData.store.email}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StarRating rating={storeData.store.averageRating || 0} size={20} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: storeData.store.averageRating > 0 ? '#d97706' : '#d1d5db' }}>
                      {storeData.store.averageRating > 0 ? storeData.store.averageRating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <StatCard title="Total Reviews" value={totalRatings} icon={Star} color="#f59e0b" bg="#fffbeb" />
              <StatCard title="Average Rating" value={storeData.store.averageRating > 0 ? storeData.store.averageRating.toFixed(2) : '—'} icon={TrendingUp} color="#3b82f6" bg="#eff6ff" />
              <StatCard title="5-Star Reviews" value={dist[5] || 0} icon={Users} color="#22c55e" bg="#f0fdf4" />
            </div>

            {/* Rating distribution */}
            {totalRatings > 0 && (
              <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Rating Distribution</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {[5, 4, 3, 2, 1].map(n => {
                    const count = dist[n] || 0;
                    const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                    return (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: 50, flexShrink: 0, fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>
                          {n} <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        </span>
                        <div className="dist-bar-bg">
                          <div className="dist-bar-fill" style={{ width: `${pct}%`, background: barColor[n] }} />
                        </div>
                        <span style={{ width: 36, flexShrink: 0, fontSize: '0.8rem', fontWeight: 700, color: '#374151', textAlign: 'right' }}>
                          {count}
                        </span>
                        <span style={{ width: 40, flexShrink: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent reviews */}
            {storeData.ratings?.length > 0 && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                  <h3>Customer Reviews</h3>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeData.ratings.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>{r.userName}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <StarRating rating={r.rating} size={14} />
                              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#d97706' }}>{r.rating}/5</span>
                            </div>
                          </td>
                          <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No reviews yet */}
            {totalRatings === 0 && (
              <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Star size={24} color="#f59e0b" />
                </div>
                <h3 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>No Reviews Yet</h3>
                <p>Your store hasn't received any ratings from customers yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;

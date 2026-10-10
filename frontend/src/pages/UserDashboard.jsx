import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import StatCard from '../components/StatCard';
import RatingModal from '../components/RatingModal';
import { Store, Search, Star, MapPin, Edit3, Plus } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores]     = useState([]);
  const [search, setSearch]     = useState('');
  const [searchType, setSearchType] = useState('all');
  const [loading, setLoading]   = useState(false);
  const [ratingModal, setRatingModal] = useState(null); // { store, isModify, currentRating }
  const [myRatingsCount, setMyRatingsCount] = useState(0);

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getStores({ search: search.trim(), searchType });
      if (res.success) {
        setStores(res.stores);
        setMyRatingsCount(res.stores.filter(s => s.userRating > 0).length);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, searchType]);

  useEffect(() => { loadStores(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadStores();
  };

  const openRate   = (store) => setRatingModal({ store, isModify: false, currentRating: 5 });
  const openModify = (store) => setRatingModal({ store, isModify: true, currentRating: store.userRating });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Navbar />

      <div className="container" style={{ padding: '1.5rem' }}>
        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h2 style={{ color: '#fff', marginBottom: '0.25rem' }}>Welcome, {user?.name?.split(' ')[0]}!</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', margin: 0 }}>
              Discover and rate stores in your area.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '0.65rem 1rem', borderRadius: 10 }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stores.length}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Stores Available</p>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '0.65rem 1rem', borderRadius: 10 }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{myRatingsCount}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Ratings Given</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div className="search-input-wrap" style={{ flex: '1 1 260px' }}>
              <Search size={15} className="search-icon" />
              <input
                id="user-search-input"
                type="text"
                className="form-control"
                placeholder="Search stores by name or address…"
                value={search}
                style={{ paddingLeft: '2.25rem' }}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select id="user-search-type" className="form-control" style={{ width: 'auto', minWidth: 140 }}
              value={searchType} onChange={e => setSearchType(e.target.value)}>
              <option value="all">All Fields</option>
              <option value="name">Name Only</option>
              <option value="address">Address Only</option>
            </select>
            <button id="user-search-btn" type="submit" className="btn btn-primary">
              <Search size={14} /> Search
            </button>
            {(search || searchType !== 'all') && (
              <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSearchType('all'); setTimeout(loadStores, 50); }}>
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Stores grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: '#9ca3af' }}>Loading stores…</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Store size={24} /></div>
            <h3 style={{ marginBottom: '0.35rem' }}>No Stores Found</h3>
            <p>{search ? 'Try different search keywords.' : 'No stores are registered yet.'}</p>
          </div>
        ) : (
          <div className="stores-grid">
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <div className="store-card-header">
                  <div style={{ flex: 1 }}>
                    <div className="store-card-icon" style={{ marginBottom: '0.5rem' }}>
                      <Store size={18} />
                    </div>
                    <p className="store-card-name">{store.name}</p>
                  </div>
                  {store.userRating > 0 && (
                    <span className="badge badge-rated">
                      <Star size={10} fill="currentColor" />
                      Rated
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem', marginBottom: '1rem' }}>
                  <MapPin size={13} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p className="store-card-address" style={{ margin: 0 }}>{store.address}</p>
                </div>

                {/* Overall rating */}
                <div className="store-card-rating-box">
                  <div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                      Overall Rating
                    </p>
                    <StarRating rating={store.averageRating || 0} size={15} showValue />
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                      {store.totalRatings} {store.totalRatings === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                  {store.userRating > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                        Your Rating
                      </p>
                      <StarRating rating={store.userRating} size={15} />
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', marginTop: '0.2rem' }}>
                        {store.userRating}/5
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="store-card-actions">
                  {store.userRating > 0 ? (
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%' }}
                      onClick={() => openModify(store)}
                      id={`modify-rating-${store.id}`}
                    >
                      <Edit3 size={14} /> Modify Your Rating
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => openRate(store)}
                      id={`submit-rating-${store.id}`}
                    >
                      <Plus size={14} /> Submit Rating
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {ratingModal && (
        <RatingModal
          store={ratingModal.store}
          isModify={ratingModal.isModify}
          currentRating={ratingModal.currentRating}
          onClose={() => setRatingModal(null)}
          onSuccess={loadStores}
        />
      )}
    </div>
  );
};

export default UserDashboard;

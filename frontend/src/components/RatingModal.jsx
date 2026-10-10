import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Star, Store } from 'lucide-react';
import StarRating from './StarRating';

const RatingModal = ({ store, isModify, currentRating, onClose, onSuccess }) => {
  const [rating, setRating] = useState(currentRating || 5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const labels = { 5: 'Outstanding!', 4: 'Very Good', 3: 'Average', 2: 'Below Expectations', 1: 'Poor' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5.');
      return;
    }
    setLoading(true); setError('');
    try {
      if (isModify) {
        await api.modifyRating({ storeId: store.id, rating });
        showToast(`Rating updated to ${rating} stars!`, 'success');
      } else {
        await api.submitRating({ storeId: store.id, rating });
        showToast(`Rated "${store.name}" ${rating} stars!`, 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} color="#f59e0b" fill="#f59e0b" />
            <h3>{isModify ? 'Modify Your Rating' : 'Rate This Store'}</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Store info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: '1.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
                <Store size={18} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{store.name}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{store.address}</p>
              </div>
            </div>

            {/* Star picker */}
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', fontWeight: 600 }}>
                Tap the stars to select your score:
              </p>
              <StarRating rating={rating} interactive onChange={setRating} size={38} />
              <p style={{ marginTop: '0.6rem', fontSize: '1.1rem', fontWeight: 700, color: '#d97706' }}>
                {rating} / 5 — {labels[rating]}
              </p>
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button id="rating-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isModify ? 'Save Changes' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;

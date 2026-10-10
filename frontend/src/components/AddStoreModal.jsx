import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Store } from 'lucide-react';

const AddStoreModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api.getUsers({ role: 'store_owner' })
      .then(res => res.success && setOwners(res.users || []))
      .catch(() => {});
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const nameOk = form.name.trim().length >= 20 && form.name.trim().length <= 60;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const addrOk  = form.address.trim().length > 0 && form.address.trim().length <= 400;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameOk) { setError('Store Name must be 20–60 characters.'); return; }
    if (!emailOk) { setError('Please enter a valid email.'); return; }
    if (!addrOk) { setError('Address is required (max 400 chars).'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.createStore({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        ownerId: form.ownerId ? parseInt(form.ownerId) : null,
      });
      showToast(res.message || 'Store created!', 'success');
      onSuccess(); onClose();
    } catch (err) {
      setError(err.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={18} color="#3b82f6" />
            <h3>Add New Store</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                Store Name
                <span className="form-hint">{form.name.length}/60 (min 20)</span>
              </label>
              <input id="as-name" type="text" className="form-control"
                placeholder="e.g. Evergreen Grand Organic Superstore"
                value={form.name} onChange={e => set('name', e.target.value)} />
              {form.name.length > 0 && !nameOk && (
                <span className="form-error">Must be 20–60 characters (currently {form.name.length}).</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Store Email</label>
              <input id="as-email" type="email" className="form-control"
                placeholder="store@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                Address
                <span className="form-hint">{form.address.length}/400</span>
              </label>
              <textarea id="as-address" className="form-control" rows={3}
                placeholder="Full physical address"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">
                Assign Store Owner
                <span className="form-hint">Optional</span>
              </label>
              <select id="as-owner" className="form-control"
                value={form.ownerId} onChange={e => set('ownerId', e.target.value)}>
                <option value="">-- No Owner --</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                ))}
              </select>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button id="as-submit" type="submit" className="btn btn-primary"
              disabled={loading || !nameOk || !emailOk || !addrOk}>
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;

import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, UserPlus, Check } from 'lucide-react';

const AddUserModal = ({ defaultRole = 'normal_user', onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: defaultRole });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const nameOk = form.name.trim().length >= 20 && form.name.trim().length <= 60;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const addrOk  = form.address.trim().length > 0 && form.address.trim().length <= 400;
  const hasLen  = form.password.length >= 8 && form.password.length <= 16;
  const hasUp   = /[A-Z]/.test(form.password);
  const hasSp   = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(form.password);
  const passOk  = hasLen && hasUp && hasSp;
  const allOk   = nameOk && emailOk && addrOk && passOk;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allOk) { setError('Please fix all highlighted issues.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.createUser({
        name: form.name.trim(), email: form.email.trim(),
        password: form.password, address: form.address.trim(), role: form.role,
      });
      showToast(res.message || 'User created!', 'success');
      onSuccess(); onClose();
    } catch (err) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const Rule = ({ ok, text }) => (
    <div className={`pass-rule ${ok ? 'ok' : ''}`}><Check size={13} />{text}</div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} color="#3b82f6" />
            <h3>Add New User</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select id="au-role" className="form-control"
                value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="normal_user">Normal User</option>
                <option value="admin">System Administrator</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Full Name
                <span className="form-hint">{form.name.length}/60 (min 20)</span>
              </label>
              <input id="au-name" type="text" className="form-control"
                placeholder="e.g. Jonathan Alexander Sterling"
                value={form.name} onChange={e => set('name', e.target.value)} />
              {form.name.length > 0 && !nameOk && (
                <span className="form-error">Must be 20–60 characters (currently {form.name.length}).</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="au-email" type="email" className="form-control"
                placeholder="user@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input id="au-password" type="password" className="form-control"
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.65rem', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Rule ok={hasLen} text="8 to 16 characters" />
              <Rule ok={hasUp} text="At least one uppercase letter" />
              <Rule ok={hasSp} text="At least one special character" />
            </div>

            <div className="form-group">
              <label className="form-label">
                Address
                <span className="form-hint">{form.address.length}/400</span>
              </label>
              <textarea id="au-address" className="form-control" rows={2}
                placeholder="User's residential or business address"
                value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button id="au-submit" type="submit" className="btn btn-primary" disabled={loading || !allOk}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

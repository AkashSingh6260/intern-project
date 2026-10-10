import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Key, Check } from 'lucide-react';

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const f = form;
  const hasLen = f.newPassword.length >= 8 && f.newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(f.newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(f.newPassword);
  const matches = f.newPassword !== '' && f.newPassword === f.confirmPassword;
  const valid = hasLen && hasUpper && hasSpecial && matches;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) { setError('Please enter your current password.'); return; }
    if (!valid) { setError('Please fix all password requirements.'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast(res.message || 'Password updated!', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const Rule = ({ ok, text }) => (
    <div className={`pass-rule ${ok ? 'ok' : ''}`}>
      <Check size={13} />
      {text}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="#3b82f6" />
            <h3>Change Password</h3>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input id="cp-current" type="password" className="form-control"
                placeholder="Enter current password"
                value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input id="cp-new" type="password" className="form-control"
                placeholder="8–16 chars, 1 uppercase, 1 special"
                value={form.newPassword} onChange={e => set('newPassword', e.target.value)} />
            </div>

            {/* Live rules */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <Rule ok={hasLen} text="8 to 16 characters" />
              <Rule ok={hasUpper} text="At least one uppercase letter" />
              <Rule ok={hasSpecial} text="At least one special character (!@#$...)" />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input id="cp-confirm" type="password" className="form-control"
                placeholder="Re-enter new password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              {form.confirmPassword && !matches && (
                <span className="form-error">Passwords do not match.</span>
              )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button id="cp-submit" type="submit" className="btn btn-primary" disabled={loading || !valid}>
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

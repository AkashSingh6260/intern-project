import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Store, Eye, EyeOff, ArrowRight, Check, User, Shield } from 'lucide-react';

const validate = {
  nameOk: n => n.trim().length >= 20 && n.trim().length <= 60,
  emailOk: e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()),
  addrOk: a => a.trim().length > 0 && a.trim().length <= 400,
  passOk: p => p.length >= 8 && p.length <= 16 && /[A-Z]/.test(p) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p),
};

const AuthPage = () => {
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', address: '' });

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  const f = form;
  const hasLen = f.password.length >= 8 && f.password.length <= 16;
  const hasUpp = /[A-Z]/.test(f.password);
  const hasSpc = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(f.password);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill all fields.'); return; }
    setLoading(true); setError('');
    try {
      const res = await login(form.email.trim(), form.password);
      if (!res.success) setError(res.message || 'Login failed.');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate.nameOk(f.name)) { setError('Name must be 20–60 characters.'); return; }
    if (!validate.emailOk(f.email)) { setError('Enter a valid email address.'); return; }
    if (!validate.addrOk(f.address)) { setError('Address is required (max 400 chars).'); return; }
    if (!validate.passOk(f.password)) { setError('Password must be 8–16 chars with 1 uppercase and 1 special character.'); return; }
    setLoading(true); setError('');
    try {
      const res = await signup(f.name.trim(), f.email.trim(), f.password, f.address.trim());
      if (!res.success) setError(res.message || 'Signup failed.');
      else showToast('Account created! Logging you in…', 'success');
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const Rule = ({ ok, text }) => (
    <div className={`pass-rule ${ok ? 'ok' : ''}`}>
      <Check size={12} />{text}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.85rem', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}>
            <Store size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', color: '#1e293b', marginBottom: '0.25rem' }}>
            Store<span style={{ color: '#3b82f6' }}>Rate</span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Store Review & Rating Platform</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: '1.5rem' }}>
            {['login', 'signup'].map(m => (
              <button key={m} id={`auth-tab-${m}`}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '0.55rem', border: 'none', cursor: 'pointer',
                  borderRadius: 8, fontWeight: 600, fontSize: '0.9rem',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1e293b' : '#6b7280',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            {/* Signup-only fields */}
            {mode === 'signup' && (
              <>
                <div className="form-group">
                  <label className="form-label">
                    Full Name
                    <span className="form-hint">{form.name.length}/60 (min 20)</span>
                  </label>
                  <input id="auth-name" type="text" className="form-control"
                    placeholder="e.g. Jonathan Alexander Sterling"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                  {form.name.length > 0 && !validate.nameOk(form.name) && (
                    <span className="form-error">Must be 20–60 characters.</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Address
                    <span className="form-hint">{form.address.length}/400</span>
                  </label>
                  <textarea id="auth-address" className="form-control" rows={2}
                    placeholder="Your residential or business address"
                    value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input id="auth-email" type="email" className="form-control"
                placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-control"
                  placeholder={mode === 'signup' ? '8–16 chars, 1 uppercase, 1 special' : 'Enter password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button"
                  onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Password rules for signup */}
            {mode === 'signup' && form.password.length > 0 && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.65rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Rule ok={hasLen} text="8 to 16 characters" />
                <Rule ok={hasUpp} text="At least one uppercase letter" />
                <Rule ok={hasSpc} text="At least one special character" />
              </div>
            )}

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

            <button id="auth-submit" type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '0.7rem' }}
              disabled={loading}>
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.5rem' }}>
            Test Accounts
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
            {[
              { role: 'Admin', email: 'admin@platform.com', pw: 'Admin@1234' },
              { role: 'User', email: 'alice.shopper@gmail.com', pw: 'User@1234' },
              { role: 'Store Owner', email: 'edward.owner@bakery.com', pw: 'Owner@1234' },
            ].map(({ role, email, pw }) => (
              <div
                key={role}
                onClick={() => {
                  setMode('login');
                  setForm({ email, password: pw, name: '', address: '' });
                  setError('');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem', background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: 6, cursor: 'pointer',
                }}
              >
                <div>
                  <strong style={{ color: '#374151' }}>{role}: </strong>
                  <span style={{ color: '#6b7280' }}>{email}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Fill</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Key, LogOut, User, Store } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

const roleLabels = {
  admin: 'Administrator',
  normal_user: 'Normal User',
  store_owner: 'Store Owner',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [showPwModal, setShowPwModal] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <a href="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: '#3b82f6', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Store size={18} color="#fff" />
            </div>
            Store<span>Rate</span>
          </a>

          {/* User info + actions */}
          {user && (
            <div className="navbar-actions">
              <div className="navbar-user">
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#dbeafe', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#3b82f6'
                }}>
                  <User size={15} />
                </div>
                <span className="user-name">{user.name}</span>
                <span className={`badge badge-${user.role}`}>
                  {roleLabels[user.role]}
                </span>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPwModal(true)}
                id="nav-change-password"
              >
                <Key size={14} />
                Change Password
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                id="nav-logout"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {showPwModal && (
        <ChangePasswordModal onClose={() => setShowPwModal(false)} />
      )}
    </>
  );
};

export default Navbar;

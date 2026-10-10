import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StarRating from '../components/StarRating';
import AddUserModal from '../components/AddUserModal';
import AddStoreModal from '../components/AddStoreModal';
import UserDetailsModal from '../components/UserDetailsModal';
import {
  Users, Store, Star, Search, Plus, RefreshCw,
  ChevronUp, ChevronDown, Mail, MapPin, Eye
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const filterAndSort = (items, search, searchKeys, sort) => {
  const query = search.toLowerCase();
  const direction = sort.dir === 'asc' ? 1 : -1;

  return items
    .filter(item => searchKeys.some(key => String(item[key] ?? '').toLowerCase().includes(query)))
    .sort((a, b) => {
      const aValue = a[sort.key] ?? '';
      const bValue = b[sort.key] ?? '';
      const comparison = typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase());
      return comparison * direction;
    });
};

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Users
  const [users, setUsers]   = useState([]);
  const [uSearch, setUSearch] = useState('');
  const [uSort, setUSort]   = useState({ key: 'name', dir: 'asc' });

  // Stores
  const [stores, setStores]   = useState([]);
  const [sSearch, setSSearch] = useState('');
  const [sSort, setSSort]     = useState({ key: 'name', dir: 'asc' });

  // Modals
  const [showAddUser, setShowAddUser]   = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [viewUserId, setViewUserId]     = useState(null);
  const [loadingData, setLoadingData]   = useState(false);

  const loadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [dashRes, usersRes, storesRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getUsers(),
        api.getAdminStores(),
      ]);
      if (dashRes.success) setStats(dashRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (storesRes.success) setStores(storesRes.stores);
    } catch {
      showToast('Failed to load data.', 'error');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const sortToggle = (key, current, setter) => {
    setter(c => c.key === key ? { key, dir: c.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortIcon = ({ colKey, current }) => {
    if (current.key !== colKey) return <span style={{ opacity: 0.3 }}><ChevronUp size={13} /></span>;
    return current.dir === 'asc' ? <ChevronUp size={13} color="#3b82f6" /> : <ChevronDown size={13} color="#3b82f6" />;
  };

  const filteredUsers = filterAndSort(users, uSearch, ['name', 'email', 'address'], uSort);
  const filteredStores = filterAndSort(stores, sSearch, ['name', 'address'], sSort);

  const roleLabels = { admin: 'Admin', normal_user: 'User', store_owner: 'Store Owner' };

  const ThCol = ({ label, colKey, sort, setSort, sortable = true }) => (
    <th
      className={sortable ? 'sortable' : ''}
      onClick={() => sortable && sortToggle(colKey, sort, setSort)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {label}
        {sortable && <SortIcon colKey={colKey} current={sort} />}
      </div>
    </th>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Navbar />

      <div className="container" style={{ padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <StatCard title="Total Users" value={stats.totalUsers} subtitle="Registered accounts" icon={Users} color="#3b82f6" bg="#eff6ff" />
          <StatCard title="Total Stores" value={stats.totalStores} subtitle="Listed stores" icon={Store} color="#22c55e" bg="#f0fdf4" />
          <StatCard title="Total Ratings" value={stats.totalRatings} subtitle="Reviews submitted" icon={Star} color="#f59e0b" bg="#fffbeb" />
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')} id="admin-tab-users">
            <Users size={15} /> Users ({filteredUsers.length})
          </button>
          <button className={`tab-btn ${tab === 'stores' ? 'active' : ''}`} onClick={() => setTab('stores')} id="admin-tab-stores">
            <Store size={15} /> Stores ({filteredStores.length})
          </button>
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3>User Management</h3>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div className="search-input-wrap" style={{ flex: '1 1 220px' }}>
                  <Search size={15} className="search-icon" />
                  <input id="users-search" type="text" className="form-control" placeholder="Search by name, email, address…"
                    style={{ paddingLeft: '2.25rem' }}
                    value={uSearch} onChange={e => setUSearch(e.target.value)} />
                </div>
                <button className="btn btn-secondary btn-sm" onClick={loadAll} id="users-refresh">
                  <RefreshCw size={14} /> Refresh
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(true)} id="users-add">
                  <Plus size={14} /> Add User
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <ThCol label="Name" colKey="name" sort={uSort} setSort={setUSort} />
                    <ThCol label="Email" colKey="email" sort={uSort} setSort={setUSort} />
                    <ThCol label="Address" colKey="address" sort={uSort} setSort={setUSort} />
                    <ThCol label="Role" colKey="role" sort={uSort} setSort={setUSort} />
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-state-icon"><Users size={22} /></div>
                          <p>{uSearch ? 'No users match your search.' : 'No users found.'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#374151' }}>
                          <Mail size={13} color="#9ca3af" /> {u.email}
                        </div>
                      </td>
                      <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MapPin size={13} color="#9ca3af" />
                          <span title={u.address}>{u.address}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${u.role}`}>{roleLabels[u.role]}</span></td>
                      <td>
                        <button className="btn btn-secondary btn-sm" style={{ gap: '0.3rem' }}
                          onClick={() => setViewUserId(u.id)} id={`view-user-${u.id}`}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {tab === 'stores' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3>Store Management</h3>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div className="search-input-wrap" style={{ flex: '1 1 220px' }}>
                  <Search size={15} className="search-icon" />
                  <input id="stores-search" type="text" className="form-control" placeholder="Search by name or address…"
                    style={{ paddingLeft: '2.25rem' }}
                    value={sSearch} onChange={e => setSSearch(e.target.value)} />
                </div>
                <button className="btn btn-secondary btn-sm" onClick={loadAll} id="stores-refresh">
                  <RefreshCw size={14} /> Refresh
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddStore(true)} id="stores-add">
                  <Plus size={14} /> Add Store
                </button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <ThCol label="Store Name" colKey="name" sort={sSort} setSort={setSSort} />
                    <ThCol label="Email" colKey="email" sort={sSort} setSort={setSSort} />
                    <ThCol label="Address" colKey="address" sort={sSort} setSort={setSSort} />
                    <ThCol label="Overall Rating" colKey="averageRating" sort={sSort} setSort={setSSort} />
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon"><Store size={22} /></div>
                          <p>{sSearch ? 'No stores match your search.' : 'No stores found.'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredStores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                      <td style={{ color: '#374151', fontSize: '0.85rem' }}>{s.email}</td>
                      <td style={{ maxWidth: 220, color: '#6b7280', fontSize: '0.85rem' }}>
                        <span title={s.address}>{s.address}</span>
                      </td>
                      <td>
                        {s.averageRating > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={s.averageRating} size={14} />
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#d97706' }}>
                              {s.averageRating.toFixed(1)}
                            </span>
                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                              ({s.totalRatings} {s.totalRatings === 1 ? 'rating' : 'ratings'})
                            </span>
                          </div>
                        ) : (
                          <span className="badge badge-neutral">No ratings</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddUser  && <AddUserModal  onClose={() => setShowAddUser(false)}  onSuccess={loadAll} />}
      {showAddStore && <AddStoreModal onClose={() => setShowAddStore(false)} onSuccess={loadAll} />}
      {viewUserId   && <UserDetailsModal userId={viewUserId} onClose={() => setViewUserId(null)} />}
    </div>
  );
};

export default AdminDashboard;

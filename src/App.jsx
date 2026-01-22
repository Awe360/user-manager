import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, User, Mail, Briefcase, X, Search, CheckCircle,
  Users as UsersIcon, Clock, AlertCircle, Key, Save, Loader2, Filter,
  Download, ChevronDown
} from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
              <p className="text-gray-600 mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              Cancel
            </button>
            <button onClick={onConfirm} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer">
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-700 font-medium">Please wait...</p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ id: null, name: '', email: '', role: 'User' });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [bulkActions, setBulkActions] = useState([]);

  const searchInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Admin', createdAt: '2024-01-15' },
        { id: 2, name: 'Sarah Miller', email: 'sarah@example.com', role: 'Developer', createdAt: '2024-02-10' },
        { id: 3, name: 'Mike Wilson', email: 'mike@example.com', role: 'Designer', createdAt: '2024-03-05' },
        { id: 4, name: 'Lisa Chen', email: 'lisa@example.com', role: 'Manager', createdAt: '2024-03-20' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const delay = ms => new Promise(r => setTimeout(r, ms));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      showNotification('Name and email required', 'error');
      return;
    }

    setLoading(true);
    await delay(1000);

    if (isEditing) {
      setUsers(prev => prev.map(u => u.id === form.id ? form : u));
      showNotification('User updated', 'success');
    } else {
      const newUser = { ...form, id: Date.now(), createdAt: new Date().toISOString() };
      setUsers(prev => [newUser, ...prev]);
      showNotification('User created', 'success');
    }

    setForm({ id: null, name: '', email: '', role: 'User' });
    setIsEditing(false);
    setShowModal(false);
    setLoading(false);
  };

  const editUser = user => {
    setForm(user);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = id => setDeleteConfirm({ open: true, id });

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setLoading(true);
    await delay(600);
    setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
    showNotification('User deleted', 'success');
    setLoading(false);
    setDeleteConfirm({ open: false, id: null });
  };

  const openAddModal = () => {
    setForm({ id: null, name: '', email: '', role: 'User' });
    setIsEditing(false);
    setShowModal(true);
  };

  const filteredUsers = useMemo(() => {
    let result = users.filter(u => {
      const q = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      ) && (filterRole === 'All' || u.role === filterRole);
    });

    result.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (sortBy === 'createdAt') { va = new Date(va); vb = new Date(vb); }
      return sortOrder === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

    return result;
  }, [users, searchQuery, filterRole, sortBy, sortOrder]);

  const getAvatarClass = role => {
    const map = {
      Admin: 'from-red-500 to-rose-600',
      Developer: 'from-blue-500 to-cyan-600',
      Designer: 'from-purple-500 to-pink-600',
      Manager: 'from-emerald-500 to-teal-600',
    };
    return map[role] || 'from-gray-600 to-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <LoadingOverlay isLoading={loading} />

      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
      />

      {notification && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-xl text-white flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          <CheckCircle size={20} />
          {notification.msg}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            User Manager
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAddModal}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium hover:shadow-xl transition-all cursor-pointer"
          >
            <Plus size={20} /> Add User
          </motion.button>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none cursor-text"
              />
            </div>

            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Manager">Manager</option>
            </select>

            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="createdAt">Date</option>
              </select>
              <button
                onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarClass(user.role)} flex items-center justify-center text-white font-medium shadow-sm`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getAvatarClass(user.role)} text-white`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => editUser(user)} className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => confirmDelete(user.id)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => !loading && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit User' : 'Add New User'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none cursor-text"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none cursor-text"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none cursor-pointer"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
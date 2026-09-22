import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  UserCheck,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, UserStatus } from '../types';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, currentUser, hasPermission, notify } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Accountant');
  const [password, setPassword] = useState('Password@123');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      notify('Please enter name and valid email.', 'warning');
      return;
    }

    addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password,
    });

    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  const handleToggleStatus = (userId: string, currentStatus: UserStatus) => {
    if (userId === currentUser?.id) {
      notify('You cannot deactivate your own logged-in account.', 'warning');
      return;
    }
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.isMainAdmin || targetUser?.email === 'goldennwonu@gmail.com') {
      notify('The host administrator account cannot be deactivated.', 'error');
      return;
    }
    const newStatus: UserStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateUser(userId, { status: newStatus });
    notify(`Account status updated to ${newStatus}.`, 'info');
  };

  return (
    <div id="users-view-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                Authorized Staff & Access Control
              </h2>
              <p className="text-xs text-slate-500">
                Manage roles (Director, Bursar, Registrar, Teachers) and invite staff members via email.
              </p>
            </div>
          </div>
        </div>

        {hasPermission('manageUsers') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite User via Email</span>
          </button>
        )}
      </div>

      {/* Role Descriptions Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            Super Admin (Director)
          </div>
          <p className="text-slate-500 text-[11px] mt-1">
            Full system control, fee configuration, session creation, user management, and audit logs.
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Accountant (Bursar)
          </div>
          <p className="text-slate-500 text-[11px] mt-1">
            Fee table editing, recording payments, receipt generation, and financial reports.
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Registrar
          </div>
          <p className="text-slate-500 text-[11px] mt-1">
            Register students, manage classes, parent info, and view fee clearance statuses.
          </p>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            Teacher
          </div>
          <p className="text-slate-500 text-[11px] mt-1">
            Class student directory access for assigned classes and academic oversight.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 font-display">
            Staff Members ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
              <tr>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-semibold text-slate-900 whitespace-nowrap flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <span>{u.name}</span>
                    {(u.isMainAdmin || u.email === 'goldennwonu@gmail.com') && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                        Host Admin
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{u.email}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Super Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'Accountant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.role === 'Registrar'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">{u.createdAt}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {u.isMainAdmin || u.email === 'goldennwonu@gmail.com' ? (
                      <span className="text-[10px] text-slate-400 font-semibold italic">
                        Host Admin (Primary)
                      </span>
                    ) : (
                      hasPermission('manageUsers') && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            u.status === 'Active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1 font-display">
              Invite Staff Member via Email
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add new authorized staff to FLO Famous School Management System.
            </p>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mrs. Blessing Nnaji"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. blessing@flofamous.edu.ng"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Staff Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  <option value="Super Admin">Super Admin (Director)</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Accountant">Accountant (Bursar)</option>
                  <option value="Registrar">Registrar</option>
                  <option value="Teacher">Teacher / Class Head</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Temporary Access Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Direct Self-Signup Supported:</span>
                </div>
                <p>
                  The user can also visit the portal, select <strong>Sign Up / Register</strong>, input this email with their name and chosen password, and immediately log into their live dashboard!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Send Invitation & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

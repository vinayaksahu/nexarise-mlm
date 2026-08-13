'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface AdminAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: 'Full platform authority. Manages administrators, system parameters, and security.',
  ADMIN: 'General administration with standard operations and management access.',
  FINANCE: 'Financial administration. Handles deposits, withdrawals, and financial reports.',
  USER_MANAGER: 'User operations. Manages users, accounts, activation, and support tickets.',
  PLAN_EDITOR: 'Business plan configuration. Edits ROI rates, Level Income percentages, and Rewards.',
  SUPPORT: 'Support operator. View users and respond to helpdesk tickets.',
  VIEWER: 'Read-only access for auditing dashboards and system stats.',
};

export default function AdminAdministratorsPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/administrators');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error('Fetch administrators error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const openAddModal = () => {
    setEditingAdmin(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('ADMIN');
    setMsg({ text: '', type: '' });
    setShowAddModal(true);
  };

  const openEditModal = (adm: AdminAccount) => {
    if (adm.role === 'SUPER_ADMIN') {
      setConfirmModal({
        isOpen: true,
        title: 'Action Restricted 🛑',
        message: 'SuperAdmin role and permissions cannot be edited or modified.',
        variant: 'info',
        confirmText: 'Understood',
        cancelText: '',
      });
      return;
    }
    setEditingAdmin(adm);
    setRole(adm.role);
    setMsg({ text: '', type: '' });
    setShowAddModal(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    setSubmitting(true);
    try {
      if (editingAdmin) {
        const res = await fetch(`/api/admin/administrators/${editingAdmin.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });
        const data = await res.json();
        if (res.ok && data.admin) {
          setAdmins(prev => prev.map(a => a.id === data.admin.id ? data.admin : a));
          setMsg({ text: '🎉 Admin role updated successfully!', type: 'success' });
          setTimeout(() => {
            setShowAddModal(false);
            setMsg({ text: '', type: '' });
          }, 1000);
        } else {
          setMsg({ text: data.error || 'Failed to update admin account', type: 'error' });
        }
      } else {
        const res = await fetch('/api/admin/administrators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password, role }),
        });
        const data = await res.json();
        if (res.ok && data.admin) {
          setAdmins(prev => [data.admin, ...prev.filter(a => a.id !== data.admin.id)]);
          setMsg({ text: '🎉 New administrative staff account created successfully!', type: 'success' });
          setTimeout(() => {
            setShowAddModal(false);
            setMsg({ text: '', type: '' });
          }, 1000);
        } else {
          setMsg({ text: data.error || 'Failed to create admin account', type: 'error' });
        }
      }
    } catch (err) {
      setMsg({ text: 'Error submitting request', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (adm: AdminAccount) => {
    if (adm.role === 'SUPER_ADMIN') {
      setConfirmModal({
        isOpen: true,
        title: 'Action Restricted 🛑',
        message: 'SuperAdmin account cannot be deactivated.',
        variant: 'info',
        confirmText: 'Understood',
        cancelText: '',
      });
      return;
    }
    const newStatus = adm.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Status Change ⚠️',
      message: `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} staff account "@${adm.username}"?`,
      variant: newStatus === 'SUSPENDED' ? 'danger' : 'warning',
      confirmText: newStatus === 'ACTIVE' ? 'Activate Account' : 'Deactivate Account',
      cancelText: 'Cancel',
      onConfirm: () => executeToggleStatus(adm, newStatus),
    });
  };

  const executeToggleStatus = async (adm: AdminAccount, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/administrators/${adm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.admin) {
          setAdmins(prev => prev.map(a => a.id === data.admin.id ? data.admin : a));
        } else {
          fetchAdmins();
        }
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const roleBadgeVariant = (r: string) => {
    switch (r) {
      case 'SUPER_ADMIN': return 'danger';
      case 'ADMIN': return 'primary';
      case 'FINANCE': return 'success';
      case 'USER_MANAGER': return 'info';
      case 'PLAN_EDITOR': return 'warning';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🛡️ Administrative Roles & Staff Management</span>
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            SuperAdmin Console: Create, assign permissions, and manage platform administrative roles.
          </p>
        </div>
        <Button onClick={openAddModal} variant="primary" className="text-xs py-2 px-4 shadow-md shrink-0">
          ➕ Create Staff Admin
        </Button>
      </div>

      {/* Role Hierarchy Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-red-500">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>👑 SuperAdmin</span>
          </h3>
          <p className="text-xs text-muted mt-1">
            Highest platform authority. Full control over administrators, plan editor, user manager, and financial settings.
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>💳 Finance & User Managers</span>
          </h3>
          <p className="text-xs text-muted mt-1">
            Specialized staff roles. FinanceAdmin manages payouts/deposits; UserManager handles accounts and support.
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            <span>📋 PlanEditor & Support</span>
          </h3>
          <p className="text-xs text-muted mt-1">
            PlanEditor updates business parameters; Support handles user helpdesk tickets without access to financial controls.
          </p>
        </Card>
      </div>

      {/* Administrators Table */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">System Administrators ({admins.length})</CardTitle>
          <CardDescription className="text-xs text-muted">All active and staff administrative accounts</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Username & Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Permissions Scope</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                      Loading staff records...
                    </td>
                  </tr>
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted">
                      <p className="text-2xl mb-1">🛡️</p>
                      <p className="text-sm font-semibold">No administrative staff accounts found</p>
                      <p className="text-xs mt-0.5">Click "Create Staff Admin" to add your first administrative staff member.</p>
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center ${adm.role === 'SUPER_ADMIN' ? 'bg-red-600' : 'bg-indigo-600'}`}>
                            {adm.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{adm.name}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <p className="font-mono text-gray-900 dark:text-slate-200">@{adm.username}</p>
                        <p className="text-[10px] text-muted">{adm.email}</p>
                      </td>

                      <td className="p-3">
                        <Badge variant={roleBadgeVariant(adm.role) as any} className="text-[10px] font-mono">
                          {adm.role}
                        </Badge>
                      </td>

                      <td className="p-3 text-muted text-[11px] max-w-xs truncate" title={ROLE_DESCRIPTIONS[adm.role] || ''}>
                        {ROLE_DESCRIPTIONS[adm.role] || 'Standard administrative access'}
                      </td>

                      <td className="p-3">
                        <Badge variant={adm.status === 'ACTIVE' ? 'success' : 'danger'} className="text-[10px]">
                          {adm.status}
                        </Badge>
                      </td>

                      <td className="p-3 text-right">
                        {adm.role === 'SUPER_ADMIN' ? (
                          <span className="text-[11px] text-muted font-medium italic">Root Authority</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] h-7 px-2"
                              onClick={() => openEditModal(adm)}
                            >
                              ✏️ Change Role
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`text-[11px] h-7 px-2 ${adm.status === 'ACTIVE' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                              onClick={() => handleToggleStatus(adm)}
                            >
                              {adm.status === 'ACTIVE' ? '⏸️ Deactivate' : '▶️ Activate'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-gray-900 dark:text-white relative my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>{editingAdmin ? `✏️ Edit Role for @${editingAdmin.username}` : '➕ Create Staff Administrator'}</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {msg.text && (
              <div className={`p-3 rounded-xl text-xs font-medium ${msg.type === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-left">
              {!editingAdmin && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Staff Full Name</label>
                    <Input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alice Smith"
                      className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Username</label>
                      <Input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. finance_alice"
                        className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                      <Input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alice@nexarise.com"
                        className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Assign Administrative Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-gray-900 dark:text-white font-medium"
                >
                  <option value="ADMIN">ADMIN — General Administration</option>
                  <option value="FINANCE">FINANCE — Financial Payouts & Approvals</option>
                  <option value="USER_MANAGER">USER_MANAGER — User Accounts & Activations</option>
                  <option value="PLAN_EDITOR">PLAN_EDITOR — ROI Rates & Plan Config</option>
                  <option value="SUPPORT">SUPPORT — Helpdesk Ticket Operator</option>
                  <option value="VIEWER">VIEWER — Read-Only Dashboard Auditor</option>
                </select>
                <p className="text-[10px] text-muted mt-1 bg-gray-50 dark:bg-slate-950 p-2 rounded-md border border-border">
                  ℹ️ {ROLE_DESCRIPTIONS[role]}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Saving...' : editingAdmin ? 'Update Role' : 'Create Staff Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={() => {
          if (confirmModal.onConfirm) confirmModal.onConfirm();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

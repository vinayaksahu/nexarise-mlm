'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface PaymentMethodItem {
  id: string;
  name: string;
  type: string;
  network: string;
  walletAddress: string;
  qrCodeUrl: string;
  instructions?: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentMethodItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  // Form State
  const [formName, setFormName] = useState('USDT');
  const [formNetwork, setFormNetwork] = useState('BEP-20');
  const [formAddress, setFormAddress] = useState('');
  const [formQrUrl, setFormQrUrl] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/admin/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setMethods(data.methods || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin payment methods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('USDT');
    setFormNetwork('BEP-20');
    setFormAddress('');
    setFormQrUrl('');
    setFormInstructions('Send only USDT on BEP-20 network.');
    setFormIsDefault(methods.length === 0);
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (item: PaymentMethodItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormNetwork(item.network);
    setFormAddress(item.walletAddress);
    setFormQrUrl(item.qrCodeUrl);
    setFormInstructions(item.instructions || '');
    setFormIsDefault(item.isDefault);
    setFormIsActive(item.isActive);
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToastMsg({ text: 'Please upload a valid image file (PNG, JPG, WebP)', type: 'error' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToastMsg({ text: 'Image size should be less than 2MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormQrUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg({ text: '', type: '' });

    if (!formName.trim()) {
      setToastMsg({ text: 'Payment Method Name is required', type: 'error' });
      return;
    }
    if (!formNetwork.trim()) {
      setToastMsg({ text: 'Network is required (e.g. BEP-20, TRC-20)', type: 'error' });
      return;
    }
    if (!formAddress.trim()) {
      setToastMsg({ text: 'Wallet Address is required', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        network: formNetwork.trim(),
        walletAddress: formAddress.trim(),
        qrCodeUrl: formQrUrl.trim(),
        instructions: formInstructions.trim(),
        isDefault: formIsDefault,
        isActive: formIsActive,
      };

      const url = editingItem ? `/api/admin/payment-methods/${editingItem.id}` : '/api/admin/payment-methods';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMsg({ text: `🎉 Payment method ${editingItem ? 'updated' : 'added'} successfully!`, type: 'success' });
        await fetchMethods();
        setTimeout(() => {
          setShowModal(false);
          setToastMsg({ text: '', type: '' });
        }, 1200);
      } else {
        setToastMsg({ text: data.error || 'Failed to save payment method', type: 'error' });
      }
    } catch (err) {
      setToastMsg({ text: 'Error saving payment method', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item: PaymentMethodItem) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        await fetchMethods();
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const setDefault = async (item: PaymentMethodItem) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true, isActive: true }),
      });
      if (res.ok) {
        await fetchMethods();
      }
    } catch (err) {
      console.error('Failed to set default method:', err);
    }
  };

  const handleDelete = async (item: PaymentMethodItem) => {
    if (!confirm(`Are you sure you want to delete payment method "${item.name} (${item.network})"?`)) return;
    try {
      const res = await fetch(`/api/admin/payment-methods/${item.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchMethods();
      }
    } catch (err) {
      console.error('Failed to delete payment method:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMsg({ text: '📋 Address copied to clipboard!', type: 'success' });
    setTimeout(() => setToastMsg({ text: '', type: '' }), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading deposit payment methods...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Payment Methods</h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Manage deposit wallet addresses, networks, QR codes, and default user payment options.
          </p>
        </div>
        <Button onClick={openAddModal} variant="primary" className="text-xs py-2 px-4 shadow-md">
          ➕ Add Payment Method
        </Button>
      </div>

      {toastMsg.text && (
        <div className={`p-3.5 rounded-xl text-xs font-medium ${toastMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'}`}>
          {toastMsg.text}
        </div>
      )}

      {methods.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-4xl mb-2">💳</p>
            <p className="text-base font-semibold text-gray-900 dark:text-white">No Payment Methods Configured</p>
            <p className="text-xs text-muted mt-1 mb-4">Add your first deposit wallet address and network for users.</p>
            <Button onClick={openAddModal} variant="primary" size="sm">
              Add First Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((item) => (
            <Card key={item.id} className={`relative transition-all border ${item.isDefault ? 'border-primary shadow-lg ring-1 ring-primary/30' : 'border-border'}`}>
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white">{item.name}</CardTitle>
                    <Badge variant="default" className="text-[10px] bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
                      {item.network}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted mt-0.5">
                    Created {new Date(item.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.isDefault && (
                    <Badge variant="success" className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold">
                      ⭐ Default
                    </Badge>
                  )}
                  <Badge variant={item.isActive ? 'success' : 'danger'} className="text-[10px]">
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-3">
                {/* QR Code Preview */}
                <div className="flex justify-center bg-gray-100 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-200 dark:border-slate-800">
                  {item.qrCodeUrl ? (
                    <img 
                      src={item.qrCodeUrl} 
                      alt={`${item.name} QR Code`} 
                      className="w-36 h-36 object-contain rounded-lg bg-white p-1 shadow"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-xs text-muted bg-gray-200 dark:bg-slate-900 rounded-lg">
                      No QR Code
                    </div>
                  )}
                </div>

                {/* Wallet Address & Copy */}
                <div className="space-y-1">
                  <label className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Deposit Address</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-mono">
                    <span className="truncate text-gray-900 dark:text-white flex-1">{item.walletAddress}</span>
                    <button 
                      onClick={() => copyToClipboard(item.walletAddress)} 
                      className="text-primary hover:text-primary-light font-bold text-xs p-1 shrink-0"
                      title="Copy Address"
                    >
                      📋
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                {item.instructions && (
                  <p className="text-[11px] text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/40 p-2 rounded-lg border border-gray-200 dark:border-slate-800/60">
                    ℹ️ {item.instructions}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[11px] h-7 px-2.5"
                      onClick={() => openEditModal(item)}
                    >
                      ✏️ Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={`text-[11px] h-7 px-2.5 ${item.isActive ? 'text-amber-600 dark:text-amber-400 hover:text-amber-500' : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500'}`}
                      onClick={() => toggleStatus(item)}
                    >
                      {item.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!item.isDefault && item.isActive && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-[11px] h-7 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                        onClick={() => setDefault(item)}
                        title="Set as default payment option"
                      >
                        ⭐ Make Default
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-[11px] h-7 px-2 text-red-600 dark:text-red-400 hover:text-red-500"
                      onClick={() => handleDelete(item)}
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-gray-900 dark:text-white relative my-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>{editingItem ? '✏️ Edit Payment Method' : '➕ Add Payment Method'}</span>
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Method Name</label>
                  <Input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. USDT, USDC, BTC"
                    className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Network</label>
                  <Input 
                    type="text" 
                    value={formNetwork}
                    onChange={(e) => setFormNetwork(e.target.value)}
                    placeholder="e.g. BEP-20, TRC-20, ERC-20"
                    className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Deposit Wallet Address</label>
                <Input 
                  type="text" 
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="0x..."
                  className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs font-mono"
                  required
                />
              </div>

              {/* QR Code Upload / Custom URL */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300">QR Code Image</label>
                
                <div className="flex items-center gap-3">
                  {formQrUrl ? (
                    <img src={formQrUrl} alt="QR Preview" className="w-16 h-16 object-contain bg-white p-1 rounded-lg border border-gray-300 dark:border-slate-700 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-lg flex items-center justify-center text-[10px] text-gray-500 dark:text-slate-500 shrink-0">
                      Auto QR
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-gray-500 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Upload custom QR image or leave empty for auto-generated QR.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Instructions (Optional)</label>
                <Input 
                  type="text" 
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  placeholder="e.g. Send only USDT on BEP-20 network."
                  className="bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800 text-gray-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>⭐ Set as Default Payment Method</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-gray-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Status: Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Payment Method'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

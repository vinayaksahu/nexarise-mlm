'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'CRYPTO' | 'BANKING' | 'UPI' | string;
  network?: string;
  walletAddress?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  upiId?: string;
  payeeName?: string;
  qrCodeUrl?: string;
  instructions?: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

export default function DepositsPage() {
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | 'CRYPTO' | 'BANKING' | 'UPI'>('ALL');
  const [proofUrl, setProofUrl] = useState('');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPopup, setShowPopup] = useState(false);

  const fetchDepositsAndMethods = async () => {
    try {
      const [resDep, resMethods] = await Promise.all([
        fetch('/api/deposits'),
        fetch('/api/payment-methods')
      ]);

      if (resDep.ok) {
        const data = await resDep.json();
        setDeposits(Array.isArray(data) ? data : []);
      }

      if (resMethods.ok) {
        const methodsData = await resMethods.json();
        // Server endpoint only returns isActive: true methods
        const activeMethods: PaymentMethod[] = (methodsData.methods || []).filter((m: PaymentMethod) => m.isActive);
        setPaymentMethods(activeMethods);

        if (activeMethods.length > 0) {
          const defaultMethod = activeMethods.find(m => m.isDefault) || activeMethods[0];
          setSelectedMethodId(defaultMethod.id);
        } else {
          setSelectedMethodId('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch deposits/methods:', err);
    }
  };

  useEffect(() => {
    fetchDepositsAndMethods();
  }, []);

  const filteredMethods = paymentMethods.filter(pm => {
    if (activeCategoryTab === 'ALL') return true;
    return pm.type === activeCategoryTab;
  });

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId) || filteredMethods[0] || paymentMethods[0];

  const handleDeposit = async () => {
    if (paymentMethods.length === 0 || !selectedMethod) {
      setMessage('Deposit payment methods are currently unavailable');
      setMessageType('error');
      setShowPopup(true);
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setMessage('Please enter a valid deposit amount');
      setMessageType('error');
      setShowPopup(true);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    let formattedMethodString = '';
    if (selectedMethod.type === 'BANKING') {
      formattedMethodString = `[Banking] ${selectedMethod.name} (${selectedMethod.bankName || ''}) - A/C: ${selectedMethod.accountNumber || ''}`;
    } else if (selectedMethod.type === 'UPI') {
      formattedMethodString = `[UPI] ${selectedMethod.name} - UPI ID: ${selectedMethod.upiId || ''}`;
    } else {
      formattedMethodString = `[Crypto] ${selectedMethod.name} (${selectedMethod.network || 'BEP-20'}) - ${selectedMethod.walletAddress || ''}`;
    }

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          method: formattedMethodString,
          proofUrl: proofUrl || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Deposit request submitted successfully! Upon admin approval, funds will be credited directly to your P2P Wallet.');
        setMessageType('success');
        setAmount('');
        setProofUrl('');
        fetchDepositsAndMethods();
      } else {
        setMessage(data.error || 'Failed to submit deposit request');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      setShowPopup(true);
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'default';
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage(`${label} copied to clipboard!`);
    setMessageType('success');
    setShowPopup(true);
  };

  const hasCrypto = paymentMethods.some(m => m.type === 'CRYPTO');
  const hasBanking = paymentMethods.some(m => m.type === 'BANKING');
  const hasUpi = paymentMethods.some(m => m.type === 'UPI');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposits</h1>
        <p className="text-muted text-xs sm:text-sm mt-0.5">
          Deposit funds to your P2P Wallet using Crypto, Bank Transfer, or UPI payment options below.
        </p>
      </div>

      {paymentMethods.length === 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-6 text-center space-y-2">
            <p className="text-3xl">⚠️</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">Deposit Payment Methods Unavailable</p>
            <p className="text-xs text-muted max-w-md mx-auto">
              Deposit payment methods are currently being updated by administration. Please check back shortly or contact support.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Payment Method Type Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Select Payment Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategoryTab('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeCategoryTab === 'ALL'
                    ? 'bg-primary text-white border-primary shadow-sm ring-1 ring-primary/30'
                    : 'bg-card border-border hover:border-border/80 text-gray-700 dark:text-slate-300'
                }`}
              >
                All Methods ({paymentMethods.length})
              </button>
              {hasCrypto && (
                <button
                  onClick={() => setActiveCategoryTab('CRYPTO')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeCategoryTab === 'CRYPTO'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                      : 'bg-card border-border hover:border-border/80 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Crypto ({paymentMethods.filter(m => m.type === 'CRYPTO').length})
                </button>
              )}
              {hasBanking && (
                <button
                  onClick={() => setActiveCategoryTab('BANKING')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeCategoryTab === 'BANKING'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-card border-border hover:border-border/80 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  🏦 Bank Transfer ({paymentMethods.filter(m => m.type === 'BANKING').length})
                </button>
              )}
              {hasUpi && (
                <button
                  onClick={() => setActiveCategoryTab('UPI')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeCategoryTab === 'UPI'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm ring-1 ring-purple-500/30'
                      : 'bg-card border-border hover:border-border/80 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  📱 UPI Payment ({paymentMethods.filter(m => m.type === 'UPI').length})
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Select Cards */}
          {filteredMethods.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {filteredMethods.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedMethodId(pm.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMethodId === pm.id 
                        ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                        : 'bg-card border-border hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-1">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{pm.name}</span>
                      <Badge variant="default" className="text-[10px] shrink-0 bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
                        {pm.type === 'BANKING' ? 'BANK' : pm.type === 'UPI' ? 'UPI' : pm.network || 'CRYPTO'}
                      </Badge>
                    </div>
                    {pm.isDefault && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">⭐ Default</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Active Payment Method Card */}
          {selectedMethod && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              <Card className="sm:col-span-2 lg:col-span-1 border-indigo-500/30">
                <CardHeader className="p-3 sm:p-4 pb-1">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>{selectedMethod.type === 'BANKING' ? '🏦' : selectedMethod.type === 'UPI' ? '📱' : '⚡'}</span>
                      <span>{selectedMethod.name}</span>
                    </span>
                    <Badge variant="info">
                      {selectedMethod.type === 'BANKING' ? 'Bank Transfer' : selectedMethod.type === 'UPI' ? 'UPI Pay' : selectedMethod.network}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-1 space-y-3">
                  {/* QR Code Preview */}
                  {selectedMethod.qrCodeUrl && (
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 shadow-md text-center">
                      <img 
                        src={selectedMethod.qrCodeUrl} 
                        alt={`${selectedMethod.name} Deposit QR Code`} 
                        className="w-36 h-36 mx-auto rounded-lg object-contain"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Scan QR Code to Pay</p>
                    </div>
                  )}

                  {/* Payment Type Details */}
                  {selectedMethod.type === 'BANKING' ? (
                    <div className="space-y-2 text-xs bg-gray-50 dark:bg-slate-900/90 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Bank Name:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{selectedMethod.bankName || 'N/A'}</span>
                      </div>
                      {selectedMethod.accountName && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">Account Holder:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{selectedMethod.accountName}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">Account Number:</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedMethod.accountNumber || 'N/A'}</span>
                          {selectedMethod.accountNumber && (
                            <button onClick={() => copyText(selectedMethod.accountNumber!, 'Account Number')} className="text-primary font-bold text-xs p-0.5">📋</button>
                          )}
                        </div>
                      </div>
                      {selectedMethod.ifscCode && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">IFSC / Code:</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-semibold text-gray-900 dark:text-white">{selectedMethod.ifscCode}</span>
                            <button onClick={() => copyText(selectedMethod.ifscCode!, 'IFSC Code')} className="text-primary font-bold text-xs p-0.5">📋</button>
                          </div>
                        </div>
                      )}
                      {selectedMethod.branchName && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">Branch:</span>
                          <span className="text-gray-700 dark:text-slate-300">{selectedMethod.branchName}</span>
                        </div>
                      )}
                    </div>
                  ) : selectedMethod.type === 'UPI' ? (
                    <div className="space-y-2 text-xs bg-gray-50 dark:bg-slate-900/90 p-3 rounded-lg border border-gray-200 dark:border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-slate-400 font-medium">UPI ID (VPA):</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-purple-600 dark:text-purple-400">{selectedMethod.upiId || 'N/A'}</span>
                          {selectedMethod.upiId && (
                            <button onClick={() => copyText(selectedMethod.upiId!, 'UPI ID')} className="text-primary font-bold text-xs p-0.5">📋</button>
                          )}
                        </div>
                      </div>
                      {selectedMethod.payeeName && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 dark:text-slate-400 font-medium">Payee Name:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{selectedMethod.payeeName}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] text-gray-500 dark:text-slate-400 font-medium">Deposit Address ({selectedMethod.network || 'BEP-20'})</label>
                      <div className="flex items-center gap-2 p-2.5 bg-gray-100 dark:bg-slate-900/90 rounded-lg border border-gray-200 dark:border-slate-800">
                        <span className="text-xs font-mono text-gray-900 dark:text-slate-200 break-all flex-1">{selectedMethod.walletAddress}</span>
                        {selectedMethod.walletAddress && (
                          <button onClick={() => copyText(selectedMethod.walletAddress!, 'Wallet Address')} className="text-primary font-bold text-xs p-1 shrink-0">📋</button>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedMethod.instructions && (
                    <p className="text-[11px] text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-900/40 p-2 rounded-lg border border-gray-200 dark:border-slate-800 text-left">
                      ℹ️ {selectedMethod.instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Deposit Request Form */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base sm:text-lg">Submit Deposit Request</CardTitle>
          <CardDescription className="text-xs">
            Send your payment using the details above, then submit your deposit request details for admin confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          <div>
            <label className="block text-xs text-gray-700 dark:text-slate-400 font-medium mb-1">Deposit Amount ($)</label>
            <Input 
              type="number" 
              className="w-full text-sm py-2.5" 
              placeholder="Amount ($)" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              disabled={paymentMethods.length === 0}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 dark:text-slate-400 font-medium mb-1">Selected Payment Method</label>
            {paymentMethods.length > 0 ? (
              <select 
                className="w-full p-2.5 border border-input bg-transparent rounded-md text-sm dark:text-white dark:bg-slate-900" 
                value={selectedMethodId} 
                onChange={e => setSelectedMethodId(e.target.value)}
              >
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.type === 'BANKING' 
                      ? `[Bank Transfer] ${pm.name} (${pm.bankName || ''})`
                      : pm.type === 'UPI'
                      ? `[UPI] ${pm.name} (${pm.upiId || ''})`
                      : `[Crypto] ${pm.name} (${pm.network || 'BEP-20'})`
                    } {pm.isDefault ? '— Default' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <Input 
                type="text" 
                disabled 
                value="Deposit Payment Methods Unavailable"
                className="w-full text-sm py-2.5 bg-gray-100 dark:bg-slate-900 text-gray-500" 
              />
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-700 dark:text-slate-400 font-medium mb-1">Proof Data (Transaction Hash / Bank UTR / UPI Ref No)</label>
            <Input 
              className="w-full text-sm py-2.5" 
              placeholder="Paste Transaction Hash, Bank UTR No, or UPI Ref ID" 
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
              disabled={paymentMethods.length === 0}
            />
          </div>

          <Button 
            onClick={handleDeposit} 
            className="w-full sm:w-auto" 
            disabled={isSubmitting || paymentMethods.length === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
          </Button>
        </CardContent>
      </Card>

      {/* Deposit History */}
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle className="text-base sm:text-lg">Deposit History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted">
                      <p className="text-2xl mb-1">📥</p>
                      <p className="text-sm">No deposit history yet.</p>
                    </td>
                  </tr>
                ) : (
                  deposits.map((d: any) => (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-xs">{d.id.substring(0, 8)}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">${Number(d.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-xs max-w-[250px] truncate" title={d.method}>{d.method}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* UI Popup / Toast */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in border border-gray-200 dark:border-slate-700">
            <div className="text-center">
              <p className="text-4xl mb-2">
                {messageType === 'success' ? '✅' : '❌'}
              </p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {messageType === 'success' ? 'Success' : 'Error'}
              </h3>
              <p className="text-sm text-muted mt-2">{message}</p>
            </div>
            <Button 
              onClick={() => setShowPopup(false)} 
              className="w-full"
              variant={messageType === 'success' ? 'primary' : 'danger'}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

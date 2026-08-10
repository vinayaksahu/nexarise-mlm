'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PaymentMethod {
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
}

export default function DepositsPage() {
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [proofUrl, setProofUrl] = useState('');
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPopup, setShowPopup] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const fetchDepositsAndMethods = async () => {
    try {
      const [resDep, resPlan, resMethods] = await Promise.all([
        fetch('/api/deposits'),
        fetch('/api/business-plan'),
        fetch('/api/payment-methods')
      ]);

      if (resDep.ok) {
        const data = await resDep.json();
        setDeposits(Array.isArray(data) ? data : []);
      }
      if (resPlan.ok) {
        const planData = await resPlan.json();
        setConfig(planData);
      }
      if (resMethods.ok) {
        const methodsData = await resMethods.json();
        const methodsList: PaymentMethod[] = methodsData.methods || [];
        setPaymentMethods(methodsList);

        if (methodsList.length > 0) {
          const defaultMethod = methodsList.find(m => m.isDefault) || methodsList[0];
          setSelectedMethodId(defaultMethod.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch deposits/methods:', err);
    }
  };

  useEffect(() => {
    fetchDepositsAndMethods();
  }, []);

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId) || paymentMethods[0];

  // Fallback if no dynamic payment methods exist in DB
  const fallbackAddress = config?.depositAddress || '0x1234567890abcdef1234567890abcdef12345678';
  const displayAddress = selectedMethod?.walletAddress || fallbackAddress;
  const displayNetwork = selectedMethod?.network || 'BEP-20';
  const displayName = selectedMethod ? `${selectedMethod.name} (${selectedMethod.network})` : 'USDT (BEP-20)';
  const displayQr = selectedMethod?.qrCodeUrl || config?.depositQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(displayAddress)}`;
  const displayInstructions = selectedMethod?.instructions || '';

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      setMessage('Please enter a valid deposit amount');
      setMessageType('error');
      setShowPopup(true);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const formattedMethodString = selectedMethod 
      ? `${selectedMethod.name} (${selectedMethod.network}) - ${selectedMethod.walletAddress}`
      : 'USDT (BEP-20)';

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposits</h1>
        <p className="text-muted text-xs sm:text-sm mt-0.5">
          Deposit crypto funds to your P2P Wallet using any active payment network below.
        </p>
      </div>

      {/* Dynamic Payment Method Selector Tabs/Cards */}
      {paymentMethods.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Payment Network</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {paymentMethods.map(pm => (
              <button
                key={pm.id}
                onClick={() => setSelectedMethodId(pm.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedMethodId === pm.id 
                    ? 'bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50' 
                    : 'bg-card border-border hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{pm.name}</span>
                  <Badge variant="default" className="text-[10px] bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {pm.network}
                  </Badge>
                </div>
                {pm.isDefault && (
                  <span className="text-[10px] text-emerald-400 font-medium mt-1">⭐ Default</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Prominent Payment Details Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <Card className="sm:col-span-2 lg:col-span-1 border-indigo-500/30">
          <CardHeader className="p-3 sm:p-4 pb-1">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{displayName} Payment</span>
              <Badge variant="info">{displayNetwork}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1 space-y-3 text-center">
            <div className="bg-white p-2.5 rounded-xl inline-block border border-slate-700 shadow-md">
              <img 
                src={displayQr} 
                alt={`${displayName} Deposit QR Code`} 
                className="w-36 h-36 mx-auto rounded-lg object-contain"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[11px] text-slate-400 font-medium">Deposit Address ({displayNetwork})</label>
              <p className="text-xs font-mono text-slate-200 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                {displayAddress}
              </p>
            </div>

            {displayInstructions && (
              <p className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800 text-left">
                ℹ️ {displayInstructions}
              </p>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs py-2 font-medium" 
              onClick={() => {
                navigator.clipboard.writeText(displayAddress);
                setMessage(`${displayNetwork} deposit address copied to clipboard!`);
                setMessageType('success');
                setShowPopup(true);
              }}
            >
              📋 Copy Deposit Address
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Request Form */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <CardTitle className="text-base sm:text-lg">Submit Deposit Request</CardTitle>
          <CardDescription className="text-xs">
            Send your payment to the address above, then submit your deposit request details for admin confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Deposit Amount ($)</label>
            <Input 
              type="number" 
              className="w-full text-sm py-2.5" 
              placeholder="Amount ($)" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Payment Method & Network</label>
            {paymentMethods.length > 0 ? (
              <select 
                className="w-full p-2.5 border border-input bg-transparent rounded-md text-sm dark:text-white dark:bg-slate-900" 
                value={selectedMethodId} 
                onChange={e => setSelectedMethodId(e.target.value)}
              >
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.network}) {pm.isDefault ? '— Default' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <Input 
                type="text" 
                disabled 
                value="USDT (BEP-20)"
                className="w-full text-sm py-2.5 bg-slate-900" 
              />
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Proof URL (Transaction Hash / ID)</label>
            <Input 
              className="w-full text-sm py-2.5" 
              placeholder="Paste transaction hash or BSCScan/Explorer URL" 
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
            />
          </div>

          <Button onClick={handleDeposit} className="w-full sm:w-auto" disabled={isSubmitting}>
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
                      <td className="py-2.5 px-3 text-xs max-w-[200px] truncate" title={d.method}>{d.method}</td>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-fade-in border border-slate-700">
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

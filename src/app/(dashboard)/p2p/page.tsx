'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function P2PPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Quick PIN modal states
  const [pinPassword, setPinPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinModalMsg, setPinModalMsg] = useState('');
  const [pinModalSubmitting, setPinModalSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [configData, walletData, historyData] = await Promise.all([
        fetch('/api/business-plan').then(r => r.json()),
        fetch('/api/wallet').then(r => r.json()),
        fetch('/api/p2p/history').then(r => r.json())
      ]);
      setConfig(configData);
      if (walletData.wallet) setWallet(walletData.wallet);
      if (historyData.transactions) setHistory(historyData.transactions);
      else if (Array.isArray(historyData)) setHistory(historyData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const numAmount = Number(amount) || 0;
  const feePercent = 0;
  const fee = 0;
  const netReceived = numAmount;

  const handleTransfer = async () => {
    setMessage('');
    if (!recipient.trim()) {
      setMessage('Recipient username / email / referral code is required');
      return;
    }
    if (!amount || numAmount <= 0) {
      setMessage('Please enter a valid transfer amount');
      return;
    }
    if (!pin) {
      setMessage('Transaction PIN is required');
      return;
    }

    setIsTransferring(true);
    try {
      const res = await fetch('/api/p2p/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: recipient.trim(), amount: numAmount, pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Transfer successful! 🎉');
        setRecipient('');
        setAmount('');
        setPin('');
        loadData();
      } else {
        setMessage(data.error || 'Transfer failed');
        if (data.error && data.error.includes('PIN')) {
          // Highlight set pin link option
        }
      }
    } catch (err) {
      setMessage('Error processing transfer');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleQuickSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinModalMsg('');
    if (!/^\d{6}$/.test(newPin)) {
      setPinModalMsg('PIN must be exactly 6 digits');
      return;
    }
    if (!pinPassword) {
      setPinModalMsg('Account password is required');
      return;
    }

    setPinModalSubmitting(true);
    try {
      const res = await fetch('/api/security/transaction-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin, currentPassword: pinPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinModalMsg('PIN set successfully! You can now use your PIN below.');
        setTimeout(() => {
          setShowPinModal(false);
          setPin(newPin);
          setPinPassword('');
          setNewPin('');
          setPinModalMsg('');
        }, 1500);
      } else {
        setPinModalMsg(data.error || 'Failed to set PIN');
      }
    } catch (e) {
      setPinModalMsg('Error setting PIN');
    } finally {
      setPinModalSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">P2P Transfer</h1>
        <p className="text-sm text-muted mt-1">
          Available P2P Balance: <span className="font-bold text-cyan-600 dark:text-cyan-400">${Number(wallet?.p2pBalance || 0).toFixed(2)}</span>
        </p>
      </div>
      
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Transfer Funds</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input 
            className="w-full text-sm py-2.5" 
            placeholder="Recipient Username" 
            value={recipient} 
            onChange={e => setRecipient(e.target.value)} 
          />
          <Input 
            className="w-full text-sm py-2.5" 
            type="number" 
            placeholder="Amount" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
          />
          
          {numAmount > 0 && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs sm:text-sm text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Source:</span> <span className="font-medium text-cyan-400">Your P2P Wallet</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span> <span className="font-medium text-emerald-400">{recipient || 'Recipient'} (P2P Wallet)</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction Fee:</span> <span className="font-bold text-emerald-400">$0.00 (No Fee)</span>
              </div>
              <div className="flex justify-between border-t border-cyan-500/20 pt-1 font-bold">
                <span>Total Amount Sent:</span> <span className="text-cyan-400">${numAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Input 
              className="w-full text-sm py-2.5" 
              type="password" 
              placeholder="6-digit Transaction PIN" 
              maxLength={6} 
              value={pin} 
              onChange={e => setPin(e.target.value)} 
            />
            <div className="flex justify-between items-center text-xs pt-1">
              <button 
                type="button" 
                onClick={() => setShowPinModal(true)} 
                className="text-primary hover:underline font-medium"
              >
                🔑 Set or Update PIN
              </button>
              <Link href="/settings" className="text-slate-400 hover:text-slate-200 underline">
                Go to Account Settings →
              </Link>
            </div>
          </div>

          {message && (
            <p className={`text-sm ${message.includes('Error') || message.includes('failed') || message.includes('required') ? 'text-red-500 font-medium' : 'text-emerald-500 font-bold'}`}>
              {message}
            </p>
          )}

          <Button onClick={handleTransfer} className="w-full sm:w-auto" disabled={isTransferring}>
            {isTransferring ? 'Processing...' : 'Send Funds'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>P2P History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Party</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Fee</th>
                  <th className="py-2.5 px-3">Net Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr className="border-b border-border/50">
                    <td colSpan={6} className="py-6 text-center text-muted">
                      <p className="text-2xl mb-1">🔄</p>
                      <p className="text-sm">No P2P history found.</p>
                    </td>
                  </tr>
                ) : (
                  history.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3">
                        <span className={`font-medium ${tx.type === 'P2P_SENT' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {tx.type === 'P2P_SENT' ? '📤 SENT' : '📥 RECEIVED'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">{tx.type === 'P2P_SENT' ? (tx.metadata?.recipientUsername || tx.receiver?.username || 'Member') : (tx.metadata?.senderUsername || tx.sender?.username || 'Member')}</td>
                      <td className="py-2.5 px-3 font-semibold">${Number(tx.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3">${Number(tx.fee || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">${Number(tx.netAmount || (Number(tx.amount) - Number(tx.fee || 0))).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Set / Update PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full space-y-4 bg-white dark:bg-slate-900 border border-slate-700 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🔑 Set Transaction PIN</span>
              </h3>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleQuickSetPin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Account Password</label>
                <Input 
                  type="password" 
                  required 
                  placeholder="Enter current password" 
                  value={pinPassword} 
                  onChange={e => setPinPassword(e.target.value)} 
                  className="w-full text-sm py-2.5" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">New 6-Digit PIN</label>
                <Input 
                  type="password" 
                  maxLength={6} 
                  required 
                  placeholder="6 digits (e.g. 123456)" 
                  value={newPin} 
                  onChange={e => setNewPin(e.target.value)} 
                  className="w-full text-sm py-2.5" 
                />
              </div>

              {pinModalMsg && (
                <p className={`text-xs ${pinModalMsg.includes('successfully') ? 'text-emerald-500 font-bold' : 'text-red-500'}`}>
                  {pinModalMsg}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPinModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pinModalSubmitting}>
                  {pinModalSubmitting ? 'Saving...' : 'Save PIN'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

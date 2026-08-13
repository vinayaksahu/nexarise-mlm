'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { User, Mail, Users, Key, ArrowRight, ShieldCheck, Check, AlertTriangle } from 'lucide-react';

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

  // Recipient live lookup states
  const [lookingUp, setLookingUp] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState<any>(null);

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

  // Live lookup recipient info on input change
  useEffect(() => {
    const trimmed = recipient.trim();
    if (trimmed.length < 2) {
      setRecipientInfo(null);
      setLookingUp(false);
      return;
    }

    setLookingUp(true);
    const timer = setTimeout(() => {
      fetch(`/api/p2p/lookup-recipient?query=${encodeURIComponent(trimmed)}`)
        .then(r => r.json())
        .then(data => {
          if (data.found) {
            setRecipientInfo(data);
          } else {
            setRecipientInfo(null);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLookingUp(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [recipient]);

  const numAmount = Number(amount) || 0;

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
        setRecipientInfo(null);
        setAmount('');
        setPin('');
        loadData();
      } else {
        setMessage(data.error || 'Transfer failed');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">P2P Transfer</h1>
        <p className="text-sm text-muted mt-1">
          Available P2P Balance: <span className="font-bold text-cyan-600 dark:text-cyan-400">${Number(wallet?.p2pBalance || 0).toFixed(2)}</span>
        </p>
      </div>
      
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Transfer Funds</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Recipient Username / Email / Referral Code</label>
            <div className="relative">
              <Input 
                className="w-full text-sm py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white" 
                placeholder="Enter recipient username or email" 
                value={recipient} 
                onChange={e => setRecipient(e.target.value)} 
              />
              {lookingUp && (
                <div className="absolute right-3 top-2.5 text-xs text-blue-500 animate-pulse font-medium">
                  Checking recipient...
                </div>
              )}
            </div>

            {/* Recipient Details Card */}
            {recipientInfo && (
              <div className="p-3 bg-blue-50/80 dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/30 rounded-xl space-y-1.5 animate-fade-in">
                {recipientInfo.isSelf ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Cannot transfer funds to your own account.</span>
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{recipientInfo.name}</span>
                        <span className="text-gray-500 dark:text-slate-400 font-mono">(@{recipientInfo.username})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{recipientInfo.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {recipientInfo.teamStatus === 'TEAM' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{recipientInfo.levelLabel}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>CrossTeam Member</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Transfer Amount ($)</label>
            <Input 
              className="w-full text-sm py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white" 
              type="number" 
              placeholder="Enter amount" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
          </div>
          
          {numAmount > 0 && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs sm:text-sm text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Source:</span> <span className="font-medium text-cyan-400">Your P2P Wallet</span>
              </div>
              <div className="flex justify-between">
                <span>Destination:</span> <span className="font-medium text-emerald-400">{recipientInfo?.name ? `${recipientInfo.name} (@${recipientInfo.username})` : (recipient || 'Recipient')}</span>
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
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300">Transaction PIN</label>
            <Input 
              className="w-full text-sm py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white" 
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
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Set or Update PIN</span>
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

          <Button onClick={handleTransfer} className="w-full sm:w-auto font-bold" disabled={isTransferring || (recipientInfo && recipientInfo.isSelf)}>
            {isTransferring ? 'Processing Transfer...' : 'Send Funds'}
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
                      <p className="text-sm font-medium">No P2P history found.</p>
                    </td>
                  </tr>
                ) : (
                  history.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${tx.type === 'P2P_SENT' ? 'text-red-400' : 'text-emerald-400'}`}>
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

      {/* Quick Set / Update PIN Modal - Centered and Frozen in Screen Center */}
      {showPinModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-left text-gray-900 dark:text-white relative z-[100000] my-auto animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                <span>Set Transaction PIN</span>
              </h3>
              <button onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-white font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleQuickSetPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Account Password</label>
                <Input 
                  type="password" 
                  required 
                  placeholder="Enter current password" 
                  value={pinPassword} 
                  onChange={e => setPinPassword(e.target.value)} 
                  className="w-full text-sm py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">New 6-Digit PIN</label>
                <Input 
                  type="password" 
                  maxLength={6} 
                  required 
                  placeholder="6 digits (e.g. 123456)" 
                  value={newPin} 
                  onChange={e => setNewPin(e.target.value)} 
                  className="w-full text-sm py-2.5 bg-white dark:bg-slate-950 text-gray-900 dark:text-white" 
                />
              </div>

              {pinModalMsg && (
                <p className={`text-xs font-bold ${pinModalMsg.includes('successfully') ? 'text-emerald-500' : 'text-red-500'}`}>
                  {pinModalMsg}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPinModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pinModalSubmitting} className="font-bold">
                  {pinModalSubmitting ? 'Saving...' : 'Save PIN'}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

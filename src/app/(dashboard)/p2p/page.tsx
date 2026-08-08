'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function P2PPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/business-plan').then(r => r.json()),
      fetch('/api/wallet').then(r => r.json()),
      fetch('/api/p2p/history').then(r => r.json())
    ]).then(([configData, walletData, historyData]) => {
      setConfig(configData);
      if (walletData.wallet) setWallet(walletData.wallet);
      if (historyData.transactions) setHistory(historyData.transactions);
      else if (Array.isArray(historyData)) setHistory(historyData);
    });
  }, []);

  const numAmount = Number(amount) || 0;
  const feePercent = config?.p2pFeePercentage || 0;
  const fee = numAmount * (feePercent / 100);

  const handleTransfer = async () => {
    setMessage('');
    setIsTransferring(true);
    try {
      const res = await fetch('/api/p2p/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, amount: Number(amount), pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Transfer successful!');
        setRecipient('');
        setAmount('');
        setPin('');
        
        Promise.all([
          fetch('/api/wallet').then(r => r.json()),
          fetch('/api/p2p/history').then(r => r.json())
        ]).then(([walletData, historyData]) => {
          if (walletData.wallet) setWallet(walletData.wallet);
          if (historyData.transactions) setHistory(historyData.transactions);
          else if (Array.isArray(historyData)) setHistory(historyData);
        });
      } else {
        setMessage(data.error || 'Transfer failed');
      }
    } catch (err) {
      setMessage('Error processing transfer');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">P2P Transfer</h1>
        <p className="text-sm text-muted mt-1">Available P2P Balance: <span className="font-bold text-cyan-600 dark:text-cyan-400">${Number(wallet?.p2pBalance || 0).toFixed(2)}</span></p>
      </div>
      
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Transfer Funds</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <Input className="w-full text-sm py-2.5" placeholder="Recipient Username / Email / Referral Code" value={recipient} onChange={e => setRecipient(e.target.value)} />
          <Input className="w-full text-sm py-2.5" type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          
          {config?.showP2pFee && (
            <p className="text-sm">Fee: ${fee.toFixed(2)} ({feePercent}%) | Net Deducted: ${(numAmount + fee).toFixed(2)}</p>
          )}

          <Input className="w-full text-sm py-2.5" type="password" placeholder="6-digit Transaction PIN" maxLength={6} value={pin} onChange={e => setPin(e.target.value)} />
          {message && <p className={`text-sm ${message.includes('Error') || message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
          <Button onClick={handleTransfer} className="w-full sm:w-auto" disabled={isTransferring}>
            {isTransferring ? 'Processing...' : 'Send Funds'}
          </Button>
          <p className="text-sm"><a href="#" className="text-blue-500 hover:underline">Set or Update PIN</a></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>P2P History</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2.5 px-3">Type</th><th className="py-2.5 px-3">Party</th><th className="py-2.5 px-3">Amount</th><th className="py-2.5 px-3">Fee</th><th className="py-2.5 px-3">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr className="border-b border-border/50">
                    <td colSpan={5} className="py-4 text-center text-muted">No P2P history found.</td>
                  </tr>
                ) : (
                  history.map((tx: any) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3"><span className="font-medium">{tx.type}</span></td>
                      <td className="py-2.5 px-3">{tx.type === 'P2P_SENT' ? tx.metadata?.recipientUsername : tx.metadata?.senderUsername}</td>
                      <td className="py-2.5 px-3">${Number(tx.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3">${Number(tx.fee || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">${(Number(tx.amount) - (tx.type === 'P2P_SENT' ? Number(tx.fee || 0) : 0)).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

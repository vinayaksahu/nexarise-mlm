'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [category, setCategory] = useState('Investment');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support');
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject, message })
      });
      if (res.ok) {
        setSubject('');
        setMessage('');
        fetchTickets();
        alert('Ticket created successfully');
      } else {
        alert('Failed to create ticket');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Support</h1>
      
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Create New Ticket</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full p-2 border border-input bg-transparent rounded-md text-sm py-2.5" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Investment</option>
                <option>Withdrawal</option>
                <option>Deposit</option>
                <option>Account</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input className="w-full text-sm py-2.5" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea 
                className="w-full p-2 border border-input bg-transparent rounded-md min-h-[100px] text-sm py-2.5 px-3" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Submit Ticket</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>My Tickets</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border border-border p-4 rounded-xl shadow-sm bg-gray-50 dark:bg-slate-900">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{ticket.subject}</h3>
                  <Badge variant={ticket.status === 'OPEN' ? 'default' : ticket.status === 'RESOLVED' ? 'success' : 'warning'}>
                    {ticket.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Category: {ticket.category} | Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                <p className="mb-2">{ticket.message}</p>
                {ticket.adminNotes && (
                  <div className="bg-gray-100 p-3 rounded mt-2 text-sm">
                    <strong>Admin Note:</strong> {ticket.adminNotes}
                  </div>
                )}
              </div>
            ))}
            {tickets.length === 0 && <p>No tickets found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

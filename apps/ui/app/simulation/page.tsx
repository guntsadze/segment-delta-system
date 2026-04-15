'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Play, FastForward, PlusCircle, Database, Terminal, CheckCircle2 } from 'lucide-react';

export default function SimulationPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState(100);
  const [days, setDays] = useState(30);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  // წამოვიღოთ ყველა მომხმარებელი ბექენდიდან
  apiFetch('/segments/all/customers')
    .then(data => {
      setCustomers(data);
      if (data.length > 0) setSelectedCustomer(data[0].id);
    })
    .catch(err => console.error("Error loading customers:", err));

  // სოკეტის ნაწილი უცვლელი რჩება...
  socket.on('segment:counts_update', ({ segmentId, delta }) => {
    // ...
  });

  return () => { socket.off('segment:counts_update'); };
}, []);

  const addTransaction = async () => {
    setLoading(true);
    await apiFetch('/simulation/transaction', {
      method: 'POST',
      body: JSON.stringify({ customerId: selectedCustomer, amount })
    });
    setLoading(false);
    addLocalLog(`Added $${amount} transaction for customer.`);
  };

  const advanceTime = async () => {
    setLoading(true);
    await apiFetch('/simulation/advance-time', {
      method: 'POST',
      body: JSON.stringify({ days })
    });
    setLoading(false);
    addLocalLog(`Advanced time by ${days} days!`);
  };

  const addLocalLog = (msg: string) => {
    setLogs(prev => [{ id: Math.random(), time: new Date().toLocaleTimeString(), message: msg, type: 'action' }, ...prev]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Play className="text-blue-600" /> System Simulation
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* მარცხენა მხარე: მართვის პანელი */}
        <div className="space-y-6">
          
          {/* Card 1: Add Transaction */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <PlusCircle size={18} className="text-green-500" /> Add Transaction
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Select Customer</label>
                <select 
                  className="w-full p-2 border rounded-lg bg-slate-50"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg bg-slate-50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <button 
                onClick={addTransaction}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Execute Transaction'}
              </button>
            </div>
          </div>

          {/* Card 2: Advance Time */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FastForward size={18} className="text-orange-500" /> Advance Time
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              This will "age" all transactions. Use it to see users exit "Active" segments.
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Days to move</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg bg-slate-50"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                />
              </div>
              <button 
                onClick={advanceTime}
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition"
              >
                Travel in Time
              </button>
            </div>
          </div>

        </div>

        {/* მარჯვენა მხარე: სისტემური ლოგი */}
        <div className="bg-slate-900 rounded-xl p-6 text-white font-mono text-sm h-[540px] flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-blue-400" />
              <span>Global Event Log</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left duration-300">
                <span className="text-slate-500">[{log.time}]</span>
                <span className={log.type === 'update' ? 'text-green-400' : 'text-blue-300'}>
                  {log.type === 'update' ? <CheckCircle2 size={14} className="inline mr-1" /> : '>'} 
                  {log.message}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-slate-600 italic">Listening for system events...</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
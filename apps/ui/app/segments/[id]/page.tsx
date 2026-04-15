'use client';
import {  useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Users, UserPlus, UserMinus, RefreshCw, Clock, ChevronLeft, Activity } from 'lucide-react';
import Link from 'next/link';

export default function SegmentDetailPage() {
  const { id } = useParams();
  const [segment, setSegment] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]); // რეალურ დროში მომხდარი ცვლილებები
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. მონაცემების წამოღება
    Promise.all([
      apiFetch(`/segments/${id}`),
      apiFetch(`/segments/${id}/members`),
      apiFetch(`/segments/${id}/deltas`)
    ]).then(([seg, mems, deltas]) => {
      setSegment(seg);
      setMembers(mems.data);
      setLoading(false);
      // ისტორიული დელტებიდან შევქმნათ საწყისი ფიდი (თუ გვინდა)
    });

    // 2. შევუერთდეთ სოკეტის "ოთახს" ამ კონკრეტული სეგმენტისთვის
    socket.emit('join-segment', id);

    // 3. მოვუსმინოთ დელტა ცვლილებებს
    socket.on('segment:delta', (delta) => {
      console.log('New Delta Received:', delta);
      
      // დავამატოთ ახალი ივენთი ფიდის თავში
      setFeed(prev => [{
        id: Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        added: delta.added,
        removed: delta.removed,
        triggeredBy: delta.triggeredBy
      }, ...prev].slice(0, 20)); // მხოლოდ ბოლო 20 ივენთი შევინახოთ

      // ავტომატურად გადავტვირთოთ წევრების სია, რომ სინქრონში ვიყოთ
      apiFetch(`/segments/${id}/members`).then(res => setMembers(res.data));
    });

    return () => {
      socket.emit('leave-segment', id);
      socket.off('segment:delta');
    };
  }, [id]);

  const handleRefresh = async () => {
    await apiFetch(`/segments/${id}/refresh`, { method: 'POST' });
  };

  if (loading) return <div className="p-8 text-center">Loading Segment...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <Link href="/segments" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition">
        <ChevronLeft size={20} /> Back to Segments
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{segment.name}</h1>
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">{segment.type}</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Users size={16} /> {members.length} Total Members
            </span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw size={18} /> Refresh Now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* მარცხენა მხარე: წევრების სია */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 font-semibold">Current Members</div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium">{member.name}</td>
                  <td className="px-6 py-4 text-slate-500">{member.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">Recently</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No members found in this segment</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* მარჯვენა მხარე: LIVE DELTA FEED */}
        <div className="bg-slate-900 rounded-xl shadow-xl p-6 text-white overflow-hidden flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Delta Feed
            </h3>
            <span className="text-xs text-slate-400 tracking-widest uppercase">Real-time</span>
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {feed.map((event) => (
              <div key={event.id} className="border-l-2 border-slate-700 pl-4 py-1 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1">
                  <Clock size={10} /> {event.timestamp} — {event.triggeredBy}
                </div>
                
                {/* ვინ დაემატა */}
                {event.added.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-green-400 mb-1">
                    <UserPlus size={14} className="mt-1 flex-shrink-0" />
                    <span>+{event.added.length} joined the segment</span>
                  </div>
                )}

                {/* ვინ გავიდა */}
                {event.removed.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-red-400">
                    <UserMinus size={14} className="mt-1 flex-shrink-0" />
                    <span>-{event.removed.length} left the segment</span>
                  </div>
                )}
              </div>
            ))}

            {feed.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
                <Activity size={40} className="mb-2 opacity-20" />
                <p className="text-sm">Waiting for changes...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

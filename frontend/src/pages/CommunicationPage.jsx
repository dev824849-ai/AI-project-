import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Radio, Send, ShieldAlert, 
  CheckCircle2, Clock, Check, ArrowRight, Bell 
} from 'lucide-react';
import { messageService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const CommunicationPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState('bharati');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [msgType, setMsgType] = useState('STANDARD');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await messageService.getMessages();
      setMessages(data || []);
    } catch (e) {
      console.error('Error fetching messages', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !body) return;
    setSending(true);
    try {
      await messageService.sendMessage({
        station_id: recipient,
        sender_id: user?.username || 'admin',
        sender_name: user?.full_name || 'India Control HQ',
        sender_role: user?.role || 'SUPER_ADMIN',
        recipient_station: recipient,
        message_type: msgType,
        priority: msgType === 'EMERGENCY_BROADCAST' ? 'FLASH_PRIORITY' : 'NORMAL',
        subject,
        body
      });
      setSubject('');
      setBody('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send satellite message');
    } finally {
      setSending(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await messageService.acknowledgeMessage(id, user?.full_name || 'Station Leader');
      fetchMessages();
    } catch (err) {
      alert('Failed to acknowledge message');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-polar-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide font-mono">
              INDIA ↔ ANTARCTIC SECURE COMMS HUB
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono">
              GSAT Satellite Link
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Encrypted mission directives, emergency broadcasts, and operational acknowledgments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Dispatch Console (5 cols) */}
        <div className="lg:col-span-5 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl font-mono">
          <div className="flex items-center space-x-2 border-b border-polar-800 pb-3 mb-4">
            <Send className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Transmit Satellite Message
            </h3>
          </div>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Recipient Station</label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="bharati">Bharati Station (Larsemann Hills)</option>
                <option value="maitri">Maitri Station (Schirmacher Oasis)</option>
                <option value="ALL">BROADCAST TO ALL ANTARCTIC STATIONS</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Message Classification</label>
              <select
                value={msgType}
                onChange={(e) => setMsgType(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="STANDARD">STANDARD DIRECTIVE</option>
                <option value="EMERGENCY_BROADCAST">EMERGENCY BROADCAST / FLASH</option>
                <option value="WEATHER_BULLETIN">WEATHER WARNING BULLETIN</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Subject Line</label>
              <input
                type="text"
                required
                placeholder="e.g. Prepare for incoming Blizzard Gale & fuel conservation"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Directive Body</label>
              <textarea
                required
                rows={4}
                placeholder="Type operational instruction or coordination bulletin..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-polar-950 border border-polar-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-polar-950 font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Transmitting to Polar Orbit...' : 'Transmit via GSAT-14 Uplink'}</span>
            </button>
          </form>
        </div>

        {/* Right: Message Stream Feed (7 cols) */}
        <div className="lg:col-span-7 bg-polar-900 border border-polar-800 rounded-2xl p-5 shadow-xl font-mono">
          <div className="flex items-center justify-between border-b border-polar-800 pb-3 mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Satellite Message Log & Acknowledgments
            </h3>
            <span className="text-[10px] text-slate-400">Total {messages.length} Dispatches</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {messages.map((m) => {
              const isFlash = m.message_type === 'EMERGENCY_BROADCAST';
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border bg-polar-950/80 space-y-2 text-xs ${
                    isFlash ? 'border-rose-500/80 bg-rose-950/20' : 'border-polar-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isFlash ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {m.message_type}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          TO: {m.recipient_station}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm mt-1">{m.subject}</h4>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs bg-polar-900 p-2.5 rounded-lg border border-polar-800/80">
                    {m.body}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Sender: {m.sender_name}</span>

                    {m.is_acknowledged ? (
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACK by {m.acknowledged_by}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(m.id)}
                        className="px-2.5 py-1 rounded bg-polar-800 hover:bg-emerald-500 hover:text-polar-950 text-slate-300 font-bold transition flex items-center space-x-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Acknowledge Message</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';

interface Message {
  id: string;
  source: 'contact' | 'brief' | 'calculator' | 'telegram' | 'other';
  status: 'new' | 'read' | 'replied' | 'archived';
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  body: string;
  metadata?: Record<string, unknown>;
  page?: string;
  locale?: string;
  telegramSent?: boolean;
  createdAt: string;
  readAt?: string;
  readBy?: string;
  repliedAt?: string;
  repliedBy?: string;
}

interface Counts {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

const SOURCE_COLORS: Record<string, string> = {
  contact: 'bg-blue-500/20 text-blue-400',
  brief: 'bg-purple-500/20 text-purple-400',
  calculator: 'bg-green-500/20 text-green-400',
  telegram: 'bg-cyan-500/20 text-cyan-400',
  other: 'bg-gray-500/20 text-gray-400',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500/20 text-yellow-400',
  read: 'bg-blue-500/20 text-blue-400',
  replied: 'bg-green-500/20 text-green-400',
  archived: 'bg-gray-500/20 text-gray-400',
};

const SOURCE_ICONS: Record<string, string> = {
  contact: '💬',
  brief: '📋',
  calculator: '🧮',
  telegram: '📱',
  other: '📨',
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, new: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      if (searchQuery) params.append('search', searchQuery);

      const url = `/api/admin/messages${params.toString() ? `?${params}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setMessages(data.messages);
      setCounts(data.counts);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, sourceFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchMessages, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setMessages(prev =>
          prev.map(m => (m.id === id ? { ...m, status: status as Message['status'] } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, status: status as Message['status'] });
        }
        fetchMessages(); // Refresh counts
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        fetchMessages(); // Refresh counts
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      updateStatus(message.id, 'read');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-text-muted text-sm mt-1">
            {counts.new > 0 ? (
              <span className="text-yellow-400">{counts.new} new message{counts.new !== 1 ? 's' : ''}</span>
            ) : (
              'All caught up!'
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'total', label: 'Total', color: 'bg-surface-hover' },
          { key: 'new', label: 'New', color: 'bg-yellow-500/20' },
          { key: 'read', label: 'Read', color: 'bg-blue-500/20' },
          { key: 'replied', label: 'Replied', color: 'bg-green-500/20' },
          { key: 'archived', label: 'Archived', color: 'bg-gray-500/20' },
        ].map(stat => (
          <div key={stat.key} className={`${stat.color} rounded-lg p-3 border border-border`}>
            <div className="text-xl font-bold text-foreground">{counts[stat.key as keyof Counts]}</div>
            <div className="text-text-muted text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-surface-muted border border-border rounded-lg px-4 py-2 text-foreground placeholder-text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'read', 'replied', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-hover'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'contact', 'brief', 'calculator'].map(source => (
            <button
              key={source}
              onClick={() => setSourceFilter(source)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                sourceFilter === source
                  ? 'bg-purple-500 text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-hover'
              }`}
            >
              {source === 'all' ? 'All Sources' : source}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Message List */}
        <div className="w-full md:w-1/2 lg:w-2/5 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg border border-border">
              <p className="text-text-muted">No messages found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map(message => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-accent/20 border-accent'
                      : message.status === 'new'
                      ? 'bg-surface border-yellow-500/30 hover:border-yellow-500/50'
                      : 'bg-surface border-border hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span>{SOURCE_ICONS[message.source] || '📨'}</span>
                      <span className={`font-medium ${message.status === 'new' ? 'text-foreground' : 'text-foreground'}`}>
                        {message.name}
                      </span>
                      {message.status === 'new' && (
                        <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                      )}
                    </div>
                    <span className="text-text-muted text-xs whitespace-nowrap">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="text-text-muted text-sm truncate mb-2">
                    {message.subject || message.body}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${SOURCE_COLORS[message.source]}`}>
                      {message.source}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[message.status]}`}>
                      {message.status}
                    </span>
                    {message.telegramSent && (
                      <span className="text-cyan-400 text-xs">📱 sent</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="hidden md:block flex-1 overflow-y-auto">
          {selectedMessage ? (
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selectedMessage.name}</h2>
                  <a href={`mailto:${selectedMessage.email}`} className="text-accent hover:underline">
                    {selectedMessage.email}
                  </a>
                  {selectedMessage.phone && (
                    <div className="text-text-muted text-sm">
                      <a href={`tel:${selectedMessage.phone}`} className="hover:text-foreground">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedMessage.status}
                    onChange={e => updateStatus(selectedMessage.id, e.target.value)}
                    disabled={updating === selectedMessage.id}
                    className="bg-surface-muted border border-border rounded px-2 py-1 text-sm text-foreground"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs ${SOURCE_COLORS[selectedMessage.source]}`}>
                  {SOURCE_ICONS[selectedMessage.source]} {selectedMessage.source}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[selectedMessage.status]}`}>
                  {selectedMessage.status}
                </span>
                {selectedMessage.telegramSent && (
                  <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400">
                    📱 Telegram sent
                  </span>
                )}
              </div>

              {selectedMessage.subject && (
                <div className="mb-4">
                  <div className="text-text-muted text-xs uppercase mb-1">Subject</div>
                  <div className="text-foreground">{selectedMessage.subject}</div>
                </div>
              )}

              <div className="mb-6">
                <div className="text-text-muted text-xs uppercase mb-1">Message</div>
                <div className="text-foreground whitespace-pre-wrap bg-surface-muted rounded-lg p-4 border border-border">
                  {selectedMessage.body || '(no message)'}
                </div>
              </div>

              {selectedMessage.metadata && Object.keys(selectedMessage.metadata).length > 0 && (
                <div className="mb-6">
                  <div className="text-text-muted text-xs uppercase mb-2">Additional Data</div>
                  <div className="bg-surface-muted rounded-lg p-4 border border-border space-y-2">
                    {Object.entries(selectedMessage.metadata).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-text-muted w-32 flex-shrink-0">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:
                        </span>
                        <span className="text-foreground">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 text-xs text-text-muted space-y-1">
                <div>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</div>
                {selectedMessage.page && <div>Page: {selectedMessage.page}</div>}
                {selectedMessage.readAt && (
                  <div>Read: {new Date(selectedMessage.readAt).toLocaleString()} by {selectedMessage.readBy}</div>
                )}
                {selectedMessage.repliedAt && (
                  <div>Replied: {new Date(selectedMessage.repliedAt).toLocaleString()} by {selectedMessage.repliedBy}</div>
                )}
                <div className="font-mono opacity-50">ID: {selectedMessage.id}</div>
              </div>

              <div className="mt-6 flex gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}`}
                  onClick={() => updateStatus(selectedMessage.id, 'replied')}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Reply via Email
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Call
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-surface rounded-lg border border-border">
              <p className="text-text-muted">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

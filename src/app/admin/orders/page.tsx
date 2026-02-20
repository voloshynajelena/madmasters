'use client';

import { useEffect, useState } from 'react';

interface Order {
  id: string;
  type: 'brief' | 'calculator' | 'contact';
  status: 'new' | 'reviewed' | 'archived';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  data?: Record<string, unknown>;
  locale: string;
  page: string;
  createdAt: string;
}

interface Counts {
  new: number;
  reviewed: number;
  archived: number;
  total: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Counts>({ new: 0, reviewed: 0, archived: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'brief' | 'calculator' | 'contact'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, typeFilter]);

  const updateStatus = async (id: string, status: 'new' | 'reviewed' | 'archived') => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const typeColors = {
    brief: 'bg-purple-500/20 text-purple-400',
    calculator: 'bg-blue-500/20 text-blue-400',
    contact: 'bg-green-500/20 text-green-400',
  };

  const statusColors = {
    new: 'bg-yellow-500/20 text-yellow-400',
    reviewed: 'bg-blue-500/20 text-blue-400',
    archived: 'bg-surface-hover text-text-muted',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-text-muted mt-1">
            {counts.new > 0 && <span className="text-yellow-400">{counts.new} new</span>}
            {counts.new > 0 && ' • '}
            {counts.total} total inquiries
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'new', 'reviewed', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === status
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-hover'
              }`}
            >
              {status}
              {status !== 'all' && counts[status] > 0 && ` (${counts[status]})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'brief', 'calculator', 'contact'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                typeFilter === type
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-hover'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1">
          {loading ? (
            <div className="text-text-muted">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-lg border border-border">
              <p className="text-text-muted">No orders found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-surface rounded-lg p-4 cursor-pointer transition-colors border ${
                    selectedOrder?.id === order.id ? 'ring-2 ring-accent border-accent' : 'border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${typeColors[order.type]}`}>
                          {order.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-foreground font-medium truncate">{order.name}</p>
                      <p className="text-text-muted text-sm truncate">{order.email}</p>
                    </div>
                    <div className="text-text-muted text-xs text-right">
                      {order.createdAt && new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedOrder && (
          <div className="w-96 bg-surface rounded-lg p-6 h-fit sticky top-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs capitalize ${typeColors[selectedOrder.type]}`}>
                  {selectedOrder.type}
                </span>
                <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-text-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-text-muted text-xs uppercase">Name</label>
                <p className="text-foreground">{selectedOrder.name}</p>
              </div>
              <div>
                <label className="text-text-muted text-xs uppercase">Email</label>
                <p className="text-foreground">
                  <a href={`mailto:${selectedOrder.email}`} className="hover:text-accent">
                    {selectedOrder.email}
                  </a>
                </p>
              </div>
              {selectedOrder.phone && (
                <div>
                  <label className="text-text-muted text-xs uppercase">Phone</label>
                  <p className="text-foreground">
                    <a href={`tel:${selectedOrder.phone}`} className="hover:text-accent">
                      {selectedOrder.phone}
                    </a>
                  </p>
                </div>
              )}
              {selectedOrder.message && (
                <div>
                  <label className="text-text-muted text-xs uppercase">Message</label>
                  <p className="text-foreground text-sm whitespace-pre-wrap">{selectedOrder.message}</p>
                </div>
              )}
              {selectedOrder.data && Object.keys(selectedOrder.data).length > 0 && (
                <div>
                  <label className="text-text-muted text-xs uppercase">Additional Data</label>
                  <pre className="text-text-muted text-xs bg-surface-muted rounded p-2 mt-1 overflow-auto">
                    {JSON.stringify(selectedOrder.data, null, 2)}
                  </pre>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-text-muted text-xs uppercase">Locale</label>
                  <p className="text-text-muted">{selectedOrder.locale}</p>
                </div>
                <div>
                  <label className="text-text-muted text-xs uppercase">Page</label>
                  <p className="text-text-muted">{selectedOrder.page}</p>
                </div>
              </div>
              <div>
                <label className="text-text-muted text-xs uppercase">Date</label>
                <p className="text-text-muted">
                  {selectedOrder.createdAt && new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-border">
              <label className="text-text-muted text-xs uppercase mb-2 block">Update Status</label>
              <div className="flex gap-2">
                {selectedOrder.status !== 'reviewed' && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'reviewed')}
                    disabled={updating === selectedOrder.id}
                    className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 disabled:opacity-50 text-sm"
                  >
                    Mark Reviewed
                  </button>
                )}
                {selectedOrder.status !== 'archived' && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'archived')}
                    disabled={updating === selectedOrder.id}
                    className="flex-1 px-3 py-2 bg-surface-hover text-text-muted rounded hover:bg-surface-muted disabled:opacity-50 text-sm"
                  >
                    Archive
                  </button>
                )}
                {selectedOrder.status === 'archived' && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, 'new')}
                    disabled={updating === selectedOrder.id}
                    className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 disabled:opacity-50 text-sm"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from './constants';

export function usePharmacy(hospitalId = 1) {
  const [stats, setStats]   = useState({ pending: 0, stat_orders: 0, dispensed_today: 0, low_stock: 0 });
  const [orders, setOrders] = useState([]);
  const [stock, setStock]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockQ, setStockQ] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/pharmacy/stats?hospital_id=${hospitalId}`);
      if (r.ok) setStats(await r.json());
    } catch {}
  }, [hospitalId]);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/pharmacy/orders?hospital_id=${hospitalId}`);
      if (r.ok) { const d = await r.json(); setOrders(d.orders || []); }
    } catch {}
  }, [hospitalId]);

  const fetchStock = useCallback(async (q = '') => {
    try {
      const url = `${API_BASE}/api/pharmacy/stock?hospital_id=${hospitalId}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
      const r = await fetch(url);
      if (r.ok) { const d = await r.json(); setStock(d.stock || []); }
    } catch {}
  }, [hospitalId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchOrders(), fetchStock()]);
      setLoading(false);
    })();
    const t = setInterval(() => { fetchStats(); fetchOrders(); }, 20000);
    return () => clearInterval(t);
  }, [fetchStats, fetchOrders, fetchStock]);

  const dispense = async (orderId, dispensedBy) => {
    await fetch(`${API_BASE}/api/pharmacy/orders/${orderId}/dispense`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispensed_by: dispensedBy }),
    });
    fetchOrders(); fetchStats(); fetchStock(stockQ);
  };

  const reject = async (orderId) => {
    await fetch(`${API_BASE}/api/pharmacy/orders/${orderId}/reject`, { method: 'PATCH' });
    fetchOrders(); fetchStats();
  };

  const addStock = async (data) => {
    await fetch(`${API_BASE}/api/pharmacy/stock`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, hospital_id: hospitalId }),
    });
    fetchStock(stockQ); fetchStats();
  };

  const updateStock = async (id, data) => {
    await fetch(`${API_BASE}/api/pharmacy/stock/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchStock(stockQ); fetchStats();
  };

  const searchStock = (q) => { setStockQ(q); fetchStock(q); };

  return { stats, orders, stock, loading, dispense, reject, addStock, updateStock, searchStock, stockQ, refetch: () => { fetchStats(); fetchOrders(); fetchStock(stockQ); } };
}

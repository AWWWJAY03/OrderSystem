import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus, triggerJtBooking } from '../services/api';
import config from '../services/config';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [filters, setFilters] = useState({
    paymentStatus: 'all',
    shippingStatus: 'all',
    search: '',
  });
  const [actionLogs, setActionLogs] = useState([]);
  const [showBulkBooking, setShowBulkBooking] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token === config.adminToken) {
      setAuthenticated(true);
      loadOrders();
    }
  }, []);

  const handleLogin = () => {
    if (password === config.adminToken) {
      localStorage.setItem('adminToken', password);
      setAuthenticated(true);
      loadOrders();
    } else {
      alert('Invalid access token');
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders(filters);
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadOrders();
    }
  }, [filters, authenticated]);

  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.OrderID)));
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { PaymentStatus: 'Paid' }, config.adminToken);
      addLog(`Marked order ${orderId} as paid`);
      loadOrders();
    } catch (error) {
      alert('Failed to update order');
    }
  };

  const handleMarkShipped = async (orderId) => {
    try {
      await updateOrderStatus(orderId, { ShippingStatus: 'Shipped' }, config.adminToken);
      addLog(`Marked order ${orderId} as shipped`);
      loadOrders();
    } catch (error) {
      alert('Failed to update order');
    }
  };

  const handleSendEmail = async (orderId) => {
    try {
      // Call API to send email
      const response = await fetch(`${config.apiUrl}/sendEmail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, token: config.adminToken }),
      });
      if (response.ok) {
        addLog(`Sent email for order ${orderId}`);
      }
    } catch (error) {
      alert('Failed to send email');
    }
  };

  const handleJtBooking = async (orderIds) => {
    try {
      setLoading(true);
      const response = await triggerJtBooking(orderIds, config.adminToken);
      addLog(`Triggered J&T booking for ${orderIds.length} order(s)`);
      alert(response.message || 'Booking triggered successfully');
      loadOrders();
    } catch (error) {
      alert('Failed to trigger J&T booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
    };
    setActionLogs([logEntry, ...actionLogs].slice(0, 20));
  };

  const handleDownloadCSV = () => {
    const selectedOrdersData = orders.filter(o => selectedOrders.has(o.OrderID));
    const ordersToExport = selectedOrdersData.length > 0 ? selectedOrdersData : orders;

    const csv = [
      ['Order ID', 'Tracking Number', 'Customer', 'Product', 'Quantity', 'Amount', 'Payment Status', 'Shipping Status', 'Date'].join(','),
      ...ordersToExport.map(order => [
        order.OrderID || '',
        order.TrackingNumber || '',
        order.CustomerName || '',
        order.ProductName || '',
        order.Quantity || '',
        `₱${(order.Price || 0) * (order.Quantity || 1))}`,
        order.PaymentStatus || '',
        order.ShippingStatus || '',
        order.Date || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="card max-w-md w-full">
          <h2 className="text-2xl font-semibold mb-6">Admin Access</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="input-field"
                placeholder="Enter admin token"
              />
            </div>
            <button onClick={handleLogin} className="w-full btn-primary">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !filters.search || 
      (order.CustomerName?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (order.OrderID?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (order.TrackingNumber?.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesPayment = filters.paymentStatus === 'all' || order.PaymentStatus === filters.paymentStatus;
    const matchesShipping = filters.shippingStatus === 'all' || order.ShippingStatus === filters.shippingStatus;

    return matchesSearch && matchesPayment && matchesShipping;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage orders and track shipping</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/')} className="btn-secondary">
            View Store
          </button>
          <button onClick={handleDownloadCSV} className="btn-secondary">
            Download CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="input-field"
          />
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
            className="input-field"
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <select
            value={filters.shippingStatus}
            onChange={(e) => setFilters({...filters, shippingStatus: e.target.value})}
            className="input-field"
          >
            <option value="all">All Shipping</option>
            <option value="Pending">Pending</option>
            <option value="Ready to Ship">Ready to Ship</option>
            <option value="Shipped">Shipped</option>
          </select>
          <button onClick={loadOrders} className="btn-secondary">
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="card mb-6 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">
                {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleJtBooking(Array.from(selectedOrders))}
                className="btn-primary"
              >
                Book Selected via J&T ({selectedOrders.size})
              </button>
              <button
                onClick={() => setSelectedOrders(new Set())}
                className="btn-secondary"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === orders.length}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Order ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Product</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Qty</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Shipping</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center py-8 text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.OrderID} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.OrderID)}
                      onChange={() => handleSelectOrder(order.OrderID)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-4 text-sm">{order.OrderID}</td>
                  <td className="py-3 px-4 text-sm">{order.CustomerName}</td>
                  <td className="py-3 px-4 text-sm">{order.ProductName}</td>
                  <td className="py-3 px-4 text-sm">{order.Quantity}</td>
                  <td className="py-3 px-4 text-sm">₱{(order.Price || 0) * (order.Quantity || 1)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.PaymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.PaymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.ShippingStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                      order.ShippingStatus === 'Ready to Ship' ? 'bg-purple-100 text-purple-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.ShippingStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{order.Date}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMarkPaid(order.OrderID)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-500 hover:text-white text-xs"
                      >
                        Paid
                      </button>
                      <button
                        onClick={() => handleMarkShipped(order.OrderID)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-500 hover:text-white text-xs"
                      >
                        Shipped
                      </button>
                      <button
                        onClick={() => handleJtBooking([order.OrderID])}
                        className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-500 hover:text-white text-xs"
                      >
                        J&T
                      </button>
                      <button
                        onClick={() => handleSendEmail(order.OrderID)}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-500 hover:text-white text-xs"
                      >
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Logs */}
      {actionLogs.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Actions</h2>
          <div className="space-y-2">
            {actionLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

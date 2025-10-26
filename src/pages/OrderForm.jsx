import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProduct, createOrder, getAddresses } from '../services/api';
import { initMayaCheckout } from '../services/paymentService';

const OrderForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('maya');

  // Address dropdowns
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadProvinces();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await getProduct(productId);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const data = await getAddresses('province');
      setProvinces(data || []);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    }
  };

  const handleProvinceChange = async (selectedProvince) => {
    setProvince(selectedProvince);
    setCity('');
    setBarangay('');
    
    if (selectedProvince) {
      try {
        const data = await getAddresses('city', selectedProvince);
        setCities(data || []);
      } catch (error) {
        console.error('Failed to load cities:', error);
      }
    }
  };

  const handleCityChange = async (selectedCity) => {
    setCity(selectedCity);
    setBarangay('');
    
    if (selectedCity) {
      try {
        const data = await getAddresses('barangay', selectedCity);
        setBarangays(data || []);
      } catch (error) {
        console.error('Failed to load barangays:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        productId,
        quantity,
        customerName,
        email,
        contact,
        province,
        city,
        barangay,
        addressDetails,
        packageSize: product.Size,
        itemCategory: product.Category,
        paymentMethod,
      };

      const { orderId } = await createOrder(orderData);

      if (paymentMethod === 'maya') {
        const amount = product.Price * quantity;
        await initMayaCheckout(amount, { orderId, ...orderData });
      } else {
        navigate(`/success?order=${orderId}`);
      }
    } catch (error) {
      alert('Failed to create order: ' + error.message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 text-lg">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Info */}
      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
            {product.QRCodeURL && (
              <img src={product.QRCodeURL} alt={product.Name} className="w-full h-full object-cover rounded-lg" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">{product.Name}</h2>
            <p className="text-gray-600 mb-2">{product.Description}</p>
            <p className="text-3xl font-bold text-blue-600">₱{product.Price}</p>
            <p className="text-sm text-gray-500">{product.Category} • {product.Size}</p>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <h2 className="text-2xl font-semibold mb-6">Order Details</h2>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={product.Stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 text-center input-field"
            />
            <button
              type="button"
              onClick={() => setQuantity(Math.min(product.Stock, quantity + 1))}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              +
            </button>
            <span className="text-sm text-gray-500">× ₱{product.Price} = ₱{quantity * product.Price}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
          <input
            type="tel"
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="09XX XXX XXXX"
            className="input-field"
          />
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
            <select
              required
              value={province}
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="input-field"
            >
              <option value="">Select Province</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <select
              required
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="input-field"
              disabled={!province}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Barangay *</label>
            <select
              required
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="input-field"
              disabled={!city}
            >
              <option value="">Select Barangay</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Details *</label>
          <textarea
            required
            value={addressDetails}
            onChange={(e) => setAddressDetails(e.target.value)}
            rows={3}
            placeholder="House/Unit No., Building Name, Street..."
            className="input-field"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod('maya')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'maya' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="font-medium">Maya</div>
              <div className="text-sm text-gray-500">Card / QR / Wallet</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('gcash')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                paymentMethod === 'gcash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="font-medium">GCash</div>
              <div className="text-sm text-gray-500">QR Code / Pay</div>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary"
        >
          {submitting ? 'Processing...' : `Continue to Payment - ₱${quantity * product.Price}`}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;

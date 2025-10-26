import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProduct } from '../services/api';
import { getGCashQR } from '../services/paymentService';

const Success = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // In a real app, fetch order details from API
    // For now, we'll use a mock structure
    const mockOrder = {
      orderId: orderId,
      trackingNumber: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${orderId}`,
      amount: 0,
      productName: 'Product Name',
      quantity: 1,
      customerName: 'Customer Name',
      paymentMethod: 'gcash',
    };
    setOrderData(mockOrder);
    setLoading(false);
  }, [orderId]);

  const totalAmount = orderData ? orderData.amount : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your order. Please complete your payment.</p>
      </div>

      {/* Order Info Card */}
      <div className="card mb-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderData.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking Number:</span>
              <span className="font-medium">{orderData.trackingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Product:</span>
              <span className="font-medium">{orderData.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium">{orderData.quantity}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">₱{totalAmount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Payment Status:</span>
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
            Pending Payment
          </span>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Instructions</h2>
        
        {orderData.paymentMethod === 'gcash' ? (
          <div>
            <p className="text-gray-700 mb-4">
              Scan the QR code below using GCash to pay ₱{totalAmount}
            </p>
            
            <button
              onClick={() => setShowQR(true)}
              className="w-full btn-primary mb-4"
            >
              View QR Code
            </button>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-medium mb-2">Payment Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open GCash app</li>
                <li>Tap "Scan QR"</li>
                <li>Scan the QR code</li>
                <li>Enter amount: ₱{totalAmount}</li>
                <li>Add reference: <strong>{orderData.trackingNumber}</strong></li>
                <li>Confirm payment</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              You will be redirected to Maya checkout page. Please complete your payment there.
            </p>
            <p className="text-sm text-gray-600">
              If you haven't been redirected, please complete the payment in the previous window.
            </p>
          </div>
        )}
      </div>

      {/* What's Next */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <div>
              <p className="font-medium">Complete your payment using GCash or Maya</p>
              <p className="text-gray-500">Once verified, your order will be processed</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <div>
              <p className="font-medium">Receive confirmation email</p>
              <p className="text-gray-500">We'll send your tracking number via email</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <div>
              <p className="font-medium">Order shipped via J&T Express</p>
              <p className="text-gray-500">Track your package with the tracking number</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="flex-1 btn-secondary text-center">
          Continue Shopping
        </Link>
        <button
          onClick={() => window.print()}
          className="flex-1 btn-secondary"
        >
          Print Receipt
        </Link>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Pay with GCash</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img src={getGCashQR()} alt="GCash QR" className="w-64 h-64 mb-4" />
              <p className="text-sm text-gray-600 text-center mb-2">
                Scan with GCash to pay <strong>₱{totalAmount}</strong>
              </p>
              <p className="text-xs text-gray-500 text-center">
                Reference: <strong>{orderData.trackingNumber}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Success;

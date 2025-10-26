import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.Category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button onClick={loadProducts} className="mt-4 btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mx-auto block input-field"
        />
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.ProductID} product={product} />
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodesList products={products} />
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
          {product.QRCodeURL ? (
            <img
              src={product.QRCodeURL}
              alt={product.Name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.Name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.Description}</p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">₱{product.Price}</p>
            <p className="text-sm text-gray-500">{product.Category} • {product.Size}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${product.Stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {product.Stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/order?id=${product.ProductID}`}
            className="flex-1 btn-primary text-center"
          >
            Order Now
          </Link>
          <button
            onClick={() => setShowQR(true)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            QR
          </button>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Scan to Order</h3>
              <button onClick={() => setShowQR(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <img src={product.QRCodeURL} alt="QR Code" className="w-64 h-64 mb-4" />
              <p className="text-gray-600 text-center">Scan with your phone to order via Messenger/Instagram</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const QRCodesList = ({ products }) => {
  const [showAll, setShowAll] = useState(false);

  const productsWithQR = products.filter(p => p.QRCodeURL);

  if (productsWithQR.length === 0) return null;

  return (
    <div className="mt-8 card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">QR Code Ordering</h2>
        <button onClick={() => setShowAll(!showAll)} className="btn-secondary text-sm">
          {showAll ? 'Hide' : 'Show All'}
        </button>
      </div>

      {showAll && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {productsWithQR.map((product) => (
            <div key={product.ProductID} className="text-center">
              <p className="text-sm font-medium mb-2">{product.Name}</p>
              <img src={product.QRCodeURL} alt={product.Name} className="w-32 h-32 mx-auto" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

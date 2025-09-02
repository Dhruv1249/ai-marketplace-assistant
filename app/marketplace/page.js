import React, { useEffect, useState } from 'react';

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch products:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Marketplace</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {products.length === 0 && <div>No products found.</div>}
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              minWidth: '260px',
              background: '#f9f9f9'
            }}
          >
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            {product.thumbnailImageUrl && (
              <img
                src={product.thumbnailImageUrl}
                alt={product.title}
                style={{ width: '100%', maxWidth: '240px', borderRadius: '4px' }}
              />
            )}
            <div style={{ fontWeight: 'bold', margin: '8px 0' }}>
              Price:{' '}
              {product.pricing?.discount?.finalPrice
                ? `$${product.pricing.discount.finalPrice}`
                : product.pricing?.basePrice
                ? `$${product.pricing.basePrice}`
                : 'N/A'}
            </div>
            {product.hasCustomPage && <span style={{ color: 'green' }}>Custom Page Available</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
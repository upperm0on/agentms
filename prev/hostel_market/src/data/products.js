export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 13 Pro Max',
    description: '128GB, Space Gray, Excellent condition',
    price: 3500,
    currency: 'GHS',
    type: 'product',
    stock_quantity: 2,
    primary_image: null,
    store_id: 1,
    store_name: 'TechHub Electronics',
    store_rating: 4.5,
    tags: ['electronics', 'phone', 'apple'],
  },
  {
    id: 2,
    name: 'Graphic Design Services',
    description: 'Professional logo design, flyers, and branding',
    price: 150,
    currency: 'GHS',
    type: 'service',
    primary_image: null,
    store_id: 2,
    store_name: 'Creative Studio',
    store_rating: 4.8,
    tags: ['design', 'services', 'creative'],
  },
]

export const generateMockProducts = (count = 20, storeCount = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    description: 'Product description',
    price: Math.floor(Math.random() * 1000) + 50,
    currency: 'GHS',
    type: Math.random() > 0.5 ? 'product' : 'service',
    stock_quantity: Math.floor(Math.random() * 10),
    store_id: Math.floor(Math.random() * storeCount) + 1,
    store_name: `Store ${Math.floor(Math.random() * storeCount) + 1}`,
    store_rating: 4 + Math.random(),
    tags: ['tag1', 'tag2'],
  }))



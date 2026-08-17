export const mockStores = [
  {
    id: 1,
    name: 'TechHub Electronics',
    description: 'Best deals on electronics and gadgets',
    category: { name: 'Electronics' },
    engagement_score: 250,
    total_views: 450,
    rating: 4.5,
    product_count: 12,
    logo: null,
  },
  {
    id: 2,
    name: 'Fashion Forward',
    description: 'Trendy clothing and accessories',
    category: { name: 'Fashion' },
    engagement_score: 180,
    total_views: 320,
    rating: 4.7,
    product_count: 25,
    logo: null,
  },
]

export const generateMockStores = (count = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Store ${i + 1}`,
    description: 'Store description',
    category: { name: 'Category' },
    engagement_score: Math.random() * 300,
    total_views: Math.floor(Math.random() * 500),
    rating: 4 + Math.random(),
    product_count: Math.floor(Math.random() * 30),
  }))



/**
 * Auto-assigns a category to a product based on its name and description
 * @param {Object} product - The product object
 * @returns {string} - The category slug
 */
export function assignCategoryToProduct(product) {
  // If product already has a category, use it
  if (product.category_slug) return product.category_slug
  if (product.category?.slug) return product.category.slug
  
  // Auto-assign based on product name and description
  const name = (product.name || '').toLowerCase()
  const description = (product.description || '').toLowerCase()
  const text = `${name} ${description}`
  
  // Category keywords mapping
  const categoryKeywords = {
    electronics: ['electronics', 'laptop', 'phone', 'headphone', 'speaker', 'charger', 'cable', 'usb', 'wireless', 'bluetooth', 'tech', 'gadget', 'device', 'computer', 'tablet', 'keyboard', 'mouse', 'monitor', 'screen', 'tv', 'television'],
    fashion: ['fashion', 'clothing', 'clothes', 'shirt', 'pants', 'jeans', 'dress', 'shoes', 'sneakers', 'hoodie', 'jacket', 'accessories', 'sunglasses', 'watch', 'jewelry', 'bag', 'backpack'],
    food: ['food', 'snack', 'drink', 'beverage', 'coffee', 'tea', 'meal', 'restaurant', 'delivery', 'cooking', 'recipe', 'groceries', 'fruit', 'vegetable'],
    services: ['service', 'cleaning', 'tutoring', 'editing', 'installation', 'setup', 'delivery', 'pickup', 'moving', 'assistance', 'help', 'support', 'consultation'],
    books: ['book', 'textbook', 'study', 'material', 'supplies', 'stationery', 'pen', 'paper', 'notebook', 'notes'],
    furniture: ['furniture', 'chair', 'table', 'desk', 'bed', 'sofa', 'cabinet', 'shelf', 'fridge', 'refrigerator', 'lamp', 'lighting']
  }
  
  // Check each category
  for (const [categorySlug, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return categorySlug
    }
  }
  
  // Default to 'all' if no match
  return 'all'
}


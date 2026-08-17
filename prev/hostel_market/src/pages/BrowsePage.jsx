import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Store, Search, X } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import ProductCard from '../components/marketplace/ProductCard'
import { SkeletonProduct } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { fetchListings, fetchCategories } from '../store/slices/marketplaceSlice'
import { categories as defaultCategories } from '../data/categories'
import { useSearch } from '../hooks/useSearch'
import { useDebounce } from '../hooks/useDebounce'
import './BrowsePage.css'
import '../index.css'

function BrowsePage() {
  const dispatch = useDispatch()
  const { products, loading, categories: reduxCategories } = useSelector(state => state.marketplace)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)
  const { search, results: searchResults, loading: searchLoading, error: searchError } = useSearch()
  
  // Store refs for each category's product scroll container
  const categoryScrollRefs = React.useRef({})
  
  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery.trim())
    }
    // When search query is cleared, we rely on debouncedQuery.trim() check in render
    // to show categories instead of search results
  }, [debouncedQuery, search])

  // Merge categories with icons
  const categories = React.useMemo(() => {
    if (reduxCategories && reduxCategories.length > 0) {
      return reduxCategories.map(reduxCat => {
        // API categories use 'id' as the slug, so map id to slug if slug doesn't exist
        const slug = reduxCat.slug || reduxCat.id
        const defaultCat = defaultCategories.find(dc => dc.slug === slug || dc.id === reduxCat.id)
        return {
          ...reduxCat,
          slug: slug, // Ensure slug is set
          icon: reduxCat.icon || defaultCat?.icon || Store,
          description: reduxCat.description || defaultCat?.description || '',
        }
      })
    }
    return defaultCategories
  }, [reduxCategories])

  // Fetch categories on mount
  React.useEffect(() => {
    if (!reduxCategories || reduxCategories.length === 0) {
      dispatch(fetchCategories())
    }
  }, [dispatch, reduxCategories])

  // Fetch all listings on mount - fetch in batches to avoid timeout
  React.useEffect(() => {
    const params = {
      type: 'all',
      page: 1,
      pageSize: 200, // Fetch 200 at a time
    }
    dispatch(fetchListings(params))
  }, [dispatch])

  // Organize products by category - loop through each product and add to its category
  const categoriesWithProducts = React.useMemo(() => {
    if (!products || products.length === 0) {
      return []
    }
    
    // Initialize categories with empty product arrays
    const categoriesMap = {}
    categories.forEach(cat => {
      if (cat.slug && cat.slug !== 'all') {
        categoriesMap[cat.slug] = {
          ...cat,
          products: [],
          count: 0
        }
      }
    })
    
    // Loop through each product and add it to its category
    products.forEach(product => {
      // Get the product's category
      const productCategory = product.category_slug || product.category
      
      // Skip if no category or category is 'all'
      if (!productCategory || productCategory === 'all') {
        return
      }
      
      // If category exists in our map, add the product
      if (categoriesMap[productCategory]) {
        categoriesMap[productCategory].products.push(product)
        categoriesMap[productCategory].count++
      }
    })
    
    // Convert to array, filter out categories with no products, and sort by count
    const result = Object.values(categoriesMap)
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count) // Sort by product count (descending)
    
    return result
  }, [categories, products])

  // Scroll functions for each category
  const scrollCategoryProducts = (categorySlug, direction) => {
    const scrollRef = categoryScrollRefs.current[categorySlug]
    if (scrollRef) {
      scrollRef.scrollBy({ 
        left: direction === 'left' ? -300 : 300, 
        behavior: 'smooth' 
      })
    }
  }
  
  return (
    <div className="browse-page">
      <div className="container">
        {/* Header */}
        <div className="browse-header">
          <h1 className="browse-title">Browse Marketplace</h1>
        </div>

        {/* Search Input */}
        <div style={{ 
          marginBottom: '24px',
          position: 'relative',
          maxWidth: '600px'
        }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }} 
            />
            <input
              type="text"
              placeholder="Search products and services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 40px',
                fontSize: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563EB'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchLoading && debouncedQuery && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e2e8f0',
                borderTopColor: '#2563EB',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite'
              }} />
              Searching...
            </div>
          )}
        </div>

        {/* Search Results or Categories List */}
        <div className="browse-content">
          {/* Show search results if query exists */}
          {debouncedQuery.trim() ? (
            searchLoading ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '16px' 
              }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonProduct key={i} />
                ))}
              </div>
            ) : searchError ? (
              <div style={{
                padding: '24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0 }}>Search failed: {searchError}</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div>
                <div style={{ 
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '16px' 
                }}>
                  {searchResults.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                variant="products"
                title="No results found"
                description={`No products or services match "${debouncedQuery}"`}
              />
            )
          ) : (
            /* Show categories when no search query */
            <>
              {loading && (!products || products.length === 0) ? (
                <div className="category-sections-list">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="category-section">
                      <div className="category-section-header">
                        <div className="category-section-title">
                          <SkeletonProduct />
                        </div>
                      </div>
                      <div className="products-container grid">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <SkeletonProduct key={j} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : categoriesWithProducts.length === 0 ? (
                <EmptyState
                  variant="products"
                  title="No listings found"
                  description="Check back later for available items"
                />
              ) : (
                <div className="category-sections-list">
                  {categoriesWithProducts.map(category => {
                    const CategoryIcon = category.icon || Store
                    const categoryProducts = category.products || []
                    
                    return (
                      <div key={category.slug || category.id} className="category-section">
                        {/* Category Header */}
                        <div className="category-section-header">
                          <div className="category-section-title">
                            <div className="category-icon-wrapper">
                              <CategoryIcon size={24} className="category-icon" />
                            </div>
                            <div className="category-title-text">
                              <h2 className="category-section-name">{category.name}</h2>
                              <p className="category-section-description">{category.description}</p>
                            </div>
                          </div>
                          <span className="category-product-count">{category.count} {category.count === 1 ? 'item' : 'items'}</span>
                        </div>

                        {/* Products for this category - Horizontal Scrollable */}
                        {categoryProducts.length > 0 ? (
                          <div className="category-products-container">
                            <button 
                              className="nav-button nav-left" 
                              onClick={() => scrollCategoryProducts(category.slug, 'left')}
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <div 
                              className="products-container grid" 
                              ref={el => {
                                if (el) categoryScrollRefs.current[category.slug] = el
                              }}
                            >
                              {categoryProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                              ))}
                            </div>
                            <button 
                              className="nav-button nav-right" 
                              onClick={() => scrollCategoryProducts(category.slug, 'right')}
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        ) : (
                          <div className="category-empty-state">
                            <p>No products in this category yet</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default BrowsePage


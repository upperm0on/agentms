import React, { useRef, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Store } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import ProductCard from '../components/marketplace/ProductCard'
import { categories as defaultCategories } from '../data/categories'
import { fetchCategories, fetchListings } from '../store/slices/marketplaceSlice'
import './CategoriesPage.css'

function CategoriesPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { products, categories: reduxCategories, loading } = useSelector(state => state.marketplace)
  const listingsScrollRef = useRef(null)
  const categoryNavRef = useRef(null)
  
  // Merge Redux categories with default categories to ensure icons are available
  const categories = React.useMemo(() => {
    // Always use defaultCategories as base, merge with Redux if available
    const baseCategories = [...defaultCategories]
    
    if (reduxCategories && reduxCategories.length > 0) {
      // Merge Redux categories with default categories to get icons
      return reduxCategories.map(reduxCat => {
        const defaultCat = defaultCategories.find(dc => dc.slug === reduxCat.slug || dc.id === reduxCat.id)
        return {
          ...reduxCat,
          slug: reduxCat.slug || defaultCat?.slug || reduxCat.id,
          icon: reduxCat.icon || defaultCat?.icon || Store,
          description: reduxCat.description || defaultCat?.description || '',
        }
      })
    }
    // Return default categories with proper slugs
    return defaultCategories.map(cat => ({
      ...cat,
      slug: cat.slug || cat.id,
    }))
  }, [reduxCategories])
  
  // Handle undefined or invalid categorySlug - redirect to first valid category
  useEffect(() => {
    if (categories.length > 0) {
      // If categorySlug is undefined, null, or the string "undefined", redirect to first category
      if (!categorySlug || categorySlug === 'undefined' || categorySlug === 'null') {
        const firstCategory = categories.find(cat => cat.slug && cat.slug !== 'all') || categories[0]
        if (firstCategory?.slug) {
          navigate(`/categories/${firstCategory.slug}`, { replace: true })
        }
      } else {
        // Check if categorySlug exists in categories
        const categoryExists = categories.find(cat => cat.slug === categorySlug)
        if (!categoryExists) {
          // Category doesn't exist, redirect to first valid category
          const firstCategory = categories.find(cat => cat.slug && cat.slug !== 'all') || categories[0]
          if (firstCategory?.slug) {
            navigate(`/categories/${firstCategory.slug}`, { replace: true })
          }
        }
      }
    }
  }, [categorySlug, categories, navigate])
  
  // Get selected category - handle undefined categorySlug
  const selectedCategory = React.useMemo(() => {
    if (!categorySlug || categorySlug === 'undefined' || categorySlug === 'null') {
      return categories.find(cat => cat.slug && cat.slug !== 'all') || categories[0] || null
    }
    return categories.find(cat => cat.slug === categorySlug) || categories.find(cat => cat.slug && cat.slug !== 'all') || categories[0] || null
  }, [categorySlug, categories])
  const IconComponent = selectedCategory?.icon || Store
  
  // Fetch categories on mount if not available
  useEffect(() => {
    if (!reduxCategories || reduxCategories.length === 0) {
      dispatch(fetchCategories())
    }
  }, [dispatch, reduxCategories])
  
  // Fetch listings for the selected category
  useEffect(() => {
    if (selectedCategory?.slug) {
      dispatch(fetchListings({
        category: selectedCategory.slug,
        type: 'all',
        page: 1,
        pageSize: 100, // Get all items for category page
      }))
    }
  }, [dispatch, selectedCategory?.slug])
  
  const displayProducts = React.useMemo(() => {
    if (!products || products.length === 0) return []
    
    // If category is 'all' or no specific category, show all products
    if (!selectedCategory || selectedCategory.slug === 'all') {
      return products
    }
    
    return products.filter(p => 
      p.category_slug === selectedCategory.slug ||
      p.category?.slug === selectedCategory.slug ||
      p.category?.name?.toLowerCase() === selectedCategory.name?.toLowerCase()
    )
  }, [products, selectedCategory])
  
  const scrollListingsLeft = () => {
    if (listingsScrollRef.current) {
      listingsScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }
  
  const scrollListingsRight = () => {
    if (listingsScrollRef.current) {
      listingsScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const scrollCategoryNav = (direction) => {
    if (categoryNavRef.current) {
      categoryNavRef.current.scrollBy({ 
        left: direction === 'left' ? -200 : 200, 
        behavior: 'smooth' 
      })
    }
  }
  
  return (
    <div className="categories-page">
      <div className="categories-main-container">
        {/* Header */}
        <div className="categories-header">
          <div className="category-title-section">
            <div className="category-icon-container">
              <IconComponent size={24} className="category-icon" />
            </div>
            <div className="category-text">
              <h1 className="category-name">{selectedCategory.name}</h1>
              <p className="category-description">{selectedCategory.description}</p>
            </div>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="category-filters">
          <div className="category-filters-container" style={{ position: 'relative' }}>
            <button 
              className="nav-button nav-left category-nav-button" 
              onClick={() => scrollCategoryNav('left')}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            >
              <ChevronLeft size={20} />
            </button>
            <div 
              className="category-list-nav"
              ref={categoryNavRef}
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '0 50px',
                WebkitScrollbar: { display: 'none' }
              }}
            >
              {categories && categories.length > 0 ? (
                categories
                  .filter(category => {
                    const slug = category.slug || category.id
                    return slug && slug !== 'undefined' && slug !== 'null' && slug !== 'all'
                  })
                  .map(category => {
                    const CatIcon = category.icon || Store
                    const slug = category.slug || category.id
                    return (
                      <Link
                        key={category.id || category.slug || category.name}
                        to={`/categories/${slug}`}
                        className={`category-filter-item ${slug === selectedCategory?.slug ? 'active' : ''}`}
                      >
                        <CatIcon size={18} />
                        <span>{category.name}</span>
                      </Link>
                    )
                  })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No categories available
                </div>
              )}
            </div>
            <button 
              className="nav-button nav-right category-nav-button" 
              onClick={() => scrollCategoryNav('right')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Products Section */}
        {displayProducts.length > 0 && (
          <div className="category-section">
            <div className="category-section-header">
              <h2 className="section-title">Listings</h2>
              <span className="item-count">{displayProducts.length} {displayProducts.length === 1 ? 'item' : 'items'}</span>
            </div>
            
            <div className="category-container">
              <button className="nav-button nav-left" onClick={scrollListingsLeft}>
                <ChevronLeft size={20} />
              </button>
              <div className="category-items-list products" ref={listingsScrollRef}>
                {displayProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <button className="nav-button nav-right" onClick={scrollListingsRight}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {displayProducts.length === 0 && (
          <div className="no-items-message">
            <Store size={48} />
            <h3>No items in this category</h3>
            <p>Check back later for available items in {selectedCategory.name}.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriesPage


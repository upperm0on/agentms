import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient, buildQuery } from '../../utils/apiClient'
import { assignCategoryToProduct } from '../../utils/categoryAssigner'

const initialState = {
  stores: [],
  products: [],
  services: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  filters: {
    priceRange: [0, 10000],
    listingType: 'all', // 'all', 'product', 'service'
    sortBy: 'recent', // 'recent', 'price-low', 'price-high', 'popular', 'rating'
  },
  loading: false,
  error: null,
  pagination: { page: 1, pageSize: 24, total: 0 },
}

export const fetchListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (params, { rejectWithValue }) => {
    try {
      const qs = buildQuery(params)
      const response = await apiClient.get(`/listings${qs}`)
      return response.data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'marketplace/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/products/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const fetchStoreById = createAsyncThunk(
  'marketplace/fetchStoreById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/stores/${id}`)
      return data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'marketplace/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/categories`)
      return data
    } catch (err) {
      return rejectWithValue(err)
    }
  }
)

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setStores: (state, action) => {
      state.stores = action.payload
    },
    addStore: (state, action) => {
      const store = action.payload
      if (!store) return
      state.stores = [...state.stores, { id: store.id || Date.now(), ...store }]
    },
    setProducts: (state, action) => {
      state.products = action.payload
    },
    addProduct: (state, action) => {
      const product = action.payload
      if (!product) return
      state.products = [{ id: product.id || Date.now(), ...product }, ...state.products]
    },
    updateProduct: (state, action) => {
      const product = action.payload
      if (!product || !product.id) return
      const idx = state.products.findIndex(p => p.id === product.id)
      if (idx !== -1) {
        state.products[idx] = { ...state.products[idx], ...product }
      }
    },
    removeProduct: (state, action) => {
      const productId = action.payload
      if (!productId) return
      state.products = state.products.filter(p => p.id !== productId)
    },
    setServices: (state, action) => {
      state.services = action.payload
    },
    setCategories: (state, action) => {
      state.categories = action.payload
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.loading = false
        const items = action.payload?.items || []
        // Assign categories to products and store them
        state.products = items.map(item => {
          // Use API's category_slug if present, otherwise use category field, otherwise assign
          const apiCategorySlug = item.category_slug || item.category
          const categorySlug = apiCategorySlug || assignCategoryToProduct(item)
          return {
            ...item,
            category: categorySlug, // Ensure both fields are set
            category_slug: categorySlug // Store the assigned category as string
          }
        })
        
        // Extract unique stores from items
        const storesMap = new Map()
        items.forEach(item => {
          if (item.store && item.store.id) {
            // Only add store if not already in map
            if (!storesMap.has(item.store.id)) {
              storesMap.set(item.store.id, {
                ...item.store,
                // Ensure we have all required fields
                id: item.store.id,
                name: item.store.name || item.store_name,
                description: item.store.description || '',
                location: item.store.location || '',
                // Store doesn't have category fields - those are on the product/item
              })
            }
          }
        })
        // Update stores array with unique stores from listings
        const uniqueStores = Array.from(storesMap.values())
        if (uniqueStores.length > 0) {
          // Create a map of existing stores by ID for quick lookup
          const existingStoresMap = new Map(state.stores.map(s => [s.id, s]))
          
          // Update or add stores
          uniqueStores.forEach(store => {
            if (existingStoresMap.has(store.id)) {
              // Update existing store with new data
              existingStoresMap.set(store.id, { ...existingStoresMap.get(store.id), ...store })
            } else {
              // Add new store
              existingStoresMap.set(store.id, store)
            }
          })
          
          // Convert back to array
          state.stores = Array.from(existingStoresMap.values())
        }
        
        state.pagination = {
          page: action.payload?.page || 1,
          pageSize: action.payload?.pageSize || 24,
          total: action.payload?.total || items.length,
        }
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch listings'
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const p = action.payload
        if (!p) return
        // Assign category if not present
        const categorySlug = assignCategoryToProduct(p)
        const productWithCategory = {
          ...p,
          category_slug: categorySlug
        }
        const idx = state.products.findIndex(x => x.id === p.id)
        if (idx === -1) state.products.unshift(productWithCategory)
        else state.products[idx] = productWithCategory
      })
      .addCase(fetchStoreById.fulfilled, (state, action) => {
        const s = action.payload
        if (!s) return
        const idx = state.stores.findIndex(x => x.id === s.id)
        if (idx === -1) state.stores.push(s)
        else state.stores[idx] = s
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : []
      })
  }
})

export const {
  setStores,
  addStore,
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setServices,
  setCategories,
  setSelectedCategory,
  setSearchQuery,
  setFilters,
  setLoading,
  setError,
} = marketplaceSlice.actions

export default marketplaceSlice.reducer


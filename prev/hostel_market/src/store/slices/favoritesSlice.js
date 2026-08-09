import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'market_favorites_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ids: [], byId: {} }
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return { ids: [], byId: {} }
    const ids = Array.isArray(parsed.ids) ? parsed.ids : []
    const byId = parsed.byId && typeof parsed.byId === 'object' ? parsed.byId : {}
    return { ids, byId }
  } catch {
    return { ids: [], byId: {} }
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: state.ids, byId: state.byId }))
  } catch {
    // ignore storage errors
  }
}

const initialState = {
  ids: loadFromStorage().ids,
  byId: loadFromStorage().byId,
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const product = action.payload
      if (!product || product.id == null) return
      if (!state.ids.includes(product.id)) {
        state.ids.push(product.id)
      }
      state.byId[product.id] = product
      persist(state)
    },
    removeFavorite: (state, action) => {
      const productId = action.payload
      state.ids = state.ids.filter(id => id !== productId)
      delete state.byId[productId]
      persist(state)
    },
    toggleFavorite: (state, action) => {
      const product = action.payload
      if (!product || product.id == null) return
      if (state.ids.includes(product.id)) {
        state.ids = state.ids.filter(id => id !== product.id)
        delete state.byId[product.id]
      } else {
        state.ids.push(product.id)
        state.byId[product.id] = product
      }
      persist(state)
    },
    clearFavorites: (state) => {
      state.ids = []
      state.byId = {}
      persist(state)
    },
  },
})

export const { addFavorite, removeFavorite, toggleFavorite, clearFavorites } = favoritesSlice.actions

export const selectFavoriteIds = (state) => state.favorites.ids
export const selectFavoritesMap = (state) => state.favorites.byId
export const selectIsFavorited = (productId) => (state) => state.favorites.ids.includes(productId)

export default favoritesSlice.reducer



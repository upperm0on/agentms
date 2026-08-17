import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'market_store_favorites_v1'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ids: [], byId: {} }
    const parsed = JSON.parse(raw)
    const ids = Array.isArray(parsed?.ids) ? parsed.ids : []
    const byId = parsed?.byId && typeof parsed.byId === 'object' ? parsed.byId : {}
    return { ids, byId }
  } catch {
    return { ids: [], byId: {} }
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: state.ids, byId: state.byId }))
  } catch {
    // ignore
  }
}

const initialState = {
  ids: loadFromStorage().ids,
  byId: loadFromStorage().byId,
}

const storeFavoritesSlice = createSlice({
  name: 'storeFavorites',
  initialState,
  reducers: {
    toggleStoreFavorite: (state, action) => {
      const store = action.payload
      if (!store || store.id == null) return
      const id = String(store.id)
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter(x => x !== id)
        delete state.byId[id]
      } else {
        state.ids.push(id)
        state.byId[id] = store
      }
      persist(state)
    },
    clearStoreFavorites: (state) => {
      state.ids = []
      state.byId = {}
      persist(state)
    },
  },
})

export const { toggleStoreFavorite, clearStoreFavorites } = storeFavoritesSlice.actions

export const selectIsStoreFavorited = (storeId) => (state) => state.storeFavorites.ids.includes(String(storeId))
export const selectStoreFavoriteIds = (state) => state.storeFavorites.ids
export const selectStoreFavoritesMap = (state) => state.storeFavorites.byId

export default storeFavoritesSlice.reducer



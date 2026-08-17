/**
 * Unit Tests for searchService.js
 * Run with: npm test -- searchService.test.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchListings, searchStores, searchProducts } from '../../src/services/searchService'
import { apiClient, buildQuery } from '../../src/utils/apiClient'

// Mock apiClient and buildQuery
vi.mock('../../src/utils/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
  buildQuery: vi.fn((params) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.append(key, String(value))
      }
    })
    const qs = search.toString()
    return qs ? `?${qs}` : ''
  }),
}))

describe('searchService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchListings', () => {
    it('should search listings with query', async () => {
      const query = 'test'
      const filters = { category: 'electronics' }
      const mockResults = [{ id: 1, name: 'Test Product' }]
      apiClient.get.mockResolvedValue({ data: mockResults })

      const result = await searchListings(query, filters)

      expect(buildQuery).toHaveBeenCalled()
      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResults)
    })

    it('should search listings without query', async () => {
      const mockResults = [{ id: 1, name: 'Product 1' }]
      apiClient.get.mockResolvedValue({ data: mockResults })

      const result = await searchListings()

      expect(result).toEqual(mockResults)
    })

    it('should handle errors', async () => {
      const mockError = new Error('Search failed')
      apiClient.get.mockRejectedValue(mockError)

      await expect(searchListings('test')).rejects.toThrow('Search failed')
    })
  })

  describe('searchStores', () => {
    it('should search stores with query', async () => {
      const query = 'test'
      const filters = {}
      const mockResults = [{ id: 1, name: 'Test Store' }]
      apiClient.get.mockResolvedValue({ data: mockResults })

      const result = await searchStores(query, filters)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResults)
    })
  })

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const query = 'test'
      const filters = { type: 'product' }
      const mockResults = [{ id: 1, name: 'Test Product' }]
      apiClient.get.mockResolvedValue({ data: mockResults })

      const result = await searchProducts(query, filters)

      expect(apiClient.get).toHaveBeenCalled()
      expect(result).toEqual(mockResults)
    })
  })
})



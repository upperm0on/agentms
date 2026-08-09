/**
 * Unit Tests for marketplaceService.js
 * Run with: npm test -- marketplaceService.test.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchStore, fetchStoreProducts, updateStoreSettings, createListing, contactSeller } from '../../src/services/marketplaceService'
import { apiClient } from '../../src/utils/apiClient'

// Mock apiClient
vi.mock('../../src/utils/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

describe('marketplaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchStore', () => {
    it('should fetch store successfully', async () => {
      const mockStore = { id: 1, name: 'Test Store', description: 'Test Description' }
      apiClient.get.mockResolvedValue({ data: mockStore })

      const result = await fetchStore()

      expect(apiClient.get).toHaveBeenCalledWith('/hq/api/marketplace/store/me/')
      expect(result).toEqual(mockStore)
    })

    it('should handle errors', async () => {
      const mockError = new Error('Failed to fetch store')
      apiClient.get.mockRejectedValue(mockError)

      await expect(fetchStore()).rejects.toThrow('Failed to fetch store')
    })
  })

  describe('fetchStoreProducts', () => {
    it('should fetch store products successfully', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }]
      apiClient.get.mockResolvedValue({ data: mockProducts })

      const result = await fetchStoreProducts()

      expect(apiClient.get).toHaveBeenCalledWith('/hq/api/marketplace/products/')
      expect(result).toEqual(mockProducts)
    })

    it('should handle errors', async () => {
      const mockError = new Error('Failed to fetch products')
      apiClient.get.mockRejectedValue(mockError)

      await expect(fetchStoreProducts()).rejects.toThrow('Failed to fetch products')
    })
  })

  describe('updateStoreSettings', () => {
    it('should update store settings successfully', async () => {
      const settingsData = { name: 'Updated Store', description: 'Updated Description' }
      const mockResponse = { id: 1, ...settingsData }
      apiClient.put.mockResolvedValue({ data: mockResponse })

      const result = await updateStoreSettings(settingsData)

      expect(apiClient.put).toHaveBeenCalledWith('/hq/api/marketplace/store/settings/', settingsData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors', async () => {
      const settingsData = { name: 'Updated Store' }
      const mockError = new Error('Failed to update settings')
      apiClient.put.mockRejectedValue(mockError)

      await expect(updateStoreSettings(settingsData)).rejects.toThrow('Failed to update settings')
    })
  })

  describe('createListing', () => {
    it('should create listing successfully', async () => {
      const listingData = {
        name: 'Test Product',
        description: 'Test Description',
        type: 'product',
        price: 100,
        currency: 'GHS',
      }
      const mockResponse = { id: 1, ...listingData }
      apiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await createListing(listingData)

      expect(apiClient.post).toHaveBeenCalledWith('/hq/api/marketplace/listings/create/', listingData)
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors', async () => {
      const listingData = { name: 'Test Product' }
      const mockError = new Error('Failed to create listing')
      apiClient.post.mockRejectedValue(mockError)

      await expect(createListing(listingData)).rejects.toThrow('Failed to create listing')
    })
  })

  describe('contactSeller', () => {
    it('should contact seller successfully', async () => {
      const productId = 1
      const message = 'Test message'
      const mockResponse = { success: true, message: 'Message sent' }
      apiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await contactSeller(productId, message)

      expect(apiClient.post).toHaveBeenCalledWith('/hq/api/marketplace/contact/', {
        product_id: productId,
        message: message,
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle errors', async () => {
      const productId = 1
      const message = 'Test message'
      const mockError = new Error('Failed to contact seller')
      apiClient.post.mockRejectedValue(mockError)

      await expect(contactSeller(productId, message)).rejects.toThrow('Failed to contact seller')
    })
  })
})



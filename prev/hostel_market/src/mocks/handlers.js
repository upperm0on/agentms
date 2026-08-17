import { http, HttpResponse } from 'msw'
import { products as FIXT_PRODUCTS, categories as FIXT_CATEGORIES } from '../data/fixtures/products'
import { stores as FIXT_STORES } from '../data/fixtures/stores'
import { wallet as FIXT_WALLET, orders as FIXT_ORDERS } from '../data/fixtures/wallet'

function applyFilters(listings, query) {
  let result = [...listings]
  const q = query.get('q') || ''
  const category = query.get('category') || 'all'
  const listingType = query.get('type') || 'all' // product|service|all
  const min = Number(query.get('min') || '0')
  const max = Number(query.get('max') || '100000000')
  const sortBy = query.get('sortBy') || 'recent'
  const page = Number(query.get('page') || '1')
  const pageSize = Number(query.get('pageSize') || '24')

  if (q) {
    const lower = q.toLowerCase()
    result = result.filter((x) =>
      x.name.toLowerCase().includes(lower) || x.description.toLowerCase().includes(lower)
    )
  }
  if (category !== 'all') {
    result = result.filter((x) => x.tags?.includes(category))
  }
  if (listingType !== 'all') {
    result = result.filter((x) => x.type === listingType)
  }
  result = result.filter((x) => x.price >= min && x.price <= max)

  switch (sortBy) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      result.sort((a, b) => b.price - a.price)
      break
    case 'popular':
      result.sort((a, b) => (b.store_rating || 0) - (a.store_rating || 0))
      break
    default:
      // recent: higher id first
      result.sort((a, b) => b.id - a.id)
  }

  const total = result.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = result.slice(start, end)

  return { items, total, page, pageSize }
}

export const handlers = [
  // Listings with filters/pagination
  http.get('/api/listings', ({ request }) => {
    const url = new URL(request.url)
    const { items, total, page, pageSize } = applyFilters(FIXT_PRODUCTS, url.searchParams)
    return HttpResponse.json({ items, total, page, pageSize })
  }),
  // Product detail
  http.get('/api/products/:id', ({ params }) => {
    const found = FIXT_PRODUCTS.find(p => String(p.id) === String(params.id))
    if (!found) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(found)
  }),
  // Store detail
  http.get('/api/stores/:id', ({ params }) => {
    const store = FIXT_STORES.find(s => String(s.id) === String(params.id))
    if (!store) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(store)
  }),
  // Store products
  http.get('/api/stores/:id/products', ({ params }) => {
    const items = FIXT_PRODUCTS.filter(p => String(p.store_id) === String(params.id))
    return HttpResponse.json(items)
  }),
  // Categories
  http.get('/api/categories', () => HttpResponse.json(FIXT_CATEGORIES)),
  // Create order (product or service)
  http.post('/api/orders', async ({ request }) => {
    const body = await request.json()
    const product = FIXT_PRODUCTS.find(p => String(p.id) === String(body.product_id))
    if (!product) return HttpResponse.json({ message: 'Product not found' }, { status: 404 })
    const id = `ord_${Date.now()}`
    const order = {
      id,
      product_id: product.id,
      store_id: product.store_id,
      type: product.type,
      price: product.price,
      currency: product.currency,
      status: product.type === 'service' ? 'escrow_held' : 'paid',
      created_at: Date.now(),
    }
    FIXT_ORDERS.unshift(order)
    if (product.type === 'product') {
      product.stock_quantity = Math.max(0, (product.stock_quantity || 0) - 1)
      FIXT_WALLET.balance += product.price
      FIXT_WALLET.transactions.unshift({ id: `tx_${Date.now()}`, type: 'credit', amount: product.price, description: `Order ${id} income`, created_at: Date.now() })
    } else {
      FIXT_WALLET.escrow += product.price
      FIXT_WALLET.transactions.unshift({ id: `tx_${Date.now()}`, type: 'escrow', amount: product.price, description: `Order ${id} escrow`, created_at: Date.now() })
    }
    return HttpResponse.json(order, { status: 201 })
  }),
  // Orders list
  http.get('/api/orders', () => HttpResponse.json(FIXT_ORDERS)),
  // Release escrow (service completion)
  http.post('/api/orders/:id/release', ({ params }) => {
    const order = FIXT_ORDERS.find(o => o.id === params.id)
    if (!order) return HttpResponse.json({ message: 'Order not found' }, { status: 404 })
    if (order.type !== 'service' || order.status !== 'escrow_held') return HttpResponse.json(order)
    order.status = 'released'
    FIXT_WALLET.escrow = Math.max(0, FIXT_WALLET.escrow - order.price)
    FIXT_WALLET.balance += order.price
    FIXT_WALLET.transactions.unshift({ id: `tx_${Date.now()}`, type: 'credit', amount: order.price, description: `Escrow released ${order.id}`, created_at: Date.now() })
    return HttpResponse.json(order)
  }),
  // Wallet endpoints
  http.get('/api/wallet', () => HttpResponse.json(FIXT_WALLET)),
  http.post('/api/wallet/withdraw', async ({ request }) => {
    const body = await request.json()
    const amount = Number(body?.amount || 0)
    if (amount <= 0 || amount > FIXT_WALLET.balance) return HttpResponse.json({ message: 'Invalid amount' }, { status: 400 })
    FIXT_WALLET.balance -= amount
    FIXT_WALLET.transactions.unshift({ id: `tx_${Date.now()}`, type: 'debit', amount, description: 'Withdrawal', created_at: Date.now() })
    return HttpResponse.json(FIXT_WALLET)
  }),
]



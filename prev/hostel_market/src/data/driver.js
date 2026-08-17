export const driverStats = {
  totalDeliveries: 45,
  completedDeliveries: 42,
  pendingDeliveries: 3,
  totalEarnings: 1250,
  averageRating: 4.8,
}

export const activeDeliveries = (driver) => [
  {
    id: 1,
    order_id: 123,
    type: 'product',
    item_name: 'iPhone 13 Pro Max',
    item_image: null,
    store_name: 'TechHub Electronics',
    total_amount: 3500,
    delivery_fee: 15,
    currency: 'GHS',
    status: 'in_transit',
    created_at: new Date().toISOString(),
    delivery_address: '123 Main Street, Hostel Block A',
    estimated_delivery: new Date(Date.now() + 3600000).toISOString(),
    driver: {
      name: driver?.name || 'You',
      vehicle_type: 'motorcycle',
      vehicle_number: 'GR-1234-20',
      phone: '+233 XX XXX XXXX',
    },
  },
  {
    id: 2,
    order_id: 124,
    type: 'product',
    item_name: 'Textbook',
    item_image: null,
    store_name: 'Book Store',
    total_amount: 45,
    delivery_fee: 10,
    currency: 'GHS',
    status: 'picked_up',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    delivery_address: '456 Campus Road, Hostel Block B',
    estimated_delivery: new Date(Date.now() + 1800000).toISOString(),
    driver: {
      name: driver?.name || 'You',
      vehicle_type: 'motorcycle',
      vehicle_number: 'GR-1234-20',
      phone: '+233 XX XXX XXXX',
    },
  },
]

export const recentDeliveries = [
  {
    id: 3,
    order_id: 122,
    type: 'product',
    item_name: 'Laptop',
    item_image: null,
    store_name: 'Tech Store',
    total_amount: 2500,
    delivery_fee: 20,
    currency: 'GHS',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]



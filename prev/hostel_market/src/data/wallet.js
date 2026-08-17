export const walletDefaults = {
  balance: 3720,
  escrowBalance: 150,
}

export const mockTransactions = [
  {
    id: 1,
    type: 'credit',
    amount: 3500,
    currency: 'GHS',
    description: 'Payment received from Order #123',
    status: 'completed',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'debit',
    amount: 150,
    currency: 'GHS',
    description: 'Service order - Escrow held',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    type: 'credit',
    amount: 45,
    currency: 'GHS',
    description: 'Payment received from Order #122',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    type: 'debit',
    amount: 25,
    currency: 'GHS',
    description: 'Payout to bank account',
    status: 'completed',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]



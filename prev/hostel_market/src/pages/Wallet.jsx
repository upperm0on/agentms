import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import WalletBalance from '../components/wallet/WalletBalance'
import TransactionHistory from '../components/wallet/TransactionHistory'
import PayoutRequest from '../components/wallet/PayoutRequest'
import { fetchWallet, withdraw } from '../store/slices/walletSlice'
import { apiClient } from '../utils/apiClient'
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

function Wallet() {
  const dispatch = useDispatch()
  const { balance, escrowBalance, transactions } = useSelector(state => state.wallet)
  const { role, entrepreneur } = useSelector(state => state.auth)
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [storeTransactions, setStoreTransactions] = useState([])
  const [storeEarnings, setStoreEarnings] = useState({
    totalRevenue: 0,
    grossProfit: 0,
    netProfit: 0,
    finalNetProfit: 0,
    serviceFees: 0,
    monthlyFees: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)

  const isSeller = role === 'seller'
  const hasStore = !!(entrepreneur?.store || entrepreneur?.store_id)
  const storeId = entrepreneur?.store?.id || entrepreneur?.store_id

  useEffect(() => {
    dispatch(fetchWallet())
  }, [dispatch])

  // Fetch store transactions and earnings if seller
  useEffect(() => {
    const fetchStoreData = async () => {
      if (!isSeller || !hasStore || !storeId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Fetch analytics for earnings
        const analyticsResponse = await apiClient.get(`/marketplace/store/${storeId}/analytics/`, {
          params: { time_range: 'all' }
        })
        const analytics = analyticsResponse.data
        setStoreEarnings({
          totalRevenue: parseFloat(analytics.total_revenue || 0),
          grossProfit: parseFloat(analytics.gross_profit || 0),
          netProfit: parseFloat(analytics.net_profit || 0),
          finalNetProfit: parseFloat(analytics.final_net_profit || analytics.net_profit || 0),
          serviceFees: parseFloat(analytics.service_fees || 0),
          monthlyFees: parseFloat(analytics.monthly_fees || 0),
          totalTransactions: parseInt(analytics.total_transactions || 0)
        })

        // Fetch transactions
        const transactionsResponse = await apiClient.get(`/marketplace/store/${storeId}/transactions/`, {
          params: { time_range: 'all' }
        })
        const transactionsData = transactionsResponse.data.results || transactionsResponse.data || []
        setStoreTransactions(transactionsData)
      } catch (error) {
        console.error('Failed to fetch store data:', error)
        // Set empty data on error
        setStoreTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [isSeller, hasStore, storeId])

  const handleWithdraw = () => {
    setPayoutOpen(true)
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <h1 className="page-title">Wallet</h1>
      {!isSeller && (
        <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
          You are in buyer mode. Wallet features are limited.
        </p>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <WalletBalance
          balance={balance}
          escrowBalance={escrowBalance}
          onWithdraw={isSeller ? handleWithdraw : undefined}
        />
      </div>

      {/* Store Earnings Section for Sellers */}
      {isSeller && hasStore && (
        <div style={{ 
          marginBottom: '1.5rem',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <DollarSign size={20} />
            Store Earnings
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
              Loading earnings...
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Total Revenue
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                  GHS {storeEarnings.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  All-time earnings
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Gross Profit
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  GHS {storeEarnings.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Before service fees
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#fef3c7',
                borderRadius: '8px',
                border: '1px solid #fde68a'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Net Profit
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>
                  GHS {storeEarnings.finalNetProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  After 1.5% service fee &amp; 5% monthly fee
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Service Fees (1.5%)
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#64748b' }}>
                  GHS {storeEarnings.serviceFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Transaction fees
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Monthly Fees (5%)
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>
                  GHS {storeEarnings.monthlyFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Monthly subscription
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  Total Transactions
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                  {storeEarnings.totalTransactions.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Completed sales
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Store Transactions for Sellers */}
      {isSeller && hasStore && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Calendar size={20} />
            Store Transactions
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
              Loading transactions...
            </div>
          ) : storeTransactions.length > 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Consumer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Service Fee</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Net Profit</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {storeTransactions.slice(0, 20).map(transaction => (
                    <tr key={transaction.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#0f172a' }}>
                        {new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#0f172a' }}>
                        {transaction.consumer?.username || transaction.consumer?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#0f172a' }}>
                        {transaction.product?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                        GHS {parseFloat(transaction.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#f59e0b', fontFamily: 'monospace' }}>
                        GHS {parseFloat(transaction.service_fee || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#10b981', fontFamily: 'monospace' }}>
                        GHS {parseFloat(transaction.net_profit || transaction.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                          background: transaction.status === 'completed' ? '#d1fae5' : transaction.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: transaction.status === 'completed' ? '#065f46' : transaction.status === 'pending' ? '#92400e' : '#991b1b'
                        }}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <Calendar size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      )}

      {/* Regular Transaction History */}
      <TransactionHistory transactions={transactions} />
      
      <PayoutRequest
        isOpen={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        balance={balance}
        onSubmit={async (data) => {
          const amount = parseFloat(data.amount)
          await dispatch(withdraw(amount))
          setPayoutOpen(false)
        }}
      />
    </div>
  )
}

export default Wallet



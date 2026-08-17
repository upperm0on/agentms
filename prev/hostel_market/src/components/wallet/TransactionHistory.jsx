import React from 'react'
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import './TransactionHistory.css'

function TransactionHistory({ transactions = [] }) {
  const displayTransactions = transactions
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-icon completed" />
      case 'pending':
        return <Clock size={16} className="status-icon pending" />
      case 'failed':
        return <XCircle size={16} className="status-icon failed" />
      default:
        return <Clock size={16} className="status-icon pending" />
    }
  }
  
  return (
    <div className="transaction-history">
      <Card>
        <CardContent className="transaction-card-content">
          <h2 className="transaction-title">Transaction History</h2>
          
          {displayTransactions.length > 0 ? (
            <div className="transactions-list">
              {displayTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.type === 'credit' ? (
                      <ArrowDownCircle size={24} className="icon-credit" />
                    ) : (
                      <ArrowUpCircle size={24} className="icon-debit" />
                    )}
                  </div>
                  
                  <div className="transaction-details">
                    <p className="transaction-description">
                      {transaction.description}
                    </p>
                    <p className="transaction-date">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="transaction-amount-section">
                    <div className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
                    </div>
                    <div className="transaction-status">
                      {getStatusIcon(transaction.status)}
                      <span className={`status-${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-transactions">
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionHistory


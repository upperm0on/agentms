import React from 'react'
import { Wallet, Lock, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import './WalletBalance.css'

function WalletBalance({ balance, escrowBalance, onWithdraw }) {
  const availableBalance = balance - escrowBalance
  
  return (
    <div className="wallet-balance">
      <Card className="wallet-card">
        <CardContent className="wallet-card-content">
          <div className="wallet-header">
            <div className="wallet-icon">
              <Wallet size={32} />
            </div>
            <h2 className="wallet-title">Wallet Balance</h2>
          </div>
          
          <div className="wallet-balances">
            <div className="balance-item available">
              <div className="balance-label">
                <span>Available Balance</span>
                <TrendingUp size={16} className="trend-icon up" />
              </div>
              <div className="balance-amount">
                <span className="currency">GHS</span>
                <span className="amount">{parseFloat(availableBalance).toLocaleString()}</span>
              </div>
              {onWithdraw && availableBalance > 0 && (
                <button className="withdraw-button" onClick={onWithdraw}>
                  Withdraw
                </button>
              )}
            </div>
            
            <div className="balance-item escrow">
              <div className="balance-label">
                <span>Escrow Balance</span>
                <Lock size={16} className="lock-icon" />
              </div>
              <div className="balance-amount escrow">
                <span className="currency">GHS</span>
                <span className="amount">{parseFloat(escrowBalance).toLocaleString()}</span>
              </div>
              <p className="balance-note">
                Held in escrow until service completion
              </p>
            </div>
            
            <div className="balance-item total">
              <div className="balance-label">
                <span>Total Balance</span>
              </div>
              <div className="balance-amount total">
                <span className="currency">GHS</span>
                <span className="amount">{parseFloat(balance).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default WalletBalance


import React, { useState } from 'react'
import { formatCurrency } from '../utils'
import styles from './PaymentModal.module.css'

const METHODS = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'card', label: 'Card', icon: '💳' },
  { id: 'gcash', label: 'GCash', icon: '📱' },
  { id: 'maya', label: 'Maya', icon: '💜' },
]

export default function PaymentModal({ total, symbol, onConfirm, onClose }) {
  const [method, setMethod] = useState('cash')
  const [tendered, setTendered] = useState('')
  const [loading, setLoading] = useState(false)

  const tenderedNum = parseFloat(tendered) || 0
  const change = method === 'cash' ? Math.max(0, tenderedNum - total) : 0
  const canCharge = method !== 'cash' || tenderedNum >= total

  const quickAmounts = [
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
    1000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total)

  async function handleConfirm() {
    if (!canCharge) return
    setLoading(true)
    await onConfirm({
      payment_method: method,
      amount_tendered: method === 'cash' ? tenderedNum : total,
      change_due: change,
    })
    setLoading(false)
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Payment</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.amount}>
          <span className={styles.amountLabel}>Total Due</span>
          <span className={styles.amountValue}>{formatCurrency(total, symbol)}</span>
        </div>

        <div className={styles.methods}>
          {METHODS.map(m => (
            <button
              key={m.id}
              className={`${styles.methodBtn} ${method === m.id ? styles.methodActive : ''}`}
              onClick={() => { setMethod(m.id); setTendered('') }}
            >
              <span className={styles.methodIcon}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {method === 'cash' && (
          <div className={styles.cashSection}>
            <label className={styles.inputLabel}>Amount Tendered</label>
            <input
              type="number"
              value={tendered}
              onChange={e => setTendered(e.target.value)}
              placeholder="Enter amount…"
              className={styles.tenderedInput}
              autoFocus
              min={0}
            />

            <div className={styles.quickAmounts}>
              {quickAmounts.slice(0, 4).map(amt => (
                <button
                  key={amt}
                  className={styles.quickBtn}
                  onClick={() => setTendered(String(amt))}
                >
                  {formatCurrency(amt, symbol)}
                </button>
              ))}
            </div>

            {tenderedNum > 0 && (
              <div className={styles.changeRow}>
                <span className={styles.changeLabel}>Change</span>
                <span className={`${styles.changeAmount} ${change < 0 ? styles.insufficient : ''}`}>
                  {change < 0 ? `Need ${formatCurrency(Math.abs(change), symbol)} more` : formatCurrency(change, symbol)}
                </span>
              </div>
            )}
          </div>
        )}

        {method !== 'cash' && (
          <div className={styles.digitalNote}>
            <span>💡</span>
            <p>Confirm when payment is received via {METHODS.find(m_ => m_.id === method)?.label}</p>
          </div>
        )}

        <button
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={!canCharge || loading}
        >
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <span>✓ Confirm Payment</span>
              <span className={styles.confirmAmount}>{formatCurrency(total, symbol)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

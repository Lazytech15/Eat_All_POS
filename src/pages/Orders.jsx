import React, { useEffect, useState } from 'react'
import { api, formatCurrency, formatDate } from '../utils'
import { useAppStore } from '../store'
import styles from './Orders.module.css'

export default function Orders() {
  const { settings } = useAppStore()
  const symbol = settings?.currency_symbol || '₱'
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.orders.getAll(100).then(data => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  const total_revenue = orders.reduce((s, o) => s + (o.total || 0), 0)

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>

  return (
    <div className={styles.layout}>
      <div className={styles.listPanel}>
        <div className={styles.listHeader}>
          <div>
            <h2 className={styles.pageTitle}>Orders</h2>
            <p className={styles.subtitle}>{orders.length} transactions</p>
          </div>
          <div className={styles.totalRevenue}>
            <span className={styles.revenueLabel}>Total Revenue</span>
            <span className={styles.revenueValue}>{formatCurrency(total_revenue, symbol)}</span>
          </div>
        </div>

        <div className={styles.orderList}>
          {orders.length === 0 && (
            <div className={styles.empty}>
              <span>📋</span>
              <p>No orders yet</p>
            </div>
          )}
          {orders.map(order => (
            <button
              key={order.id}
              className={`${styles.orderRow} ${selected?.id === order.id ? styles.orderSelected : ''}`}
              onClick={() => setSelected(order)}
            >
              <div className={styles.orderLeft}>
                <span className={styles.orderNum}>{order.order_number}</span>
                <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
              </div>
              <div className={styles.orderRight}>
                <span className={styles.orderTotal}>{formatCurrency(order.total, symbol)}</span>
                <span className={styles.orderMethod}>{order.payment_method}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.detailPanel}>
        {!selected ? (
          <div className={styles.detailEmpty}>
            <span>👈</span>
            <p>Select an order to view details</p>
          </div>
        ) : (
          <div className={styles.detail} key={selected.id}>
            <div className={styles.detailHeader}>
              <div>
                <h3 className={styles.detailTitle}>{selected.order_number}</h3>
                <p className={styles.detailDate}>{formatDate(selected.created_at)}</p>
              </div>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>Completed</span>
            </div>

            <div className={styles.detailItems}>
              <h4 className={styles.sectionLabel}>Items</h4>
              {(selected.items || []).map((item, i) => (
                <div key={i} className={styles.detailItem}>
                  <span className={styles.detailItemName}>{item.product_name}</span>
                  <span className={styles.detailItemQty}>×{item.quantity}</span>
                  <span className={styles.detailItemTotal}>{formatCurrency(item.total, symbol)}</span>
                </div>
              ))}
            </div>

            <div className={styles.detailSummary}>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>{formatCurrency(selected.subtotal, symbol)}</span>
              </div>
              {selected.discount > 0 && (
                <div className={styles.summaryLine}>
                  <span>Discount</span>
                  <span className={styles.discountText}>−{formatCurrency(selected.discount, symbol)}</span>
                </div>
              )}
              <div className={styles.summaryLine}>
                <span>VAT</span>
                <span>{formatCurrency(selected.tax, symbol)}</span>
              </div>
              <div className={`${styles.summaryLine} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>{formatCurrency(selected.total, symbol)}</span>
              </div>
            </div>

            <div className={styles.paymentInfo}>
              <div className={styles.payInfoRow}>
                <span className={styles.payLabel}>Payment Method</span>
                <span className={styles.payValue}>{selected.payment_method}</span>
              </div>
              {selected.payment_method === 'cash' && (
                <>
                  <div className={styles.payInfoRow}>
                    <span className={styles.payLabel}>Tendered</span>
                    <span className={styles.payValue}>{formatCurrency(selected.amount_tendered, symbol)}</span>
                  </div>
                  <div className={styles.payInfoRow}>
                    <span className={styles.payLabel}>Change</span>
                    <span className={styles.payValue}>{formatCurrency(selected.change_due, symbol)}</span>
                  </div>
                </>
              )}
              {selected.note && (
                <div className={styles.payInfoRow}>
                  <span className={styles.payLabel}>Note</span>
                  <span className={styles.payValue}>{selected.note}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

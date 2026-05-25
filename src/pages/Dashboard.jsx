import React, { useEffect, useState } from 'react'
import { api, formatCurrency, formatShortDate } from '../utils'
import { useAppStore } from '../store'
import styles from './Dashboard.module.css'

function MiniBar({ value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className={styles.barTrack}>
      <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function Dashboard() {
  const { settings } = useAppStore()
  const symbol = settings?.currency_symbol || '₱'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats.getDashboard().then(data => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>
  if (!stats) return null

  const maxRevenue = Math.max(...(stats.weekly_sales?.map(d => d.revenue) || [1]))
  const maxQty = Math.max(...(stats.top_products?.map(p => p.qty_sold) || [1]))

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Dashboard</h2>
          <p className={styles.subtitle}>{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>💰</span>
          <div>
            <p className={styles.kpiLabel}>Today's Revenue</p>
            <p className={styles.kpiValue}>{formatCurrency(stats.today.revenue, symbol)}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>🧾</span>
          <div>
            <p className={styles.kpiLabel}>Today's Orders</p>
            <p className={styles.kpiValue}>{stats.today.count}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>📦</span>
          <div>
            <p className={styles.kpiLabel}>Items Sold Today</p>
            <p className={styles.kpiValue}>{stats.today.items_sold}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>⚠️</span>
          <div>
            <p className={styles.kpiLabel}>Low Stock Items</p>
            <p className={`${styles.kpiValue} ${stats.products.low_stock > 0 ? styles.danger : ''}`}>
              {stats.products.low_stock}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Weekly Sales Chart */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Weekly Sales</h3>
          <div className={styles.chart}>
            {stats.weekly_sales.map((day, i) => (
              <div key={i} className={styles.chartBar}>
                <div className={styles.chartBarWrapper}>
                  <div
                    className={styles.chartBarFill}
                    style={{ height: `${maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0}%` }}
                    title={formatCurrency(day.revenue, symbol)}
                  />
                </div>
                <span className={styles.chartLabel}>{formatShortDate(day.date)}</span>
                <span className={styles.chartValue}>{formatCurrency(day.revenue, symbol)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Top Products (30 days)</h3>
          <div className={styles.topProducts}>
            {stats.top_products.length === 0 && (
              <p className={styles.empty}>No sales data yet</p>
            )}
            {stats.top_products.map((prod, i) => (
              <div key={i} className={styles.topRow}>
                <span className={styles.topRank}>#{i + 1}</span>
                <div className={styles.topInfo}>
                  <span className={styles.topName}>{prod.product_name}</span>
                  <MiniBar value={prod.qty_sold} max={maxQty} />
                </div>
                <div className={styles.topStats}>
                  <span className={styles.topQty}>{prod.qty_sold} sold</span>
                  <span className={styles.topRev}>{formatCurrency(prod.revenue, symbol)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className={`${styles.card} ${styles.wide}`}>
          <h3 className={styles.cardTitle}>Recent Orders</h3>
          <div className={styles.recentList}>
            {stats.recent_orders.length === 0 && <p className={styles.empty}>No orders yet</p>}
            {stats.recent_orders.map(order => (
              <div key={order.id} className={styles.recentRow}>
                <span className={styles.recentNum}>{order.order_number}</span>
                <span className={styles.recentDate}>{new Date(order.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className={styles.recentMethod}>{order.payment_method}</span>
                <span className={styles.recentTotal}>{formatCurrency(order.total, symbol)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { useAppStore } from '../store'
import styles from './Sidebar.module.css'
import logo from '../assets/Eatall.png'

const NAV = [
  { id: 'pos', icon: '🧾', label: 'POS' },
  { id: 'orders', icon: '📋', label: 'Orders' },
  { id: 'products', icon: '📦', label: 'Products' },
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  const { activeTab, setActiveTab, settings } = useAppStore()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={logo} alt="Eat-All" className={styles.logoMark} />
        <div className={styles.logoText}>
          <span className={styles.logoName}>Eat-All</span>
          <span className={styles.logoSub}>POS</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.offlineBadge}>
          <span className={styles.dot} />
          Offline Ready
        </div>
        <div className={styles.storeName}>
          {settings?.store_name || 'My Store'}
        </div>
      </div>
    </aside>
  )
}
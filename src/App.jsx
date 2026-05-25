import React, { useEffect } from 'react'
import { useAppStore } from './store'
import { api } from './utils'
import Sidebar from './components/Sidebar'
import Notification from './components/Notification'
import POS from './pages/POS'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import styles from './App.module.css'

const PAGES = {
  pos: POS,
  orders: Orders,
  products: Products,
  dashboard: Dashboard,
  settings: Settings,
}

export default function App() {
  const { activeTab, setSettings, setProducts, setCategories } = useAppStore()

  useEffect(() => {
    async function bootstrap() {
      try {
        const [settings, products, categories] = await Promise.all([
          api.settings.get(),
          api.products.getAll(),
          api.categories.getAll(),
        ])
        setSettings(settings)
        setProducts(products)
        setCategories(categories)
      } catch (err) {
        console.error('Bootstrap error:', err)
      }
    }
    bootstrap()
  }, [])

  const Page = PAGES[activeTab] || POS

  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.page}>
          <Page />
        </div>
      </main>
      <Notification />
    </div>
  )
}

import React, { useState, useEffect, useMemo } from 'react'
import { useCartStore, useAppStore } from '../store'
import { api, formatCurrency } from '../utils'
import PaymentModal from '../components/PaymentModal'
import styles from './POS.module.css'

const EMOJI_OPTIONS = ['📦','🍔','🍕','🍗','🍚','🥤','💧','☕','🧃','🥔','🍫','🐻','🔌','💡','🎮','👕','👟','💊','🧴','🧹']

export default function POS() {
  const { products, categories, settings, showNotification } = useAppStore()
  const { items, addItem, removeItem, updateQty, discount, setDiscount, note, setNote, clearCart, getSubtotal, getTax, getTotal } = useCartStore()

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [localProducts, setLocalProducts] = useState(products)

  useEffect(() => { setLocalProducts(products) }, [products])

  const taxRate = parseFloat(settings?.tax_rate || 12)
  const symbol = settings?.currency_symbol || '₱'

  const filteredProducts = useMemo(() => {
    return localProducts.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [localProducts, selectedCategory, search])

  const subtotal = getSubtotal()
  const tax = getTax(taxRate)
  const total = getTotal(taxRate)

  const handleOrderComplete = async (paymentData) => {
    try {
      const orderData = {
        items,
        subtotal,
        tax,
        total,
        discount,
        note,
        ...paymentData,
      }
      await api.orders.create(orderData)
      
      // Refresh local product stock
      const updated = await api.products.getAll()
      setLocalProducts(updated)
      
      clearCart()
      setShowPayment(false)
      showNotification('Order completed successfully!', 'success')
    } catch (err) {
      showNotification('Failed to process order', 'error')
    }
  }

  const allCategories = ['All', ...categories.map(c => c.name)]

  return (
    <div className={styles.layout}>
      {/* ── Product Panel ── */}
      <div className={styles.productPanel}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.categories}>
          {allCategories.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${selectedCategory === cat ? styles.catActive : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.productGrid}>
          {filteredProducts.length === 0 && (
            <div className={styles.empty}>
              <span>🔍</span>
              <p>No products found</p>
            </div>
          )}
          {filteredProducts.map(product => (
            <button
              key={product.id}
              className={`${styles.productCard} ${product.stock === 0 ? styles.outOfStock : ''}`}
              onClick={() => {
                if (product.stock === 0) {
                  showNotification(`${product.name} is out of stock`, 'warning')
                  return
                }
                addItem(product)
              }}
            >
              <div className={styles.productEmoji}>{product.image_emoji || '📦'}</div>
              <div className={styles.productInfo}>
                <span className={styles.productName}>{product.name}</span>
                <span className={styles.productPrice}>{formatCurrency(product.price, symbol)}</span>
              </div>
              <div className={styles.productStock}>
                <span className={product.stock <= 5 ? styles.lowStock : styles.inStock}>
                  {product.stock === 0 ? 'Out' : `${product.stock} left`}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <div className={styles.cartPanel}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>Current Order</h2>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={clearCart}>Clear</button>
          )}
        </div>

        <div className={styles.cartItems}>
          {items.length === 0 ? (
            <div className={styles.cartEmpty}>
              <span>🛒</span>
              <p>Cart is empty</p>
              <small>Tap products to add</small>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product_id} className={styles.cartItem}>
                <span className={styles.itemEmoji}>{item.image_emoji}</span>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.product_name}</span>
                  <span className={styles.itemPrice}>{formatCurrency(item.unit_price, symbol)} ea.</span>
                </div>
                <div className={styles.qtyControl}>
                  <button className={styles.qtyBtn} onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                </div>
                <span className={styles.itemTotal}>{formatCurrency(item.total, symbol)}</span>
                <button className={styles.removeBtn} onClick={() => removeItem(item.product_id)}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className={styles.cartSummary}>
          <div className={styles.discountRow}>
            <label className={styles.summaryLabel}>Discount ({symbol})</label>
            <input
              type="number"
              value={discount || ''}
              onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="0.00"
              className={styles.discountInput}
              min={0}
              max={subtotal}
            />
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal</span>
            <span>{formatCurrency(subtotal, symbol)}</span>
          </div>
          {discount > 0 && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Discount</span>
              <span className={styles.discountValue}>−{formatCurrency(discount, symbol)}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>VAT ({taxRate}%)</span>
            <span>{formatCurrency(tax, symbol)}</span>
          </div>

          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>TOTAL</span>
            <span className={styles.totalAmount}>{formatCurrency(total, symbol)}</span>
          </div>

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Order note…"
            className={styles.noteInput}
            rows={2}
          />

          <button
            className={styles.chargeBtn}
            disabled={items.length === 0}
            onClick={() => setShowPayment(true)}
          >
            <span>Charge</span>
            <span className={styles.chargeBtnAmount}>{formatCurrency(total, symbol)}</span>
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          symbol={symbol}
          onConfirm={handleOrderComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}

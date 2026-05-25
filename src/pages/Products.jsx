import React, { useState } from 'react'
import { useAppStore } from '../store'
import { api, formatCurrency } from '../utils'
import styles from './Products.module.css'

const EMOJIS = ['📦','🍔','🍕','🍗','🍚','🥤','💧','☕','🧃','🥔','🍫','🐻','🔌','💡','🎮','👕','👟','💊','🧴','🧹','🛒','🍎','🥩','🍞','🧀','🥛']

function ProductModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState(product || {
    name: '', price: '', category: categories[0]?.name || '', stock: 0, image_emoji: '📦', barcode: '',
  })

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{product ? 'Edit Product' : 'New Product'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.emojiPicker}>
          <p className={styles.emojiLabel}>Icon</p>
          <div className={styles.emojiGrid}>
            {EMOJIS.map(e => (
              <button
                key={e}
                className={`${styles.emojiBtn} ${form.image_emoji === e ? styles.emojiActive : ''}`}
                onClick={() => set('image_emoji', e)}
              >{e}</button>
            ))}
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Burger Meal" />
          </div>
          <div className={styles.formGroup}>
            <label>Price</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" min={0} />
          </div>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Stock</label>
            <input type="number" value={form.stock} onChange={e => set('stock', parseInt(e.target.value) || 0)} min={0} />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Barcode (optional)</label>
            <input value={form.barcode || ''} onChange={e => set('barcode', e.target.value)} placeholder="Scan or type barcode" />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.saveBtn}
            onClick={() => onSave(form)}
            disabled={!form.name || !form.price}
          >
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const { products, setProducts, categories, settings, showNotification } = useAppStore()
  const symbol = settings?.currency_symbol || '₱'
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'All' || p.category === catFilter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSave = async (form) => {
    try {
      if (editing) {
        const updated = await api.products.update(editing.id, {
          name: form.name, price: parseFloat(form.price), category: form.category,
          stock: parseInt(form.stock) || 0, barcode: form.barcode, image_emoji: form.image_emoji,
        })
        setProducts(products.map(p => p.id === editing.id ? updated : p))
        showNotification('Product updated!', 'success')
      } else {
        const created = await api.products.create({
          name: form.name, price: parseFloat(form.price), category: form.category,
          stock: parseInt(form.stock) || 0, barcode: form.barcode, image_emoji: form.image_emoji,
        })
        setProducts([...products, created])
        showNotification('Product added!', 'success')
      }
      setShowModal(false)
      setEditing(null)
    } catch (err) {
      showNotification('Failed to save product', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.products.delete(id)
    setProducts(products.filter(p => p.id !== id))
    showNotification('Product deleted', 'info')
  }

  const allCats = ['All', ...categories.map(c => c.name)]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Products</h2>
          <p className={styles.subtitle}>{products.length} items in inventory</p>
        </div>
        <button className={styles.addBtn} onClick={() => { setEditing(null); setShowModal(true) }}>
          + Add Product
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" />
        </div>
        <div className={styles.catFilters}>
          {allCats.map(cat => (
            <button
              key={cat}
              className={`${styles.catBtn} ${catFilter === cat ? styles.catActive : ''}`}
              onClick={() => setCatFilter(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Product</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>
        <div className={styles.tableBody}>
          {filtered.map(product => (
            <div key={product.id} className={styles.tableRow}>
              <div className={styles.productCell}>
                <span className={styles.productEmoji}>{product.image_emoji || '📦'}</span>
                <div>
                  <span className={styles.productName}>{product.name}</span>
                  {product.barcode && <span className={styles.barcode}>{product.barcode}</span>}
                </div>
              </div>
              <span className={styles.cell}>
                <span className={styles.categoryTag}>{product.category}</span>
              </span>
              <span className={`${styles.cell} ${styles.price}`}>{formatCurrency(product.price, symbol)}</span>
              <span className={`${styles.cell}`}>
                <span className={product.stock === 0 ? styles.outOfStock : product.stock <= 5 ? styles.lowStock : styles.inStock}>
                  {product.stock}
                </span>
              </span>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => { setEditing(product); setShowModal(true) }}>Edit</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(product.id)}>Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.empty}>
              <span>📦</span>
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editing}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

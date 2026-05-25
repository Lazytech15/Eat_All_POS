import { create } from 'zustand'

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  items: [],
  discount: 0,
  note: '',

  addItem: (product) => {
    const items = get().items
    const existing = items.find(i => i.product_id === product.id)
    if (existing) {
      set({
        items: items.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unit_price }
            : i
        )
      })
    } else {
      set({
        items: [...items, {
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: 1,
          total: product.price,
          image_emoji: product.image_emoji,
        }]
      })
    }
  },

  removeItem: (product_id) => {
    set({ items: get().items.filter(i => i.product_id !== product_id) })
  },

  updateQty: (product_id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(product_id)
      return
    }
    set({
      items: get().items.map(i =>
        i.product_id === product_id
          ? { ...i, quantity, total: quantity * i.unit_price }
          : i
      )
    })
  },

  setDiscount: (discount) => set({ discount }),
  setNote: (note) => set({ note }),

  clearCart: () => set({ items: [], discount: 0, note: '' }),

  getSubtotal: () => get().items.reduce((sum, i) => sum + i.total, 0),
  getTax: (rate = 12) => {
    const subtotal = get().getSubtotal()
    const afterDiscount = subtotal - get().discount
    return afterDiscount * (rate / 100)
  },
  getTotal: (rate = 12) => {
    const subtotal = get().getSubtotal()
    const afterDiscount = subtotal - get().discount
    return afterDiscount + afterDiscount * (rate / 100)
  },
}))

// ─── App Store ────────────────────────────────────────────────────────────────
export const useAppStore = create((set) => ({
  activeTab: 'pos',
  setActiveTab: (tab) => set({ activeTab: tab }),

  settings: {},
  setSettings: (settings) => set({ settings }),

  products: [],
  setProducts: (products) => set({ products }),

  categories: [],
  setCategories: (categories) => set({ categories }),

  notification: null,
  showNotification: (message, type = 'success') => {
    set({ notification: { message, type, id: Date.now() } })
    setTimeout(() => set({ notification: null }), 3000)
  },
}))

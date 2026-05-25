export function formatCurrency(amount, symbol = '₱') {
  return `${symbol}${Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export function isElectron() {
  return typeof window !== 'undefined' && typeof window.api !== 'undefined'
}

// Mock API for browser dev without Electron
export const api = isElectron() ? window.api : createMockApi()

function createMockApi() {
  const store = {
    settings: {
      store_name: "Angel's Burger",
      currency: 'PHP',
      currency_symbol: '₱',
      tax_rate: '0',
      receipt_footer: "Ang Burger ng Bayan! Thank you for your order!",
    },
    categories: [
      { id: '1', name: 'Hamburgers', color: '#dc2626' },
      { id: '2', name: 'Hotdog Sandwiches', color: '#d97706' },
      { id: '3', name: 'Ham Sandwiches', color: '#b45309' },
      { id: '4', name: 'Bacon Sandwiches', color: '#92400e' },
      { id: '5', name: 'Add Ons', color: '#f59e0b' },
      { id: '6', name: 'Drinks', color: '#3b82f6' },
    ],
    products: [
      // Hamburgers
      { id: '1',  name: 'Beef Burger Sandwich',         price: 30,  category: 'Hamburgers',        stock: 100, image_emoji: '🍔' },
      { id: '2',  name: 'Cheeseburger Sandwich',        price: 40,  category: 'Hamburgers',        stock: 100, image_emoji: '🍔' },
      // Hotdog Sandwiches
      { id: '3',  name: 'Cheesy Hotdog Sandwich',       price: 30,  category: 'Hotdog Sandwiches', stock: 100, image_emoji: '🌭' },
      { id: '4',  name: 'Jumbo Cheese Footlong Sandwich',price: 45, category: 'Hotdog Sandwiches', stock: 100, image_emoji: '🌭' },
      { id: '5',  name: 'Cheesy Hungarian Sandwich',    price: 55,  category: 'Hotdog Sandwiches', stock: 100, image_emoji: '🌭' },
      // Ham Sandwiches
      { id: '6',  name: 'Ham Sandwich',                 price: 18,  category: 'Ham Sandwiches',    stock: 100, image_emoji: '🥪' },
      { id: '7',  name: 'Ham & Cheese Sandwich',        price: 23,  category: 'Ham Sandwiches',    stock: 100, image_emoji: '🥪' },
      { id: '8',  name: 'Ham & Egg Sandwich',           price: 30,  category: 'Ham Sandwiches',    stock: 100, image_emoji: '🥪' },
      { id: '9',  name: 'Ham, Cheese & Egg Sandwich',   price: 35,  category: 'Ham Sandwiches',    stock: 100, image_emoji: '🥪' },
      // Bacon Sandwiches
      { id: '10', name: 'Bacon Sandwich',               price: 25,  category: 'Bacon Sandwiches',  stock: 100, image_emoji: '🥓' },
      { id: '11', name: 'Bacon & Cheese Sandwich',      price: 30,  category: 'Bacon Sandwiches',  stock: 100, image_emoji: '🥓' },
      { id: '12', name: 'Bacon & Egg Sandwich',         price: 37,  category: 'Bacon Sandwiches',  stock: 100, image_emoji: '🥓' },
      { id: '13', name: 'Bacon, Cheese & Egg Sandwich', price: 42,  category: 'Bacon Sandwiches',  stock: 100, image_emoji: '🥓' },
      { id: '14', name: 'Egg Sandwich',                 price: 16,  category: 'Bacon Sandwiches',  stock: 100, image_emoji: '🍳' },
      // Add Ons
      { id: '15', name: 'Extra Cheese',                 price: 5,   category: 'Add Ons',           stock: 200, image_emoji: '🧀' },
      { id: '16', name: 'Extra Egg',                    price: 12,  category: 'Add Ons',           stock: 200, image_emoji: '🍳' },
      { id: '17', name: 'Extra Ham',                    price: 14,  category: 'Add Ons',           stock: 200, image_emoji: '🥩' },
      { id: '18', name: 'Extra Bacon',                  price: 21,  category: 'Add Ons',           stock: 200, image_emoji: '🥓' },
      // Drinks
      { id: '19', name: 'Lipton Iced Tea',              price: 30,  category: 'Drinks',            stock: 100, image_emoji: '🧃' },
      { id: '20', name: 'Bottled Water',                price: 16,  category: 'Drinks',            stock: 100, image_emoji: '💧' },
      { id: '21', name: 'Mug',                          price: 18,  category: 'Drinks',            stock: 100, image_emoji: '☕' },
      { id: '22', name: 'Mirinda',                      price: 17,  category: 'Drinks',            stock: 100, image_emoji: '🥤' },
      { id: '23', name: 'Pepsi',                        price: 17,  category: 'Drinks',            stock: 100, image_emoji: '🥤' },
      { id: '24', name: '7-Up',                         price: 17,  category: 'Drinks',            stock: 100, image_emoji: '🥤' },
    ],
    orders: [],
  }

  return {
    settings: {
      get: async () => store.settings,
      set: async (k, v) => { store.settings[k] = v; return true },
    },
    products: {
      getAll: async () => store.products,
      create: async (p) => { const prod = { ...p, id: String(Date.now()) }; store.products.push(prod); return prod },
      update: async (id, u) => {
        const i = store.products.findIndex(p => p.id === id)
        if (i >= 0) store.products[i] = { ...store.products[i], ...u }
        return store.products[i]
      },
      delete: async (id) => { store.products = store.products.filter(p => p.id !== id); return true },
      updateStock: async (id, delta) => {
        const p = store.products.find(p => p.id === id)
        if (p) p.stock = Math.max(0, p.stock + delta)
        return { stock: p?.stock }
      },
    },
    categories: {
      getAll: async () => store.categories,
      create: async (name, color) => { const c = { id: String(Date.now()), name, color }; store.categories.push(c); return c },
    },
    orders: {
      create: async (o) => {
        const order = { ...o, id: String(Date.now()), order_number: `ORD-${Date.now()}`, created_at: new Date().toISOString() }
        store.orders.unshift(order)
        return order
      },
      getAll: async (limit = 50) => store.orders.slice(0, limit),
      getById: async (id) => store.orders.find(o => o.id === id),
    },
    stats: {
      getDashboard: async () => ({
        today: { count: 3, revenue: 650, items_sold: 8 },
        products: { total: store.products.length, low_stock: 1 },
        weekly_sales: [
          { date: '2025-05-19', revenue: 2400, count: 12 },
          { date: '2025-05-20', revenue: 1800, count: 9 },
          { date: '2025-05-21', revenue: 3100, count: 16 },
          { date: '2025-05-22', revenue: 2700, count: 14 },
          { date: '2025-05-23', revenue: 4200, count: 21 },
          { date: '2025-05-24', revenue: 3800, count: 19 },
          { date: '2025-05-25', revenue: 650, count: 3 },
        ],
        top_products: [
          { product_name: 'Cheeseburger Sandwich', qty_sold: 48, revenue: 1920 },
          { product_name: 'Cheesy Hotdog Sandwich', qty_sold: 36, revenue: 1080 },
          { product_name: 'Bacon & Egg Sandwich', qty_sold: 28, revenue: 1036 },
        ],
        recent_orders: store.orders.slice(0, 5),
      }),
    },
  }
}

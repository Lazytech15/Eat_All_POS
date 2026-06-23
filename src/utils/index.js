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
      store_name: "EatAll Fast Food",
      currency: 'PHP',
      currency_symbol: '₱',
      tax_rate: '12',
      receipt_footer: "Thank you for dining with us! Come back again!",
    },
    categories: [
      { id: '1', name: 'Burgers',    color: '#dc2626' },
      { id: '2', name: 'Chicken',    color: '#d97706' },
      { id: '3', name: 'Rice Meals', color: '#f59e0b' },
      { id: '4', name: 'Sides',      color: '#10b981' },
      { id: '5', name: 'Desserts',   color: '#ec4899' },
      { id: '6', name: 'Drinks',     color: '#3b82f6' },
    ],
    products: [
      // Burgers
      { id: '1',  name: 'Classic Burger',         price: 99,  category: 'Burgers',    stock: 100, image_emoji: '🍔', barcode: '8001001' },
      { id: '2',  name: 'Cheeseburger',           price: 115, category: 'Burgers',    stock: 100, image_emoji: '🍔', barcode: '8001002' },
      { id: '3',  name: 'Double Burger',          price: 149, category: 'Burgers',    stock: 100, image_emoji: '🍔', barcode: '8001003' },
      { id: '4',  name: 'Spicy Burger',           price: 129, category: 'Burgers',    stock: 100, image_emoji: '🌶️', barcode: '8001004' },
      // Chicken
      { id: '5',  name: 'Fried Chicken (1 pc)',   price: 109, category: 'Chicken',    stock: 80,  image_emoji: '🍗', barcode: '8002001' },
      { id: '6',  name: 'Fried Chicken (2 pcs)',  price: 199, category: 'Chicken',    stock: 80,  image_emoji: '🍗', barcode: '8002002' },
      { id: '7',  name: 'Chicken Sandwich',       price: 119, category: 'Chicken',    stock: 80,  image_emoji: '🥪', barcode: '8002003' },
      { id: '8',  name: 'Spicy Chicken',          price: 125, category: 'Chicken',    stock: 80,  image_emoji: '🌶️', barcode: '8002004' },
      { id: '9',  name: 'Chicken Nuggets (6 pcs)',price: 89,  category: 'Chicken',    stock: 100, image_emoji: '🍗', barcode: '8002005' },
      // Rice Meals
      { id: '10', name: 'Chickenjoy w/ Rice',     price: 145, category: 'Rice Meals', stock: 80,  image_emoji: '🍚', barcode: '8003001' },
      { id: '11', name: 'Burger Steak w/ Rice',   price: 129, category: 'Rice Meals', stock: 80,  image_emoji: '🍚', barcode: '8003002' },
      { id: '12', name: 'Spaghetti',              price: 99,  category: 'Rice Meals', stock: 60,  image_emoji: '🍝', barcode: '8003003' },
      { id: '13', name: 'Palabok',                price: 109, category: 'Rice Meals', stock: 60,  image_emoji: '🍜', barcode: '8003004' },
      { id: '14', name: 'Burger Meal (w/ fries)', price: 175, category: 'Rice Meals', stock: 100, image_emoji: '🍟', barcode: '8003005' },
      // Sides
      { id: '15', name: 'French Fries (Regular)', price: 55,  category: 'Sides',      stock: 120, image_emoji: '🍟', barcode: '8004001' },
      { id: '16', name: 'French Fries (Large)',   price: 75,  category: 'Sides',      stock: 120, image_emoji: '🍟', barcode: '8004002' },
      { id: '17', name: 'Mashed Potato',          price: 59,  category: 'Sides',      stock: 100, image_emoji: '🥔', barcode: '8004003' },
      { id: '18', name: 'Coleslaw',               price: 49,  category: 'Sides',      stock: 100, image_emoji: '🥗', barcode: '8004004' },
      { id: '19', name: 'Plain Rice',             price: 30,  category: 'Sides',      stock: 200, image_emoji: '🍚', barcode: '8004005' },
      // Desserts
      { id: '20', name: 'Peach Mango Pie',        price: 55,  category: 'Desserts',   stock: 60,  image_emoji: '🥧', barcode: '8005001' },
      { id: '21', name: 'Chocolate Sundae',       price: 65,  category: 'Desserts',   stock: 60,  image_emoji: '🍦', barcode: '8005002' },
      { id: '22', name: 'Vanilla Soft Serve',     price: 49,  category: 'Desserts',   stock: 60,  image_emoji: '🍦', barcode: '8005003' },
      { id: '23', name: 'Halo-Halo',              price: 99,  category: 'Desserts',   stock: 50,  image_emoji: '🍨', barcode: '8005004' },
      // Drinks
      { id: '24', name: 'Coke Regular',           price: 55,  category: 'Drinks',     stock: 150, image_emoji: '🥤', barcode: '8006001' },
      { id: '25', name: 'Coke Large',             price: 70,  category: 'Drinks',     stock: 150, image_emoji: '🥤', barcode: '8006002' },
      { id: '26', name: 'Royal/Sprite',           price: 55,  category: 'Drinks',     stock: 150, image_emoji: '🥤', barcode: '8006003' },
      { id: '27', name: 'Pineapple Juice',        price: 65,  category: 'Drinks',     stock: 100, image_emoji: '🍹', barcode: '8006004' },
      { id: '28', name: 'Bottled Water',          price: 35,  category: 'Drinks',     stock: 200, image_emoji: '💧', barcode: '8006005' },
      { id: '29', name: 'Iced Coffee',            price: 89,  category: 'Drinks',     stock: 80,  image_emoji: '☕', barcode: '8006006' },
      { id: '30', name: '4-Season Juice',         price: 59,  category: 'Drinks',     stock: 100, image_emoji: '🧃', barcode: '8006007' },
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
      getByBarcode: async (barcode) => store.products.find(p => p.barcode === barcode) || null,
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
          { product_name: 'Chickenjoy w/ Rice', qty_sold: 48, revenue: 6960 },
          { product_name: 'Cheeseburger', qty_sold: 36, revenue: 4140 },
          { product_name: 'Fried Chicken (2 pcs)', qty_sold: 28, revenue: 5572 },
        ],
        recent_orders: store.orders.slice(0, 5),
      }),
    },
    receipt: {
      print: async (receiptData) => {
        // In browser/dev mode, open a print-friendly window
        const w = window.open('', '_blank', 'width=380,height=600')
        if (!w) return false
        const fmt = (n) => `₱${Number(n || 0).toFixed(2)}`
        const now = new Date()
        const itemRows = (receiptData.items || []).map(i =>
          `<tr><td>${i.product_name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">${fmt(i.total)}</td></tr>`
        ).join('')
        w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
          <style>body{font-family:monospace;font-size:12px;padding:16px;max-width:320px}
          .center{text-align:center}.divider{border-top:1px dashed #000;margin:6px 0}
          table{width:100%}th{border-bottom:1px solid #000}
          .total-line{font-weight:bold;border-top:1px solid #000}</style></head><body>
          <div class="center"><b style="font-size:18px">EatAll Fast Food</b><br>
          ${now.toLocaleDateString()} ${now.toLocaleTimeString()}<br>Order: ${receiptData.order_number || 'N/A'}</div>
          <div class="divider"></div>
          <table><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Amt</th></tr></thead>
          <tbody>${itemRows}</tbody></table>
          <div class="divider"></div>
          <table>
          <tr><td>Subtotal</td><td style="text-align:right">${fmt(receiptData.subtotal)}</td></tr>
          ${receiptData.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-${fmt(receiptData.discount)}</td></tr>` : ''}
          <tr><td>VAT (12%)</td><td style="text-align:right">${fmt(receiptData.tax)}</td></tr>
          <tr class="total-line"><td>TOTAL</td><td style="text-align:right">${fmt(receiptData.total)}</td></tr>
          <tr><td>Payment (${receiptData.payment_method})</td><td style="text-align:right">${fmt(receiptData.amount_tendered)}</td></tr>
          ${receiptData.change_due > 0 ? `<tr><td>Change</td><td style="text-align:right">${fmt(receiptData.change_due)}</td></tr>` : ''}
          </table>
          <div class="divider"></div>
          <div class="center">Thank you for dining with us!</div>
          <script>window.onload=()=>window.print()</script>
          </body></html>`)
        w.document.close()
        return true
      },
    },
  }
}

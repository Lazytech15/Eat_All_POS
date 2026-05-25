const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const Database = require('better-sqlite3')
const { v4: uuidv4 } = require('uuid')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow
let db

// ─── Database Setup ──────────────────────────────────────────────────────────

function initDatabase() {
  const dbPath = isDev
    ? path.join(__dirname, '..', 'pos.db')
    : path.join(app.getPath('userData'), 'pos.db')

  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      barcode TEXT,
      image_emoji TEXT DEFAULT '📦',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      total REAL NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      discount REAL DEFAULT 0,
      payment_method TEXT NOT NULL,
      amount_tendered REAL,
      change_due REAL DEFAULT 0,
      status TEXT DEFAULT 'completed',
      note TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#6366f1',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Seed default categories
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get()
  if (catCount.c === 0) {
    const cats = [
      { id: uuidv4(), name: 'Food', color: '#f59e0b' },
      { id: uuidv4(), name: 'Drinks', color: '#3b82f6' },
      { id: uuidv4(), name: 'Snacks', color: '#10b981' },
      { id: uuidv4(), name: 'Electronics', color: '#8b5cf6' },
      { id: uuidv4(), name: 'Others', color: '#6b7280' },
    ]
    const insertCat = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)')
    cats.forEach(c => insertCat.run(c.id, c.name, c.color))
  }

  // Seed sample products
  const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get()
  if (prodCount.c === 0) {
    const products = [
      { id: uuidv4(), name: 'Burger Meal', price: 199, category: 'Food', stock: 50, image_emoji: '🍔' },
      { id: uuidv4(), name: 'Pizza Slice', price: 89, category: 'Food', stock: 30, image_emoji: '🍕' },
      { id: uuidv4(), name: 'Fried Chicken', price: 149, category: 'Food', stock: 40, image_emoji: '🍗' },
      { id: uuidv4(), name: 'Rice Bowl', price: 75, category: 'Food', stock: 60, image_emoji: '🍚' },
      { id: uuidv4(), name: 'Soda Can', price: 35, category: 'Drinks', stock: 100, image_emoji: '🥤' },
      { id: uuidv4(), name: 'Bottled Water', price: 20, category: 'Drinks', stock: 200, image_emoji: '💧' },
      { id: uuidv4(), name: 'Iced Coffee', price: 79, category: 'Drinks', stock: 45, image_emoji: '☕' },
      { id: uuidv4(), name: 'Juice Box', price: 45, category: 'Drinks', stock: 80, image_emoji: '🧃' },
      { id: uuidv4(), name: 'Potato Chips', price: 29, category: 'Snacks', stock: 120, image_emoji: '🥔' },
      { id: uuidv4(), name: 'Chocolate Bar', price: 39, category: 'Snacks', stock: 90, image_emoji: '🍫' },
      { id: uuidv4(), name: 'Gummy Bears', price: 25, category: 'Snacks', stock: 70, image_emoji: '🐻' },
      { id: uuidv4(), name: 'USB Cable', price: 199, category: 'Electronics', stock: 25, image_emoji: '🔌' },
    ]
    const insertProd = db.prepare(
      'INSERT INTO products (id, name, price, category, stock, image_emoji) VALUES (?, ?, ?, ?, ?, ?)'
    )
    products.forEach(p => insertProd.run(p.id, p.name, p.price, p.category, p.stock, p.image_emoji))
  }

  // Seed settings
  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get()
  if (settingsCount.c === 0) {
    const settings = [
      ['store_name', 'EatAll POS'],
      ['currency', 'PHP'],
      ['currency_symbol', '₱'],
      ['tax_rate', '12'],
      ['receipt_footer', 'Thank you for shopping with us!'],
    ]
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    settings.forEach(s => insertSetting.run(s[0], s[1]))
  }
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────

function registerIpcHandlers() {
  // Settings
  ipcMain.handle('settings:get', () => {
    const rows = db.prepare('SELECT key, value FROM settings').all()
    return Object.fromEntries(rows.map(r => [r.key, r.value]))
  })

  ipcMain.handle('settings:set', (_, key, value) => {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
    return true
  })

  // Products
  ipcMain.handle('products:getAll', () => {
    return db.prepare('SELECT * FROM products ORDER BY name ASC').all()
  })

  ipcMain.handle('products:create', (_, product) => {
    const id = uuidv4()
    db.prepare(
      'INSERT INTO products (id, name, price, category, stock, barcode, image_emoji) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, product.name, product.price, product.category, product.stock || 0, product.barcode || null, product.image_emoji || '📦')
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  })

  ipcMain.handle('products:update', (_, id, updates) => {
    db.prepare(
      'UPDATE products SET name=?, price=?, category=?, stock=?, barcode=?, image_emoji=?, updated_at=datetime("now") WHERE id=?'
    ).run(updates.name, updates.price, updates.category, updates.stock, updates.barcode || null, updates.image_emoji, id)
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  })

  ipcMain.handle('products:delete', (_, id) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(id)
    return true
  })

  ipcMain.handle('products:updateStock', (_, id, delta) => {
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(delta, id)
    return db.prepare('SELECT stock FROM products WHERE id = ?').get(id)
  })

  // Categories
  ipcMain.handle('categories:getAll', () => {
    return db.prepare('SELECT * FROM categories ORDER BY name ASC').all()
  })

  ipcMain.handle('categories:create', (_, name, color) => {
    const id = uuidv4()
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run(id, name, color)
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id)
  })

  // Orders
  ipcMain.handle('orders:create', (_, orderData) => {
    const id = uuidv4()
    const orderNumber = `ORD-${Date.now()}`

    const insertOrder = db.prepare(
      'INSERT INTO orders (id, order_number, total, subtotal, tax, discount, payment_method, amount_tendered, change_due, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )

    const insertItem = db.prepare(
      'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )

    const deductStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?')

    db.transaction(() => {
      insertOrder.run(
        id, orderNumber,
        orderData.total, orderData.subtotal,
        orderData.tax, orderData.discount || 0,
        orderData.payment_method,
        orderData.amount_tendered || orderData.total,
        orderData.change_due || 0,
        orderData.note || null
      )

      for (const item of orderData.items) {
        insertItem.run(uuidv4(), id, item.product_id, item.product_name, item.quantity, item.unit_price, item.total)
        deductStock.run(item.quantity, item.product_id)
      }
    })()

    return { id, order_number: orderNumber }
  })

  ipcMain.handle('orders:getAll', (_, limit = 50) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').all(limit)
    return orders.map(order => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
      return { ...order, items }
    })
  })

  ipcMain.handle('orders:getById', (_, id) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
    if (!order) return null
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id)
    return { ...order, items }
  })

  // Dashboard stats
  ipcMain.handle('stats:getDashboard', () => {
    const todaySales = db.prepare(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders WHERE date(created_at) = date('now')`
    ).get()

    const todayItemsSold = db.prepare(
      `SELECT COALESCE(SUM(oi.quantity), 0) as count
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE date(o.created_at) = date('now')`
    ).get()

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get()
    const lowStock = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= 5').get()

    const weeklySales = db.prepare(
      `SELECT date(created_at) as date, COALESCE(SUM(total), 0) as revenue, COUNT(*) as count
       FROM orders
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at)
       ORDER BY date ASC`
    ).all()

    const topProducts = db.prepare(
      `SELECT oi.product_name, SUM(oi.quantity) as qty_sold, SUM(oi.total) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.created_at >= datetime('now', '-30 days')
       GROUP BY oi.product_name
       ORDER BY qty_sold DESC
       LIMIT 5`
    ).all()

    const recentOrders = db.prepare(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 5'
    ).all()

    return {
      today: { ...todaySales, items_sold: todayItemsSold.count },
      products: { total: totalProducts.count, low_stock: lowStock.count },
      weekly_sales: weeklySales,
      top_products: topProducts,
      recent_orders: recentOrders,
    }
  })
}

// ─── Splash Screen ───────────────────────────────────────────────────────────

function createSplash() {
  const splash = new BrowserWindow({
    width: 480,
    height: 320,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: path.join(__dirname, '..', 'src', 'assets', 'Eatall.png'),
    webPreferences: { nodeIntegration: false },
  })

  splash.loadFile(path.join(__dirname, '..', 'splash.html'))
  return splash
}

// ─── Main Window ─────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    backgroundColor: '#0f0f14',
    show: false,
    icon: path.join(__dirname, '..', 'src', 'assets', 'Eatall.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// ─── App Events ──────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  initDatabase()
  registerIpcHandlers()

  const splash = createSplash()
  createWindow()

  mainWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => {
      splash.close()
      mainWindow.show()
    }, 2000)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
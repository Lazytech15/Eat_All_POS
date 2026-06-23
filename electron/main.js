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
      { id: uuidv4(), name: 'Burgers',    color: '#dc2626' },
      { id: uuidv4(), name: 'Chicken',    color: '#d97706' },
      { id: uuidv4(), name: 'Rice Meals', color: '#f59e0b' },
      { id: uuidv4(), name: 'Sides',      color: '#10b981' },
      { id: uuidv4(), name: 'Desserts',   color: '#ec4899' },
      { id: uuidv4(), name: 'Drinks',     color: '#3b82f6' },
    ]
    const insertCat = db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)')
    cats.forEach(c => insertCat.run(c.id, c.name, c.color))
  }

  // Seed sample products
  const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get()
  if (prodCount.c === 0) {
    const products = [
      // Burgers
      { name: 'Classic Burger',          price: 99,  category: 'Burgers',    stock: 100, image_emoji: '🍔', barcode: '8001001' },
      { name: 'Cheeseburger',            price: 115, category: 'Burgers',    stock: 100, image_emoji: '🍔', barcode: '8001002' },
      { name: 'Double Burger',           price: 149, category: 'Burgers',    stock: 100, image_emoji: '🍔', barcode: '8001003' },
      { name: 'Spicy Burger',            price: 129, category: 'Burgers',    stock: 100, image_emoji: '🌶️', barcode: '8001004' },
      // Chicken
      { name: 'Fried Chicken (1 pc)',    price: 109, category: 'Chicken',    stock: 80,  image_emoji: '🍗', barcode: '8002001' },
      { name: 'Fried Chicken (2 pcs)',   price: 199, category: 'Chicken',    stock: 80,  image_emoji: '🍗', barcode: '8002002' },
      { name: 'Chicken Sandwich',        price: 119, category: 'Chicken',    stock: 80,  image_emoji: '🥪', barcode: '8002003' },
      { name: 'Spicy Chicken',           price: 125, category: 'Chicken',    stock: 80,  image_emoji: '🌶️', barcode: '8002004' },
      { name: 'Chicken Nuggets (6 pcs)', price: 89,  category: 'Chicken',    stock: 100, image_emoji: '🍗', barcode: '8002005' },
      // Rice Meals
      { name: 'Chickenjoy w/ Rice',      price: 145, category: 'Rice Meals', stock: 80,  image_emoji: '🍚', barcode: '8003001' },
      { name: 'Burger Steak w/ Rice',    price: 129, category: 'Rice Meals', stock: 80,  image_emoji: '🍚', barcode: '8003002' },
      { name: 'Spaghetti',               price: 99,  category: 'Rice Meals', stock: 60,  image_emoji: '🍝', barcode: '8003003' },
      { name: 'Palabok',                 price: 109, category: 'Rice Meals', stock: 60,  image_emoji: '🍜', barcode: '8003004' },
      { name: 'Burger Meal (w/ fries)',  price: 175, category: 'Rice Meals', stock: 100, image_emoji: '🍟', barcode: '8003005' },
      // Sides
      { name: 'French Fries (Regular)',  price: 55,  category: 'Sides',      stock: 120, image_emoji: '🍟', barcode: '8004001' },
      { name: 'French Fries (Large)',    price: 75,  category: 'Sides',      stock: 120, image_emoji: '🍟', barcode: '8004002' },
      { name: 'Mashed Potato',           price: 59,  category: 'Sides',      stock: 100, image_emoji: '🥔', barcode: '8004003' },
      { name: 'Coleslaw',                price: 49,  category: 'Sides',      stock: 100, image_emoji: '🥗', barcode: '8004004' },
      { name: 'Plain Rice',              price: 30,  category: 'Sides',      stock: 200, image_emoji: '🍚', barcode: '8004005' },
      // Desserts
      { name: 'Peach Mango Pie',         price: 55,  category: 'Desserts',   stock: 60,  image_emoji: '🥧', barcode: '8005001' },
      { name: 'Chocolate Sundae',        price: 65,  category: 'Desserts',   stock: 60,  image_emoji: '🍦', barcode: '8005002' },
      { name: 'Vanilla Soft Serve',      price: 49,  category: 'Desserts',   stock: 60,  image_emoji: '🍦', barcode: '8005003' },
      { name: 'Halo-Halo',               price: 99,  category: 'Desserts',   stock: 50,  image_emoji: '🍨', barcode: '8005004' },
      // Drinks
      { name: 'Coke Regular',            price: 55,  category: 'Drinks',     stock: 150, image_emoji: '🥤', barcode: '8006001' },
      { name: 'Coke Large',              price: 70,  category: 'Drinks',     stock: 150, image_emoji: '🥤', barcode: '8006002' },
      { name: 'Royal/Sprite',            price: 55,  category: 'Drinks',     stock: 150, image_emoji: '🥤', barcode: '8006003' },
      { name: 'Pineapple Juice',         price: 65,  category: 'Drinks',     stock: 100, image_emoji: '🍹', barcode: '8006004' },
      { name: 'Bottled Water',           price: 35,  category: 'Drinks',     stock: 200, image_emoji: '💧', barcode: '8006005' },
      { name: 'Iced Coffee',             price: 89,  category: 'Drinks',     stock: 80,  image_emoji: '☕', barcode: '8006006' },
      { name: '4-Season Juice',          price: 59,  category: 'Drinks',     stock: 100, image_emoji: '🧃', barcode: '8006007' },
    ]
    const insertProd = db.prepare(
      'INSERT INTO products (id, name, price, category, stock, barcode, image_emoji) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    products.forEach(p => insertProd.run(uuidv4(), p.name, p.price, p.category, p.stock, p.barcode || null, p.image_emoji))
  }

  // Seed settings
  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get()
  if (settingsCount.c === 0) {
    const settings = [
      ['store_name', 'EatAll Fast Food'],
      ['currency', 'PHP'],
      ['currency_symbol', '₱'],
      ['tax_rate', '12'],
      ['receipt_footer', 'Thank you for dining with us! Come back again!'],
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

  ipcMain.handle('products:getByBarcode', (_, barcode) => {
    return db.prepare('SELECT * FROM products WHERE barcode = ?').get(barcode) || null
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

  // Print receipt
  ipcMain.handle('receipt:print', (_, receiptData) => {
    const { BrowserWindow: BW } = require('electron')
    const fs = require('fs')
    const os = require('os')

    const settings = db.prepare('SELECT key, value FROM settings').all()
    const cfg = Object.fromEntries(settings.map(r => [r.key, r.value]))
    const storeName = cfg.store_name || 'EatAll Fast Food'
    const footer = cfg.receipt_footer || 'Thank you!'
    const symbol = cfg.currency_symbol || '₱'

    const fmt = (n) => `${symbol}${Number(n || 0).toFixed(2)}`
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

    const itemRows = (receiptData.items || []).map(i =>
      `<tr>
        <td style="padding:3px 0">${i.product_name}</td>
        <td style="text-align:center;padding:3px 6px">${i.quantity}</td>
        <td style="text-align:right;padding:3px 0;white-space:nowrap">${fmt(i.total)}</td>
      </tr>`
    ).join('')

    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <style>
        @page { size: 80mm auto; margin: 4mm; }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          font-family: Arial, sans-serif;
        }

        /* Toolbar - hidden when printing */
        .toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          width: 320px;
        }
        .btn-print {
          flex: 1;
          background: #4f46e5;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 0;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          letter-spacing: 0.5px;
        }
        .btn-print:hover { background: #4338ca; }
        .btn-close {
          background: #6b7280;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 15px;
          cursor: pointer;
        }
        .btn-close:hover { background: #4b5563; }

        /* Receipt paper */
        .receipt {
          background: #fff;
          width: 300px;
          padding: 14px 16px 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          color: #000;
        }

        .center { text-align: center; }
        .store-name { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
        .divider { border: none; border-top: 1px dashed #000; margin: 6px 0; }

        table { width: 100%; border-collapse: collapse; }
        th {
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding: 3px 0;
          font-size: 11px;
          text-transform: uppercase;
        }
        .totals td { padding: 2px 0; }
        .total-row td {
          font-weight: bold;
          font-size: 14px;
          border-top: 1px solid #000;
          padding-top: 5px;
          padding-bottom: 3px;
        }
        .footer { text-align: center; font-size: 11px; margin-top: 8px; }

        /* When printing: hide toolbar, remove background, full width */
        @media print {
          body { background: none; padding: 0; }
          .toolbar { display: none; }
          .receipt { box-shadow: none; width: 72mm; padding: 0; }
        }
      </style>
    </head><body>

      <div class="toolbar">
        <button class="btn-print" onclick="window.print()">🖨️ &nbsp;Print Receipt</button>
        <button class="btn-close" onclick="window.close()">✕ Close</button>
      </div>

      <div class="receipt">
        <div class="center">
          <div class="store-name">${storeName}</div>
          <div style="font-size:11px;margin-top:3px">${dateStr} &nbsp; ${timeStr}</div>
          <div style="font-size:11px">Order #: ${receiptData.order_number || 'N/A'}</div>
        </div>
        <hr class="divider">
        <table>
          <thead><tr>
            <th style="text-align:left">Item</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Amt</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <hr class="divider">
        <table class="totals">
          <tr><td>Subtotal</td><td style="text-align:right">${fmt(receiptData.subtotal)}</td></tr>
          ${receiptData.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-${fmt(receiptData.discount)}</td></tr>` : ''}
          <tr><td>VAT (12%)</td><td style="text-align:right">${fmt(receiptData.tax)}</td></tr>
          <tr class="total-row"><td>TOTAL</td><td style="text-align:right">${fmt(receiptData.total)}</td></tr>
          <tr style="padding-top:4px"><td>${receiptData.payment_method || 'Cash'}</td><td style="text-align:right">${fmt(receiptData.amount_tendered)}</td></tr>
          ${receiptData.change_due > 0 ? `<tr><td>Change</td><td style="text-align:right">${fmt(receiptData.change_due)}</td></tr>` : ''}
        </table>
        <hr class="divider">
        <div class="footer">${footer}<br><br>*** Customer Copy ***</div>
      </div>

    </body></html>`

    // Write to a real temp file so Chromium can load + preview it properly
    const tmpFile = path.join(os.tmpdir(), `receipt_${Date.now()}.html`)
    fs.writeFileSync(tmpFile, html, 'utf-8')

    const receiptWin = new BW({
      width: 480,
      height: 750,
      show: false,
      title: 'Receipt Preview',
      webPreferences: { nodeIntegration: false, contextIsolation: true },
    })

    receiptWin.loadFile(tmpFile)
    receiptWin.webContents.once('did-finish-load', () => {
      receiptWin.show()
      try { fs.unlinkSync(tmpFile) } catch (_) {}
    })
    return true
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
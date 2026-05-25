# NeuralDesk POS

An offline-capable Point of Sale system built with **Electron** (backend) and **React + Vite** (frontend), with **SQLite** for local data persistence.

## Features

- 🛒 **POS Interface** — Fast product browsing, cart management, discounts, notes
- 💳 **Multiple Payment Methods** — Cash (with change calculation), Card, GCash, Maya
- 📋 **Order History** — Full transaction log with line-item details
- 📦 **Product Management** — Add/edit/delete products, emoji icons, stock tracking
- 📊 **Dashboard** — Daily KPIs, weekly sales chart, top products, recent orders
- ⚙️ **Settings** — Store name, currency, VAT rate, receipt footer
- 🔌 **Fully Offline** — SQLite local database, works without internet
- 🖥️ **Cross-platform** — Windows, macOS, Linux

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | Electron 29 |
| Frontend | React 18 + Vite 5 |
| State | Zustand |
| Database | SQLite via better-sqlite3 |
| IPC | Electron contextBridge |
| Styling | CSS Modules |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install

```bash
cd neuraldesk-pos
npm install
```

### Development

```bash
npm run dev
```

This starts Vite dev server on `http://localhost:5173` and launches Electron pointing to it.

### Production Build

```bash
npm run build
```

Outputs to `dist-electron/`.

## Project Structure

```
neuraldesk-pos/
├── electron/
│   ├── main.js        # Main process: SQLite, IPC handlers, window
│   └── preload.js     # Secure IPC bridge to renderer
├── src/
│   ├── pages/
│   │   ├── POS.jsx          # Cashier view
│   │   ├── Orders.jsx       # Transaction history
│   │   ├── Products.jsx     # Inventory management
│   │   ├── Dashboard.jsx    # Analytics
│   │   └── Settings.jsx     # Store configuration
│   ├── components/
│   │   ├── Sidebar.jsx      # Navigation
│   │   ├── PaymentModal.jsx # Payment flow
│   │   └── Notification.jsx # Toast alerts
│   ├── store/
│   │   └── index.js         # Zustand stores
│   ├── utils/
│   │   └── index.js         # Helpers + mock API
│   └── styles/
│       └── globals.css      # Design tokens
├── pos.db             # SQLite database (auto-created on first run)
└── package.json
```

## Database Schema

- **products** — id, name, price, category, stock, barcode, image_emoji
- **orders** — id, order_number, total, subtotal, tax, discount, payment_method, ...
- **order_items** — id, order_id, product_id, product_name, quantity, unit_price, total
- **categories** — id, name, color
- **settings** — key, value

## IPC API (Renderer ↔ Main)

```js
// Products
window.api.products.getAll()
window.api.products.create(product)
window.api.products.update(id, updates)
window.api.products.delete(id)

// Orders
window.api.orders.create(orderData)
window.api.orders.getAll(limit)

// Settings
window.api.settings.get()
window.api.settings.set(key, value)

// Stats
window.api.stats.getDashboard()
```

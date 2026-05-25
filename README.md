# 🍔 Eat-All POS

A fast, offline-capable Point-of-Sale desktop application built for food businesses.
Built with Electron + React + SQLite — no internet required.

---

## 📸 Screenshots

### Loading Animation
<img width="485" height="322" alt="Splash Screen" src="https://github.com/user-attachments/assets/1506f3b4-dc1b-4691-8ba4-0968d11269ab" />

### Main Dashboard
<img width="1387" height="893" alt="Main Dashboard" src="https://github.com/user-attachments/assets/74c68c25-4473-480e-91f5-5096d5d4b742" />

---

## ✨ Features

- **Offline-First** — All data stored locally via SQLite. Works without internet.
- **Fast Cashier Interface** — Search products, manage cart, apply discounts, and charge customers in seconds.
- **VAT & Discount Handling** — Automatic 12% VAT computation with optional per-order discounts.
- **Multiple Payment Methods** — Cash, card, and more with automatic change calculation.
- **Inventory Management** — Add, edit, delete products and categories. Stock auto-deducts on every order.
- **Low Stock Alerts** — Dashboard flags products with 5 or fewer units remaining.
- **Sales Dashboard** — Daily revenue, items sold, weekly sales chart, and top 5 products (last 30 days).
- **Order History** — Browse past transactions with full item breakdowns.
- **Animated Splash Screen** — Branded loading screen on launch.
- **Frameless Window** — Clean UI with no native menu bar or devtools in production.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron |
| Frontend | React + Vite |
| Styling | CSS Modules |
| State management | Zustand |
| Database | SQLite via better-sqlite3 |
| IPC | Electron ipcMain / ipcRenderer |
| Runtime | Node.js |

---

## 📁 Project Structure
eat-all-pos/
├── electron/
│   ├── main.js          # Electron main process, DB setup, IPC handlers
│   └── preload.js       # Context bridge for renderer
├── src/
│   ├── assets/
│   │   └── Eatall.png   # App logo
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Sidebar.module.css
│   │   └── ...
│   ├── pages/
│   │   ├── POS.jsx
│   │   ├── Orders.jsx
│   │   ├── Products.jsx
│   │   ├── Dashboard.jsx
│   │   └── Settings.jsx
│   ├── store/           # Zustand store
│   └── main.jsx
├── splash.html          # Splash screen (root level)
├── pos.db               # Auto-generated SQLite database (dev)
├── package.json
└── vite.config.js

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
git clone https://github.com/your-username/eat-all-pos.git
cd eat-all-pos
npm install
```

### Run in Development

```bash
npm run dev
```

This starts the Vite dev server and launches Electron pointing to `localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## 🗄 Database

The SQLite database (`pos.db`) is auto-created on first launch and seeded with:

- **5 default categories** — Food, Drinks, Snacks, Electronics, Others
- **12 sample products** with prices, stock levels, and emoji icons
- **Default settings** — store name, currency (PHP ₱), 12% tax rate

In production, the database is stored in the OS user data directory:

| OS | Path |
|---|---|
| Windows | `%APPDATA%\eat-all-pos\pos.db` |
| macOS | `~/Library/Application Support/eat-all-pos/pos.db` |
| Linux | `~/.config/eat-all-pos/pos.db` |

---

## 📄 License

MIT — feel free to use, modify, and distribute.

---

> Built with ☕ and 🍔 by a solo engineer.

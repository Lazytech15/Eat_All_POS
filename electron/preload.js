const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Settings
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },

  // Products
  products: {
    getAll: () => ipcRenderer.invoke('products:getAll'),
    getByBarcode: (barcode) => ipcRenderer.invoke('products:getByBarcode', barcode),
    create: (product) => ipcRenderer.invoke('products:create', product),
    update: (id, updates) => ipcRenderer.invoke('products:update', id, updates),
    delete: (id) => ipcRenderer.invoke('products:delete', id),
    updateStock: (id, delta) => ipcRenderer.invoke('products:updateStock', id, delta),
  },

  // Categories
  categories: {
    getAll: () => ipcRenderer.invoke('categories:getAll'),
    create: (name, color) => ipcRenderer.invoke('categories:create', name, color),
  },

  // Orders
  orders: {
    create: (orderData) => ipcRenderer.invoke('orders:create', orderData),
    getAll: (limit) => ipcRenderer.invoke('orders:getAll', limit),
    getById: (id) => ipcRenderer.invoke('orders:getById', id),
  },

  // Stats
  stats: {
    getDashboard: () => ipcRenderer.invoke('stats:getDashboard'),
  },

  // Receipt
  receipt: {
    print: (receiptData) => ipcRenderer.invoke('receipt:print', receiptData),
  },
})

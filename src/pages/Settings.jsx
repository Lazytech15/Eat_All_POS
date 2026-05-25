import React, { useState, useEffect } from 'react'
import { api } from '../utils'
import { useAppStore } from '../store'
import styles from './Settings.module.css'

export default function Settings() {
  const { settings, setSettings, showNotification } = useAppStore()
  const [form, setForm] = useState({
    store_name: '',
    currency: 'PHP',
    currency_symbol: '₱',
    tax_rate: '12',
    receipt_footer: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) setForm({ ...form, ...settings })
  }, [settings])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [k, v] of Object.entries(form)) {
        await api.settings.set(k, v)
      }
      const updated = await api.settings.get()
      setSettings(updated)
      showNotification('Settings saved!', 'success')
    } catch (err) {
      showNotification('Failed to save settings', 'error')
    }
    setSaving(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>Settings</h2>
        <p className={styles.subtitle}>Configure your store</p>
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Store Information</h3>
          <div className={styles.formGroup}>
            <label>Store Name</label>
            <input value={form.store_name} onChange={e => set('store_name', e.target.value)} placeholder="My Store" />
          </div>
          <div className={styles.formGroup}>
            <label>Receipt Footer Message</label>
            <textarea
              value={form.receipt_footer}
              onChange={e => set('receipt_footer', e.target.value)}
              placeholder="Thank you for your purchase!"
              rows={3}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Currency & Tax</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Currency Code</label>
              <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option value="PHP">PHP – Philippine Peso</option>
                <option value="USD">USD – US Dollar</option>
                <option value="EUR">EUR – Euro</option>
                <option value="SGD">SGD – Singapore Dollar</option>
                <option value="JPY">JPY – Japanese Yen</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Currency Symbol</label>
              <input value={form.currency_symbol} onChange={e => set('currency_symbol', e.target.value)} maxLength={3} />
            </div>
            <div className={styles.formGroup}>
              <label>Tax Rate (%)</label>
              <input type="number" value={form.tax_rate} onChange={e => set('tax_rate', e.target.value)} min={0} max={100} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>App Info</h3>
          <div className={styles.infoGrid}>
            {[
              ['Version', '1.0.0'],
              ['Database', 'SQLite (Local)'],
              ['Mode', 'Offline-capable'],
              ['Build', 'Electron + React Vite'],
            ].map(([k, v]) => (
              <div key={k} className={styles.infoRow}>
                <span className={styles.infoLabel}>{k}</span>
                <span className={styles.infoValue}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : '✓ Save Settings'}
        </button>
      </div>
    </div>
  )
}

import React from 'react'
import { useAppStore } from '../store'
import styles from './Notification.module.css'

export default function Notification() {
  const { notification } = useAppStore()
  if (!notification) return null

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }

  return (
    <div className={`${styles.toast} ${styles[notification.type]} animate-scale-in`} key={notification.id}>
      <span className={styles.icon}>{icons[notification.type] || icons.info}</span>
      <span className={styles.message}>{notification.message}</span>
    </div>
  )
}

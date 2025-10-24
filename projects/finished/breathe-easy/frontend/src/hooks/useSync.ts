import { useState, useEffect } from 'react'
import { SyncManager } from '../lib/sync'

export function useSync(dbName: string) {
  const [syncManager] = useState(() => new SyncManager(dbName))
  const [syncStatus, setSyncStatus] = useState({
    enabled: false,
    dashboardUrl: null,
    type: 'fireproof-cloud'
  })

  const enableSync = async (config?: any) => {
    try {
      let dashboardUrl = null
      
      switch ('fireproof-cloud') {
        case 'fireproof-cloud':
          dashboardUrl = await syncManager.enableCloudSync()
          break
        case 'partykit':
          await syncManager.enablePartyKitSync(config?.roomId || 'default-room')
          break
        case 's3':
          await syncManager.enableS3Sync()
          break
      }
      
      setSyncStatus({
        enabled: true,
        dashboardUrl,
        type: 'fireproof-cloud'
      })
      
      return { success: true, dashboardUrl }
    } catch (error) {
      console.error('Sync enable failed:', error)
      return { success: false, error: error.message }
    }
  }

  const disableSync = async () => {
    await syncManager.disableSync()
    setSyncStatus({
      enabled: false,
      dashboardUrl: null,
      type: 'fireproof-cloud'
    })
  }

  useEffect(() => {
    // Initialize sync status
    const status = syncManager.getSyncStatus()
    setSyncStatus(prev => ({ ...prev, ...status }))
  }, [])

  return {
    syncStatus,
    enableSync,
    disableSync
  }
}
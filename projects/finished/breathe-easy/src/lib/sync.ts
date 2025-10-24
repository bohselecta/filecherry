import { connect } from '@fireproof/cloud'
import { fireproof } from '@fireproof/core'

export class SyncManager {
  private db: any
  private connection: any

  constructor(dbName: string) {
    this.db = fireproof(dbName)
  }

  async enableCloudSync(): Promise<string> {
    try {
      this.connection = await connect(this.db, 'my-cherry-uuid')
      console.log('🌐 Cloud sync enabled!')
      console.log('Dashboard:', this.connection.dashboardUrl)
      return this.connection.dashboardUrl
    } catch (error) {
      console.error('❌ Sync failed:', error)
      throw error
    }
  }

  async disableSync() {
    if (this.connection) {
      await this.connection.close()
      this.connection = null
      console.log('🔒 Sync disabled')
    }
  }

  getSyncStatus() {
    return {
      enabled: !!this.connection,
      dashboardUrl: this.connection?.dashboardUrl
    }
  }
}
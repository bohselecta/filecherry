import { fireproof } from '@fireproof/core'

// Initialize Fireproof database with project name
export const db = fireproof('go-desktop-demo')

// Basic CRUD operations
export async function saveItem(item: any) {
  return await db.put(item)
}

export async function getItem(id: string) {
  return await db.get(id)
}

export async function deleteItem(id: string) {
  return await db.del(id)
}

export async function queryItems(field: string, options?: any) {
  return await db.query(field, options)
}

// Convenience functions for common patterns
export async function saveTodo(text: string, done: boolean = false) {
  return await db.put({
    _id: crypto.randomUUID(),
    type: 'todo',
    text,
    done,
    created: Date.now()
  })
}

export async function saveNote(title: string, content: string) {
  return await db.put({
    _id: crypto.randomUUID(),
    type: 'note',
    title,
    content,
    created: Date.now(),
    updated: Date.now()
  })
}

export async function getAllTodos() {
  return await db.query('type', { key: 'todo' })
}

export async function getAllNotes() {
  return await db.query('type', { key: 'note' })
}

// Cherry management functions
export async function saveCherry(cherry: any) {
  return await db.put({
    _id: crypto.randomUUID(),
    type: 'cherry',
    name: cherry.name,
    description: cherry.description,
    category: cherry.category,
    stack: cherry.stack,
    size: cherry.size,
    path: cherry.path,
    created: Date.now(),
    lastRun: cherry.lastRun,
    isRunning: cherry.isRunning || false,
    metadata: cherry.metadata || {}
  })
}

export async function getAllCherries() {
  return await db.query('type', { key: 'cherry' })
}

export async function getCherryById(id: string) {
  return await db.get(id)
}

export async function updateCherry(id: string, updates: any) {
  const cherry = await db.get(id)
  if (cherry) {
    return await db.put({
      ...cherry,
      ...updates,
      updated: Date.now()
    })
  }
}

export async function deleteCherry(id: string) {
  return await db.del(id)
}

// Project sharing functions
export async function shareProject(projectId: string, shareOptions: any) {
  const project = await db.get(projectId)
  if (project) {
    const shareData = {
      _id: crypto.randomUUID(),
      type: 'shared-project',
      projectId,
      projectData: project,
      shareOptions,
      sharedAt: Date.now(),
      expiresAt: shareOptions.expiresAt || (Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
    }
    
    return await db.put(shareData)
  }
}

export async function getSharedProjects() {
  return await db.query('type', { key: 'shared-project' })
}

export async function importSharedProject(shareId: string) {
  const shareData = await db.get(shareId)
  if (shareData && shareData.type === 'shared-project') {
    // Import the project as a new cherry
    const cherry = {
      ...shareData.projectData,
      _id: crypto.randomUUID(),
      importedAt: Date.now(),
      importedFrom: shareId
    }
    
    return await db.put(cherry)
  }
}

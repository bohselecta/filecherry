import { fireproof } from '@fireproof/core'

// Initialize Fireproof database with project name
export const db = fireproof('{{PROJECT_SLUG}}')

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

// Database status and info
export async function getDatabaseInfo() {
  const stats = await db.stats()
  return {
    name: '{{PROJECT_SLUG}}',
    documents: stats.documents || 0,
    size: stats.size || 0,
    lastModified: stats.lastModified || Date.now()
  }
}

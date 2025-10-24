import { useState, useEffect } from 'react'
import { useLiveQuery, useDocument } from 'use-fireproof'
import { db } from '../lib/database'

// Live query hooks for automatic UI updates
export function useTodos() {
  const result = useLiveQuery('type', { key: 'todo' })
  return result.docs || []
}

export function useNotes() {
  const result = useLiveQuery('type', { key: 'note' })
  return result.docs || []
}

export function useDocumentsByType(type: string) {
  const result = useLiveQuery('type', { key: type })
  return result.docs || []
}

// Single document hooks
export function useUser(userId: string) {
  return useDocument({ _id: userId })
}

export function useDocumentById(id: string) {
  return useDocument({ _id: id })
}

// Database status hook
export function useDatabaseStatus() {
  const [status, setStatus] = useState({
    connected: false,
    documents: 0,
    size: 0,
    lastModified: 0
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const docs = await db.query('type', { key: 'note' })
        setStatus({
          connected: true,
          documents: docs.rows.length,
          size: 0, // Fireproof doesn't expose size directly
          lastModified: Date.now()
        })
      } catch (error) {
        setStatus(prev => ({ ...prev, connected: false }))
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  return status
}

// Custom hooks for common operations
export function useTodoOperations() {
  const addTodo = async (text: string) => {
    return await db.put({
      _id: crypto.randomUUID(),
      type: 'todo',
      text,
      done: false,
      created: Date.now()
    })
  }

  const toggleTodo = async (id: string, done: boolean) => {
    const todo = await db.get(id)
    if (todo) {
      return await db.put({ ...todo, done })
    }
  }

  const deleteTodo = async (id: string) => {
    return await db.del(id)
  }

  return { addTodo, toggleTodo, deleteTodo }
}

export function useNoteOperations() {
  const addNote = async (title: string, content: string) => {
    return await db.put({
      _id: crypto.randomUUID(),
      type: 'note',
      title,
      content,
      created: Date.now(),
      updated: Date.now()
    })
  }

  const updateNote = async (id: string, title: string, content: string) => {
    const note = await db.get(id)
    if (note) {
      return await db.put({
        ...note,
        title,
        content,
        updated: Date.now()
      })
    }
  }

  const deleteNote = async (id: string) => {
    return await db.del(id)
  }

  return { addNote, updateNote, deleteNote }
}

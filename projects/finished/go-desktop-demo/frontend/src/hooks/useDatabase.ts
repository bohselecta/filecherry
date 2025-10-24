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
        const stats = await db.stats()
        setStatus({
          connected: true,
          documents: stats.documents || 0,
          size: stats.size || 0,
          lastModified: stats.lastModified || Date.now()
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

// Cherry management hooks
export function useCherries() {
  const result = useLiveQuery('type', { key: 'cherry' })
  return result.docs || []
}

export function useCherryOperations() {
  const addCherry = async (cherry: any) => {
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
      isRunning: false,
      metadata: cherry.metadata || {}
    })
  }

  const updateCherry = async (id: string, updates: any) => {
    const cherry = await db.get(id)
    if (cherry) {
      return await db.put({
        ...cherry,
        ...updates,
        updated: Date.now()
      })
    }
  }

  const deleteCherry = async (id: string) => {
    return await db.del(id)
  }

  const toggleCherryRunning = async (id: string, isRunning: boolean) => {
    const cherry = await db.get(id)
    if (cherry) {
      return await db.put({
        ...cherry,
        isRunning,
        lastRun: isRunning ? Date.now() : cherry.lastRun,
        updated: Date.now()
      })
    }
  }

  return { addCherry, updateCherry, deleteCherry, toggleCherryRunning }
}

// Project sharing hooks
export function useProjectSharing() {
  const shareProject = async (projectId: string, shareOptions: any) => {
    const project = await db.get(projectId)
    if (project) {
      const shareData = {
        _id: crypto.randomUUID(),
        type: 'shared-project',
        projectId,
        projectData: project,
        shareOptions,
        sharedAt: Date.now(),
        expiresAt: shareOptions.expiresAt || (Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
      
      return await db.put(shareData)
    }
  }

  const getSharedProjects = async () => {
    return await db.query('type', { key: 'shared-project' })
  }

  const importSharedProject = async (shareId: string) => {
    const shareData = await db.get(shareId)
    if (shareData && shareData.type === 'shared-project') {
      const cherry = {
        ...shareData.projectData,
        _id: crypto.randomUUID(),
        importedAt: Date.now(),
        importedFrom: shareId
      }
      
      return await db.put(cherry)
    }
  }

  return { shareProject, getSharedProjects, importSharedProject }
}

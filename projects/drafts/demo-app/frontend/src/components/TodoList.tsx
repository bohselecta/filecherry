import { useState } from 'react'
import { useTodos, useTodoOperations } from '../hooks/useDatabase'

interface Todo {
  _id: string
  text: string
  done: boolean
  created: number
}

export function TodoList() {
  const [newTodo, setNewTodo] = useState('')
  const todos = useTodos() as Todo[]
  const { addTodo, toggleTodo, deleteTodo } = useTodoOperations()

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      await addTodo(newTodo.trim())
      setNewTodo('')
    }
  }

  const handleToggleTodo = async (id: string, done: boolean) => {
    await toggleTodo(id, done)
  }

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">
        🍒 Fireproof Todo List
      </h3>
      
      {/* Add new todo */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new todo..."
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          onClick={handleAddTodo}
          disabled={!newTodo.trim()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          Add
        </button>
      </div>

      {/* Todo list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todos.length === 0 ? (
          <p className="text-white/60 text-center py-4">
            No todos yet. Add one above! ✨
          </p>
        ) : (
          todos
            .sort((a, b) => b.created - a.created) // Newest first
            .map((todo) => (
              <div
                key={todo._id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={(e) => handleToggleTodo(todo._id, e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-400"
                />
                <span
                  className={`flex-1 ${
                    todo.done
                      ? 'line-through text-white/60'
                      : 'text-white'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => handleDeleteTodo(todo._id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete todo"
                >
                  🗑️
                </button>
              </div>
            ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm text-white/60">
          <span>Total: {todos.length}</span>
          <span>Done: {todos.filter(t => t.done).length}</span>
          <span>Remaining: {todos.filter(t => !t.done).length}</span>
        </div>
      </div>
    </div>
  )
}

package main

import (
	"fmt"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/widget"
)

// Task represents a single task item
type Task struct {
	ID          string
	Text        string
	Completed   bool
	Priority    string
	CreatedAt   time.Time
	CompletedAt *time.Time
}

// TaskManager handles task operations
type TaskManager struct {
	tasks []Task
}

func NewTaskManager() *TaskManager {
	return &TaskManager{
		tasks: []Task{
			{
				ID:        "1",
				Text:      "Welcome to Task Cherry! 🍒",
				Completed: false,
				Priority:  "high",
				CreatedAt: time.Now(),
			},
			{
				ID:        "2", 
				Text:      "This is a native Go desktop app",
				Completed: false,
				Priority:  "medium",
				CreatedAt: time.Now(),
			},
		},
	}
}

func (tm *TaskManager) AddTask(text, priority string) {
	task := Task{
		ID:        fmt.Sprintf("%d", len(tm.tasks)+1),
		Text:      text,
		Completed: false,
		Priority:  priority,
		CreatedAt: time.Now(),
	}
	tm.tasks = append(tm.tasks, task)
}

func (tm *TaskManager) ToggleTask(id string) {
	for i, task := range tm.tasks {
		if task.ID == id {
			tm.tasks[i].Completed = !tm.tasks[i].Completed
			if tm.tasks[i].Completed {
				now := time.Now()
				tm.tasks[i].CompletedAt = &now
			} else {
				tm.tasks[i].CompletedAt = nil
			}
			break
		}
	}
}

func (tm *TaskManager) DeleteTask(id string) {
	for i, task := range tm.tasks {
		if task.ID == id {
			tm.tasks = append(tm.tasks[:i], tm.tasks[i+1:]...)
			break
		}
	}
}

func (tm *TaskManager) GetTasks() []Task {
	return tm.tasks
}

func (tm *TaskManager) GetStats() (total, completed, pending int) {
	total = len(tm.tasks)
	for _, task := range tm.tasks {
		if task.Completed {
			completed++
		} else {
			pending++
		}
	}
	return
}

func main() {
	// Create the app
	myApp := app.NewWithID("com.filecherry.task-cherry")

	// Create the main window
	myWindow := myApp.NewWindow("🍒 Task Cherry - Native Desktop App")
	myWindow.Resize(fyne.NewSize(800, 600))
	myWindow.CenterOnScreen()

	// Initialize task manager
	taskManager := NewTaskManager()

	// Create UI elements
	title := widget.NewLabel("🍒 Task Cherry")
	title.TextStyle.Bold = true
	title.Alignment = fyne.TextAlignCenter

	subtitle := widget.NewLabel("Native Go Desktop Application")
	subtitle.Alignment = fyne.TextAlignCenter

	// Stats display
	statsBinding := binding.NewString()
	updateStats := func() {
		total, completed, pending := taskManager.GetStats()
		statsBinding.Set(fmt.Sprintf("📊 Total: %d | ✅ Completed: %d | ⏳ Pending: %d", 
			total, completed, pending))
	}
	updateStats()

	statsLabel := widget.NewLabelWithData(statsBinding)

	// Task input
	taskInput := widget.NewEntry()
	taskInput.SetPlaceHolder("What needs to be done?")

	// Priority selector
	prioritySelect := widget.NewSelect([]string{"low", "medium", "high"}, nil)
	prioritySelect.SetSelected("medium")

	// Task list container
	taskList := container.NewVBox()

	// Function to refresh the task list
	var refreshTaskList func()
	refreshTaskList = func() {
		taskList.RemoveAll()
		for _, task := range taskManager.GetTasks() {
			taskItem := createTaskItem(task, taskManager, refreshTaskList, updateStats)
			taskList.Add(taskItem)
		}
	}

	// Add task button
	addButton := widget.NewButton("🍒 Add Task", func() {
		text := taskInput.Text
		priority := prioritySelect.Selected
		if text != "" {
			taskManager.AddTask(text, priority)
			taskInput.SetText("")
			refreshTaskList()
			updateStats()
		}
	})

	// Initial task list
	refreshTaskList()

	// Create scrollable task list
	scrollContainer := container.NewScroll(taskList)
	scrollContainer.SetMinSize(fyne.NewSize(0, 300))

	// Filter buttons
	filterAll := widget.NewButton("All", func() {
		refreshTaskList()
	})
	filterPending := widget.NewButton("Pending", func() {
		taskList.RemoveAll()
		for _, task := range taskManager.GetTasks() {
			if !task.Completed {
				taskItem := createTaskItem(task, taskManager, refreshTaskList, updateStats)
				taskList.Add(taskItem)
			}
		}
	})
	filterCompleted := widget.NewButton("Completed", func() {
		taskList.RemoveAll()
		for _, task := range taskManager.GetTasks() {
			if task.Completed {
				taskItem := createTaskItem(task, taskManager, refreshTaskList, updateStats)
				taskList.Add(taskItem)
			}
		}
	})

	filterContainer := container.NewHBox(
		widget.NewLabel("Filters:"),
		filterAll,
		filterPending,
		filterCompleted,
	)

	// Input container
	inputContainer := container.NewVBox(
		taskInput,
		container.NewHBox(
			widget.NewLabel("Priority:"),
			prioritySelect,
			addButton,
		),
	)

	// Main content
	content := container.NewVBox(
		title,
		subtitle,
		widget.NewSeparator(),
		statsLabel,
		widget.NewSeparator(),
		inputContainer,
		widget.NewSeparator(),
		filterContainer,
		scrollContainer,
	)

	// Set content and show window
	myWindow.SetContent(content)
	myWindow.ShowAndRun()
}

func createTaskItem(task Task, taskManager *TaskManager, refreshList func(), updateStats func()) *fyne.Container {
	// Task text
	taskText := widget.NewLabel(task.Text)
	if task.Completed {
		// Fyne doesn't have strikethrough, so we'll use a different visual indicator
		taskText.TextStyle.Italic = true
	}

	// Priority indicator
	priorityLabel := widget.NewLabel(getPriorityIcon(task.Priority))

	// Toggle button
	toggleText := "✅"
	if !task.Completed {
		toggleText = "⭕"
	}
	toggleButton := widget.NewButton(toggleText, func() {
		taskManager.ToggleTask(task.ID)
		refreshList()
		updateStats()
	})

	// Delete button
	deleteButton := widget.NewButton("🗑️", func() {
		taskManager.DeleteTask(task.ID)
		refreshList()
		updateStats()
	})

	// Created time
	timeLabel := widget.NewLabel(formatTime(task.CreatedAt))
	timeLabel.TextStyle.Italic = true

	// Task item container
	taskItem := container.NewBorder(
		nil, nil,
		container.NewHBox(priorityLabel, taskText),
		container.NewHBox(toggleButton, deleteButton),
		timeLabel,
	)

	return taskItem
}

func getPriorityIcon(priority string) string {
	switch priority {
	case "high":
		return "🔴"
	case "medium":
		return "🟡"
	case "low":
		return "🟢"
	default:
		return "⚪"
	}
}

func formatTime(t time.Time) string {
	return t.Format("Jan 2, 3:04 PM")
}
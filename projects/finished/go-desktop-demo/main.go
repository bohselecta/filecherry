package main

import (
	"fmt"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
)

// Cherry represents a portable application
type Cherry struct {
	ID          string
	Name        string
	Description string
	Category    string
	Stack       string
	Size        string
	Path        string
	CreatedAt   time.Time
	LastRun     *time.Time
	IsRunning   bool
}

// CherryManager handles cherry operations
type CherryManager struct {
	cherries []Cherry
}

func NewCherryManager() *CherryManager {
	return &CherryManager{
		cherries: []Cherry{
			{
				ID:          "1",
				Name:        "Task Cherry",
				Description: "Simple task management app",
				Category:    "productivity",
				Stack:       "go-gin",
				Size:        "12 MB",
				Path:        "",
				CreatedAt:   time.Now(),
			},
			{
				ID:          "2",
				Name:        "Note Taker",
				Description: "Quick note-taking utility",
				Category:    "productivity",
				Stack:       "static",
				Size:        "800 KB",
				Path:        "",
				CreatedAt:   time.Now(),
			},
		},
	}
}

func (cm *CherryManager) AddCherry(name, description, category, stack string) {
	cherry := Cherry{
		ID:          fmt.Sprintf("%d", len(cm.cherries)+1),
		Name:        name,
		Description: description,
		Category:    category,
		Stack:       stack,
		Size:        estimateSize(stack),
		Path:        "",
		CreatedAt:   time.Now(),
	}
	cm.cherries = append(cm.cherries, cherry)
}

func (cm *CherryManager) DeleteCherry(id string) {
	for i, cherry := range cm.cherries {
		if cherry.ID == id {
			cm.cherries = append(cm.cherries[:i], cm.cherries[i+1:]...)
			break
		}
	}
}

func (cm *CherryManager) GetCherries() []Cherry {
	return cm.cherries
}

func (cm *CherryManager) GetStats() (total, running, stopped int) {
	total = len(cm.cherries)
	for _, cherry := range cm.cherries {
		if cherry.IsRunning {
			running++
		} else {
			stopped++
		}
	}
	return
}

func estimateSize(stack string) string {
	sizes := map[string]string{
		"go-gin":     "8-18 MB",
		"go-fyne":    "20-30 MB",
		"bun-hono":   "50-100 MB",
		"rust-axum":  "5-15 MB",
		"tauri-react": "6-14 MB",
		"static":     "<2 MB",
	}
	if size, exists := sizes[stack]; exists {
		return size
	}
	return "Unknown"
}

func main() {
	// Create the app
	myApp := app.NewWithID("com.filecherry.desktop")

	// Create the main window
	myWindow := myApp.NewWindow("🍒 FileCherry Desktop - Cherry Bowl Manager")
	myWindow.Resize(fyne.NewSize(1000, 700))
	myWindow.CenterOnScreen()

	// Initialize cherry manager
	cherryManager := NewCherryManager()

	// Create UI elements
	title := widget.NewLabel("🍒 FileCherry Desktop")
	title.TextStyle.Bold = true
	title.Alignment = fyne.TextAlignCenter

	subtitle := widget.NewLabel("Your Cherry Bowl & Project Manager")
	subtitle.Alignment = fyne.TextAlignCenter

	// Stats display
	statsBinding := binding.NewString()
	updateStats := func() {
		total, running, stopped := cherryManager.GetStats()
		statsBinding.Set(fmt.Sprintf("📊 Total: %d | 🟢 Running: %d | ⏸️ Stopped: %d", 
			total, running, stopped))
	}
	updateStats()

	statsLabel := widget.NewLabelWithData(statsBinding)

	// Cherry list container
	cherryList := container.NewVBox()

	// Function to refresh the cherry list
	var refreshCherryList func()
	refreshCherryList = func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats)
			cherryList.Add(cherryItem)
		}
	}

	// Browse marketplace button
	browseMarketplaceButton := widget.NewButton("🛒 Browse Marketplace", func() {
		showMarketplaceDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Install from file button
	installFromFileButton := widget.NewButton("📁 Install from File", func() {
		showInstallDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Initial cherry list
	refreshCherryList()

	// Create scrollable cherry list
	scrollContainer := container.NewScroll(cherryList)
	scrollContainer.SetMinSize(fyne.NewSize(0, 400))

	// Filter buttons
	filterAll := widget.NewButton("All", func() {
		refreshCherryList()
	})
	filterRunning := widget.NewButton("Running", func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			if cherry.IsRunning {
				cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats)
				cherryList.Add(cherryItem)
			}
		}
	})
	filterStopped := widget.NewButton("Stopped", func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			if !cherry.IsRunning {
				cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats)
				cherryList.Add(cherryItem)
			}
		}
	})

	filterContainer := container.NewHBox(
		widget.NewLabel("Filters:"),
		filterAll,
		filterRunning,
		filterStopped,
	)

	// Input container
	inputContainer := container.NewVBox(
		widget.NewLabel("Add Cherries to Your Bowl:"),
		container.NewHBox(browseMarketplaceButton, installFromFileButton),
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

func createCherryItem(cherry Cherry, cherryManager *CherryManager, refreshList func(), updateStats func()) *fyne.Container {
	// Cherry name
	cherryName := widget.NewLabel(cherry.Name)
	cherryName.TextStyle.Bold = true

	// Cherry description
	cherryDesc := widget.NewLabel(cherry.Description)
	cherryDesc.TextStyle.Italic = true

	// Stack and size info
	stackLabel := widget.NewLabel(fmt.Sprintf("%s • %s", cherry.Stack, cherry.Size))

	// Status indicator
	statusIcon := "⏸️"
	if cherry.IsRunning {
		statusIcon = "🟢"
	}
	statusLabel := widget.NewLabel(statusIcon)

	// Run/Stop button
	runButtonText := "▶ Run"
	if cherry.IsRunning {
		runButtonText = "⏹ Stop"
	}
	runButton := widget.NewButton(runButtonText, func() {
		if cherry.IsRunning {
			// Stop cherry
			for i, c := range cherryManager.cherries {
				if c.ID == cherry.ID {
					cherryManager.cherries[i].IsRunning = false
					break
				}
			}
		} else {
			// Run cherry
			for i, c := range cherryManager.cherries {
				if c.ID == cherry.ID {
					cherryManager.cherries[i].IsRunning = true
					now := time.Now()
					cherryManager.cherries[i].LastRun = &now
					break
				}
			}
		}
		refreshList()
		updateStats()
	})

	// Delete button
	deleteButton := widget.NewButton("🗑️", func() {
		cherryManager.DeleteCherry(cherry.ID)
		refreshList()
		updateStats()
	})

	// Created time
	timeLabel := widget.NewLabel(formatTime(cherry.CreatedAt))
	timeLabel.TextStyle.Italic = true

	// Cherry item container
	cherryItem := container.NewBorder(
		nil, nil,
		container.NewVBox(
			container.NewHBox(cherryName, statusLabel),
			cherryDesc,
			stackLabel,
		),
		container.NewHBox(runButton, deleteButton),
		timeLabel,
	)

	return cherryItem
}

func showMarketplaceDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Sample marketplace cherries
	marketplaceCherries := []Cherry{
		{
			ID:          "market-1",
			Name:        "Task Master",
			Description: "Beautiful task manager with categories and due dates",
			Category:    "productivity",
			Stack:       "go-gin",
			Size:        "12 MB",
		},
		{
			ID:          "market-2",
			Name:        "Note Taker",
			Description: "Quick note-taking utility with markdown support",
			Category:    "productivity",
			Stack:       "static",
			Size:        "800 KB",
		},
		{
			ID:          "market-3",
			Name:        "Color Palette",
			Description: "Generate beautiful color schemes with AI",
			Category:    "creative",
			Stack:       "static",
			Size:        "600 KB",
		},
		{
			ID:          "market-4",
			Name:        "Invoice Generator",
			Description: "Professional invoices with PDF export",
			Category:    "business",
			Stack:       "go-gin",
			Size:        "14 MB",
		},
	}

	// Create marketplace list
	marketplaceList := container.NewVBox()
	for _, cherry := range marketplaceCherries {
		item := container.NewBorder(
			nil, nil,
			container.NewVBox(
				widget.NewLabel(cherry.Name),
				widget.NewLabel(cherry.Description),
				widget.NewLabel(fmt.Sprintf("%s • %s", cherry.Category, cherry.Size)),
			),
			widget.NewButton("Install", func() {
				// Add to cherry bowl
				cherryManager.AddCherry(cherry.Name, cherry.Description, cherry.Category, cherry.Stack)
				refreshList()
				updateStats()
				dialog.ShowInformation("Installed", fmt.Sprintf("Cherry '%s' added to your bowl!", cherry.Name), parent)
			}),
		)
		marketplaceList.Add(item)
	}

	scrollContainer := container.NewScroll(marketplaceList)
	scrollContainer.SetMinSize(fyne.NewSize(600, 400))

	dialog.ShowCustom("Cherry Marketplace", "Close", scrollContainer, parent)
}

func showInstallDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// This would open a file dialog to install cherries from local files
	dialog.ShowInformation("Install from File", "This feature will allow you to install cherries from local .exe/.app files", parent)
}

func formatTime(t time.Time) string {
	return t.Format("Jan 2, 3:04 PM")
}
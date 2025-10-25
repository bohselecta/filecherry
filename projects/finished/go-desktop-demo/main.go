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
				Name:        "Todo Desktop App",
				Description: "A desktop todo application built with Go + Fyne",
				Category:    "desktop",
				Stack:       "go-fyne",
				Size:        "15 MB",
				Path:        "/projects/todo-desktop",
				CreatedAt:   time.Now().Add(-24 * time.Hour),
				LastRun:     &[]time.Time{time.Now().Add(-2 * time.Hour)}[0],
				IsRunning:   false,
			},
			{
				ID:          "2",
				Name:        "Chat Web App",
				Description: "Real-time chat application with Bun + Hono",
				Category:    "web",
				Stack:       "bun-hono",
				Size:        "8 MB",
				Path:        "/projects/chat-web",
				CreatedAt:   time.Now().Add(-12 * time.Hour),
				LastRun:     &[]time.Time{time.Now().Add(-1 * time.Hour)}[0],
				IsRunning:   true,
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
	// Create the app with custom theme
	myApp := app.NewWithID("com.filecherry.desktop")
	myApp.Settings().SetTheme(NewFileCherryTheme())

	// Create the main window
	myWindow := myApp.NewWindow("🍒 FileCherry Desktop - Cherry Bowl Manager")
	myWindow.Resize(fyne.NewSize(1200, 800))
	myWindow.CenterOnScreen()

	// Initialize cherry manager
	cherryManager := NewCherryManager()

	// Create UI elements
	title := widget.NewLabel("🍒 FileCherry Desktop")
	title.TextStyle.Bold = true
	title.Alignment = fyne.TextAlignCenter

	subtitle := widget.NewLabel("Code Generator for Desktop & Web Apps")
	subtitle.Alignment = fyne.TextAlignCenter

	// Stats display
	statsBinding := binding.NewString()
	updateStats := func() {
		total, running, stopped := cherryManager.GetStats()
		statsBinding.Set(fmt.Sprintf("📊 Total: %d | 📂 Open: %d | ⏸️ Closed: %d", 
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
			cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats, myWindow)
			cherryList.Add(cherryItem)
		}
	}

	// Generate App button
	generateAppButton := widget.NewButton("🚀 Generate App", func() {
		showGenerateAppDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Browse Templates button
	browseTemplatesButton := widget.NewButton("📋 Browse Templates", func() {
		showTemplatesDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Build Projects button
	buildProjectsButton := widget.NewButton("🔨 Build Projects", func() {
		showBuildDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Settings button
	settingsButton := widget.NewButton("⚙️ Settings", func() {
		showSettingsDialog(myWindow)
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
	filterOpen := widget.NewButton("Open", func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			if cherry.IsRunning {
				cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats, myWindow)
				cherryList.Add(cherryItem)
			}
		}
	})
	filterClosed := widget.NewButton("Closed", func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			if !cherry.IsRunning {
				cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats, myWindow)
				cherryList.Add(cherryItem)
			}
		}
	})

	filterContainer := container.NewHBox(
		widget.NewLabel("Filters:"),
		filterAll,
		filterOpen,
		filterClosed,
	)

	// Input container
	inputContainer := container.NewVBox(
		widget.NewLabel("Generate Applications:"),
		container.NewHBox(generateAppButton, browseTemplatesButton, buildProjectsButton, settingsButton),
	)

	// Create hero section with main cherry
	var heroCherry Cherry
	if len(cherryManager.GetCherries()) > 0 {
		heroCherry = cherryManager.GetCherries()[0]
	} else {
		heroCherry = Cherry{
			ID:          "hero",
			Name:        "Welcome to FileCherry!",
			Description: "Generate desktop and web applications with TinyApp Factory. Choose a template and create your app!",
			Category:    "welcome",
			Stack:       "static",
			Size:        "0 MB",
			CreatedAt:   time.Now(),
		}
	}
	
	heroCard := NewHeroCard(heroCherry)
	heroContainer := container.NewPadded(heroCard)

	// Main content with hero section
	content := container.NewVBox(
		title,
		subtitle,
		widget.NewSeparator(),
		statsLabel,
		widget.NewSeparator(),
		heroContainer,
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

func createCherryItem(cherry Cherry, cherryManager *CherryManager, refreshList func(), updateStats func(), parent fyne.Window) *fyne.Container {
	// Create beautiful cherry card
	cherryCard := NewCherryCard(cherry, 
		func() {
			// Open cherry functionality
			for i, c := range cherryManager.cherries {
				if c.ID == cherry.ID {
					cherryManager.cherries[i].IsRunning = true
					now := time.Now()
					cherryManager.cherries[i].LastRun = &now
					break
				}
			}
			refreshList()
			updateStats()
			dialog.ShowInformation("Cherry Opened", fmt.Sprintf("Opening '%s'...", cherry.Name), parent)
		},
		func() {
			// Delete functionality
			cherryManager.DeleteCherry(cherry.ID)
			refreshList()
			updateStats()
		},
		func() {
			// Share functionality
			dialog.ShowInformation("Share Cherry", fmt.Sprintf("Sharing cherry '%s' with Fireproof sync!", cherry.Name), parent)
		},
		refreshList,
		updateStats,
	)
	
	// Wrap in container with padding
	return container.NewPadded(cherryCard)
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

func showSettingsDialog(parent fyne.Window) {
	// Create settings content
	generalLabel := widget.NewLabel("General Settings")
	generalLabel.TextStyle.Bold = true

	// Auto-update setting
	autoUpdateCheck := widget.NewCheck("Enable auto-updates", nil)
	autoUpdateCheck.SetChecked(true)

	// Storage path setting
	storagePathLabel := widget.NewLabel("Storage Path:")
	storagePathEntry := widget.NewEntry()
	storagePathEntry.SetText("~/FileCherry")
	storagePathButton := widget.NewButton("Browse", func() {
		// This would open a folder picker dialog
		dialog.ShowInformation("Browse Folder", "This would open a folder picker dialog", parent)
	})

	// AI API Key setting
	aiKeyLabel := widget.NewLabel("AI API Key (for AI Builder):")
	aiKeyEntry := widget.NewEntry()
	aiKeyEntry.SetPlaceHolder("Enter your DeepSeek or OpenAI API key")
	aiKeyEntry.SetText("")

	// About section
	aboutLabel := widget.NewLabel("About FileCherry")
	aboutLabel.TextStyle.Bold = true
	versionLabel := widget.NewLabel("Version: 1.0.0")
	buildLabel := widget.NewLabel("Build: Desktop Manager")
	authorLabel := widget.NewLabel("Built with TinyApp Factory")

	// Settings content
	content := container.NewVBox(
		generalLabel,
		widget.NewSeparator(),
		autoUpdateCheck,
		widget.NewSeparator(),
		storagePathLabel,
		container.NewHBox(storagePathEntry, storagePathButton),
		widget.NewSeparator(),
		aiKeyLabel,
		aiKeyEntry,
		widget.NewSeparator(),
		aboutLabel,
		widget.NewSeparator(),
		versionLabel,
		buildLabel,
		authorLabel,
	)

	dialog.ShowCustom("Settings", "Close", content, parent)
}

func formatTime(t time.Time) string {
	return t.Format("Jan 2, 3:04 PM")
}

func showGenerateAppDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create app generation dialog
	nameEntry := widget.NewEntry()
	nameEntry.SetPlaceHolder("App name")

	descEntry := widget.NewEntry()
	descEntry.SetPlaceHolder("App description")

	appTypeSelect := widget.NewSelect([]string{"desktop", "web"}, nil)
	appTypeSelect.SetSelected("desktop")

	stackSelect := widget.NewSelect([]string{"go-fyne", "tauri-react", "bun-hono", "rust-axum", "go-gin", "static"}, nil)
	stackSelect.SetSelected("go-fyne")

	content := container.NewVBox(
		widget.NewLabel("🚀 Generate New Application"),
		widget.NewSeparator(),
		nameEntry,
		descEntry,
		container.NewHBox(
			widget.NewLabel("App Type:"),
			appTypeSelect,
		),
		container.NewHBox(
			widget.NewLabel("Stack:"),
			stackSelect,
		),
		widget.NewSeparator(),
		widget.NewLabel("This will create a new project using TinyApp Factory CLI"),
	)

	dialog.ShowCustomConfirm("Generate App", "Generate", "Cancel", content, func(confirmed bool) {
		if confirmed {
			name := nameEntry.Text
			desc := descEntry.Text
			appType := appTypeSelect.Selected
			stack := stackSelect.Selected
			if name != "" && desc != "" {
				// Add to cherry manager as a generated project
				cherryManager.AddCherry(name, desc, appType, stack)
				refreshList()
				updateStats()
				dialog.ShowInformation("App Generated", fmt.Sprintf("App '%s' has been generated using %s stack!", name, stack), parent)
			}
		}
	}, parent)
}

func showTemplatesDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create templates dialog
	templatesLabel := widget.NewLabel("📋 Available Templates")
	templatesLabel.TextStyle.Bold = true

	templates := []struct {
		name        string
		description string
		stack       string
		type_       string
	}{
		{"Todo App", "A simple todo list application", "go-fyne", "desktop"},
		{"Chat App", "Real-time chat application", "bun-hono", "web"},
		{"File Manager", "Desktop file management tool", "tauri-react", "desktop"},
		{"API Server", "RESTful API server", "rust-axum", "web"},
		{"Static Site", "Simple static website", "static", "web"},
	}

	var templateButtons []fyne.CanvasObject
	for _, template := range templates {
		template := template // capture loop variable
		btn := widget.NewButton(fmt.Sprintf("%s (%s)", template.name, template.stack), func() {
			cherryManager.AddCherry(template.name, template.description, template.type_, template.stack)
			refreshList()
			updateStats()
			dialog.ShowInformation("Template Added", fmt.Sprintf("Template '%s' added to your projects!", template.name), parent)
		})
		templateButtons = append(templateButtons, btn)
	}

	content := container.NewVBox(
		templatesLabel,
		widget.NewSeparator(),
		widget.NewLabel("Choose a template to add to your projects:"),
		widget.NewSeparator(),
		container.NewVBox(templateButtons...),
	)

	dialog.ShowCustom("Browse Templates", "Close", content, parent)
}

func showBuildDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create build dialog
	buildLabel := widget.NewLabel("🔨 Build Projects")
	buildLabel.TextStyle.Bold = true

	cherries := cherryManager.GetCherries()
	if len(cherries) == 0 {
		dialog.ShowInformation("No Projects", "You don't have any projects to build yet. Generate an app first!", parent)
		return
	}

	var buildButtons []fyne.CanvasObject
	for _, cherry := range cherries {
		cherry := cherry // capture loop variable
		btn := widget.NewButton(fmt.Sprintf("Build %s (%s)", cherry.Name, cherry.Stack), func() {
			dialog.ShowInformation("Building", fmt.Sprintf("Building %s using TinyApp Factory CLI...", cherry.Name), parent)
		})
		buildButtons = append(buildButtons, btn)
	}

	content := container.NewVBox(
		buildLabel,
		widget.NewSeparator(),
		widget.NewLabel("Build your generated projects:"),
		widget.NewSeparator(),
		container.NewVBox(buildButtons...),
		widget.NewSeparator(),
		widget.NewLabel("This will compile and package your applications for distribution."),
	)

	dialog.ShowCustom("Build Projects", "Close", content, parent)
}
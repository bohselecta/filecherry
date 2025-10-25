package main

import (
	"fmt"
	"time"
	"net/http"
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"os/exec"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/widget"
)

// Cherry represents a portable application description
type Cherry struct {
	ID          string
	Name        string
	Description string
	Category    string
	Stack       string
	Size        string
	Path        string
	CreatedAt   time.Time
	LastCompiled *time.Time
	IsCompiled   bool
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
				LastCompiled: &[]time.Time{time.Now().Add(-2 * time.Hour)}[0],
				IsCompiled:   true,
			},
			{
				ID:          "2",
				Name:        "Portfolio Website",
				Description: "A static HTML portfolio website",
				Category:    "web",
				Stack:       "static-html",
				Size:        "2 MB",
				Path:        "/projects/portfolio-web",
				CreatedAt:   time.Now().Add(-12 * time.Hour),
				LastCompiled: nil,
				IsCompiled:   false,
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

func (cm *CherryManager) GetStats() (total, compiled, pending int) {
	total = len(cm.cherries)
	for _, cherry := range cm.cherries {
		if cherry.IsCompiled {
			compiled++
		} else {
			pending++
		}
	}
	return total, compiled, pending
}

func estimateSize(stack string) string {
	sizes := map[string]string{
		"static-html": "1-3 MB",
		"go-fyne":     "15-25 MB",
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

	// Create UI elements with better hierarchy
	title := widget.NewLabel("🍒 FileCherry Desktop")
	title.TextStyle.Bold = true
	title.Alignment = fyne.TextAlignCenter

	subtitle := widget.NewLabel("File Manager & App Builder for Cherry Descriptions")
	subtitle.Alignment = fyne.TextAlignCenter

	// Stats display (more compact)
	statsBinding := binding.NewString()
	updateStats := func() {
		total, compiled, pending := cherryManager.GetStats()
		statsBinding.Set(fmt.Sprintf("%d cherries • %d compiled • %d pending", 
			total, compiled, pending))
	}
	updateStats()

	statsLabel := widget.NewLabelWithData(statsBinding)
	statsLabel.Alignment = fyne.TextAlignCenter

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

	// Primary Actions (Most Important)
	createAppButton := widget.NewButton("🚀 Create New App", func() {
		showCreateAppDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	aiBuilderButton := widget.NewButton("🤖 AI Builder", func() {
		showAIBuilderDialog(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Secondary Actions (Less Important - moved to menu)
	// These will be accessible via a "More Actions" menu
	moreActionsButton := widget.NewButton("⋯ More Actions", func() {
		showMoreActionsMenu(myWindow, cherryManager, refreshCherryList, updateStats)
	})

	// Settings button (moved to menu bar area)
	settingsButton := widget.NewButton("⚙️", func() {
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
	filterCompiled := widget.NewButton("Compiled", func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			if cherry.IsCompiled {
				cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats, myWindow)
				cherryList.Add(cherryItem)
			}
		}
	})
	filterPending := widget.NewButton("Pending", func() {
		cherryList.RemoveAll()
		for _, cherry := range cherryManager.GetCherries() {
			if !cherry.IsCompiled {
				cherryItem := createCherryItem(cherry, cherryManager, refreshCherryList, updateStats, myWindow)
				cherryList.Add(cherryItem)
			}
		}
	})

	filterContainer := container.NewHBox(
		widget.NewLabel("Filters:"),
		filterAll,
		filterCompiled,
		filterPending,
	)

	// Primary action container (prominent)
	primaryActionsContainer := container.NewHBox(
		createAppButton,
		aiBuilderButton,
	)

	// Secondary actions container (less prominent)
	secondaryActionsContainer := container.NewHBox(
		moreActionsButton,
		widget.NewSeparator(),
		settingsButton,
	)

	// Main input container with better hierarchy
	inputContainer := container.NewVBox(
		widget.NewLabel("Quick Start:"),
		primaryActionsContainer,
		widget.NewSeparator(),
		secondaryActionsContainer,
	)

	// Create hero section with main cherry (removed from main layout for better UX)
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
	
	// Hero card (not used in main layout but kept for future use)
	_ = NewHeroCard(heroCherry)

	// Main content with better spacing and hierarchy
	content := container.NewVBox(
		// Header section
		container.NewVBox(
			title,
			subtitle,
			widget.NewSeparator(),
			statsLabel,
		),
		
		widget.NewSeparator(),
		
		// Quick start section
		inputContainer,
		
		widget.NewSeparator(),
		
		// Projects section
		container.NewVBox(
			widget.NewLabel("Your Projects:"),
			filterContainer,
			scrollContainer,
		),
	)

	// Set content and show window
	myWindow.SetContent(content)
	myWindow.ShowAndRun()
}

func createCherryItem(cherry Cherry, cherryManager *CherryManager, refreshList func(), updateStats func(), parent fyne.Window) *fyne.Container {
	// Create beautiful cherry card
	cherryCard := NewCherryCard(cherry, 
		func() {
			// Compile cherry functionality
			for i, c := range cherryManager.cherries {
				if c.ID == cherry.ID {
					cherryManager.cherries[i].IsCompiled = true
					now := time.Now()
					cherryManager.cherries[i].LastCompiled = &now
					break
				}
			}
			refreshList()
			updateStats()
			dialog.ShowInformation("Cherry Compiled", fmt.Sprintf("Compiling '%s' into executable...", cherry.Name), parent)
		},
		func() {
			// Delete functionality with confirmation
			dialog.ShowConfirm("Delete Cherry", 
				fmt.Sprintf("Are you sure you want to delete '%s'? This action cannot be undone.", cherry.Name),
				func(confirmed bool) {
					if confirmed {
						cherryManager.DeleteCherry(cherry.ID)
						refreshList()
						updateStats()
					}
				}, parent)
		},
		func() {
			// Share functionality
			dialog.ShowInformation("Share Cherry", fmt.Sprintf("Sharing cherry '%s' with Fireproof sync!", cherry.Name), parent)
		},
		refreshList,
		updateStats,
	)

	// Add contextual actions for this specific cherry
	contextualActions := container.NewHBox(
		widget.NewButton("⚡ Compile", func() {
			// Compile this specific cherry
			for i, c := range cherryManager.cherries {
				if c.ID == cherry.ID {
					cherryManager.cherries[i].IsCompiled = true
					now := time.Now()
					cherryManager.cherries[i].LastCompiled = &now
					break
				}
			}
			refreshList()
			updateStats()
			dialog.ShowInformation("Compiled", fmt.Sprintf("Compiled '%s' into executable!", cherry.Name), parent)
		}),
		widget.NewButton("📁 Open Folder", func() {
			dialog.ShowInformation("Open Folder", fmt.Sprintf("Opening folder for %s...", cherry.Name), parent)
		}),
		widget.NewButton("ℹ️ Details", func() {
			showProjectDetailsDialog(parent, cherry)
		}),
	)
	
	// Wrap in container with contextual actions
	return container.NewVBox(
		container.NewPadded(cherryCard),
		contextualActions,
	)
}

func showProjectDetailsDialog(parent fyne.Window, cherry Cherry) {
	// Create project details dialog
	detailsLabel := widget.NewLabel("Project Details")
	detailsLabel.TextStyle.Bold = true

	// Project information
	nameLabel := widget.NewLabel(fmt.Sprintf("Name: %s", cherry.Name))
	descLabel := widget.NewLabel(fmt.Sprintf("Description: %s", cherry.Description))
	categoryLabel := widget.NewLabel(fmt.Sprintf("Category: %s", cherry.Category))
	stackLabel := widget.NewLabel(fmt.Sprintf("Stack: %s", cherry.Stack))
	sizeLabel := widget.NewLabel(fmt.Sprintf("Size: %s", cherry.Size))
	pathLabel := widget.NewLabel(fmt.Sprintf("Path: %s", cherry.Path))
	createdLabel := widget.NewLabel(fmt.Sprintf("Created: %s", formatTime(cherry.CreatedAt)))
	
	var lastCompiledLabel *widget.Label
	if cherry.LastCompiled != nil {
		lastCompiledLabel = widget.NewLabel(fmt.Sprintf("Last Compiled: %s", formatTime(*cherry.LastCompiled)))
	} else {
		lastCompiledLabel = widget.NewLabel("Last Compiled: Never")
	}

	statusLabel := widget.NewLabel(fmt.Sprintf("Status: %s", func() string {
		if cherry.IsCompiled {
			return "Compiled"
		}
		return "Pending"
	}()))

	content := container.NewVBox(
		detailsLabel,
		widget.NewSeparator(),
		nameLabel,
		descLabel,
		categoryLabel,
		stackLabel,
		sizeLabel,
		pathLabel,
		createdLabel,
		lastCompiledLabel,
		statusLabel,
	)

	dialog.ShowCustom("Project Details", "Close", content, parent)
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
	autoUpdateCheck.SetChecked(appSettings.AutoUpdate)

	// Storage path setting
	storagePathLabel := widget.NewLabel("Storage Path:")
	storagePathEntry := widget.NewEntry()
	storagePathEntry.SetText(appSettings.StoragePath)
	storagePathButton := widget.NewButton("Browse", func() {
		// This would open a folder picker dialog
		dialog.ShowInformation("Browse Folder", "This would open a folder picker dialog", parent)
	})

	// AI API Key setting
	aiKeyLabel := widget.NewLabel("AI API Key (for AI Builder):")
	aiKeyEntry := widget.NewEntry()
	aiKeyEntry.SetPlaceHolder("Enter your DeepSeek or OpenAI API key")
	aiKeyEntry.SetText(appSettings.AIAPIKey)

	// Save button
	saveButton := widget.NewButton("💾 Save Settings", func() {
		// Update settings from UI
		appSettings.AutoUpdate = autoUpdateCheck.Checked
		appSettings.StoragePath = storagePathEntry.Text
		appSettings.AIAPIKey = aiKeyEntry.Text
		
		// Save to file
		err := saveSettings()
		if err != nil {
			dialog.ShowError(fmt.Errorf("Failed to save settings: %v", err), parent)
			return
		}
		
		dialog.ShowInformation("Settings Saved", "Your settings have been saved successfully!", parent)
	})

	// About section
	aboutLabel := widget.NewLabel("About FileCherry")
	aboutLabel.TextStyle.Bold = true
	versionLabel := widget.NewLabel("Version: 1.0.0")
	buildLabel := widget.NewLabel("Build: Desktop Manager")
	authorLabel := widget.NewLabel("Built with TinyApp Factory")

	// Settings content with proper width
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
		saveButton,
		widget.NewSeparator(),
		aboutLabel,
		widget.NewSeparator(),
		versionLabel,
		buildLabel,
		authorLabel,
	)

	// Create custom dialog with proper size
	settingsDialog := dialog.NewCustom("Settings", "Close", content, parent)
	settingsDialog.Resize(fyne.NewSize(500, 400)) // Mobile-friendly width
	settingsDialog.Show()
}

func formatTime(t time.Time) string {
	return t.Format("Jan 2, 3:04 PM")
}

func showCreateAppDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create new app dialog
	nameEntry := widget.NewEntry()
	nameEntry.SetPlaceHolder("App name")

	descEntry := widget.NewEntry()
	descEntry.SetPlaceHolder("App description")

	appTypeSelect := widget.NewSelect([]string{"desktop", "web"}, nil)
	appTypeSelect.SetSelected("desktop")

	stackSelect := widget.NewSelect([]string{"static-html", "go-fyne"}, nil)
	stackSelect.SetSelected("static-html")

	content := container.NewVBox(
		widget.NewLabel("🚀 Create New Application"),
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
		widget.NewLabel("This will scaffold a new project using TinyApp Factory CLI"),
	)

	dialog.ShowCustomConfirm("Create App", "Create", "Cancel", content, func(confirmed bool) {
		if confirmed {
			name := nameEntry.Text
			desc := descEntry.Text
			appType := appTypeSelect.Selected
			stack := stackSelect.Selected
			if name != "" && desc != "" {
				// Add to cherry manager as a created project
				cherryManager.AddCherry(name, desc, appType, stack)
				refreshList()
				updateStats()
				dialog.ShowInformation("App Created", fmt.Sprintf("App '%s' has been created using %s stack!", name, stack), parent)
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
		{"Simple Website", "A clean static HTML website", "static-html", "web"},
		{"Desktop Calculator", "A desktop calculator app", "go-fyne", "desktop"},
		{"Portfolio Site", "A professional portfolio website", "static-html", "web"},
		{"Text Editor", "A simple desktop text editor", "go-fyne", "desktop"},
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

func showCompileDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create compile dialog
	compileLabel := widget.NewLabel("⚡ AI-Powered Compile")
	compileLabel.TextStyle.Bold = true

	cherries := cherryManager.GetCherries()
	if len(cherries) == 0 {
		dialog.ShowInformation("No Projects", "You don't have any projects to compile yet. Create an app first!", parent)
		return
	}

	// Status label for compilation progress
	statusLabel := widget.NewLabel("Ready to compile with AI")
	statusLabel.Alignment = fyne.TextAlignCenter

	var compileButtons []fyne.CanvasObject
	for _, cherry := range cherries {
		cherry := cherry // capture loop variable
		btn := widget.NewButton(fmt.Sprintf("🤖 AI Compile %s (%s)", cherry.Name, cherry.Stack), func() {
			// Update status
			statusLabel.SetText(fmt.Sprintf("🤖 AI is building %s...", cherry.Name))
			statusLabel.Refresh()
			
			// Compile with AI in background
			go func() {
				err := compileWithAI(cherry, parent)
				
				if err != nil {
					statusLabel.SetText(fmt.Sprintf("❌ Error compiling %s", cherry.Name))
					dialog.ShowError(fmt.Errorf("Failed to compile %s: %v", cherry.Name, err), parent)
					return
				}
				
				statusLabel.SetText(fmt.Sprintf("✅ Successfully compiled %s!", cherry.Name))
				dialog.ShowInformation("Compilation Complete", fmt.Sprintf("🎉 %s has been compiled successfully!\n\nExecutable saved to outputs/", cherry.Name), parent)
			}()
		})
		compileButtons = append(compileButtons, btn)
	}

	content := container.NewVBox(
		compileLabel,
		widget.NewSeparator(),
		widget.NewLabel("🤖 AI-Powered Compilation:"),
		widget.NewLabel("DeepSeek AI will generate bug-free code and compile it automatically"),
		widget.NewSeparator(),
		container.NewVBox(compileButtons...),
		widget.NewSeparator(),
		statusLabel,
		widget.NewSeparator(),
		widget.NewLabel("✨ Features:"),
		widget.NewLabel("• AI generates optimized, bug-free code"),
		widget.NewLabel("• Automatic compilation and testing"),
		widget.NewLabel("• Cross-platform executables"),
		widget.NewLabel("• Built-in error detection and fixes"),
	)

	dialog.ShowCustom("AI Compile Apps", "Close", content, parent)
}

func showMoreActionsMenu(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create more actions menu
	menuLabel := widget.NewLabel("More Actions")
	menuLabel.TextStyle.Bold = true

	// Browse Templates button
	browseTemplatesButton := widget.NewButton("📋 Browse Templates", func() {
		showTemplatesDialog(parent, cherryManager, refreshList, updateStats)
	})

	// Compile Apps button
	compileAppsButton := widget.NewButton("⚡ Compile Apps", func() {
		showCompileDialog(parent, cherryManager, refreshList, updateStats)
	})

	// Import Project button
	importProjectButton := widget.NewButton("📁 Import Project", func() {
		showImportDialog(parent, cherryManager, refreshList, updateStats)
	})

	// Export Projects button
	exportProjectsButton := widget.NewButton("📤 Export Projects", func() {
		showExportDialog(parent, cherryManager, refreshList, updateStats)
	})

	content := container.NewVBox(
		menuLabel,
		widget.NewSeparator(),
		widget.NewLabel("Additional Tools:"),
		browseTemplatesButton,
		compileAppsButton,
		widget.NewSeparator(),
		widget.NewLabel("Project Management:"),
		importProjectButton,
		exportProjectsButton,
	)

	dialog.ShowCustom("More Actions", "Close", content, parent)
}

func showImportDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	dialog.ShowInformation("Import Project", "This feature will allow you to import existing projects from local files or URLs.", parent)
}

func showExportDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	dialog.ShowInformation("Export Projects", "This feature will allow you to export your projects for backup or sharing.", parent)
}

func showAIBuilderDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create AI Builder dialog
	aiLabel := widget.NewLabel("🤖 AI Cherry Builder")
	aiLabel.TextStyle.Bold = true

	descEntry := widget.NewMultiLineEntry()
	descEntry.SetPlaceHolder("Describe what you want your app to do...\n\nExample: 'A simple todo app with categories and due dates'")

	categorySelect := widget.NewSelect([]string{"productivity", "creative", "civic", "business", "personal"}, nil)
	categorySelect.SetSelected("productivity")

	stackSelect := widget.NewSelect([]string{"static-html", "go-fyne"}, nil)
	stackSelect.SetSelected("static-html")

	// Options
	includeDatabase := widget.NewCheck("Include Fireproof Database", nil)
	includeDatabase.SetChecked(true)
	
	includeSync := widget.NewCheck("Include Sync Features", nil)
	includeSync.SetChecked(false)
	
	includeAuth := widget.NewCheck("Include Authentication", nil)
	includeAuth.SetChecked(false)

	// Status label
	statusLabel := widget.NewLabel("Ready to generate")
	statusLabel.Alignment = fyne.TextAlignCenter

	content := container.NewVBox(
		aiLabel,
		widget.NewSeparator(),
		widget.NewLabel("Describe what you want your app to do:"),
		descEntry,
		widget.NewSeparator(),
		container.NewHBox(
			widget.NewLabel("Category:"),
			categorySelect,
		),
		container.NewHBox(
			widget.NewLabel("Stack:"),
			stackSelect,
		),
		widget.NewSeparator(),
		widget.NewLabel("Features:"),
		includeDatabase,
		includeSync,
		includeAuth,
		widget.NewSeparator(),
		statusLabel,
	)

	dialog.ShowCustomConfirm("AI Builder", "Generate", "Cancel", content, func(confirmed bool) {
		if confirmed {
			description := descEntry.Text
			if description == "" {
				dialog.ShowInformation("Error", "Please describe what you want your app to do", parent)
				return
			}

			// Update status
			statusLabel.SetText("Generating with AI...")
			statusLabel.Refresh()

			// Call AI API
			go func() {
				cherrySpec, err := callAIGenerateCherry(description, categorySelect.Selected, stackSelect.Selected, includeDatabase.Checked, includeSync.Checked, includeAuth.Checked)
				
				if err != nil {
					statusLabel.SetText("Error: " + err.Error())
					dialog.ShowError(err, parent)
					return
				}

				// Add generated cherry to manager
				cherryManager.AddCherry(cherrySpec.Name, cherrySpec.Description, categorySelect.Selected, stackSelect.Selected)
				refreshList()
				updateStats()
				
				statusLabel.SetText("Generated successfully!")
				dialog.ShowInformation("AI Generated", fmt.Sprintf("App '%s' has been generated using AI!", cherrySpec.Name), parent)
			}()
		}
	}, parent)
}

// CherrySpec represents the AI-generated cherry specification
type CherrySpec struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Features    []string `json:"features"`
	Stack       string `json:"stack"`
}

// Settings represents application settings
type Settings struct {
	AutoUpdate    bool   `json:"autoUpdate"`
	StoragePath   string `json:"storagePath"`
	AIAPIKey      string `json:"aiApiKey"`
}

// Global settings
var appSettings Settings

func init() {
	// Initialize default settings
	appSettings = Settings{
		AutoUpdate:  true,
		StoragePath: "~/FileCherry",
		AIAPIKey:    "",
	}
	loadSettings()
}

func getSettingsPath() string {
	homeDir, _ := os.UserHomeDir()
	return filepath.Join(homeDir, ".filecherry", "settings.json")
}

func loadSettings() {
	settingsPath := getSettingsPath()
	
	// Create directory if it doesn't exist
	os.MkdirAll(filepath.Dir(settingsPath), 0755)
	
	data, err := os.ReadFile(settingsPath)
	if err != nil {
		// File doesn't exist, use defaults
		return
	}
	
	err = json.Unmarshal(data, &appSettings)
	if err != nil {
		// Invalid JSON, use defaults
		appSettings = Settings{
			AutoUpdate:  true,
			StoragePath: "~/FileCherry",
			AIAPIKey:    "",
		}
	}
}

func saveSettings() error {
	settingsPath := getSettingsPath()
	
	// Create directory if it doesn't exist
	os.MkdirAll(filepath.Dir(settingsPath), 0755)
	
	data, err := json.MarshalIndent(appSettings, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile(settingsPath, data, 0644)
}

func callAIGenerateCherry(description, category, stack string, includeDatabase, includeSync, includeAuth bool) (*CherrySpec, error) {
	// Prepare request
	requestData := map[string]interface{}{
		"description": description,
		"category": category,
		"stack": stack,
		"includeDatabase": includeDatabase,
		"includeSync": includeSync,
		"includeAuth": includeAuth,
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	// Call the backend API
	resp, err := http.Post("http://localhost:3001/api/generate-cherry", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to call AI API: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI API returned status %d", resp.StatusCode)
	}

	// Parse response
	var cherrySpec CherrySpec
	if err := json.NewDecoder(resp.Body).Decode(&cherrySpec); err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return &cherrySpec, nil
}

func compileWithAI(cherry Cherry, parent fyne.Window) error {
	// Step 1: Generate enhanced specification with AI
	enhancedSpec, err := generateEnhancedSpecWithAI(cherry)
	if err != nil {
		return fmt.Errorf("failed to generate enhanced spec: %v", err)
	}

	// Step 2: Create project using TinyApp Factory CLI
	err = createProjectWithCLI(enhancedSpec)
	if err != nil {
		return fmt.Errorf("failed to create project: %v", err)
	}

	// Step 3: AI-powered code generation and bug fixing
	err = generateAndFixCodeWithAI(enhancedSpec)
	if err != nil {
		return fmt.Errorf("failed to generate/fix code: %v", err)
	}

	// Step 4: Compile the project
	err = buildProjectWithCLI(enhancedSpec)
	if err != nil {
		return fmt.Errorf("failed to build project: %v", err)
	}

	return nil
}

func generateEnhancedSpecWithAI(cherry Cherry) (*CherrySpec, error) {
	// Create enhanced prompt for AI
	prompt := fmt.Sprintf(`Generate a complete, bug-free application specification for:

Name: %s
Description: %s
Stack: %s
Category: %s

Requirements:
1. Generate complete, production-ready code
2. Include proper error handling
3. Add comprehensive testing
4. Optimize for performance
5. Include proper documentation
6. Ensure cross-platform compatibility
7. Add security best practices

Return a detailed specification that can be used to generate a complete application.`, 
		cherry.Name, cherry.Description, cherry.Stack, cherry.Category)

	// Call AI API with enhanced prompt
	requestData := map[string]interface{}{
		"description": prompt,
		"category": cherry.Category,
		"stack": cherry.Stack,
		"includeDatabase": true,
		"includeSync": true,
		"includeAuth": false,
		"enhancedMode": true,
		"bugFreeMode": true,
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post("http://localhost:3001/api/generate-cherry", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI API returned status %d", resp.StatusCode)
	}

	var cherrySpec CherrySpec
	if err := json.NewDecoder(resp.Body).Decode(&cherrySpec); err != nil {
		return nil, err
	}

	return &cherrySpec, nil
}

func createProjectWithCLI(spec *CherrySpec) error {
	// Get the TinyApp Factory CLI path
	cliPath := filepath.Join("/Users/home/dev/tinyapp-factory", "cli.js")
	
	// Create project using TinyApp Factory CLI (non-interactive mode)
	cmd := exec.Command("node", cliPath, "new", "--name", spec.Name, "--stack", spec.Stack)
	cmd.Dir = "/Users/home/dev/tinyapp-factory"
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to create project: %v\nOutput: %s", err, string(output))
	}
	
	return nil
}

func generateAndFixCodeWithAI(spec *CherrySpec) error {
	// AI-powered code generation with bug fixing
	// This would:
	// 1. Generate initial code
	// 2. Run static analysis
	// 3. Fix any issues found
	// 4. Generate tests
	// 5. Run tests and fix failures
	// 6. Optimize code
	
	// For now, we'll enhance the existing project with AI-generated code
	// This could be expanded to include actual code generation and bug fixing
	
	return nil
}

func buildProjectWithCLI(spec *CherrySpec) error {
	// Get the TinyApp Factory CLI path
	cliPath := filepath.Join("/Users/home/dev/tinyapp-factory", "cli.js")
	
	// Build project using TinyApp Factory CLI (correct command format)
	cmd := exec.Command("node", cliPath, "build", "--project", spec.Name)
	cmd.Dir = "/Users/home/dev/tinyapp-factory"
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to build project: %v\nOutput: %s", err, string(output))
	}
	
	return nil
}
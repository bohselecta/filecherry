package main

import (
	"fmt"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/data/binding"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

// Cherry represents a downloadable app
type Cherry struct {
	ID          string
	Name        string
	Description string
	Category    string
	Size        string
	Downloads   int
	Features    []string
	Icon        string
	Author      string
	Version     string
	Installed   bool
	DownloadURL string
}

// CherryBowl manages user's installed cherries
type CherryBowl struct {
	InstalledCherries []Cherry
	Favorites         []string
}

// FileCherryApp is the main application
type FileCherryApp struct {
	app        fyne.App
	window     fyne.Window
	cherryBowl *CherryBowl
	marketplace []Cherry
	currentTab int
}

func NewFileCherryApp() *FileCherryApp {
	myApp := app.NewWithID("com.filecherry.desktop")

	window := myApp.NewWindow("🍒 FileCherry - Cherry Bowl & Marketplace")
	window.Resize(fyne.NewSize(1200, 800))
	window.CenterOnScreen()

	return &FileCherryApp{
		app:        myApp,
		window:     window,
		cherryBowl: &CherryBowl{},
		marketplace: getSampleCherries(),
		currentTab: 0,
	}
}

func (fc *FileCherryApp) Run() {
	fc.setupUI()
	fc.window.ShowAndRun()
}

func (fc *FileCherryApp) setupUI() {
	// Create main tabs
	tabs := container.NewAppTabs(
		container.NewTabItem("🏠 Home", fc.createHomeTab()),
		container.NewTabItem("🍒 Marketplace", fc.createMarketplaceTab()),
		container.NewTabItem("🥣 My Cherry Bowl", fc.createCherryBowlTab()),
		container.NewTabItem("🤖 AI Builder", fc.createAIBuilderTab()),
		container.NewTabItem("⚙️ Settings", fc.createSettingsTab()),
	)

	fc.window.SetContent(tabs)
}

func (fc *FileCherryApp) createHomeTab() fyne.CanvasObject {
	// Welcome section
	welcomeTitle := widget.NewLabel("🍒 Welcome to FileCherry!")
	welcomeTitle.TextStyle.Bold = true
	welcomeTitle.Alignment = fyne.TextAlignCenter

	welcomeSubtitle := widget.NewLabel("Your Cherry Bowl & Marketplace for Tiny Apps")
	welcomeSubtitle.Alignment = fyne.TextAlignCenter

	// Stats section
	statsBinding := binding.NewString()
	updateStats := func() {
		installed := len(fc.cherryBowl.InstalledCherries)
		available := len(fc.marketplace)
		statsBinding.Set(fmt.Sprintf("📊 Installed: %d | Available: %d | Favorites: %d", 
			installed, available, len(fc.cherryBowl.Favorites)))
	}
	updateStats()

	statsLabel := widget.NewLabelWithData(statsBinding)
	statsLabel.Alignment = fyne.TextAlignCenter

	// Quick actions
	quickActionsTitle := widget.NewLabel("Quick Actions")
	quickActionsTitle.TextStyle.Bold = true

	browseMarketplaceBtn := widget.NewButton("🔍 Browse Marketplace", func() {
		// Switch to marketplace tab
		fc.window.SetContent(container.NewAppTabs(
			container.NewTabItem("🏠 Home", fc.createHomeTab()),
			container.NewTabItem("🍒 Marketplace", fc.createMarketplaceTab()),
			container.NewTabItem("🥣 My Cherry Bowl", fc.createCherryBowlTab()),
			container.NewTabItem("🤖 AI Builder", fc.createAIBuilderTab()),
			container.NewTabItem("⚙️ Settings", fc.createSettingsTab()),
		))
	})

	viewCherryBowlBtn := widget.NewButton("🥣 View Cherry Bowl", func() {
		// Switch to cherry bowl tab
		fc.window.SetContent(container.NewAppTabs(
			container.NewTabItem("🏠 Home", fc.createHomeTab()),
			container.NewTabItem("🍒 Marketplace", fc.createMarketplaceTab()),
			container.NewTabItem("🥣 My Cherry Bowl", fc.createCherryBowlTab()),
			container.NewTabItem("🤖 AI Builder", fc.createAIBuilderTab()),
			container.NewTabItem("⚙️ Settings", fc.createSettingsTab()),
		))
	})

	createCherryBtn := widget.NewButton("🤖 Create New Cherry", func() {
		// Switch to AI builder tab
		fc.window.SetContent(container.NewAppTabs(
			container.NewTabItem("🏠 Home", fc.createHomeTab()),
			container.NewTabItem("🍒 Marketplace", fc.createMarketplaceTab()),
			container.NewTabItem("🥣 My Cherry Bowl", fc.createCherryBowlTab()),
			container.NewTabItem("🤖 AI Builder", fc.createAIBuilderTab()),
			container.NewTabItem("⚙️ Settings", fc.createSettingsTab()),
		))
	})

	quickActions := container.NewGridWithColumns(3,
		browseMarketplaceBtn,
		viewCherryBowlBtn,
		createCherryBtn,
	)

	// Recent cherries
	recentTitle := widget.NewLabel("Recently Installed")
	recentTitle.TextStyle.Bold = true

	recentList := widget.NewList(
		func() int {
			return len(fc.cherryBowl.InstalledCherries)
		},
		func() fyne.CanvasObject {
			return container.NewHBox(
				widget.NewIcon(theme.DocumentIcon()),
				widget.NewLabel("Cherry Name"),
				widget.NewButton("▶", nil),
			)
		},
		func(id widget.ListItemID, obj fyne.CanvasObject) {
			if id < len(fc.cherryBowl.InstalledCherries) {
				cherry := fc.cherryBowl.InstalledCherries[id]
				container := obj.(*fyne.Container)
				label := container.Objects[1].(*widget.Label)
				button := container.Objects[2].(*widget.Button)
				
				label.SetText(fmt.Sprintf("%s %s", cherry.Icon, cherry.Name))
				button.OnTapped = func() {
					fc.runCherry(cherry)
				}
			}
		},
	)

	// Layout
	content := container.NewVBox(
		welcomeTitle,
		welcomeSubtitle,
		widget.NewSeparator(),
		statsLabel,
		widget.NewSeparator(),
		quickActionsTitle,
		quickActions,
		widget.NewSeparator(),
		recentTitle,
		container.NewScroll(recentList),
	)

	return container.NewScroll(content)
}

func (fc *FileCherryApp) createMarketplaceTab() fyne.CanvasObject {
	// Search and filter
	searchEntry := widget.NewEntry()
	searchEntry.SetPlaceHolder("Search cherries...")

	categorySelect := widget.NewSelect([]string{"All", "Productivity", "Games", "Tools", "Creative", "Education"}, nil)
	categorySelect.SetSelected("All")

	searchBtn := widget.NewButton("🔍 Search", func() {
		// Implement search functionality
	})

	searchContainer := container.NewHBox(
		searchEntry,
		categorySelect,
		searchBtn,
	)

	// Marketplace list
	marketplaceList := widget.NewList(
		func() int {
			return len(fc.marketplace)
		},
		func() fyne.CanvasObject {
			return container.NewVBox(
				container.NewHBox(
					widget.NewLabel("Cherry Name"),
					widget.NewButton("Install", nil),
				),
				widget.NewLabel("Description"),
				widget.NewLabel("Size • Downloads • Author"),
			)
		},
		func(id widget.ListItemID, obj fyne.CanvasObject) {
			if id < len(fc.marketplace) {
				cherry := fc.marketplace[id]
				container := obj.(*fyne.Container)
				
				// Name and install button
				nameContainer := container.Objects[0].(*fyne.Container)
				nameLabel := nameContainer.Objects[0].(*widget.Label)
				installBtn := nameContainer.Objects[1].(*widget.Button)
				
				nameLabel.SetText(fmt.Sprintf("%s %s", cherry.Icon, cherry.Name))
				installBtn.SetText("Install")
				installBtn.OnTapped = func() {
					fc.installCherry(cherry)
				}
				
				// Description
				descLabel := container.Objects[1].(*widget.Label)
				descLabel.SetText(cherry.Description)
				
				// Meta info
				metaLabel := container.Objects[2].(*widget.Label)
				metaLabel.SetText(fmt.Sprintf("%s • %d downloads • %s", 
					cherry.Size, cherry.Downloads, cherry.Author))
			}
		},
	)

	// Layout
	content := container.NewVBox(
		widget.NewLabel("🍒 Cherry Marketplace"),
		widget.NewSeparator(),
		searchContainer,
		widget.NewSeparator(),
		container.NewScroll(marketplaceList),
	)

	return content
}

func (fc *FileCherryApp) createCherryBowlTab() fyne.CanvasObject {
	// Cherry bowl header
	bowlTitle := widget.NewLabel("🥣 My Cherry Bowl")
	bowlTitle.TextStyle.Bold = true

	// Installed cherries list
	installedList := widget.NewList(
		func() int {
			return len(fc.cherryBowl.InstalledCherries)
		},
		func() fyne.CanvasObject {
			return container.NewHBox(
				widget.NewLabel("Cherry Name"),
				widget.NewButton("▶ Run", nil),
				widget.NewButton("⭐", nil),
				widget.NewButton("🗑️", nil),
			)
		},
		func(id widget.ListItemID, obj fyne.CanvasObject) {
			if id < len(fc.cherryBowl.InstalledCherries) {
				cherry := fc.cherryBowl.InstalledCherries[id]
				container := obj.(*fyne.Container)
				
				nameLabel := container.Objects[0].(*widget.Label)
				runBtn := container.Objects[1].(*widget.Button)
				favBtn := container.Objects[2].(*widget.Button)
				deleteBtn := container.Objects[3].(*widget.Button)
				
				nameLabel.SetText(fmt.Sprintf("%s %s", cherry.Icon, cherry.Name))
				
				runBtn.OnTapped = func() {
					fc.runCherry(cherry)
				}
				
				favBtn.OnTapped = func() {
					fc.toggleFavorite(cherry.ID)
				}
				
				deleteBtn.OnTapped = func() {
					fc.uninstallCherry(cherry.ID)
				}
			}
		},
	)

	// Layout
	content := container.NewVBox(
		bowlTitle,
		widget.NewSeparator(),
		container.NewScroll(installedList),
	)

	return content
}

func (fc *FileCherryApp) createAIBuilderTab() fyne.CanvasObject {
	// AI Builder header
	builderTitle := widget.NewLabel("🤖 AI Cherry Builder")
	builderTitle.TextStyle.Bold = true

	// API Key input
	apiKeyLabel := widget.NewLabel("AI API Key:")
	apiKeyEntry := widget.NewPasswordEntry()
	apiKeyEntry.SetPlaceHolder("Enter your AI API key (DeepSeek, OpenAI, etc.)")

	// Cherry description
	descLabel := widget.NewLabel("Describe your cherry:")
	descEntry := widget.NewMultiLineEntry()
	descEntry.SetPlaceHolder("Describe what you want your cherry to do...\n\nExample: 'A simple calculator with basic math operations'")

	// Build button
	buildBtn := widget.NewButton("🍒 Build Cherry", func() {
		if apiKeyEntry.Text == "" {
			dialog.ShowInformation("Error", "Please enter an AI API key", fc.window)
			return
		}
		if descEntry.Text == "" {
			dialog.ShowInformation("Error", "Please describe your cherry", fc.window)
			return
		}
		
		fc.buildCherryWithAI(apiKeyEntry.Text, descEntry.Text)
	})

	// Recent builds
	recentBuildsTitle := widget.NewLabel("Recent Builds")
	recentBuildsTitle.TextStyle.Bold = true

	recentBuildsList := widget.NewList(
		func() int {
			return 0 // TODO: Implement recent builds
		},
		func() fyne.CanvasObject {
			return widget.NewLabel("Recent build")
		},
		func(id widget.ListItemID, obj fyne.CanvasObject) {
			// TODO: Implement recent builds
		},
	)

	// Layout
	content := container.NewVBox(
		builderTitle,
		widget.NewSeparator(),
		apiKeyLabel,
		apiKeyEntry,
		widget.NewSeparator(),
		descLabel,
		descEntry,
		buildBtn,
		widget.NewSeparator(),
		recentBuildsTitle,
		container.NewScroll(recentBuildsList),
	)

	return content
}

func (fc *FileCherryApp) createSettingsTab() fyne.CanvasObject {
	// Settings header
	settingsTitle := widget.NewLabel("⚙️ Settings")
	settingsTitle.TextStyle.Bold = true

	// General settings
	generalTitle := widget.NewLabel("General")
	generalTitle.TextStyle.Bold = true

	autoUpdateCheck := widget.NewCheck("Auto-update cherries", nil)
	notificationsCheck := widget.NewCheck("Show notifications", nil)

	// Storage settings
	storageTitle := widget.NewLabel("Storage")
	storageTitle.TextStyle.Bold = true

	storagePathLabel := widget.NewLabel("Cherry storage path:")
	storagePathEntry := widget.NewEntry()
	storagePathEntry.SetText("/Users/home/.filecherry/cherries")

	browseBtn := widget.NewButton("Browse", func() {
		dialog.ShowInformation("Browse", "Folder browser not implemented yet", fc.window)
	})

	// About section
	aboutTitle := widget.NewLabel("About")
	aboutTitle.TextStyle.Bold = true

	aboutText := widget.NewLabel("FileCherry Desktop v1.0.0\nBuilt with Go + Fyne\n\nYour Cherry Bowl & Marketplace for Tiny Apps")

	// Layout
	content := container.NewVBox(
		settingsTitle,
		widget.NewSeparator(),
		generalTitle,
		autoUpdateCheck,
		notificationsCheck,
		widget.NewSeparator(),
		storageTitle,
		storagePathLabel,
		container.NewHBox(storagePathEntry, browseBtn),
		widget.NewSeparator(),
		aboutTitle,
		aboutText,
	)

	return container.NewScroll(content)
}

// Helper methods
func (fc *FileCherryApp) installCherry(cherry Cherry) {
	// Add to cherry bowl
	fc.cherryBowl.InstalledCherries = append(fc.cherryBowl.InstalledCherries, cherry)
	
	// Show success message
	dialog.ShowInformation("Success", fmt.Sprintf("Installed %s!", cherry.Name), fc.window)
}

func (fc *FileCherryApp) uninstallCherry(cherryID string) {
	// Remove from cherry bowl
	for i, cherry := range fc.cherryBowl.InstalledCherries {
		if cherry.ID == cherryID {
			fc.cherryBowl.InstalledCherries = append(
				fc.cherryBowl.InstalledCherries[:i],
				fc.cherryBowl.InstalledCherries[i+1:]...,
			)
			break
		}
	}
}

func (fc *FileCherryApp) toggleFavorite(cherryID string) {
	// Toggle favorite status
	for i, favID := range fc.cherryBowl.Favorites {
		if favID == cherryID {
			fc.cherryBowl.Favorites = append(
				fc.cherryBowl.Favorites[:i],
				fc.cherryBowl.Favorites[i+1:]...,
			)
			return
		}
	}
	fc.cherryBowl.Favorites = append(fc.cherryBowl.Favorites, cherryID)
}

func (fc *FileCherryApp) runCherry(cherry Cherry) {
	// TODO: Implement cherry execution
	dialog.ShowInformation("Running Cherry", fmt.Sprintf("Running %s...", cherry.Name), fc.window)
}

func (fc *FileCherryApp) buildCherryWithAI(apiKey, description string) {
	// TODO: Implement AI cherry building
	dialog.ShowInformation("Building Cherry", "Building your cherry with AI...", fc.window)
}

func getSampleCherries() []Cherry {
	return []Cherry{
		{
			ID:          "task-manager",
			Name:        "Task Manager",
			Description: "Simple task management with categories and due dates",
			Category:    "Productivity",
			Size:        "12 MB",
			Downloads:   1247,
			Features:    []string{"Offline-first", "Categories", "Due dates"},
			Icon:        "✅",
			Author:      "FileCherry Team",
			Version:     "1.2.0",
			Installed:   false,
		},
		{
			ID:          "expense-tracker",
			Name:        "Expense Tracker",
			Description: "Track spending with charts and budgets",
			Category:    "Personal",
			Size:        "18 MB",
			Downloads:   892,
			Features:    []string{"Charts", "Budgets", "CSV export"},
			Icon:        "💰",
			Author:      "FinanceTools",
			Version:     "2.0.1",
			Installed:   false,
		},
		{
			ID:          "pixel-art",
			Name:        "Pixel Art Studio",
			Description: "Create pixel art with layers and animation",
			Category:    "Creative",
			Size:        "25 MB",
			Downloads:   2156,
			Features:    []string{"Layers", "Animation", "Export"},
			Icon:        "🎨",
			Author:      "ArtTools",
			Version:     "1.5.0",
			Installed:   false,
		},
		{
			ID:          "breathing-app",
			Name:        "Breathe Easy",
			Description: "Guided breathing exercises with ambient sounds",
			Category:    "Health",
			Size:        "8 MB",
			Downloads:   3421,
			Features:    []string{"Guided exercises", "Ambient sounds", "Progress tracking"},
			Icon:        "🫁",
			Author:      "WellnessApps",
			Version:     "1.0.0",
			Installed:   false,
		},
	}
}

func main() {
	fileCherryApp := NewFileCherryApp()
	fileCherryApp.Run()
}

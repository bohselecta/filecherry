package main

import (
	"fmt"
	"os/exec"
	"path/filepath"
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

	// Cherry input form
	nameInput := widget.NewEntry()
	nameInput.SetPlaceHolder("Cherry name")

	descInput := widget.NewEntry()
	descInput.SetPlaceHolder("Description")

	categorySelect := widget.NewSelect([]string{"productivity", "creative", "civic", "business", "personal"}, nil)
	categorySelect.SetSelected("productivity")

	stackSelect := widget.NewSelect([]string{"go-gin", "go-fyne", "bun-hono", "rust-axum", "tauri-react", "static"}, nil)
	stackSelect.SetSelected("go-gin")

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

	// Add cherry button
	addButton := widget.NewButton("🍒 Add Cherry", func() {
		name := nameInput.Text
		desc := descInput.Text
		category := categorySelect.Selected
		stack := stackSelect.Selected
		if name != "" && desc != "" {
			cherryManager.AddCherry(name, desc, category, stack)
			nameInput.SetText("")
			descInput.SetText("")
			refreshCherryList()
			updateStats()
		}
	})

	// Create new project button
	createProjectButton := widget.NewButton("🚀 Create New Project", func() {
		showCreateProjectDialog(myWindow, cherryManager, refreshCherryList, updateStats)
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
		widget.NewLabel("Add New Cherry:"),
		nameInput,
		descInput,
		container.NewHBox(
			widget.NewLabel("Category:"),
			categorySelect,
			widget.NewLabel("Stack:"),
			stackSelect,
		),
		container.NewHBox(addButton, createProjectButton),
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

	// Build button
	buildButton := widget.NewButton("🔨 Build", func() {
		go func() {
			err := buildProjectCLI(cherry.Name)
			if err != nil {
				// Show error dialog
				fmt.Printf("Build error: %v\n", err)
			} else {
				fmt.Printf("Build successful for %s\n", cherry.Name)
			}
		}()
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
		container.NewHBox(runButton, buildButton, deleteButton),
		timeLabel,
	)

	return cherryItem
}

func showCreateProjectDialog(parent fyne.Window, cherryManager *CherryManager, refreshList func(), updateStats func()) {
	// Create dialog content
	nameEntry := widget.NewEntry()
	nameEntry.SetPlaceHolder("Project name")

	descEntry := widget.NewEntry()
	descEntry.SetPlaceHolder("Project description")

	categorySelect := widget.NewSelect([]string{"productivity", "creative", "civic", "business", "personal"}, nil)
	categorySelect.SetSelected("productivity")

	stackSelect := widget.NewSelect([]string{"go-gin", "go-fyne", "bun-hono", "rust-axum", "tauri-react", "static"}, nil)
	stackSelect.SetSelected("go-gin")

	includeDatabase := widget.NewCheck("Include Fireproof Database", nil)
	includeDatabase.SetChecked(true)

	includeSync := widget.NewCheck("Enable Cloud Sync", nil)
	includeAuth := widget.NewCheck("Add Authentication", nil)

	content := container.NewVBox(
		widget.NewLabel("Create New Cherry Project"),
		widget.NewSeparator(),
		nameEntry,
		descEntry,
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
	)

	dialog.ShowCustomConfirm("Create New Project", "Create", "Cancel", content, func(confirmed bool) {
		if confirmed {
			name := nameEntry.Text
			desc := descEntry.Text
			category := categorySelect.Selected
			stack := stackSelect.Selected

			if name != "" && desc != "" {
				// Add to cherry manager
				cherryManager.AddCherry(name, desc, category, stack)
				refreshList()
				updateStats()

				// Show success message
				dialog.ShowInformation("Success", fmt.Sprintf("Cherry '%s' added to your bowl!", name), parent)

				// Integrate with TinyApp Factory CLI
				go func() {
					err := createProjectWithCLI(name, stack, includeDatabase.Checked, includeSync.Checked, includeAuth.Checked)
					if err != nil {
						dialog.ShowError(err, parent)
					} else {
						dialog.ShowInformation("Project Created", fmt.Sprintf("Project '%s' created successfully with TinyApp Factory!", name), parent)
					}
				}()
			}
		}
	}, parent)
}

func createProjectWithCLI(name, stack string, includeDB, includeSync, includeAuth bool) error {
	// Get the TinyApp Factory CLI path
	cliPath := filepath.Join("..", "..", "cli.js")
	
	// Create the project using TinyApp Factory
	cmd := exec.Command("node", cliPath, "new", "--name", name, "--stack", stack)
	
	// Set working directory to the TinyApp Factory root
	cmd.Dir = filepath.Join("..", "..")
	
	// Run the command
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to create project: %v\nOutput: %s", err, string(output))
	}
	
	fmt.Printf("Project created successfully: %s\n", name)
	fmt.Printf("Output: %s\n", string(output))
	
	// Add additional features if requested
	if includeDB {
		addFeatureCLI(name, "database", "fireproof")
	}
	if includeSync {
		addFeatureCLI(name, "sync", "fireproof-cloud")
	}
	if includeAuth {
		addFeatureCLI(name, "auth", "device")
	}
	
	return nil
}

func addFeatureCLI(projectName, feature, provider string) {
	cliPath := filepath.Join("..", "..", "cli.js")
	cmd := exec.Command("node", cliPath, "add", feature, "--provider", provider, "--project", projectName)
	cmd.Dir = filepath.Join("..", "..")
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Failed to add %s feature: %v\nOutput: %s\n", feature, err, string(output))
	} else {
		fmt.Printf("Added %s feature successfully\n", feature)
	}
}

func buildProjectCLI(projectName string) error {
	cliPath := filepath.Join("..", "..", "cli.js")
	cmd := exec.Command("node", cliPath, "build", "--project", projectName)
	cmd.Dir = filepath.Join("..", "..")
	
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to build project: %v\nOutput: %s", err, string(output))
	}
	
	fmt.Printf("Project built successfully: %s\n", projectName)
	fmt.Printf("Output: %s\n", string(output))
	return nil
}

func formatTime(t time.Time) string {
	return t.Format("Jan 2, 3:04 PM")
}
package main

import (
	"fmt"
	"image/color"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/widget"
)

// CherryCard creates a beautiful card widget for displaying cherries
type CherryCard struct {
	widget.BaseWidget
	cherry     Cherry
	onRun      func()
	onDelete   func()
	onShare    func()
	refresher  func()
	updater    func()
}

// NewCherryCard creates a new cherry card widget
func NewCherryCard(cherry Cherry, onRun, onDelete, onShare func(), refresher, updater func()) *CherryCard {
	card := &CherryCard{
		cherry:    cherry,
		onRun:     onRun,
		onDelete:  onDelete,
		onShare:   onShare,
		refresher: refresher,
		updater:   updater,
	}
	card.ExtendBaseWidget(card)
	return card
}

// CreateRenderer creates the renderer for the cherry card
func (c *CherryCard) CreateRenderer() fyne.WidgetRenderer {
	return NewCherryCardRenderer(c)
}

// cherryCardRenderer handles the rendering of cherry cards
type cherryCardRenderer struct {
	card           *CherryCard
	background     *canvas.Rectangle
	cherryIcon     *canvas.Text
	titleLabel     *widget.Label
	descLabel      *widget.Label
	stackLabel     *widget.Label
	statusLabel    *widget.Label
	timeLabel      *widget.Label
	runButton      *widget.Button
	shareButton    *widget.Button
	deleteButton   *widget.Button
	cardContainer  *fyne.Container
}

// MinSize returns the minimum size of the cherry card
func (r *cherryCardRenderer) MinSize() fyne.Size {
	return fyne.NewSize(300, 120)
}

// Layout arranges the components of the cherry card
func (r *cherryCardRenderer) Layout(size fyne.Size) {
	padding := float32(16)
	iconSize := float32(32)
	
	// Background fills the entire card
	r.background.Resize(size)
	r.background.Move(fyne.NewPos(0, 0))
	
	// Cherry icon (top-left)
	r.cherryIcon.Resize(fyne.NewSize(iconSize, iconSize))
	r.cherryIcon.Move(fyne.NewPos(padding, padding))
	
	// Title (top, left of center)
	titlePos := fyne.NewPos(padding+iconSize+8, padding)
	r.titleLabel.Move(titlePos)
	r.titleLabel.Resize(fyne.NewSize(size.Width-iconSize-padding*2-8, 20))
	
	// Description (below title)
	descPos := fyne.NewPos(padding+iconSize+8, padding+24)
	r.descLabel.Move(descPos)
	r.descLabel.Resize(fyne.NewSize(size.Width-iconSize-padding*2-8, 16))
	
	// Stack info (below description)
	stackPos := fyne.NewPos(padding+iconSize+8, padding+44)
	r.stackLabel.Move(stackPos)
	r.stackLabel.Resize(fyne.NewSize(size.Width-iconSize-padding*2-8, 14))
	
	// Status indicator (top-right)
	statusSize := fyne.NewSize(20, 20)
	r.statusLabel.Resize(statusSize)
	r.statusLabel.Move(fyne.NewPos(size.Width-padding-statusSize.Width, padding))
	
	// Time label (bottom-left)
	timePos := fyne.NewPos(padding, size.Height-20)
	r.timeLabel.Move(timePos)
	r.timeLabel.Resize(fyne.NewSize(size.Width-padding*2, 16))
	
	// Buttons (bottom-right)
	buttonWidth := float32(60)
	buttonHeight := float32(28)
	buttonSpacing := float32(4)
	
	// Run button
	runPos := fyne.NewPos(size.Width-padding-buttonWidth*3-buttonSpacing*2, size.Height-buttonHeight-8)
	r.runButton.Move(runPos)
	r.runButton.Resize(fyne.NewSize(buttonWidth, buttonHeight))
	
	// Share button
	sharePos := fyne.NewPos(size.Width-padding-buttonWidth*2-buttonSpacing, size.Height-buttonHeight-8)
	r.shareButton.Move(sharePos)
	r.shareButton.Resize(fyne.NewSize(buttonWidth, buttonHeight))
	
	// Delete button
	deletePos := fyne.NewPos(size.Width-padding-buttonWidth, size.Height-buttonHeight-8)
	r.deleteButton.Move(deletePos)
	r.deleteButton.Resize(fyne.NewSize(buttonWidth, buttonHeight))
}

// Refresh updates the cherry card display
func (r *cherryCardRenderer) Refresh() {
	cherry := r.card.cherry
	
	// Update cherry icon
	r.cherryIcon.Text = "🍒"
	r.cherryIcon.Color = color.RGBA{R: 255, G: 23, B: 68, A: 255} // Cherry red
	
	// Update title
	r.titleLabel.SetText(cherry.Name)
	r.titleLabel.TextStyle.Bold = true
	
	// Update description
	r.descLabel.SetText(cherry.Description)
	r.descLabel.TextStyle.Italic = true
	
	// Update stack info
	r.stackLabel.SetText(fmt.Sprintf("%s • %s", cherry.Stack, cherry.Size))
	
	// Update status
	if cherry.IsRunning {
		r.statusLabel.SetText("🟢")
		r.statusLabel.SetText("Running")
	} else {
		r.statusLabel.SetText("⏸️")
		r.statusLabel.SetText("Stopped")
	}
	
	// Update time
	r.timeLabel.SetText(formatTime(cherry.CreatedAt))
	r.timeLabel.TextStyle.Italic = true
	
	// Update open button
	r.runButton.SetText("📂 Open")
	r.runButton.Importance = widget.HighImportance
	
	// Update background color based on status
	if cherry.IsRunning {
		r.background.FillColor = color.RGBA{R: 30, G: 60, B: 30, A: 255} // Dark green for running
	} else {
		r.background.FillColor = color.RGBA{R: 30, G: 30, B: 30, A: 255} // Default dark
	}
	
	// Refresh all components
	r.background.Refresh()
	r.cherryIcon.Refresh()
	r.titleLabel.Refresh()
	r.descLabel.Refresh()
	r.stackLabel.Refresh()
	r.statusLabel.Refresh()
	r.timeLabel.Refresh()
	r.runButton.Refresh()
	r.shareButton.Refresh()
	r.deleteButton.Refresh()
}

// Objects returns all the objects in the cherry card
func (r *cherryCardRenderer) Objects() []fyne.CanvasObject {
	return []fyne.CanvasObject{
		r.background,
		r.cherryIcon,
		r.titleLabel,
		r.descLabel,
		r.stackLabel,
		r.statusLabel,
		r.timeLabel,
		r.runButton,
		r.shareButton,
		r.deleteButton,
	}
}

// Destroy cleans up the cherry card renderer
func (r *cherryCardRenderer) Destroy() {}

// NewCherryCardRenderer creates a new cherry card renderer
func NewCherryCardRenderer(card *CherryCard) *cherryCardRenderer {
	cherry := card.cherry
	
	// Background with glass morphism effect
	background := canvas.NewRectangle(color.RGBA{R: 45, G: 21, B: 21, A: 255}) // Cherry dark background
	background.StrokeColor = color.RGBA{R: 255, G: 255, B: 255, A: 25} // Subtle white border
	background.StrokeWidth = 1
	
	// Cherry icon with gradient effect
	cherryIcon := canvas.NewText("🍒", color.RGBA{R: 255, G: 23, B: 68, A: 255})
	cherryIcon.TextSize = 28
	
	// Labels with proper hierarchy
	titleLabel := widget.NewLabel(cherry.Name)
	titleLabel.TextStyle.Bold = true
	
	descLabel := widget.NewLabel(cherry.Description)
	descLabel.TextStyle.Italic = true
	
	stackLabel := widget.NewLabel(fmt.Sprintf("%s • %s", cherry.Stack, cherry.Size))
	
	statusLabel := widget.NewLabel("⏸️")
	if cherry.IsRunning {
		statusLabel.SetText("🟢")
	}
	
	timeLabel := widget.NewLabel(formatTime(cherry.CreatedAt))
	timeLabel.TextStyle.Italic = true
	
	// Buttons with cherry styling
	openButton := widget.NewButton("📂 Open", card.onRun)
	openButton.Importance = widget.HighImportance
	
	shareButton := widget.NewButton("📤 Share", card.onShare)
	shareButton.Importance = widget.MediumImportance
	
	deleteButton := widget.NewButton("🗑️", card.onDelete)
	deleteButton.Importance = widget.DangerImportance
	
	return &cherryCardRenderer{
		card:           card,
		background:     background,
		cherryIcon:     cherryIcon,
		titleLabel:     titleLabel,
		descLabel:      descLabel,
		stackLabel:     stackLabel,
		statusLabel:    statusLabel,
		timeLabel:      timeLabel,
		runButton:      openButton,
		shareButton:    shareButton,
		deleteButton:   deleteButton,
	}
}

// HeroCard creates a beautiful hero section for the main cherry
type HeroCard struct {
	widget.BaseWidget
	cherry Cherry
}

// NewHeroCard creates a new hero card widget
func NewHeroCard(cherry Cherry) *HeroCard {
	card := &HeroCard{cherry: cherry}
	card.ExtendBaseWidget(card)
	return card
}

// CreateRenderer creates the renderer for the hero card
func (h *HeroCard) CreateRenderer() fyne.WidgetRenderer {
	return NewHeroCardRenderer(h)
}

// heroCardRenderer handles the rendering of hero cards
type heroCardRenderer struct {
	hero           *HeroCard
	background     *canvas.Rectangle
	cherryIcon     *canvas.Text
	titleLabel     *widget.Label
	descLabel      *widget.Label
	stackLabel     *widget.Label
	statusLabel    *widget.Label
	runButton      *widget.Button
	cardContainer  *fyne.Container
}

// MinSize returns the minimum size of the hero card
func (r *heroCardRenderer) MinSize() fyne.Size {
	return fyne.NewSize(400, 200)
}

// Layout arranges the components of the hero card
func (r *heroCardRenderer) Layout(size fyne.Size) {
	padding := float32(24)
	iconSize := float32(64)
	
	// Background fills the entire card
	r.background.Resize(size)
	r.background.Move(fyne.NewPos(0, 0))
	
	// Cherry icon (large, centered)
	r.cherryIcon.Resize(fyne.NewSize(iconSize, iconSize))
	r.cherryIcon.Move(fyne.NewPos(size.Width/2-iconSize/2, padding))
	
	// Title (below icon, centered)
	titlePos := fyne.NewPos(padding, padding+iconSize+16)
	r.titleLabel.Move(titlePos)
	r.titleLabel.Resize(fyne.NewSize(size.Width-padding*2, 32))
	
	// Description (below title, centered)
	descPos := fyne.NewPos(padding, padding+iconSize+52)
	r.descLabel.Move(descPos)
	r.descLabel.Resize(fyne.NewSize(size.Width-padding*2, 20))
	
	// Stack info (below description, centered)
	stackPos := fyne.NewPos(padding, padding+iconSize+76)
	r.stackLabel.Move(stackPos)
	r.stackLabel.Resize(fyne.NewSize(size.Width-padding*2, 16))
	
	// Status indicator (top-right)
	statusSize := fyne.NewSize(24, 24)
	r.statusLabel.Resize(statusSize)
	r.statusLabel.Move(fyne.NewPos(size.Width-padding-statusSize.Width, padding))
	
	// Run button (bottom, centered)
	buttonWidth := float32(120)
	buttonHeight := float32(36)
	runPos := fyne.NewPos(size.Width/2-buttonWidth/2, size.Height-buttonHeight-padding)
	r.runButton.Move(runPos)
	r.runButton.Resize(fyne.NewSize(buttonWidth, buttonHeight))
}

// Refresh updates the hero card display
func (r *heroCardRenderer) Refresh() {
	cherry := r.hero.cherry
	
	// Update cherry icon
	r.cherryIcon.Text = "🍒"
	r.cherryIcon.Color = color.RGBA{R: 255, G: 23, B: 68, A: 255}
	
	// Update title
	r.titleLabel.SetText(cherry.Name)
	r.titleLabel.TextStyle.Bold = true
	r.titleLabel.Alignment = fyne.TextAlignCenter
	
	// Update description
	r.descLabel.SetText(cherry.Description)
	r.descLabel.TextStyle.Italic = true
	r.descLabel.Alignment = fyne.TextAlignCenter
	
	// Update stack info
	r.stackLabel.SetText(fmt.Sprintf("%s • %s", cherry.Stack, cherry.Size))
	r.stackLabel.Alignment = fyne.TextAlignCenter
	
	// Update status
	if cherry.IsRunning {
		r.statusLabel.SetText("🟢 Running")
	} else {
		r.statusLabel.SetText("⏸️ Stopped")
	}
	
	// Update open button
	r.runButton.SetText("📂 Open Cherry")
	r.runButton.Importance = widget.HighImportance
	
	// Update background with gradient effect
	r.background.FillColor = color.RGBA{R: 40, G: 40, B: 40, A: 255}
	
	// Refresh all components
	r.background.Refresh()
	r.cherryIcon.Refresh()
	r.titleLabel.Refresh()
	r.descLabel.Refresh()
	r.stackLabel.Refresh()
	r.statusLabel.Refresh()
	r.runButton.Refresh()
}

// Objects returns all the objects in the hero card
func (r *heroCardRenderer) Objects() []fyne.CanvasObject {
	return []fyne.CanvasObject{
		r.background,
		r.cherryIcon,
		r.titleLabel,
		r.descLabel,
		r.stackLabel,
		r.statusLabel,
		r.runButton,
	}
}

// Destroy cleans up the hero card renderer
func (r *heroCardRenderer) Destroy() {}

// NewHeroCardRenderer creates a new hero card renderer
func NewHeroCardRenderer(hero *HeroCard) *heroCardRenderer {
	cherry := hero.cherry
	
	// Background with cherry glow effect
	background := canvas.NewRectangle(color.RGBA{R: 45, G: 21, B: 21, A: 255}) // Cherry dark background
	background.StrokeColor = color.RGBA{R: 255, G: 23, B: 68, A: 255} // Cherry red border
	background.StrokeWidth = 2
	
	// Large cherry icon with gradient effect
	cherryIcon := canvas.NewText("🍒", color.RGBA{R: 255, G: 23, B: 68, A: 255})
	cherryIcon.TextSize = 56
	
	// Labels with proper hierarchy
	titleLabel := widget.NewLabel(cherry.Name)
	titleLabel.TextStyle.Bold = true
	titleLabel.Alignment = fyne.TextAlignCenter
	
	descLabel := widget.NewLabel(cherry.Description)
	descLabel.TextStyle.Italic = true
	descLabel.Alignment = fyne.TextAlignCenter
	
	stackLabel := widget.NewLabel(fmt.Sprintf("%s • %s", cherry.Stack, cherry.Size))
	stackLabel.Alignment = fyne.TextAlignCenter
	
	statusLabel := widget.NewLabel("⏸️ Stopped")
	if cherry.IsRunning {
		statusLabel.SetText("🟢 Running")
	}
	
	// Open button with cherry styling
	openButton := widget.NewButton("📂 Open Cherry", func() {
		// This would be connected to the cherry manager
	})
	openButton.Importance = widget.HighImportance
	
	return &heroCardRenderer{
		hero:           hero,
		background:     background,
		cherryIcon:     cherryIcon,
		titleLabel:     titleLabel,
		descLabel:      descLabel,
		stackLabel:     stackLabel,
		statusLabel:    statusLabel,
		runButton:      openButton,
	}
}

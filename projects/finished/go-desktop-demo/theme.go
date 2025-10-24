package main

import (
	"image/color"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/theme"
)

// FileCherryTheme implements a custom dark theme with cherry red accents
type FileCherryTheme struct{}

// Color returns the color for the given theme color name
func (t *FileCherryTheme) Color(name fyne.ThemeColorName, variant fyne.ThemeVariant) color.Color {
	switch name {
	case theme.ColorNamePrimary:
		return color.RGBA{R: 255, G: 23, B: 68, A: 255} // Cherry red #ff1744
	case theme.ColorNameBackground:
		return color.RGBA{R: 26, G: 10, B: 10, A: 255} // Dark cherry background #1a0a0a
	case theme.ColorNameOverlayBackground:
		return color.RGBA{R: 0, G: 0, B: 0, A: 200} // Semi-transparent overlay
	case theme.ColorNameSuccess:
		return color.RGBA{R: 76, G: 175, B: 80, A: 255} // Green for running cherries
	case theme.ColorNameWarning:
		return color.RGBA{R: 255, G: 152, B: 0, A: 255} // Orange for warnings
	case theme.ColorNameError:
		return color.RGBA{R: 244, G: 67, B: 54, A: 255} // Red for errors
	case theme.ColorNameDisabled:
		return color.RGBA{R: 100, G: 100, B: 100, A: 255} // Disabled text
	case theme.ColorNameHover:
		return color.RGBA{R: 255, G: 23, B: 68, A: 50} // Cherry red hover
	case theme.ColorNameFocus:
		return color.RGBA{R: 255, G: 23, B: 68, A: 100} // Cherry red focus
	case theme.ColorNameSelection:
		return color.RGBA{R: 255, G: 23, B: 68, A: 150} // Cherry red selection
	case theme.ColorNameSeparator:
		return color.RGBA{R: 60, G: 60, B: 60, A: 255} // Subtle separators
	case theme.ColorNameInputBackground:
		return color.RGBA{R: 45, G: 21, B: 21, A: 255} // Cherry dark input background
	case theme.ColorNameInputBorder:
		return color.RGBA{R: 80, G: 80, B: 80, A: 255} // Input border
	case theme.ColorNameForeground:
		return color.RGBA{R: 255, G: 255, B: 255, A: 255} // White text
	default:
		return theme.DarkTheme().Color(name, variant)
	}
}

// Size returns the size for the given theme size name
func (t *FileCherryTheme) Size(name fyne.ThemeSizeName) float32 {
	switch name {
	case theme.SizeNamePadding:
		return 12
	case theme.SizeNameScrollBar:
		return 8
	case theme.SizeNameScrollBarSmall:
		return 4
	case theme.SizeNameSeparatorThickness:
		return 1
	case theme.SizeNameInputBorder:
		return 2
	case theme.SizeNameInputRadius:
		return 8
	case theme.SizeNameSelectionRadius:
		return 6
	default:
		return theme.DarkTheme().Size(name)
	}
}

// Font returns the font for the given text style
func (t *FileCherryTheme) Font(style fyne.TextStyle) fyne.Resource {
	return theme.DarkTheme().Font(style)
}

// Icon returns the icon for the given theme icon name
func (t *FileCherryTheme) Icon(name fyne.ThemeIconName) fyne.Resource {
	return theme.DarkTheme().Icon(name)
}

// NewFileCherryTheme creates a new FileCherry theme instance
func NewFileCherryTheme() fyne.Theme {
	return &FileCherryTheme{}
}

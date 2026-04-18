import { createContext, useContext, useState, useMemo } from 'react'

// Department color definitions (hex codes)
export const THEME_COLORS = {
  red: '#D0021B',      // Emergency/Ambulance
  green: '#7ED321',    // General Ward / OPD
  pink: '#FFB6C1',     // Maternity
  grey: '#9B9B9B',     // Cleaning
  blue: '#4A90E2',     // Nursing (default nurse)
  black: '#1A1A1A',    // Security
  orange: '#F5A623',   // Pharmacy
  violet: '#9013FE',   // Lab / Pathology
  teal: '#50E3C2',     // Radiology / Imaging
  gold: '#F5A623',     // Admin (default admin)
  silver: '#B8B8B8',   // Operation Theatre
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [role, setRole] = useState('nurse') // default role
  const [themeColor, setThemeColor] = useState(THEME_COLORS.blue) // default blue
  const [chaosMode, setChaosMode] = useState(false)

  // Map role to default theme color when role changes
  const roleToColor = {
    admin: THEME_COLORS.gold,
    nurse: THEME_COLORS.blue,
    patient: THEME_COLORS.green,
    ambulance: THEME_COLORS.red,
  }

  const setTheme = (color) => {
    setThemeColor(color)
  }

  const setRoleAndTheme = (newRole) => {
    setRole(newRole)
    const defaultColor = roleToColor[newRole] || THEME_COLORS.blue
    setThemeColor(defaultColor)
  }

  const toggleChaosMode = () => {
    setChaosMode(prev => !prev)
  }

  const value = useMemo(() => ({
    role,
    setRole: setRoleAndTheme,
    theme: themeColor,
    setTheme,
    colors: THEME_COLORS,
    chaosMode,
    toggleChaosMode,
  }), [role, themeColor, chaosMode])

  return (
    <ThemeContext.Provider value={value}>
      <div
        className={chaosMode ? 'chaos-mode' : ''}
        style={{
          '--theme-primary': themeColor,
          '--theme-bg-light': `${themeColor}15`,
          '--theme-border': `${themeColor}40`,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Add CSS for chaos mode globally (in index.css or via style tag)
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .chaos-mode main,
    .chaos-mode .dashboard-content {
      filter: grayscale(100%) contrast(1.2) !important;
    }
  `
  document.head.appendChild(style)
}
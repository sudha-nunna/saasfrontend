// "use client"

// import type React from "react"
// import { createContext, useContext, useEffect, useState } from "react"
// import type { Language } from "./translations"

// interface ThemeContextType {
//   darkMode: boolean
//   setDarkMode: (value: boolean) => void
//   language: Language
//   setLanguage: (value: Language) => void
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const [darkMode, setDarkMode] = useState(false)
//   const [language, setLanguage] = useState<Language>("en")
//   const [mounted, setMounted] = useState(false)

//   // Load preferences from localStorage on mount
//   useEffect(() => {
//     const savedDarkMode = localStorage.getItem("darkMode") === "true"
//     const savedLanguage = (localStorage.getItem("language") as Language) || "en"

//     setDarkMode(savedDarkMode)
//     setLanguage(savedLanguage)
//     setMounted(true)
//   }, [])

//   // Apply dark mode to document
//   useEffect(() => {
//     if (!mounted) return

//     if (darkMode) {
//       document.documentElement.classList.add("dark")
//     } else {
//       document.documentElement.classList.remove("dark")
//     }
//     localStorage.setItem("darkMode", String(darkMode))
//   }, [darkMode, mounted])

//   // Save language preference
//   useEffect(() => {
//     if (!mounted) return
//     localStorage.setItem("language", language)
//   }, [language, mounted])

//   return (
//     <ThemeContext.Provider value={{ darkMode, setDarkMode, language, setLanguage }}>{children}</ThemeContext.Provider>
//   )
// }

// export function useTheme() {
//   const context = useContext(ThemeContext)
//   if (context === undefined) {
//     throw new Error("useTheme must be used within a ThemeProvider")
//   }
//   return context
// }


"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Language } from "./translations"

interface ThemeContextType {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  language: Language
  setLanguage: (value: Language) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    const savedLanguage = (localStorage.getItem("language") as Language) || "en"

    setDarkMode(savedDarkMode)
    setLanguage(savedLanguage)
    setMounted(true)
  }, [])

  // Apply dark mode to document
  useEffect(() => {
    if (!mounted) return

    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("darkMode", String(darkMode))
  }, [darkMode, mounted])

  // Save language preference
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("language", language)
  }, [language, mounted])

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, language, setLanguage }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

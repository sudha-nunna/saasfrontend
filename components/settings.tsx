"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Bell, Lock, User, LogOut, Database, Eye, Globe } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { translations } from "@/lib/translations"
import type { Language } from "@/lib/translations"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"

export default function Settings() {
  const { darkMode, setDarkMode, language, setLanguage } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const t = translations[language]

  // Local state for settings that aren't in theme context
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  // Editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  // Form states
  const [editName, setEditName] = useState(user?.name || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleLogout = () => {
    logout()
    // Force a page reload to ensure clean state
    window.location.href = "/"
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true)
    setEditName(user?.name || "")
  }

  const saveProfile = () => {
    // In a real app, this would call an API
    alert(`Profile updated! New name: ${editName}`)
    setIsEditingProfile(false)
  }

  const handleChangeEmail = () => {
    setIsEditingEmail(true)
    setEditEmail(user?.email || "")
  }

  const saveEmail = () => {
    if (!editEmail.includes("@")) {
      alert("Please enter a valid email address")
      return
    }
    // In a real app, this would call an API
    alert(`Email updated to: ${editEmail}`)
    setIsEditingEmail(false)
  }

  const handleChangePassword = () => {
    setIsEditingPassword(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const savePassword = () => {
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match")
      return
    }
    // In a real app, this would call an API
    alert("Password updated successfully!")
    setIsEditingPassword(false)
  }

  const SettingToggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  )

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">{t.settingsTitle}</h1>
        <p className="text-muted-foreground mt-1">{t.settingsSubtitle}</p>
      </motion.div>

      <div className="space-y-4 max-w-2xl">
        {/* Account Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <User size={20} />
            {t.account}
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="pb-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{t.profileInfo}</h3>
                  <p className="text-sm text-muted-foreground">{t.updateNameEmail}</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    {t.editProfile}
                  </button>
                )}
              </div>
              {isEditingProfile && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveProfile}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{t.emailAddress}</h3>
                {!isEditingEmail && (
                  <button
                    onClick={handleChangeEmail}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    {t.change}
                  </button>
                )}
              </div>
              {isEditingEmail ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Enter new email"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEmail}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingEmail(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{user?.email || "Not available"}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Appearance Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Eye size={20} />
            {t.appearance}
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <h3 className="font-semibold text-foreground">{t.darkMode}</h3>
                  <p className="text-sm text-muted-foreground">{t.toggleDarkTheme}</p>
                </div>
              </div>
              <SettingToggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={20} />
                <div>
                  <h3 className="font-semibold text-foreground">{t.language}</h3>
                  <p className="text-sm text-muted-foreground">{t.selectLanguage}</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-muted transition-colors text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell size={20} />
            {t.notifications}
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Bell size={20} />
                <div>
                  <h3 className="font-semibold text-foreground">{t.pushNotifications}</h3>
                  <p className="text-sm text-muted-foreground">{t.receiveAlerts}</p>
                </div>
              </div>
              <SettingToggle enabled={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{t.emailAlerts}</h3>
                <p className="text-sm text-muted-foreground">{t.getNotifiedViaEmail}</p>
              </div>
              <SettingToggle enabled={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lock size={20} />
            {t.security}
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="pb-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{t.password}</h3>
                  {!isEditingPassword && <p className="text-sm text-muted-foreground">{t.lastChanged}</p>}
                </div>
                {!isEditingPassword && (
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    {t.changePassword}
                  </button>
                )}
              </div>
              {isEditingPassword && (
                <div className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Current password"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="New password"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="Confirm new password"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={savePassword}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingPassword(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{t.twoFactorAuth}</h3>
                <p className="text-sm text-muted-foreground">{t.addExtraLayer}</p>
              </div>
              <SettingToggle enabled={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} />
            </div>
          </div>
        </motion.div>

        {/* Data Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Database size={20} />
            {t.data}
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors">
              <h3 className="font-semibold text-foreground">{t.exportData}</h3>
              <p className="text-sm text-muted-foreground">{t.downloadInventory}</p>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors border-t border-border pt-3">
              <h3 className="font-semibold text-destructive">{t.deleteAccount}</h3>
              <p className="text-sm text-muted-foreground">{t.permanentlyDelete}</p>
            </button>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

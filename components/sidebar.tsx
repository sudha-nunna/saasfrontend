"use client"

import { LayoutDashboard, Package, TrendingUp, BarChart3, Settings, X, Receipt } from "lucide-react"
import { motion } from "framer-motion"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "billing", label: "Billing", icon: Receipt },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
        className="fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border z-50 md:z-0 flex flex-col rounded-tr-3xl rounded-br-3xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-sidebar-foreground font-semibold hidden sm:inline">SaaS</span>
          </div>
          <button
            onClick={onToggle}
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  if (window.innerWidth < 768) {
                    onToggle()
                  }
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground rounded-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/30"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">v1.0.0</div>
        </div>
      </motion.aside>
    </>
  )
}

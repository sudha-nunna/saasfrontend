"use client"

import { Menu, Bell, Search } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect, Fragment } from "react"
import Auth from "./auth"
import Notifications from "./notifications"
import { useAuth } from "../context/AuthContext"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5000/api'
        const response = await fetch(`${API}/products`);
        if (!response.ok) return;
        const products = await response.json();

        const LOW_STOCK_THRESHOLD = 10;
        const CRITICAL_STOCK_THRESHOLD = 5;

        let count = 0;
        products.forEach((product: any) => {
          const stock = product.stock ?? product.quantity ?? 0;
          if (stock === 0 || stock <= LOW_STOCK_THRESHOLD) {
            count++;
          }
        });

        setNotificationCount(count);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      <button onClick={onMenuClick} className="md:hidden text-foreground hover:bg-muted rounded-lg p-2">
        <Menu size={20} />
      </button>

      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          onClick={() => setShowNotifications(true)}
          className="relative p-2 text-foreground hover:bg-muted rounded-lg"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </motion.button>

        {isLoading ? null : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              Hello, {user?.name}
            </span>
            <motion.button
              onClick={() => logout()}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/20 transition-colors"
            >
              Logout
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Sign In
          </motion.button>
        )}
      </div>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </header>
  )
}

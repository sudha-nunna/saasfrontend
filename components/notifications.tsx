"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";

interface Notification {
  id: string;
  type: "low_stock" | "out_of_stock" | "stock_limit";
  message: string;
  productName: string;
  sku: string;
  stock: number;
  timestamp: string;
  timeAgo: string;
}

interface NotificationsProps {
  onClose: () => void;
}

export default function Notifications({ onClose }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("https://saas-backend-1-p5kr.onrender.com/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const products = await response.json();

        const LOW_STOCK_THRESHOLD = 10; // Alert if stock is below this
        const CRITICAL_STOCK_THRESHOLD = 5; // Critical alert

        const newNotifications: Notification[] = [];

        products.forEach((product: any) => {
          const stock = product.stock ?? product.quantity ?? 0;
          const productName = product.name || product.sku || "Unknown Product";
          const sku = product.sku || "N/A";
          const now = new Date();

          if (stock === 0) {
            newNotifications.push({
              id: `out-${sku}-${now.getTime()}`,
              type: "out_of_stock",
              message: `${productName} is out of stock`,
              productName,
              sku,
              stock: 0,
              timestamp: now.toISOString(),
              timeAgo: "Just now",
            });
          } else if (stock <= CRITICAL_STOCK_THRESHOLD) {
            newNotifications.push({
              id: `critical-${sku}-${now.getTime()}`,
              type: "low_stock",
              message: `${productName} stock is critically low`,
              productName,
              sku,
              stock,
              timestamp: now.toISOString(),
              timeAgo: "Just now",
            });
          } else if (stock <= LOW_STOCK_THRESHOLD) {
            newNotifications.push({
              id: `low-${sku}-${now.getTime()}`,
              type: "stock_limit",
              message: `${productName} stock is reaching limit`,
              productName,
              sku,
              stock,
              timestamp: now.toISOString(),
              timeAgo: "Just now",
            });
          }
        });

        // Sort by priority: out of stock first, then critical, then low stock
        newNotifications.sort((a, b) => {
          if (a.type === "out_of_stock" && b.type !== "out_of_stock") return -1;
          if (a.type !== "out_of_stock" && b.type === "out_of_stock") return 1;
          if (a.type === "low_stock" && b.type === "stock_limit") return -1;
          if (a.type === "stock_limit" && b.type === "low_stock") return 1;
          return 0;
        });

        setNotifications(newNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "out_of_stock":
        return <AlertTriangle className="text-destructive" size={20} />;
      case "low_stock":
        return <TrendingDown className="text-orange-500" size={20} />;
      case "stock_limit":
        return <Package className="text-yellow-500" size={20} />;
      default:
        return <Package className="text-primary" size={20} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "out_of_stock":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
      case "low_stock":
        return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800";
      case "stock_limit":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-muted border-border";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50 p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md h-[80vh] flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                {notifications.length} {notifications.length === 1 ? "alert" : "alerts"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Package className="text-muted-foreground mb-4" size={48} />
              <p className="text-lg font-semibold text-foreground mb-2">All Good!</p>
              <p className="text-sm text-muted-foreground">
                No stock alerts at the moment
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0 border border-border">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground text-sm">
                          {notification.productName}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">SKU: {notification.sku}</span>
                        <span className="font-medium text-foreground">
                          Stock: <span className={notification.stock === 0 ? "text-destructive" : "text-primary"}>{notification.stock}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <button className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Mark all as read
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}


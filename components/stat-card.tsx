"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  trend?: number
  icon?: ReactNode
  onClick?: () => void
}

export default function StatCard({ title, value, trend, icon, onClick }: StatCardProps) {
  const isPositive = trend && trend >= 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all hover:shadow-md ${
        onClick ? "hover:border-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
        </div>
        {icon && <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp size={16} className="text-green-600" />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
          <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {Math.abs(trend)}% {isPositive ? "increase" : "decrease"}
          </span>
        </div>
      )}
    </motion.div>
  )
}

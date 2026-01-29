"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, TrendingUp } from "lucide-react"

interface Alert {
  id: string
  type: string
  product: string
  message: string
  severity: "warning" | "critical" | "info"
}

interface TurnoverMetric {
  product: string
  currentStock: number
  averageInventoryValue: number
  totalSold: number
  totalRevenue: number
  turnover: number
  trend: number
}

export async function fetchInventoryAlerts() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000'
  try {
    const response = await fetch(`${BASE}/api/products/low-stock`)
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Failed to fetch alerts: ${response.status} ${response.statusText} ${text}`)
    }
    const products = await response.json()
    return products.map((product: any, index: number) => ({
      id: product._id || index.toString(),
      type: 'low_stock',
      product: product.name,
      message: `Stock level (${product.stock}) is below minimum (${product.minStock})`,
      severity: product.stock === 0 ? 'critical' : 'warning' as const
    }))
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
}

export async function fetchInventoryTurnover() {
  const BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000'
  try {
    // Get all products
    const productsResponse = await fetch(`${BASE}/api/products?limit=100`)
    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products')
    }
    const productsData = await productsResponse.json()
    const products = productsData.products || []

    // Get sales data for the last month
    const salesResponse = await fetch(`${BASE}/api/reports/top-products?period=month&limit=100`)
    if (!salesResponse.ok) {
      throw new Error('Failed to fetch sales data')
    }
    const salesData = await salesResponse.json()

    // Create a map of product sales
    const salesMap = new Map()
    salesData.forEach((sale: any) => {
      salesMap.set(sale._id, {
        totalQuantity: sale.totalQuantity,
        totalRevenue: sale.totalRevenue
      })
    })

    // Calculate inventory turnover for each product
    const turnoverMetrics = products.map((product: any) => {
      const sales = salesMap.get(product._id) || { totalQuantity: 0, totalRevenue: 0 }
      const averageInventoryValue = (product.stock * product.price) / 2 // Simple average
      const turnover = averageInventoryValue > 0
        ? Math.round((sales.totalRevenue / averageInventoryValue) * 100) / 100
        : 0

      return {
        product: product.name,
        currentStock: product.stock,
        averageInventoryValue: Math.round(averageInventoryValue * 100) / 100,
        totalSold: sales.totalQuantity,
        totalRevenue: sales.totalRevenue,
        turnover: turnover,
        trend: Math.floor(Math.random() * 20) - 10 // Mock trend data
      }
    })

    // Sort by turnover rate (highest first) and return top 10
    return turnoverMetrics
      .sort((a: any, b: any) => b.turnover - a.turnover)
      .slice(0, 10)

  } catch (error) {
    console.error('Error fetching inventory turnover:', error)
    return []
  }
}

export default function Reports() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [turnoverMetrics, setTurnoverMetrics] = useState<TurnoverMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [alertsData, metricsData] = await Promise.all([
          fetchInventoryAlerts(),
          fetchInventoryTurnover()
        ])
        setAlerts(alertsData)
        setTurnoverMetrics(metricsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-destructive">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Inventory health and alerts</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-destructive" />
            Active Alerts
          </h3>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-muted-foreground">No active alerts</p>
            ) : (
              alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : alert.severity === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <p className="font-medium text-foreground">{alert.product}</p>
                <p
                  className={`text-sm ${
                    alert.severity === "critical"
                      ? "text-red-700"
                      : alert.severity === "warning"
                        ? "text-yellow-700"
                        : "text-blue-700"
                  }`}
                >
                  {alert.message}
                </p>
              </div>
            )))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Inventory Turnover
          </h3>
          <div className="space-y-3">
            {turnoverMetrics.length === 0 ? (
              <p className="text-muted-foreground">No turnover metrics available</p>
            ) : (
              turnoverMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{metric.product}</p>
                  <p className={`text-sm font-bold ${metric.trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {metric.trend >= 0 ? "+" : ""}
                    {metric.trend}%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Stock</p>
                    <p className="font-medium">{metric.currentStock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Inventory Value</p>
                    <p className="font-medium">₹{metric.averageInventoryValue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Sold</p>
                    <p className="font-medium">{metric.totalSold}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Turnover Rate</p>
                    <p className="font-bold text-primary">{metric.turnover}x</p>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

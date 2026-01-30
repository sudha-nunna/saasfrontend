"use client"

import { useState, useEffect } from "react"
import { Package, AlertTriangle, DollarSign, RotateCw, RefreshCw } from "lucide-react"
import StatCard from "@/components/stat-card"
import InventoryTable from "@/components/inventory-table"
import TopProductsChart from "@/components/top-products-chart"
import { motion } from "framer-motion"

// Resolve API base consistently with auth
const API = (process.env.NEXT_PUBLIC_API_URL || "https://saas-backend-1-p5kr.onrender.com/api").replace(/\/$/, "");

interface Product {
  _id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  minStock: number
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

interface DashboardItem {
  name: string
  count: number
  min: number
  price: number
  mfg: string
  exp: string
  status: string
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredData, setFilteredData] = useState<DashboardItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProducts = async () => {
    try {
      setRefreshing(true)
      const response = await fetch(`${API}/products`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch products' }))
        throw new Error(errorData.error || 'Failed to fetch products')
      }
      const data: Product[] = await response.json()
      setProducts(data)
      // Transform data to dashboard format
      const transformedData: DashboardItem[] = data.map(product => ({
        name: product.name,
        count: product.stock,
        min: 5,
        price: product.price,
        mfg: product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : '',
        exp: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
        status: getStatus(product)
      }))
      setFilteredData(transformedData)
      setLoading(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const getStatus = (product: Product): string => {
    if (product.stock === 0) return 'Out of stock'
    if (product.stock <= 5) return 'Low stock'
    if (product.expiryDate) {
      const today = new Date()
      const expiry = new Date(product.expiryDate)
      const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (days < 0) return 'Expired'
      if (days <= 30) return 'Expiring soon'
    }
    return 'In stock'
  }

  const totalProducts = products.length
  const lowStockItems = products.filter((product) => product.stock > 0 && product.stock <= 5).length
  const outOfStockItems = products.filter((product) => product.stock === 0).length
  const totalValue = products.reduce((sum, product) => sum + product.stock * product.price, 0)
  const turnoverRate = 2.4

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Loading inventory data...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-red-500 mt-1">Error loading data: {error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your inventory overview.</p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard title="Total Products" value={totalProducts} trend={12} icon={<Package size={24} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard title="Low Stock Items" value={lowStockItems} trend={-8} icon={<AlertTriangle size={24} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard title="Out of Stock Items" value={outOfStockItems} trend={-5} icon={<AlertTriangle size={24} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard
            title="Total Inventory Value"
            value={`₹${totalValue.toLocaleString()}`}
            trend={5}
            icon={<DollarSign size={24} />}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <StatCard title="Turnover Rate" value={`${turnoverRate}x`} trend={3} icon={<RotateCw size={24} />} />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <TopProductsChart />
        </motion.div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <InventoryTable data={filteredData} />
      </motion.div>
    </div>
  )
}
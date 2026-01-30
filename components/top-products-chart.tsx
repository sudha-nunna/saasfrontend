
"use client"

import { useEffect, useState, useCallback } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

type TopProduct = {
  name: string
  revenue: number
  quantitySold: number
}

export default function TopProductsChart() {
  const [data, setData] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"revenue" | "quantitySold">("revenue")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://saas-backend-1-p5kr.onrender.com/api/analytics/top-products?sortBy=${sortBy}&limit=10`
      )
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setData(json.data)
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [sortBy])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 60000)
    return () => clearInterval(id)
  }, [fetchData])

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Top Products</h3>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "revenue" | "quantitySold")
            }
            className="px-3 py-1 rounded bg-muted text-sm text-foreground"
          >
            <option value="revenue">By Revenue</option>
            <option value="quantitySold">By Quantity</option>
          </select>
          <button
            onClick={fetchData}
            className="px-3 py-1 rounded bg-muted text-sm text-foreground"
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading chart data…
        </div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-destructive">
          Error: {error}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
            <YAxis
              dataKey={sortBy}
              stroke="var(--color-muted-foreground)"
              tickFormatter={
                sortBy === "revenue"
                  ? (value) => `$${value.toLocaleString()}`
                  : undefined
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
              }}
              formatter={(value: number) =>
                sortBy === "revenue"
                  ? [`$${value.toLocaleString()}`, "Revenue"]
                  : [value, "Units Sold"]
              }
            />
            <Bar
              dataKey={sortBy}
              fill="var(--color-chart-1, #4f46e5)"
              radius={[8, 8, 0, 0]}
              name={sortBy === "revenue" ? "Revenue" : "Units Sold"}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

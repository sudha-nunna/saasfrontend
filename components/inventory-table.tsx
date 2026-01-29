"use client"

import { useState } from "react"
import { Edit2, Trash2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface InventoryItem {
  name: string
  count: number
  min: number
  price: number
  mfg: string
  exp: string
  status: string
}

interface InventoryTableProps {
  data: InventoryItem[]
}

export default function InventoryTable({ data }: InventoryTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In stock":
        return "bg-green-100 text-green-800 border-green-200"
      case "Low stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">All Materials</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Product Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Count</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Min Count</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Price (₹)</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Mfg Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Exp Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={index}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-border transition-colors ${
                  hoveredRow === index ? "bg-muted/50" : ""
                } ${item.status === "Low stock" || item.status === "Expired" ? "bg-red-50/30" : ""}`}
              >
                <td className="px-6 py-4 text-sm text-foreground font-medium">{item.name}</td>
                <td className="px-6 py-4 text-sm text-foreground">{item.count}</td>
                <td className="px-6 py-4 text-sm text-foreground">{item.min}</td>
                <td className="px-6 py-4 text-sm text-foreground">₹{item.price}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{item.mfg}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{item.exp}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {item.status === "Low stock" || item.status === "Expired" ? <AlertCircle size={14} /> : null}
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-muted rounded text-foreground">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1 hover:bg-destructive/10 rounded text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

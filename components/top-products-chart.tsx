// "use client"

// import { useEffect, useState, useCallback } from "react"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// type TopProduct = {
//   name: string
//   revenue: number
//   quantitySold: number
// }

// export default function TopProductsChart() {
//   const [data, setData] = useState<TopProduct[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [sortBy, setSortBy] = useState<'revenue' | 'quantitySold'>('revenue')

//   const fetchData = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await fetch(`http://localhost:5000/api/analytics/top-products?sortBy=${sortBy}&limit=10`)
//       if (!res.ok) throw new Error(`Server returned ${res.status}`)
//       const json = await res.json()
//       if (!json.success) throw new Error(json.error)
//       setData(json.data)
//     } catch (err: any) {
//       setError(err?.message || String(err))
//     } finally {
//       setLoading(false)
//     }
//   }, [sortBy])

//   useEffect(() => {
//     fetchData()
//     // Poll every 60s for fresh data
//     const id = setInterval(fetchData, 60000)
//     return () => clearInterval(id)
//   }, [fetchData])

//   return (
//     <div className="bg-card border border-border rounded-2xl p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-bold text-foreground">Top Products</h3>
//         <div className="flex items-center gap-2">
//           <select 
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value as 'revenue' | 'quantitySold')}
//             className="px-3 py-1 rounded bg-muted text-sm text-foreground"
//           >
//             <option value="revenue">By Revenue</option>
//             <option value="quantitySold">By Quantity</option>
//           </select>
//           <button
//             onClick={fetchData}
//             className="px-3 py-1 rounded bg-muted text-sm text-foreground"
//             disabled={loading}
//           >
//             Refresh
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div className="py-12 text-center text-sm text-muted-foreground">Loading chart data…</div>
//       ) : error ? (
//         <div className="py-12 text-center text-sm text-destructive">Error: {error}</div>
//       ) : (
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
//             <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
//             <YAxis 
//               dataKey={sortBy} 
//               stroke="var(--color-muted-foreground)"
//               tickFormatter={sortBy === 'revenue' ? 
//                 (value) => `$${value.toLocaleString()}` :
//                 undefined
//               }
//             />
//             <Tooltip
//               contentStyle={{
//                 backgroundColor: "var(--color-card)",
//                 border: "1px solid var(--color-border)",
//                 borderRadius: "8px",
//               }}
//               formatter={(value: number) => 
//                 sortBy === 'revenue' ? 
//                   [`$${value.toLocaleString()}`, "Revenue"] :
//                   [value, "Units Sold"]
//               }
//             />
//             <Bar 
//               dataKey={sortBy} 
//               fill="var(--color-chart-1)" 
//               radius={[8, 8, 0, 0]} 
//               name={sortBy === 'revenue' ? "Revenue" : "Units Sold"}
//             />
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   )
// }



// "use client"

// import { motion } from "framer-motion"
// import { Moon, Sun, Bell, Lock, User, LogOut, Database, Eye, Globe } from "lucide-react"
// import { useTheme } from "@/lib/theme-context"
// import { translations } from "@/lib/translations"
// import type { Language } from "@/lib/translations"

// export default function Settings() {
//   const { darkMode, setDarkMode, language, setLanguage } = useTheme()
//   const t = translations[language]

//   const SettingToggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
//     <button
//       onClick={onChange}
//       className={`w-12 h-6 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
//     >
//       <div
//         className={`w-5 h-5 bg-white rounded-full transition-transform ${
//           enabled ? "translate-x-6" : "translate-x-0.5"
//         }`}
//       />
//     </button>
//   )

//   return (
//     <div className="p-6 space-y-6">
//       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
//         <h1 className="text-3xl font-bold text-foreground">{t.settingsTitle}</h1>
//         <p className="text-muted-foreground mt-1">{t.settingsSubtitle}</p>
//       </motion.div>

//       <div className="space-y-4 max-w-2xl">
//         {/* Account Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
//           <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
//             <User size={20} />
//             {t.account}
//           </h2>
//           <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
//             <div className="flex items-center justify-between pb-4 border-b border-border">
//               <div>
//                 <h3 className="font-semibold text-foreground">{t.profileInfo}</h3>
//                 <p className="text-sm text-muted-foreground">{t.updateNameEmail}</p>
//               </div>
//               <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
//                 {t.editProfile}
//               </button>
//             </div>
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="font-semibold text-foreground">{t.emailAddress}</h3>
//                 <p className="text-sm text-muted-foreground">admin@inventory.com</p>
//               </div>
//               <button className="text-primary hover:underline text-sm font-medium">{t.change}</button>
//             </div>
//           </div>
//         </motion.div>

//         {/* Appearance Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
//           <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
//             <Eye size={20} />
//             {t.appearance}
//           </h2>
//           <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
//             <div className="flex items-center justify-between pb-4 border-b border-border">
//               <div className="flex items-center gap-3">
//                 {darkMode ? <Moon size={20} /> : <Sun size={20} />}
//                 <div>
//                   <h3 className="font-semibold text-foreground">{t.darkMode}</h3>
//                   <p className="text-sm text-muted-foreground">{t.toggleDarkTheme}</p>
//                 </div>
//               </div>
//               <SettingToggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Globe size={20} />
//                 <div>
//                   <h3 className="font-semibold text-foreground">{t.language}</h3>
//                   <p className="text-sm text-muted-foreground">{t.selectLanguage}</p>
//                 </div>
//               </div>
//               <select
//                 value={language}
//                 onChange={(e) => setLanguage(e.target.value as Language)}
//                 className="px-3 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-muted transition-colors text-sm"
//               >
//                 <option value="en">English</option>
//                 <option value="hi">हिंदी (Hindi)</option>
//                 <option value="te">తెలుగు (Telugu)</option>
//               </select>
//             </div>
//           </div>
//         </motion.div>

//         {/* Notifications Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//           <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
//             <Bell size={20} />
//             {t.notifications}
//           </h2>
//           <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
//             <div className="flex items-center justify-between pb-4 border-b border-border">
//               <div className="flex items-center gap-3">
//                 <Bell size={20} />
//                 <div>
//                   <h3 className="font-semibold text-foreground">{t.pushNotifications}</h3>
//                   <p className="text-sm text-muted-foreground">{t.receiveAlerts}</p>
//                 </div>
//               </div>
//               <SettingToggle enabled={true} onChange={() => {}} />
//             </div>
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="font-semibold text-foreground">{t.emailAlerts}</h3>
//                 <p className="text-sm text-muted-foreground">{t.getNotifiedViaEmail}</p>
//               </div>
//               <SettingToggle enabled={true} onChange={() => {}} />
//             </div>
//           </div>
//         </motion.div>

//         {/* Security Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
//           <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
//             <Lock size={20} />
//             {t.security}
//           </h2>
//           <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
//             <div className="flex items-center justify-between pb-4 border-b border-border">
//               <div>
//                 <h3 className="font-semibold text-foreground">{t.password}</h3>
//                 <p className="text-sm text-muted-foreground">{t.lastChanged}</p>
//               </div>
//               <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm">
//                 {t.changePassword}
//               </button>
//             </div>
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="font-semibold text-foreground">{t.twoFactorAuth}</h3>
//                 <p className="text-sm text-muted-foreground">{t.addExtraLayer}</p>
//               </div>
//               <SettingToggle enabled={false} onChange={() => {}} />
//             </div>
//           </div>
//         </motion.div>

//         {/* Data Section */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//           <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
//             <Database size={20} />
//             {t.data}
//           </h2>
//           <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
//             <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors">
//               <h3 className="font-semibold text-foreground">{t.exportData}</h3>
//               <p className="text-sm text-muted-foreground">{t.downloadInventory}</p>
//             </button>
//             <button className="w-full text-left px-4 py-3 hover:bg-muted rounded-lg transition-colors border-t border-border pt-3">
//               <h3 className="font-semibold text-destructive">{t.deleteAccount}</h3>
//               <p className="text-sm text-muted-foreground">{t.permanentlyDelete}</p>
//             </button>
//           </div>
//         </motion.div>

//         {/* Logout */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
//           <button className="w-full flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium">
//             <LogOut size={18} />
//             {t.logout}
//           </button>
//         </motion.div>
//       </div>
//     </div>
//   )
// }



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
        `http://localhost:5000/api/analytics/top-products?sortBy=${sortBy}&limit=10`
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

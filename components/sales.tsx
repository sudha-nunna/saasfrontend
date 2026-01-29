"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SalesChart from "./sales-chart";

// Resolve API base consistently
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// Type definitions for TypeScript
interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  sku: string;
  name: string;
  sales: number;
}

interface SalesResponse {
  trends: RevenueData[];
  topProducts: TopProduct[];
}

export default function Sales() {
  const [salesData, setSalesData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${API}/sales`);
        if (!res.ok) {
          // Handle error gracefully without throwing
          setSalesData([]);
          setTopProducts([]);
          setLoading(false);
          return;
        }
        const data: SalesResponse = await res.json();
        // Ensure arrays are always set, even if undefined in response
        setSalesData(Array.isArray(data.trends) ? data.trends : []);
        setTopProducts(Array.isArray(data.topProducts) ? data.topProducts : []);
      } catch (error) {
        // Silently handle network errors without throwing
        console.error("Error fetching sales data:", error);
        // Ensure state is always an array, even on error
        setSalesData([]);
        setTopProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-semibold">
        Loading sales data...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Sales</h1>
        <p className="text-muted-foreground mt-1">
          Revenue and order analytics
        </p>
      </motion.div>

      {/* Revenue + Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </div>
        </motion.div>

        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Orders Trend</h3>
            {salesData && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="orders"
                    fill="#f97316"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No orders data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sales + Inventory Trends Chart */}
      <SalesChart />

      {/* Top Products Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Top Selling SKUs</h3>
          <div className="space-y-3">
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                  </div>
                  <p className="font-bold text-primary">{item.sales} units</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No top products data available
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}







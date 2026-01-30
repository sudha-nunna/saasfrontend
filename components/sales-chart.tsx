"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Resolve API base consistently
const API = (process.env.NEXT_PUBLIC_API_URL || "https://saas-backend-1-p5kr.onrender.com/api").replace(/\/$/, "");

interface AnalyticsData {
  date: string;
  sales: number;
  inventory: number;
}

export default function SalesChart() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API}/analytics`);
        if (!res.ok) {
          setError("Failed to load analytics data");
          setAnalyticsData([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        // Ensure data is an array
        setAnalyticsData(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        // Silently handle network errors without throwing
        setError("Failed to load analytics data");
        setAnalyticsData([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Loading analytics data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 mt-4">
        <h3 className="text-lg font-bold mb-4">Sales & Inventory Trends</h3>
        <div className="text-center text-muted-foreground py-10">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mt-4">
      <h3 className="text-lg font-bold mb-4">Sales & Inventory Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={analyticsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="inventory"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}




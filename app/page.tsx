"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"
import Link from "next/link"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/50 to-indigo-900/60" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Food/Business Icons Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 text-6xl">🍎</div>
        <div className="absolute top-40 right-20 text-5xl">🥕</div>
        <div className="absolute bottom-32 left-20 text-4xl">🍞</div>
        <div className="absolute bottom-20 right-10 text-5xl">🥬</div>
        <div className="absolute top-1/2 left-1/4 text-4xl">🍗</div>
        <div className="absolute top-1/3 right-1/3 text-5xl">🧀</div>
        <div className="absolute bottom-1/3 left-1/2 text-4xl">🍝</div>
        <div className="absolute top-2/3 right-1/4 text-5xl">🥩</div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-lg w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center border border-white/30">
          <div className="mb-8">
            <div className="text-6xl mb-4">🏪</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Fresh Inventory, Flourishing Business</h1>
            <p className="text-gray-600 text-lg">Transform your food business with intelligent inventory control, real-time sales insights, and seamless growth tools</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Real-time tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Low stock alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Sales analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Easy billing</span>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/register"
              className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Get Started - Register Your Business
            </Link>

            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in to your dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

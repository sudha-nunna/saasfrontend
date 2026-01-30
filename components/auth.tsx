"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook

// Resolve API base without relying on a missing utils file
const API = (process.env.NEXT_PUBLIC_API_URL || "https://saas-backend-1-p5kr.onrender.com/api").replace(/\/$/, "");

interface SignInFormData {
  email: string;
  password: string;
}

export function SignInForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<SignInFormData>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to authenticate");

      login({ token: data.token, user: data.user });
      if (onClose) onClose();
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md"
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded-md"
          required
        />

        {error && (
          <p className="text-red-600 text-sm text-center mb-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="bg-blue-600 w-full text-white py-2 rounded-md hover:bg-blue-700 transition">
          {loading ? "Processing..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpForm({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<SignUpFormData>({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to authenticate");

      login({ token: data.token, user: data.user });
      if (onClose) onClose();
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md"
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md"
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded-md"
          required
        />
        <input
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded-md"
          required
        />

        {error && (
          <p className="text-red-600 text-sm text-center mb-2">{error}</p>
        )}

        <button type="submit" disabled={loading} className="bg-blue-600 w-full text-white py-2 rounded-md hover:bg-blue-700 transition">
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

// Backwards-compatible default export (optional)
export default SignInForm;

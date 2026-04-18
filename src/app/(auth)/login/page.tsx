"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Dumbbell, Mail, Lock, AlertCircle, Loader2, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const user = await login(email, password);
    setLoading(false);

    if (!user) {
      setError("Invalid email or password. Please try again.");
    } else {
      if (user.role === "trainer") {
        router.push("/trainer/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  };

  const fillDemo = (type: "trainer" | "customer") => {
    if (type === "trainer") {
      setEmail("trainer@ishow.com");
      setPassword("trainer123");
    } else {
      setEmail("john@example.com");
      setPassword("demo123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white mt-4">Welcome Back</h1>
          <p className="text-blue-300 mt-2">Sign in to continue your fitness journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white py-3 rounded-lg font-bold text-base transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600">
                Register here
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Demo Accounts — Click to Fill</p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo("trainer")}
                className="w-full bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2.5 text-xs text-blue-700 text-left transition-colors border border-blue-100"
              >
                <span className="font-bold">Trainer Account:</span> trainer@ishow.com / trainer123
              </button>
              <button
                type="button"
                onClick={() => fillDemo("customer")}
                className="w-full bg-orange-50 hover:bg-orange-100 rounded-lg px-3 py-2.5 text-xs text-orange-700 text-left transition-colors border border-orange-100"
              >
                <span className="font-bold">Customer Account:</span> john@example.com / demo123
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-300/60 text-sm mt-6">
          <Link href="/" className="hover:text-blue-300 transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

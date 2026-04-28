"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#111113] border border-[#2A2A2E] rounded-2xl p-8">
        <h1 className="text-center text-[#F5F5F5] font-semibold mb-6">Property CRM</h1>
        <h2 className="text-sm font-medium text-[#F5F5F5] mb-4">Sign Up</h2>
        {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-2 mb-4">{error}</p>}
        {message && <p className="text-sm text-green-400 bg-green-500/10 rounded-lg p-2 mb-4">{message}</p>}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#A1A1AA] mb-2 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              required
            />
          </div>
          <div>
            <label className="text-xs text-[#A1A1AA] mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              required
            />
          </div>

          <div>
            <label className="text-xs text-[#A1A1AA] mb-2 block">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#A1A1AA] mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1A1A1D] border border-[#2A2A2E] rounded-lg px-3 py-2 text-sm text-[#F5F5F5] focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Create Account
          </button>
        </form>
        <p className="text-sm text-[#A1A1AA] mb-2 text-center p-2">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-400 hover:text-[#F5F5F5] transition-colors duration-200">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

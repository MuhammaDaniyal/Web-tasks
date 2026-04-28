"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F5F5F5] overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center border-b border-[#2A2A2E] bg-[#0B0B0C]/80 backdrop-blur-md">
        <p className="text-sm font-semibold text-[#F5F5F5]">Property CRM</p>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-200">
            Login
          </Link>
          <Link href="/signup" className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg transition-colors duration-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 relative">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            Built for Pakistan's Real Estate Market
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold text-[#F5F5F5] leading-tight mb-6">
            Manage Your Leads
            <br />
            <span className="text-indigo-400">Close More Deals</span>
          </h1>

          <p className="text-[#A1A1AA] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            A professional CRM built for property dealers. Track leads from Facebook Ads, walk-ins, and website inquiries — all in one place.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/signup" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-lg transition-colors duration-200 font-medium">
              Start Free
            </Link>
            <Link href="/login" className="border border-[#2A2A2E] hover:bg-[#1A1A1D] text-[#A1A1AA] hover:text-[#F5F5F5] text-sm px-6 py-2.5 rounded-lg transition-colors duration-200">
              Sign In
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto">
          <div className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-4 shadow-2xl">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2A2A2E]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-amber-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="flex-1 mx-4 bg-[#1A1A1D] rounded-md px-3 py-1 text-xs text-[#A1A1AA]">
                propertycrm.vercel.app/admin
              </div>
            </div>

            {/* Fake dashboard UI */}
            <div className="flex gap-3">
              {/* Fake sidebar */}
              <div className="w-36 bg-[#0B0B0C] rounded-xl p-3 space-y-1 flex-shrink-0">
                <div className="text-xs text-[#A1A1AA] px-2 py-1 mb-2">Property CRM</div>
                {["Dashboard", "Leads", "Agents"].map((item, i) => (
                  <div key={item} className={`text-xs px-2 py-1.5 rounded-lg ${i === 0 ? "bg-[#1A1A1D] text-indigo-400" : "text-[#A1A1AA]"}`}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Fake content */}
              <div className="flex-1 space-y-3">
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Total Leads", value: "248", color: "text-indigo-400" },
                    { label: "Unassigned", value: "12", color: "text-amber-400" },
                    { label: "Overdue", value: "5", color: "text-red-400" },
                    { label: "Agents", value: "8", color: "text-green-400" },
                  ].map(card => (
                    <div key={card.label} className="bg-[#0B0B0C] rounded-xl p-3">
                      <p className={`text-lg font-semibold ${card.color}`}>{card.value}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{card.label}</p>
                    </div>
                  ))}
                </div>

                {/* Fake table */}
                <div className="bg-[#0B0B0C] rounded-xl p-3">
                  <div className="grid grid-cols-4 text-xs text-[#A1A1AA] pb-2 border-b border-[#2A2A2E] mb-2">
                    <span>Client</span><span>Budget</span><span>Priority</span><span>Status</span>
                  </div>
                  {[
                    { name: "Bilal Siddiqui", budget: "Rs. 25M", priority: "High", priorityColor: "text-red-400 bg-red-500/10", status: "New", statusColor: "text-zinc-300 bg-zinc-800" },
                    { name: "Fatima Sheikh", budget: "Rs. 15M", priority: "Medium", priorityColor: "text-amber-400 bg-amber-500/10", status: "Contacted", statusColor: "text-blue-400 bg-blue-500/10" },
                    { name: "Danish Iqbal", budget: "Rs. 35M", priority: "High", priorityColor: "text-red-400 bg-red-500/10", status: "In Progress", statusColor: "text-amber-400 bg-amber-500/10" },
                  ].map(row => (
                    <div key={row.name} className="grid grid-cols-4 text-xs py-1.5 items-center">
                      <span className="text-[#F5F5F5]">{row.name}</span>
                      <span className="text-[#A1A1AA]">{row.budget}</span>
                      <span className={`inline-flex w-fit px-1.5 py-0.5 rounded-full text-xs ${row.priorityColor}`}>{row.priority}</span>
                      <span className={`inline-flex w-fit px-1.5 py-0.5 rounded-full text-xs ${row.statusColor}`}>{row.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Everything you need to close deals</h2>
          <p className="text-[#A1A1AA] text-sm max-w-md mx-auto">Built specifically for the Pakistani real estate market. No bloat, just what property dealers actually need.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-5.196-3.796M9 20H4v-1a4 4 0 015.196-3.796M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-14 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              ),
              title: "Lead Management",
              desc: "Capture leads from Facebook Ads, walk-ins, and websites. Never lose a potential client again."
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V21h4.5v-7.5H3zm7.5-6V21H15V7.5h-4.5zm7.5 3V21H21v-9.5h-3.5z"/></svg>
              ),
              title: "Smart Analytics",
              desc: "Track agent performance, lead conversion rates, and pipeline health in real time."
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
              ),
              title: "Follow-up Reminders",
              desc: "Never miss a follow-up. Get alerted on overdue leads and stale contacts automatically."
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
              ),
              title: "WhatsApp Integration",
              desc: "Contact any lead instantly via WhatsApp with one click. No copy-pasting numbers."
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
              ),
              title: "Role Based Access",
              desc: "Admins see everything. Agents only see their assigned leads. Clean and secure."
            },
            {
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ),
              title: "Activity Timeline",
              desc: "Full audit trail of every action on every lead. Know exactly what happened and when."
            },
          ].map(feature => (
            <div key={feature.title} className="bg-[#111113] border border-[#2A2A2E] rounded-2xl p-5 hover:bg-[#1A1A1D] transition-colors duration-200">
              <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-medium text-[#F5F5F5] mb-2">{feature.title}</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-[#2A2A2E] py-12 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: "3x", label: "Faster lead response" },
            { value: "60%", label: "Less missed follow-ups" },
            { value: "100%", label: "Lead visibility for admin" },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold text-indigo-400 mb-1">{stat.value}</p>
              <p className="text-xs text-[#A1A1AA]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Ready to grow your business?</h2>
          <p className="text-[#A1A1AA] text-sm mb-8">Join property dealers already using the system to close more deals.</p>
          <Link href="/signup" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-8 py-3 rounded-lg transition-colors duration-200 font-medium">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2E] px-6 py-6 flex justify-between items-center">
        <p className="text-xs text-[#A1A1AA]">Property CRM — CS-4032 Web Programming</p>
        <div className="flex gap-4">
          <Link href="/login" className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-200">Login</Link>
          <Link href="/signup" className="text-xs text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-200">Signup</Link>
        </div>
      </footer>

    </div>
  );
}
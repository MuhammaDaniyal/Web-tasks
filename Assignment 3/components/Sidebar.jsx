"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function ChartIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V21h4.5v-7.5H3zm7.5-6V21H15V7.5h-4.5zm7.5 3V21H21v-9.5h-3.5z"/></svg>;
}
function LeadsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-5.196-3.796M9 20H4v-1a4 4 0 015.196-3.796M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zm-14 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>;
}
function AgentsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>;
}
function LogoutIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>;
}

const adminLinks = [
  { href: "/admin",        label: "Dashboard", icon: <ChartIcon /> },
  { href: "/admin/leads",  label: "Leads",     icon: <LeadsIcon /> },
  { href: "/admin/agents", label: "Agents",    icon: <AgentsIcon /> },
];

const agentLinks = [
  { href: "/agent", label: "My Leads", icon: <LeadsIcon /> },
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = role === "admin" ? adminLinks : agentLinks;

  function logout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  function isActive(href) {
    if (href === "/admin" || href === "/agent") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#111113] border-r border-[#2A2A2E] flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[#2A2A2E]">
        <p className="text-sm font-semibold text-[#F5F5F5]">Property CRM</p>
        <p className="text-xs text-[#A1A1AA] mt-0.5 capitalize">{role} panel</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
              isActive(link.href)
                ? "bg-[#1A1A1D] text-indigo-400"
                : "text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1A1A1D]"
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#2A2A2E]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#A1A1AA] hover:text-red-400 hover:bg-[#1A1A1D] transition-colors duration-200 w-full"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  );
}
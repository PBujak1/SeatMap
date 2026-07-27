import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LayoutGrid, CalendarCheck, LogOut } from "lucide-react";

const nav = [
    { to: "/", label: "Spaces", icon: LayoutGrid },
    { to: "/my-reservations", label: "My bookings", icon: CalendarCheck },
];

export default function AppShell() {
    const { pathname } = useLocation();
    return (
        <div className="min-h-screen bg-[#FAFAF8] text-neutral-900">
            <header className="sticky top-0 z-20 backdrop-blur bg-[#FAFAF8]/80 border-b border-neutral-200/70">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="text-lg tracking-tight font-semibold">
                        Seat<span className="text-neutral-400">plan</span>
                    </Link>
                    <nav className="flex items-center gap-1">
                        {nav.map(({ to, label, icon: Icon }) => {
                            const active = pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-colors ${
                                        active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-200/60"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => base44.auth.logout("/login")}
                            className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </nav>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-10">
                <Outlet />
            </main>
        </div>
    );
}
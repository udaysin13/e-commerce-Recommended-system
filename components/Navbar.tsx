"use client";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between">

      {/* Logo */}
      <h1 className="text-lg md:text-xl font-bold text-white">
        FluxCart
      </h1>

      {/* Search (desktop only) */}
      <input
        placeholder="Search products..."
        className="hidden md:block bg-slate-800 px-4 py-2 rounded-lg w-1/3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Icons */}
      <div className="flex items-center gap-4 text-lg">
        <span className="cursor-pointer hover:text-indigo-400">👤</span>
        <span className="cursor-pointer hover:text-indigo-400">🛒</span>
      </div>
    </div>
  );
}
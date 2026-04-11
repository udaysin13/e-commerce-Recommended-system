import "./globals.css";
import { Suspense } from "react";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "ShopWise - E-commerce Recommendation System",
  description: "A modern e-commerce platform with AI-powered product recommendations using hybrid recommendation engine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="bg-slate-100">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <div className="min-h-screen">{children}</div>
        <footer className="border-t border-stone-200 bg-white/50 py-8 text-center text-sm text-stone-600">
          <p>Build shopping discovery around real hybrid recommendations.</p>
          <p className="mt-2">Backend: http://localhost:5000 | Frontend: http://localhost:3000</p>
        </footer>
      </body>
    </html>
  );
}

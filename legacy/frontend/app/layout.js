import "./globals.css";
import { Suspense } from "react";
import { Header, Footer } from "@/components/Navigation";

export const metadata = {
  title: "ShopSmart - AI-Powered E-commerce with Smart Recommendations",
  description: "Modern e-commerce platform with intelligent product recommendations using hybrid recommendation algorithms. Browse thousands of products tailored to your preferences.",
  keywords: "ecommerce, shopping, recommendations, AI, products",
  og: {
    title: "ShopSmart - Smart Shopping",
    description: "Discover products recommended just for you",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50">
        <Suspense fallback={<div className="h-16 bg-white" />}>
          <Header />
        </Suspense>
        
        <main className="min-h-screen">
          {children}
        </main>
        
        <Suspense fallback={<div className="h-32 bg-gray-200" />}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}

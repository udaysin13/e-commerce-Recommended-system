import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
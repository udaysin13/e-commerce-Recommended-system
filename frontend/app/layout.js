import "./globals.css";

export const metadata = {
  title: "E-commerce Recommendation System",
  description: "Full-stack ecommerce recommendation demo with Next.js and Express.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

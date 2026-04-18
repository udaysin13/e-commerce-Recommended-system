import { Suspense } from "react";
import HomePageEnhanced from "../components/HomePageEnhanced";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-gray-100" />}>
      <HomePageEnhanced />
    </Suspense>
  );
}

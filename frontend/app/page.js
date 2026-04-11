import { Suspense } from "react";
import HomeClientEnhanced from "../components/HomeClientEnhanced";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeClientEnhanced />
    </Suspense>
  );
}

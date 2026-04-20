import NewLandingPage from '@/components/new-landing';
import { PublicGuard } from "@/components/guards/AuthGuard";

export default function Home() {
  return (
    <PublicGuard>
      <NewLandingPage />
    </PublicGuard>
  );
}

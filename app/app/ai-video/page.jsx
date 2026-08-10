import { Suspense } from 'react';
import AIVideoPageContent from './components/ai-video-page-content';
import { AIVideoSkeleton } from '@/components/skeletons/aivideo';

export const metadata = {
  title: 'AI Video Summary Report | Odito',
  description: 'Generate an automated narrated overview report of your project\'s AI visibility and SEO metrics',
};

export default function AIVideoPage() {
  return (
    <Suspense fallback={<AIVideoSkeleton />}>
      <AIVideoPageContent />
    </Suspense>
  );
}

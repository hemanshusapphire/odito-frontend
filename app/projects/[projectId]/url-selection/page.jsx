import UrlSelectionPageClient from './client';

// Server component - async to unwrap params
export default async function UrlSelectionPage({ params }) {
  const { projectId } = await params;

  return <UrlSelectionPageClient projectId={projectId} />;
}

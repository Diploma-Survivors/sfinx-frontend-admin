import { DiscussDetail } from "@/components/discuss/discuss-detail";

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <DiscussDetail postId={resolvedParams.id} />
    </div>
  );
}

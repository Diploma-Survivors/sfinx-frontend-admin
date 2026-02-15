import { DiscussList } from "@/components/discuss/discuss-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DiscussionsPage() {
  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussions</h1>
          <p className="text-muted-foreground mt-1">
            Manage student discussions and community posts.
          </p>
        </div>
        <Button asChild>
          <Link href="/discussions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Discussion
          </Link>
        </Button>
      </div>

      <DiscussList />
    </div>
  );
}

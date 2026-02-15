"use client";

import { DiscussForm } from "@/components/discuss/discuss-form";
import { DiscussService } from "@/services/discuss-service";
import { Post } from "@/types/discuss";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";

export default function EditDiscussionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { error } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const data = await DiscussService.getPost(id);
        setPost(data);
      } catch (err) {
        error("Failed to load discussion details");
        router.push("/discussions");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="container py-8 text-center bg-background">Loading...</div>
    );
  }

  if (!post) {
    return (
      <div className="container py-8 text-center bg-background">
        Discussion not found
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <DiscussForm post={post} isEditing />
    </div>
  );
}

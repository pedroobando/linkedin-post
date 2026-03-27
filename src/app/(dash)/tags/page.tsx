/**
 * Tags Page - Server Component
 * Fetches session server-side and renders the client component with tags data.
 */

import { getAllTagsWithCount } from '@/actions/tags';
import { getServerSession } from '@/lib/get-session';
import { TagsContainer } from './tags-container';

export default async function TagsPage() {
  // Fetch session server-side
  const session = await getServerSession();
  const currentUserId = session?.user?.id;

  // Fetch tags server-side
  const tags = await getAllTagsWithCount();

  return <TagsContainer initialTags={tags} currentUserId={currentUserId} />;
}

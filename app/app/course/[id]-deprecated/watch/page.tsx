// Redirect to new slug-based route
import { redirect } from 'next/navigation'

export default function OldWatchPage({ params }: { params: { id: string } }) {
  // This is a placeholder - in a real app you'd look up the course by ID to get its slug
  redirect(`/courses`)
}

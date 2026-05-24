import { Star } from 'lucide-react';
import type { ReviewWithUser } from '@helfy/shared';

import { Card, CardContent } from '@/components/ui/card';

interface ReviewListProps {
  reviews: ReviewWithUser[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{review.user.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-3 fill-primary text-primary" />
                {review.rating}/5
              </div>
            </div>
            <p className="font-medium">{review.title}</p>
            <p className="text-sm text-muted-foreground">{review.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

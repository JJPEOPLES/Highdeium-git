import { Heart, MessageCircle, Share, Bookmark, Play, Music, Image } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { BookWithAuthor } from "@shared/schema";

interface BookCardProps {
  book: BookWithAuthor;
}

export function BookCard({ book }: BookCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(book.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(book.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(book.likeCount);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/books/${book.id}/like`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      setLikeCount(data.likeCount);
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to toggle like",
        variant: "destructive",
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/books/${book.id}/bookmark`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked);
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to toggle bookmark",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like books",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required", 
        description: "Please log in to bookmark books",
        variant: "destructive",
      });
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description || '',
        url: `${window.location.origin}/books/${book.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/books/${book.id}`);
      toast({
        title: "Link Copied",
        description: "Book link copied to clipboard",
      });
    }
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'fantasy': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      'sci-fi': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
      'romance': 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
      'horror': 'bg-gray-800 dark:bg-gray-700 text-gray-100',
      'thriller': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      'mystery': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
      'adventure': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      'business': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      'self-help': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    };
    return colors[genre] || 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
  };

  return (
    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden" data-testid={`book-card-${book.id}`}>
      <div className="relative">
        <Link href={`/books/${book.id}`}>
          <div className="aspect-[3/2] overflow-hidden">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-testid={`book-cover-${book.id}`}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                <span className="text-4xl">📖</span>
              </div>
            )}
          </div>
        </Link>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute top-3 left-3 flex space-x-2">
          <Badge className={getGenreColor(book.genre)} data-testid={`book-genre-${book.id}`}>
            {book.genre}
          </Badge>
          {book.isMature && (
            <Badge className="bg-red-600 text-white" data-testid={`book-mature-${book.id}`}>
              18+
            </Badge>
          )}
          <div className="flex space-x-1">
            {book.hasVideo && (
              <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <Play className="h-3 w-3" />
              </div>
            )}
            {book.hasAudio && (
              <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <Music className="h-3 w-3" />
              </div>
            )}
            {book.hasImages && (
              <div className="bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                <Image className="h-3 w-3" />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-3 right-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
            data-testid={`bookmark-button-${book.id}`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link href={`/books/${book.id}`}>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2 hover:text-blue-500 transition-colors" data-testid={`book-title-${book.id}`}>
                {book.title}
              </h3>
            </Link>
            <Link href={`/authors/${book.author.id}`}>
              <p className="text-gray-600 dark:text-gray-400 text-sm hover:text-blue-500 transition-colors" data-testid={`book-author-${book.id}`}>
                by {book.author.firstName && book.author.lastName 
                  ? `${book.author.firstName} ${book.author.lastName}`
                  : book.author.email
                }
              </p>
            </Link>
          </div>
          <div className="ml-3 flex-shrink-0">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300" data-testid={`book-rating-${book.id}`}>
                {book.rating || '0.0'}
              </span>
            </div>
          </div>
        </div>

        {book.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 font-serif" data-testid={`book-description-${book.id}`}>
            {book.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} hover:text-red-500 transition-colors`}
              data-testid={`like-button-${book.id}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm" data-testid={`like-count-${book.id}`}>{likeCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Link href={`/books/${book.id}#comments`} data-testid={`comment-button-${book.id}`}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm" data-testid={`comment-count-${book.id}`}>{book.commentCount}</span>
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors"
              data-testid={`share-button-${book.id}`}
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-semibold ${parseFloat(book.price) > 0 ? 'text-orange-500' : 'text-green-500'}`} data-testid={`book-price-${book.id}`}>
              {parseFloat(book.price) > 0 ? `$${book.price}` : 'Free'}
            </div>
            {book.readTime && (
              <div className="text-xs text-gray-500 dark:text-gray-400" data-testid={`book-read-time-${book.id}`}>
                {book.readTime}m read
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

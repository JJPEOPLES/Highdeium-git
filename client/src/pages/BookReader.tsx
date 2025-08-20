import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Heart, 
  Bookmark, 
  Share, 
  MessageCircle, 
  Star, 
  Play, 
  Music, 
  Image as ImageIcon,
  ArrowLeft,
  Eye,
  ShoppingCart,
  Lock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { BookWithDetails, CommentWithUser } from "@shared/schema";

export default function BookReader() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const { data: book, isLoading } = useQuery<BookWithDetails>({
    queryKey: [`/api/books/${id}`],
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/books/${id}/comments`],
    enabled: !!id,
  });

  useEffect(() => {
    if (book) {
      setIsLiked(book.isLiked || false);
      setIsBookmarked(book.isBookmarked || false);
      setLikeCount(book.likeCount);
    }
  }, [book]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/books/${id}/like`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsLiked(data.liked);
      setLikeCount(data.likeCount);
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
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
      const response = await apiRequest("POST", `/api/books/${id}/bookmark`);
      return response.json();
    },
    onSuccess: (data) => {
      setIsBookmarked(data.bookmarked);
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}`] });
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

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/books/${id}/comments`, { content });
      return response.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/books/${id}/comments`] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully.",
      });
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
        description: "Failed to post comment",
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
    if (navigator.share && book) {
      navigator.share({
        title: book.title,
        text: book.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Book link copied to clipboard",
      });
    }
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The book you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canReadFull = parseFloat(book.price) === 0 || book.isPurchased || book.authorId === user?.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="back-button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                data-testid="header-like-button"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="ml-1">{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
                data-testid="header-bookmark-button"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                data-testid="header-share-button"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Book Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover */}
            <div className="md:w-64 flex-shrink-0">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full rounded-lg shadow-lg"
                  data-testid="book-cover"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-6xl">📖</span>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="book-title">
                    {book.title}
                  </h1>
                  <Link href={`/authors/${book.author.id}`}>
                    <p className="text-xl text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors" data-testid="book-author">
                      by {book.author.firstName && book.author.lastName 
                        ? `${book.author.firstName} ${book.author.lastName}`
                        : book.author.email
                      }
                    </p>
                  </Link>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300" data-testid="book-rating">
                    {book.rating || '0.0'}
                  </span>
                  <span className="text-sm text-gray-500">({book.ratingCount} reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className={getGenreColor(book.genre)} data-testid="book-genre">
                  {book.genre}
                </Badge>
                {book.isMature && (
                  <Badge className="bg-red-600 text-white" data-testid="mature-badge">
                    18+
                  </Badge>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span data-testid="view-count">{book.viewCount} views</span>
                </div>
                {book.readTime && (
                  <span className="text-sm text-gray-500 dark:text-gray-400" data-testid="read-time">
                    {book.readTime}m read
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-6">
                {book.hasVideo && (
                  <div className="flex items-center space-x-1 text-blue-500">
                    <Play className="h-4 w-4" />
                    <span className="text-sm">Video</span>
                  </div>
                )}
                {book.hasAudio && (
                  <div className="flex items-center space-x-1 text-green-500">
                    <Music className="h-4 w-4" />
                    <span className="text-sm">Audio</span>
                  </div>
                )}
                {book.hasImages && (
                  <div className="flex items-center space-x-1 text-purple-500">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm">Illustrated</span>
                  </div>
                )}
              </div>

              {book.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-serif" data-testid="book-description">
                  {book.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                {!canReadFull && parseFloat(book.price) > 0 && (
                  <Link href={`/checkout/${book.id}`}>
                    <Button className="bg-green-500 hover:bg-green-600 text-white" data-testid="purchase-button">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy for ${book.price}
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleLike}
                  className={`${isLiked ? 'text-red-500 border-red-200' : ''}`}
                  data-testid="like-button"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'} ({likeCount})
                </Button>

                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  className={`${isBookmarked ? 'text-blue-500 border-blue-200' : ''}`}
                  data-testid="bookmark-button"
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  data-testid="share-button"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {canReadFull ? (
              <div className="prose dark:prose-invert max-w-none font-serif" data-testid="book-content">
                {book.chapters.length > 0 ? (
                  book.chapters.map((chapter, index) => (
                    <div key={chapter.id} className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">{chapter.title}</h2>
                      <div 
                        className="whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br>') }}
                      />
                      {index < book.chapters.length - 1 && <Separator className="my-8" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No content available yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  This book requires purchase
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Purchase this book for ${book.price} to read the full content.
                </p>
                <Link href={`/checkout/${book.id}`}>
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card id="comments">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Comments ({comments.length})
              </h3>
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>

            {/* Add Comment */}
            {isAuthenticated ? (
              <div className="mb-6">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                  data-testid="comment-input"
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim() || commentMutation.isPending}
                  data-testid="submit-comment-button"
                >
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Please log in to leave a comment</p>
                <Button asChild>
                  <a href="/api/login">Sign In</a>
                </Button>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4" data-testid="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.profileImageUrl || ''} />
                      <AvatarFallback>
                        {comment.user.firstName?.[0]?.toUpperCase() || comment.user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.user.firstName && comment.user.lastName 
                            ? `${comment.user.firstName} ${comment.user.lastName}`
                            : comment.user.email
                          }
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

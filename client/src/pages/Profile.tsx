import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  BookOpen, 
  Heart, 
  Users, 
  DollarSign, 
  Calendar,
  Settings,
  Edit,
  Plus,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BookCard } from "@/components/BookCard";
import { BookEditor } from "@/components/BookEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User as UserType, BookWithAuthor } from "@shared/schema";

export default function Profile() {
  const { id } = useParams();
  const [location] = useLocation();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Determine which profile to show and what data to fetch
  const isOwnProfile = !id || id === currentUser?.id;
  const isMyBooksPage = location === "/my-books";
  const isBookmarksPage = location === "/bookmarks";
  const profileUserId = id || currentUser?.id;

  // Check authentication for protected pages
  useEffect(() => {
    if ((isMyBooksPage || isBookmarksPage || (isOwnProfile && location === "/profile")) && !isAuthenticated) {
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
  }, [isAuthenticated, isMyBooksPage, isBookmarksPage, isOwnProfile, location, toast]);

  const { data: profileUser } = useQuery<UserType>({
    queryKey: [`/api/auth/user`],
    enabled: isOwnProfile && isAuthenticated,
  });

  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${profileUserId}/stats`],
    enabled: !!profileUserId,
  });

  const { data: userBooks = [] } = useQuery<BookWithAuthor[]>({
    queryKey: [`/api/users/${profileUserId}/books`],
    enabled: !!profileUserId && (isOwnProfile || !isMyBooksPage),
  });

  const { data: bookmarks = [] } = useQuery<BookWithAuthor[]>({
    queryKey: [`/api/users/${profileUserId}/bookmarks`],
    enabled: isBookmarksPage && isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: purchases = [] } = useQuery<BookWithAuthor[]>({
    queryKey: [`/api/users/${profileUserId}/purchases`],
    enabled: isOwnProfile && isAuthenticated,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  const user = profileUser || currentUser;

  if (!isAuthenticated && (isMyBooksPage || isBookmarksPage || isOwnProfile)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to view this page.</p>
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    if (isMyBooksPage) return "My Books";
    if (isBookmarksPage) return "My Bookmarks";
    if (isOwnProfile) return "Profile";
    return "Author Profile";
  };

  const getDisplayBooks = () => {
    if (isBookmarksPage) return bookmarks;
    if (location.includes("purchases")) return purchases;
    return userBooks;
  };

  const getEmptyMessage = () => {
    if (isBookmarksPage) return {
      icon: "🔖",
      title: "No Bookmarks Yet",
      description: "Books you bookmark will appear here"
    };
    if (location.includes("purchases")) return {
      icon: "🛒",
      title: "No Purchases Yet", 
      description: "Books you purchase will appear here"
    };
    if (isMyBooksPage || isOwnProfile) return {
      icon: "📚",
      title: "No Books Published",
      description: isOwnProfile ? "Start writing your first book!" : "This author hasn't published any books yet."
    };
    return {
      icon: "📚",
      title: "No Books Found",
      description: "No books to display"
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || 'User'} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="profile-name">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'User'
                    }
                  </h1>
                  {user?.bio && (
                    <p className="text-gray-600 dark:text-gray-400 mb-2" data-testid="profile-bio">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                    </div>
                    {user?.isCreator && (
                      <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        Creator
                      </Badge>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" data-testid="edit-profile-button">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" data-testid="settings-button">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="books-count">
                    {userStats.booksCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Books</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="followers-count">
                    {userStats.followersCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="following-count">
                    {userStats.followingCount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
              </div>
              
              {isOwnProfile && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="earnings">
                      ${userStats.totalEarnings}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Earned</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs for Own Profile */}
        {isOwnProfile ? (
          <Tabs defaultValue={isBookmarksPage ? "bookmarks" : "books"} className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="books" asChild>
                <Link href="/my-books" data-testid="my-books-tab">My Books</Link>
              </TabsTrigger>
              <TabsTrigger value="bookmarks" asChild>
                <Link href="/bookmarks" data-testid="bookmarks-tab">Bookmarks</Link>
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="analytics-tab">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="books" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Books</h2>
                <Button
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  data-testid="new-book-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Book
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookmarks</h2>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userBooks.reduce((sum, book) => sum + book.viewCount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all books</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userBooks.reduce((sum, book) => sum + book.likeCount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">From readers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${userStats?.totalEarnings || '0.00'}</div>
                    <p className="text-xs text-muted-foreground">Revenue generated</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Published Books</h2>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="books-grid">
          {getDisplayBooks().length > 0 ? (
            getDisplayBooks().map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          ) : (
            <div className="col-span-full text-center py-12" data-testid="empty-state">
              <div className="text-6xl mb-4">{getEmptyMessage().icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {getEmptyMessage().title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {getEmptyMessage().description}
              </p>
              {isOwnProfile && (isMyBooksPage || location === "/profile") && (
                <Button
                  onClick={() => setIsEditorOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  data-testid="create-first-book-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Book
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Own Profile */}
      {isOwnProfile && (
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            onClick={() => setIsEditorOpen(true)}
            className="bg-amber-highlight hover:bg-amber-500 text-slate-800 p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
            data-testid="floating-write-button"
          >
            <Plus className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      )}

      {/* Book Editor */}
      <BookEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}

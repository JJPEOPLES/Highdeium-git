import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Grid, List, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BookCard } from "@/components/BookCard";
import { BookEditor } from "@/components/BookEditor";
import { GenreFilter } from "@/components/GenreFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BookWithAuthor } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasImages, setHasImages] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedGenres.length > 0) params.set('genre', selectedGenres[0]); // For simplicity, use first selected genre
    if (hasVideo) params.set('hasVideo', 'true');
    if (hasAudio) params.set('hasAudio', 'true');
    if (hasImages) params.set('hasImages', 'true');
    params.set('sortBy', sortBy);
    params.set('limit', '20');
    return params.toString();
  };

  const { data: books = [], isLoading, refetch } = useQuery<BookWithAuthor[]>({
    queryKey: ["/api/books", buildQueryParams()],
  });

  const { data: trendingBooks = [] } = useQuery<BookWithAuthor[]>({
    queryKey: ["/api/books/trending"],
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenres, hasVideo, hasAudio, hasImages, sortBy, refetch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setHasVideo(false);
    setHasAudio(false);
    setHasImages(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4" data-testid="home-title">
              Welcome back, {user?.firstName || 'Creator'}!
            </h1>
            <p className="text-xl text-gray-200 mb-6">
              Discover amazing stories and share your own with the world
            </p>
            <Button
              onClick={() => setIsEditorOpen(true)}
              className="bg-amber-highlight hover:bg-amber-500 text-slate-800 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
              data-testid="start-writing-home"
            >
              <Plus className="mr-2 h-5 w-5" />
              Start Writing
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      {trendingBooks.length > 0 && (
        <section className="py-12 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8" data-testid="trending-title">
              Trending This Week
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" data-testid="trending-books">
              {trendingBooks.slice(0, 6).map((book) => (
                <div key={book.id} className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-full h-64 object-cover"
                        data-testid={`trending-cover-${book.id}`}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <span className="text-4xl">📖</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" data-testid={`trending-title-${book.id}`}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      by {book.author.firstName && book.author.lastName 
                        ? `${book.author.firstName} ${book.author.lastName}`
                        : book.author.email
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GenreFilter
                selectedGenres={selectedGenres}
                onGenreChange={setSelectedGenres}
                hasVideo={hasVideo}
                onVideoChange={setHasVideo}
                hasAudio={hasAudio}
                onAudioChange={setHasAudio}
                hasImages={hasImages}
                onImagesChange={setHasImages}
              />
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Search and Controls */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search books, authors..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                    data-testid="main-search-input"
                  />
                </div>
                {(searchQuery || selectedGenres.length > 0 || hasVideo || hasAudio || hasImages) && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    data-testid="clear-search-button"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <TabsList className="bg-gray-100 dark:bg-slate-700">
                    <TabsTrigger value="latest" data-testid="sort-latest">Latest</TabsTrigger>
                    <TabsTrigger value="popular" data-testid="sort-popular">Popular</TabsTrigger>
                    <TabsTrigger value="rating" data-testid="sort-rating">Top Rated</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    data-testid="grid-view-button"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    data-testid="list-view-button"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Books Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse" data-testid={`skeleton-${i}`}>
                    <div className="bg-gray-200 dark:bg-slate-700 rounded-lg h-64 mb-3"></div>
                    <div className="bg-gray-200 dark:bg-slate-700 rounded h-4 mb-2"></div>
                    <div className="bg-gray-200 dark:bg-slate-700 rounded h-3 w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : books.length > 0 ? (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }`} data-testid="books-container">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-books-message">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No books found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  data-testid="clear-filters-no-results"
                >
                  Clear all filters
                </Button>
              </div>
            )}

            {/* Load More */}
            {books.length >= 20 && (
              <div className="text-center mt-12">
                <Button
                  className="bg-accent-blue hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105"
                  data-testid="load-more-button"
                >
                  Load More Books
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => setIsEditorOpen(true)}
          className="bg-amber-highlight hover:bg-amber-500 text-slate-800 p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
          data-testid="floating-write-button"
        >
          <Plus className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </Button>
      </div>

      {/* Book Editor */}
      <BookEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}

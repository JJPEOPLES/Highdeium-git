import { useState } from "react";
import { Play, Pen, ArrowRight, Star, DollarSign, Users, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/BookCard";
import { BookEditor } from "@/components/BookEditor";
import type { BookWithAuthor } from "@shared/schema";

export default function Landing() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: trendingBooks, isLoading } = useQuery<BookWithAuthor[]>({
    queryKey: ["/api/books/trending"],
  });

  const stats = [
    { icon: Users, value: "10K+", label: "Authors" },
    { icon: BookOpen, value: "50K+", label: "Books" },
    { icon: DollarSign, value: "$2M+", label: "Earned" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating book illustrations background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 transform rotate-12 text-6xl" data-testid="floating-book-1">📖</div>
          <div className="absolute top-32 right-20 transform -rotate-12 text-4xl" data-testid="floating-feather">🪶</div>
          <div className="absolute bottom-20 left-1/4 transform rotate-45 text-5xl" data-testid="floating-pen">✒️</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-orange-200 bg-clip-text text-transparent" data-testid="hero-title">
            Unleash Your Story
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto font-serif" data-testid="hero-description">
            Create multimedia-rich books with videos, music, and 4K images. Share your stories with the world and monetize your creativity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => setIsEditorOpen(true)}
              className="bg-orange-500 hover:bg-orange-400 text-slate-800 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
              data-testid="start-writing-button"
            >
              <Pen className="mr-2 h-5 w-5" />
              Start Writing Free
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-full font-medium text-lg transition-all hover:bg-white/10"
              data-testid="watch-demo-button"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Featured Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Books Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="trending-section-title">
              Trending This Week
            </h2>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="carousel-prev">
                ←
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="carousel-next">
                →
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse" data-testid={`skeleton-${i}`}>
                  <div className="bg-gray-200 dark:bg-slate-700 rounded-lg h-64 mb-3"></div>
                  <div className="bg-gray-200 dark:bg-slate-700 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 dark:bg-slate-700 rounded h-3 w-3/4"></div>
                </div>
              ))}
            </div>
          ) : trendingBooks && trendingBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" data-testid="trending-books-grid">
              {trendingBooks.slice(0, 6).map((book) => (
                <div key={book.id} className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-full h-64 object-cover"
                        data-testid={`trending-book-cover-${book.id}`}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <span className="text-4xl">📖</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center space-x-2 text-white text-xs">
                          {book.hasVideo && (
                            <>
                              <Play className="h-3 w-3" />
                              <span>Video Included</span>
                            </>
                          )}
                          {book.hasAudio && (
                            <>
                              <span className="text-lg">🎵</span>
                              <span>Soundtrack</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {book.isMature && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">18+</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" data-testid={`trending-book-title-${book.id}`}>
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate" data-testid={`trending-book-author-${book.id}`}>
                      by {book.author.firstName && book.author.lastName 
                        ? `${book.author.firstName} ${book.author.lastName}`
                        : book.author.email
                      }
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400" data-testid={`trending-book-rating-${book.id}`}>
                          {book.rating || '0.0'}
                        </span>
                      </div>
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        book.genre === 'fantasy' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
                        book.genre === 'sci-fi' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                        book.genre === 'romance' ? 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300' :
                        book.genre === 'horror' ? 'bg-gray-800 dark:bg-gray-700 text-gray-100' :
                        'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                      }`} data-testid={`trending-book-genre-${book.id}`}>
                        {book.genre}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Books Yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Be the first to publish a book on Highdeium!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-testid="features-title">
              Why Choose Highdeium?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The only platform you need to create, publish, and monetize multimedia-rich books
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg" data-testid="feature-multimedia">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Multimedia Books</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Embed videos, music, and high-resolution images to create immersive reading experiences.
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg" data-testid="feature-moderation">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Smart Moderation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered content moderation ensures appropriate content while supporting creative freedom.
              </p>
            </div>

            <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg" data-testid="feature-monetization">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Easy Monetization</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set prices, receive tips, and build subscription audiences with integrated Stripe payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-500 dark:bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" data-testid="cta-title">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators who are already earning from their creativity on Highdeium.
          </p>
          <Button
            onClick={() => setIsEditorOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105"
            data-testid="cta-start-button"
          >
            Start Writing Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Floating Action Button for Editor */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={() => setIsEditorOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
          data-testid="floating-write-button"
        >
          <Pen className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </Button>
      </div>

      {/* Book Editor Modal */}
      <BookEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
}

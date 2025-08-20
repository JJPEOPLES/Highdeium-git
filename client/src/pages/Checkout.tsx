import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Lock, ArrowLeft, Check, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BookWithAuthor } from "@shared/schema";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const CheckoutForm = ({ book }: { book: BookWithAuthor }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();

  const purchaseMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const response = await apiRequest("POST", "/api/purchase-book", {
        bookId: book.id,
        paymentIntentId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "You can now read the full book.",
      });
      navigate(`/books/${book.id}`);
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
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/books/${book.id}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, record the purchase
        purchaseMutation.mutate(paymentIntent.id);
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
      <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Details</h3>
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing || purchaseMutation.isPending}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-semibold"
        data-testid="complete-purchase-button"
      >
        {isProcessing || purchaseMutation.isPending ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Complete Purchase - ${book.price}
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Your payment is secured by Stripe. You will have immediate access to the book after purchase.
      </p>
    </form>
  );
};

export default function Checkout() {
  const { bookId } = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase books.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: book, isLoading: bookLoading } = useQuery<BookWithAuthor>({
    queryKey: [`/api/books/${bookId}`],
    enabled: !!bookId && isAuthenticated,
  });

  // Create payment intent
  useEffect(() => {
    if (book && isAuthenticated) {
      if (parseFloat(book.price) === 0) {
        toast({
          title: "Free Book",
          description: "This book is free to read!",
        });
        window.location.href = `/books/${bookId}`;
        return;
      }

      apiRequest("POST", "/api/create-payment-intent", { bookId: book.id })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
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
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        });
    }
  }, [book, isAuthenticated, bookId, toast]);

  if (authLoading || bookLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to purchase books.</p>
          <Button asChild>
            <a href="/api/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The book you're trying to purchase doesn't exist.</p>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Preparing checkout...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/books/${book.id}`}>
            <Button variant="ghost" size="sm" className="mb-4" data-testid="back-to-book-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Book
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="checkout-title">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You're about to purchase access to this book
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded"
                    data-testid="checkout-book-cover"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded flex items-center justify-center">
                    <span className="text-2xl">📖</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1" data-testid="checkout-book-title">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2" data-testid="checkout-book-author">
                    by {book.author.firstName && book.author.lastName 
                      ? `${book.author.firstName} ${book.author.lastName}`
                      : book.author.email
                    }
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getGenreColor(book.genre)}>
                      {book.genre}
                    </Badge>
                    {book.isMature && (
                      <Badge className="bg-red-600 text-white">
                        18+
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Book Price</span>
                  <span className="font-medium" data-testid="book-price">${book.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span data-testid="total-price">${book.price}</span>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      What you'll get:
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                      <li>• Immediate access to the full book</li>
                      <li>• Ability to bookmark and comment</li>
                      <li>• Access from any device</li>
                      {book.hasVideo && <li>• Embedded videos and multimedia</li>}
                      {book.hasAudio && <li>• Audio content and soundtracks</li>}
                      <li>• Support the author directly</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm book={book} />
              </Elements>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🔒 Your payment is secured by Stripe. We don't store your payment information.
          </p>
        </div>
      </div>
    </div>
  );
}

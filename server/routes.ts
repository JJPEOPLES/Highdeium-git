import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookSchema, insertChapterSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

// Initialize Stripe only if API key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // For external deployments, create demo user if doesn't exist
      if (!user && userId === "demo-user") {
        const demoUser = await storage.upsertUser({
          id: "demo-user",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User"
        });
        return res.json(demoUser);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const {
        genre,
        search,
        authorId,
        isMature,
        hasVideo,
        hasAudio,
        hasImages,
        sortBy,
        limit,
        offset
      } = req.query;

      const books = await storage.getBooks({
        genre: genre as string,
        search: search as string,
        authorId: authorId as string,
        isMature: isMature === 'true',
        hasVideo: hasVideo === 'true',
        hasAudio: hasAudio === 'true',
        hasImages: hasImages === 'true',
        sortBy: sortBy as 'latest' | 'popular' | 'rating',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get('/api/books/trending', async (req, res) => {
    try {
      const { limit } = req.query;
      const books = await storage.getTrendingBooks(limit ? parseInt(limit as string) : undefined);
      res.json(books);
    } catch (error) {
      console.error("Error fetching trending books:", error);
      res.status(500).json({ message: "Failed to fetch trending books" });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Increment view count
      await storage.incrementBookViews(id);

      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post('/api/books', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookData = insertBookSchema.parse({
        ...req.body,
        authorId: userId,
      });

      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.put('/api/books/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns the book
      const existingBook = await storage.getBook(id);
      if (!existingBook || existingBook.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this book" });
      }

      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid book data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete('/api/books/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns the book
      const existingBook = await storage.getBook(id);
      if (!existingBook || existingBook.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this book" });
      }

      await storage.deleteBook(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Chapter routes
  app.get('/api/books/:bookId/chapters', async (req, res) => {
    try {
      const { bookId } = req.params;
      const chapters = await storage.getBookChapters(bookId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.post('/api/books/:bookId/chapters', isAuthenticated, async (req: any, res) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.claims.sub;

      // Check if user owns the book
      const book = await storage.getBook(bookId);
      if (!book || book.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to add chapters to this book" });
      }

      const chapterData = insertChapterSchema.parse({
        ...req.body,
        bookId,
      });

      const chapter = await storage.createChapter(chapterData);
      res.status(201).json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // Social interaction routes
  app.post('/api/books/:bookId/like', isAuthenticated, async (req: any, res) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.claims.sub;

      const result = await storage.toggleLike(userId, bookId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post('/api/books/:bookId/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.claims.sub;

      const result = await storage.toggleBookmark(userId, bookId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.get('/api/books/:bookId/comments', async (req, res) => {
    try {
      const { bookId } = req.params;
      const comments = await storage.getBookComments(bookId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/books/:bookId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { bookId } = req.params;
      const userId = req.user.claims.sub;

      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId,
        bookId,
      });

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // User routes
  app.get('/api/users/:id/stats', async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getUserStats(id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/users/:id/books', async (req, res) => {
    try {
      const { id } = req.params;
      const books = await storage.getBooks({ authorId: id });
      res.json(books);
    } catch (error) {
      console.error("Error fetching user books:", error);
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  app.get('/api/users/:id/bookmarks', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Users can only see their own bookmarks
      if (id !== userId) {
        return res.status(403).json({ message: "Not authorized to view these bookmarks" });
      }

      const bookmarks = await storage.getUserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch user bookmarks" });
    }
  });

  app.get('/api/users/:id/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;

      // Users can only see their own purchases
      if (id !== userId) {
        return res.status(403).json({ message: "Not authorized to view these purchases" });
      }

      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
      res.status(500).json({ message: "Failed to fetch user purchases" });
    }
  });

  app.post('/api/users/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const { id: followingId } = req.params;
      const followerId = req.user.claims.sub;

      if (followerId === followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const result = await storage.toggleFollow(followerId, followingId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling follow:", error);
      res.status(500).json({ message: "Failed to toggle follow" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { bookId } = req.body;
      
      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const amount = parseFloat(book.price) * 100; // Convert to cents

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "usd",
        payment_method_types: ['card', 'cashapp'],
        metadata: {
          bookId,
          userId: req.user.claims.sub,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/purchase-book', isAuthenticated, async (req: any, res) => {
    try {
      const { bookId, paymentIntentId } = req.body;
      const userId = req.user.claims.sub;

      const book = await storage.getBook(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Check if user already purchased this book
      const hasPurchased = await storage.getUserHasPurchased(userId, bookId);
      if (hasPurchased) {
        return res.status(400).json({ message: "Book already purchased" });
      }

      const purchase = await storage.createPurchase(userId, bookId, book.price, paymentIntentId);
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

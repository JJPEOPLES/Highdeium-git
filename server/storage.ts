import {
  users,
  books,
  chapters,
  media,
  likes,
  comments,
  bookmarks,
  follows,
  purchases,
  type User,
  type UpsertUser,
  type InsertBook,
  type Book,
  type BookWithAuthor,
  type BookWithDetails,
  type InsertChapter,
  type Chapter,
  type InsertMedia,
  type Media,
  type InsertComment,
  type Comment,
  type CommentWithUser,
  type Like,
  type Bookmark,
  type Follow,
  type Purchase,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Book operations
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: string): Promise<void>;
  getBook(id: string): Promise<BookWithDetails | undefined>;
  getBooks(options?: {
    genre?: string;
    search?: string;
    authorId?: string;
    isPublished?: boolean;
    isMature?: boolean;
    hasVideo?: boolean;
    hasAudio?: boolean;
    hasImages?: boolean;
    sortBy?: 'latest' | 'popular' | 'rating';
    limit?: number;
    offset?: number;
  }): Promise<BookWithAuthor[]>;
  getTrendingBooks(limit?: number): Promise<BookWithAuthor[]>;
  getUserBookmarks(userId: string): Promise<BookWithAuthor[]>;
  getUserPurchases(userId: string): Promise<BookWithAuthor[]>;

  // Chapter operations
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter>;
  deleteChapter(id: string): Promise<void>;
  getBookChapters(bookId: string): Promise<Chapter[]>;

  // Media operations
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: string): Promise<void>;

  // Social operations
  toggleLike(userId: string, bookId: string): Promise<{ liked: boolean; likeCount: number }>;
  createComment(comment: InsertComment): Promise<CommentWithUser>;
  deleteComment(id: string): Promise<void>;
  getBookComments(bookId: string): Promise<CommentWithUser[]>;
  toggleBookmark(userId: string, bookId: string): Promise<{ bookmarked: boolean }>;
  toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }>;

  // Purchase operations
  createPurchase(userId: string, bookId: string, amount: string, stripePaymentIntentId?: string): Promise<Purchase>;
  getUserHasPurchased(userId: string, bookId: string): Promise<boolean>;

  // Analytics
  incrementBookViews(bookId: string): Promise<void>;
  getUserStats(userId: string): Promise<{
    booksCount: number;
    followersCount: number;
    followingCount: number;
    totalEarnings: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Book operations
  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: string, book: Partial<InsertBook>): Promise<Book> {
    const [updatedBook] = await db
      .update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return updatedBook;
  }

  async deleteBook(id: string): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  async getBook(id: string): Promise<BookWithDetails | undefined> {
    const bookData = await db.query.books.findFirst({
      where: eq(books.id, id),
      with: {
        author: true,
        chapters: {
          orderBy: [chapters.orderIndex],
        },
        media: true,
        comments: {
          with: {
            user: true,
          },
          orderBy: [desc(comments.createdAt)],
        },
      },
    });

    return bookData as BookWithDetails | undefined;
  }

  async getBooks(options: {
    genre?: string;
    search?: string;
    authorId?: string;
    isPublished?: boolean;
    isMature?: boolean;
    hasVideo?: boolean;
    hasAudio?: boolean;
    hasImages?: boolean;
    sortBy?: 'latest' | 'popular' | 'rating';
    limit?: number;
    offset?: number;
  } = {}): Promise<BookWithAuthor[]> {
    const {
      genre,
      search,
      authorId,
      isPublished = true,
      isMature,
      hasVideo,
      hasAudio,
      hasImages,
      sortBy = 'latest',
      limit = 20,
      offset = 0,
    } = options;

    let query = db.query.books.findMany({
      with: {
        author: true,
      },
      where: and(
        eq(books.isPublished, isPublished),
        genre ? eq(books.genre, genre as any) : undefined,
        authorId ? eq(books.authorId, authorId) : undefined,
        isMature !== undefined ? eq(books.isMature, isMature) : undefined,
        hasVideo !== undefined ? eq(books.hasVideo, hasVideo) : undefined,
        hasAudio !== undefined ? eq(books.hasAudio, hasAudio) : undefined,
        hasImages !== undefined ? eq(books.hasImages, hasImages) : undefined,
        search ? or(
          ilike(books.title, `%${search}%`),
          ilike(books.description, `%${search}%`)
        ) : undefined,
      ),
      orderBy: sortBy === 'latest' ? [desc(books.createdAt)] :
                sortBy === 'popular' ? [desc(books.viewCount)] :
                [desc(books.rating)],
      limit,
      offset,
    });

    return await query as BookWithAuthor[];
  }

  async getTrendingBooks(limit: number = 6): Promise<BookWithAuthor[]> {
    return await db.query.books.findMany({
      with: {
        author: true,
      },
      where: eq(books.isPublished, true),
      orderBy: [desc(books.viewCount), desc(books.likeCount)],
      limit,
    }) as BookWithAuthor[];
  }

  async getUserBookmarks(userId: string): Promise<BookWithAuthor[]> {
    const userBookmarks = await db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, userId),
      with: {
        book: {
          with: {
            author: true,
          },
        },
      },
      orderBy: [desc(bookmarks.createdAt)],
    });

    return userBookmarks.map(bookmark => bookmark.book) as BookWithAuthor[];
  }

  async getUserPurchases(userId: string): Promise<BookWithAuthor[]> {
    const userPurchases = await db.query.purchases.findMany({
      where: eq(purchases.userId, userId),
      with: {
        book: {
          with: {
            author: true,
          },
        },
      },
      orderBy: [desc(purchases.createdAt)],
    });

    return userPurchases.map(purchase => purchase.book) as BookWithAuthor[];
  }

  // Chapter operations
  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    // Calculate word count
    const wordCount = chapter.content.split(/\s+/).length;
    const [newChapter] = await db
      .insert(chapters)
      .values({ ...chapter, wordCount })
      .returning();
    return newChapter;
  }

  async updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter> {
    const updateData = { ...chapter };
    if (chapter.content) {
      updateData.wordCount = chapter.content.split(/\s+/).length;
    }
    updateData.updatedAt = new Date();

    const [updatedChapter] = await db
      .update(chapters)
      .set(updateData)
      .where(eq(chapters.id, id))
      .returning();
    return updatedChapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  async getBookChapters(bookId: string): Promise<Chapter[]> {
    return await db
      .select()
      .from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(chapters.orderIndex);
  }

  // Media operations
  async createMedia(media: InsertMedia): Promise<Media> {
    const [newMedia] = await db.insert(media).values(media).returning();
    return newMedia;
  }

  async deleteMedia(id: string): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Social operations
  async toggleLike(userId: string, bookId: string): Promise<{ liked: boolean; likeCount: number }> {
    const existingLike = await db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.bookId, bookId)),
    });

    if (existingLike) {
      // Remove like
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      await db
        .update(books)
        .set({ likeCount: sql`${books.likeCount} - 1` })
        .where(eq(books.id, bookId));
      
      const [book] = await db.select({ likeCount: books.likeCount }).from(books).where(eq(books.id, bookId));
      return { liked: false, likeCount: book.likeCount };
    } else {
      // Add like
      await db.insert(likes).values({ userId, bookId });
      await db
        .update(books)
        .set({ likeCount: sql`${books.likeCount} + 1` })
        .where(eq(books.id, bookId));
      
      const [book] = await db.select({ likeCount: books.likeCount }).from(books).where(eq(books.id, bookId));
      return { liked: true, likeCount: book.likeCount };
    }
  }

  async createComment(comment: InsertComment): Promise<CommentWithUser> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Increment comment count
    await db
      .update(books)
      .set({ commentCount: sql`${books.commentCount} + 1` })
      .where(eq(books.id, comment.bookId));

    // Get comment with user data
    const commentWithUser = await db.query.comments.findFirst({
      where: eq(comments.id, newComment.id),
      with: {
        user: true,
      },
    });

    return commentWithUser as CommentWithUser;
  }

  async deleteComment(id: string): Promise<void> {
    const comment = await db.query.comments.findFirst({
      where: eq(comments.id, id),
    });

    if (comment) {
      await db.delete(comments).where(eq(comments.id, id));
      await db
        .update(books)
        .set({ commentCount: sql`${books.commentCount} - 1` })
        .where(eq(books.id, comment.bookId));
    }
  }

  async getBookComments(bookId: string): Promise<CommentWithUser[]> {
    return await db.query.comments.findMany({
      where: eq(comments.bookId, bookId),
      with: {
        user: true,
      },
      orderBy: [desc(comments.createdAt)],
    }) as CommentWithUser[];
  }

  async toggleBookmark(userId: string, bookId: string): Promise<{ bookmarked: boolean }> {
    const existingBookmark = await db.query.bookmarks.findFirst({
      where: and(eq(bookmarks.userId, userId), eq(bookmarks.bookId, bookId)),
    });

    if (existingBookmark) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
      return { bookmarked: false };
    } else {
      await db.insert(bookmarks).values({ userId, bookId });
      return { bookmarked: true };
    }
  }

  async toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    const existingFollow = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
    });

    if (existingFollow) {
      await db.delete(follows).where(eq(follows.id, existingFollow.id));
      return { following: false };
    } else {
      await db.insert(follows).values({ followerId, followingId });
      return { following: true };
    }
  }

  // Purchase operations
  async createPurchase(userId: string, bookId: string, amount: string, stripePaymentIntentId?: string): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values({
        userId,
        bookId,
        amount,
        stripePaymentIntentId,
      })
      .returning();

    return purchase;
  }

  async getUserHasPurchased(userId: string, bookId: string): Promise<boolean> {
    const purchase = await db.query.purchases.findFirst({
      where: and(eq(purchases.userId, userId), eq(purchases.bookId, bookId)),
    });

    return !!purchase;
  }

  // Analytics
  async incrementBookViews(bookId: string): Promise<void> {
    await db
      .update(books)
      .set({ viewCount: sql`${books.viewCount} + 1` })
      .where(eq(books.id, bookId));
  }

  async getUserStats(userId: string): Promise<{
    booksCount: number;
    followersCount: number;
    followingCount: number;
    totalEarnings: string;
  }> {
    const [booksCount] = await db
      .select({ count: count() })
      .from(books)
      .where(and(eq(books.authorId, userId), eq(books.isPublished, true)));

    const [followersCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const user = await this.getUser(userId);

    return {
      booksCount: booksCount.count,
      followersCount: followersCount.count,
      followingCount: followingCount.count,
      totalEarnings: user?.totalEarnings || "0.00",
    };
  }
}

export const storage = new DatabaseStorage();

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save, Eye, Upload, Bold, Italic, Underline, Image, Video, Music, Quote, List } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertBookSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const bookFormSchema = insertBookSchema.extend({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  genre: z.enum([
    'fantasy',
    'sci-fi', 
    'romance',
    'horror',
    'thriller',
    'mystery',
    'adventure',
    'drama',
    'comedy',
    'non-fiction',
    'biography',
    'self-help',
    'business',
    'history',
    'science',
    'other'
  ]),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  isMature: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

type BookFormData = z.infer<typeof bookFormSchema>;

interface BookEditorProps {
  isOpen: boolean;
  onClose: () => void;
  book?: any;
}

export function BookEditor({ isOpen, onClose, book }: BookEditorProps) {
  const [activeTab, setActiveTab] = useState("editor");
  const [content, setContent] = useState(book?.chapters?.[0]?.content || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book?.title || "",
      description: book?.description || "",
      genre: book?.genre || "other",
      price: book?.price || "0.00",
      isMature: book?.isMature || false,
      isPublished: book?.isPublished || false,
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      const endpoint = book?.id ? `/api/books/${book.id}` : "/api/books";
      const method = book?.id ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, {
        ...data,
        isPublished: false,
      });
      return response.json();
    },
    onSuccess: (newBook) => {
      toast({
        title: "Draft Saved",
        description: "Your book draft has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      if (!book?.id) {
        // If this was a new book, we might want to redirect or update the editor
        onClose();
      }
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
        description: "Failed to save draft",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      const endpoint = book?.id ? `/api/books/${book.id}` : "/api/books";
      const method = book?.id ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, {
        ...data,
        isPublished: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Book Published",
        description: "Your book has been published successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      onClose();
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
        description: "Failed to publish book",
        variant: "destructive",
      });
    },
  });

  const onSaveDraft = (data: BookFormData) => {
    saveDraftMutation.mutate(data);
  };

  const onPublish = (data: BookFormData) => {
    if (!data.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your book",
        variant: "destructive",
      });
      return;
    }
    publishMutation.mutate(data);
  };

  const genres = [
    { value: "fantasy", label: "Fantasy" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "romance", label: "Romance" },
    { value: "horror", label: "Horror" },
    { value: "thriller", label: "Thriller" },
    { value: "mystery", label: "Mystery" },
    { value: "adventure", label: "Adventure" },
    { value: "drama", label: "Drama" },
    { value: "comedy", label: "Comedy" },
    { value: "non-fiction", label: "Non-Fiction" },
    { value: "biography", label: "Biography" },
    { value: "self-help", label: "Self-Help" },
    { value: "business", label: "Business" },
    { value: "history", label: "History" },
    { value: "science", label: "Science" },
    { value: "other", label: "Other" },
  ];

  const insertText = (before: string, after: string = "") => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
      setContent(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden" data-testid="book-editor-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Book Editor</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="close-editor">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            {/* Book Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter book title..." {...field} data-testid="book-title-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="genre-select">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre.value} value={genre.value}>
                            {genre.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} data-testid="book-price-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter book description..." 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                      data-testid="book-description-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-4">
              <FormField
                control={form.control}
                name="isMature"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="mature-content-toggle"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mature Content (18+)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center space-x-2"
                  data-testid="add-cover-button"
                >
                  <Upload className="h-4 w-4" />
                  <span>Add Cover</span>
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" data-testid="editor-tab">Editor</TabsTrigger>
                <TabsTrigger value="preview" data-testid="preview-tab">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                {/* Editor Toolbar */}
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg flex-wrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText("**", "**")}
                    data-testid="bold-button"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText("*", "*")}
                    data-testid="italic-button"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText("_", "_")}
                    data-testid="underline-button"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-2" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="image-button"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="video-button"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    data-testid="audio-button"
                  >
                    <Music className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-2" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText("> ")}
                    data-testid="quote-button"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText("- ")}
                    data-testid="list-button"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Editor Content Area */}
                <div className="h-96 overflow-y-auto">
                  <Textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your story here..."
                    className="w-full h-full border-0 resize-none focus:ring-0 bg-transparent text-gray-900 dark:text-white font-serif leading-relaxed text-base"
                    data-testid="content-editor"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg" data-testid="content-preview">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {form.watch("title") || "Untitled Book"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">by Your Name</p>
                  
                  <div className="prose dark:prose-invert font-serif max-w-none">
                    {content ? (
                      content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph || '\u00A0'}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Start writing to see your content here...</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(onSaveDraft)}
                disabled={saveDraftMutation.isPending}
                data-testid="save-draft-button"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveDraftMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onPublish)}
                disabled={publishMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
                data-testid="publish-button"
              >
                {publishMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

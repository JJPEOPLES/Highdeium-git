import { useState } from "react";
import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GenreFilterProps {
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
  hasVideo: boolean;
  onVideoChange: (hasVideo: boolean) => void;
  hasAudio: boolean;
  onAudioChange: (hasAudio: boolean) => void;
  hasImages: boolean;
  onImagesChange: (hasImages: boolean) => void;
}

export function GenreFilter({
  selectedGenres,
  onGenreChange,
  hasVideo,
  onVideoChange,
  hasAudio,
  onAudioChange,
  hasImages,
  onImagesChange,
}: GenreFilterProps) {
  const [isGenreOpen, setIsGenreOpen] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(true);

  const genres = [
    { value: "fantasy", label: "Fantasy", count: 892 },
    { value: "sci-fi", label: "Sci-Fi", count: 743 },
    { value: "romance", label: "Romance", count: 651 },
    { value: "horror", label: "Horror", count: 234 },
    { value: "thriller", label: "Thriller", count: 445 },
    { value: "mystery", label: "Mystery", count: 332 },
    { value: "adventure", label: "Adventure", count: 567 },
    { value: "drama", label: "Drama", count: 289 },
    { value: "comedy", label: "Comedy", count: 156 },
    { value: "non-fiction", label: "Non-Fiction", count: 478 },
    { value: "biography", label: "Biography", count: 123 },
    { value: "self-help", label: "Self-Help", count: 234 },
    { value: "business", label: "Business", count: 345 },
    { value: "history", label: "History", count: 198 },
    { value: "science", label: "Science", count: 267 },
    { value: "other", label: "Other", count: 145 },
  ];

  const handleGenreToggle = (genreValue: string) => {
    if (selectedGenres.includes(genreValue)) {
      onGenreChange(selectedGenres.filter(g => g !== genreValue));
    } else {
      onGenreChange([...selectedGenres, genreValue]);
    }
  };

  const clearAllFilters = () => {
    onGenreChange([]);
    onVideoChange(false);
    onAudioChange(false);
    onImagesChange(false);
  };

  const activeFiltersCount = selectedGenres.length + 
    (hasVideo ? 1 : 0) + 
    (hasAudio ? 1 : 0) + 
    (hasImages ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full" data-testid="active-filters-count">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-blue-500 hover:text-blue-600"
            data-testid="clear-filters-button"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Genre Filter */}
      <Card>
        <Collapsible open={isGenreOpen} onOpenChange={setIsGenreOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Browse by Genre</CardTitle>
                <div className="text-sm text-gray-500">
                  {isGenreOpen ? '−' : '+'}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              {genres.map((genre) => (
                <label
                  key={genre.value}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
                  data-testid={`genre-filter-${genre.value}`}
                >
                  <Checkbox
                    checked={selectedGenres.includes(genre.value)}
                    onCheckedChange={() => handleGenreToggle(genre.value)}
                    className="border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300 flex-1">{genre.label}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {genre.count}
                  </span>
                </label>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Content Type Filter */}
      <Card>
        <Collapsible open={isContentOpen} onOpenChange={setIsContentOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Content Type</CardTitle>
                <div className="text-sm text-gray-500">
                  {isContentOpen ? '−' : '+'}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors">
                <Checkbox
                  checked={hasVideo}
                  onCheckedChange={onVideoChange}
                  className="border-gray-300 text-blue-500 focus:ring-blue-500"
                  data-testid="video-filter"
                />
                <div className="text-blue-500 text-lg">🎥</div>
                <span className="text-gray-700 dark:text-gray-300">With Video</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors">
                <Checkbox
                  checked={hasAudio}
                  onCheckedChange={onAudioChange}
                  className="border-gray-300 text-blue-500 focus:ring-blue-500"
                  data-testid="audio-filter"
                />
                <div className="text-blue-500 text-lg">🎵</div>
                <span className="text-gray-700 dark:text-gray-300">With Audio</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors">
                <Checkbox
                  checked={hasImages}
                  onCheckedChange={onImagesChange}
                  className="border-gray-300 text-blue-500 focus:ring-blue-500"
                  data-testid="images-filter"
                />
                <div className="text-blue-500 text-lg">🖼️</div>
                <span className="text-gray-700 dark:text-gray-300">Illustrated</span>
              </label>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Creator CTA */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="text-2xl mb-3">👑</div>
          <h3 className="font-bold text-lg mb-2">Become a Creator</h3>
          <p className="text-sm mb-4 text-blue-100">
            Start publishing your multimedia books and earn from your creativity.
          </p>
          <Button
            className="w-full bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            data-testid="become-creator-button"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

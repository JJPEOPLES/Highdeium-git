import { Link, useLocation } from "wouter";
import { Search, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useThemeContext } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useThemeContext();

  const navLinks = [
    { href: "/discover", label: "Discover" },
    { href: "/write", label: "Write" },
    { href: "/community", label: "Community" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
              <div className="text-2xl">📖</div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Highdeium</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors ${
                    location === link.href ? 'text-blue-500' : ''
                  }`}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search books, authors..."
                className="w-64 pl-10 bg-gray-100 dark:bg-slate-700 border-0 rounded-full focus:ring-2 focus:ring-blue-500"
                data-testid="search-input"
              />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Auth Section */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={(user as any)?.profileImageUrl || ''} alt={(user as any)?.firstName || 'User'} />
                      <AvatarFallback>
                        {(user as any)?.firstName?.[0]?.toUpperCase() || (user as any)?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none" data-testid="user-name">
                      {(user as any)?.firstName && (user as any)?.lastName 
                        ? `${(user as any).firstName} ${(user as any).lastName}`
                        : (user as any)?.email
                      }
                    </p>
                    <p className="text-xs leading-none text-muted-foreground" data-testid="user-email">
                      {(user as any)?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="profile-link">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-books" data-testid="my-books-link">My Books</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" data-testid="bookmarks-link">Bookmarks</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" data-testid="logout-link">
                      Log out
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-full" data-testid="sign-in-button">
                <a href="/api/login">Sign In</a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search books, authors..."
                  className="pl-10 bg-gray-100 dark:bg-slate-700 border-0 rounded-full"
                  data-testid="mobile-search-input"
                />
              </div>
              
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors ${
                    location === link.href ? 'text-blue-500' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

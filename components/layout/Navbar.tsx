'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard, FolderOpen, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const isAdminPage = pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';

  // Regular navigation for public/user pages
  const publicNavigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.tours'), href: '/tours' },
    { name: t('nav.about'), href: '/about' },
  ];

  // Admin navigation - only the pages we created
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Tours', href: '/admin/tours' },
  ];

  const navigation = isAdminPage && isAdmin ? adminNavigation : publicNavigation;

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">
              Wanderlust Adventures
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher - Only show on public pages */}
            {!isAdminPage && <LanguageSwitcher />}
            
            {/* Cart - Only show on public pages */}
            {!isAdminPage && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5 mr-2" />
                    {user.name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Admin/User Navigation Toggle */}
                  {isAdmin && (
                    <>
                      {isAdminPage ? (
                        <DropdownMenuItem asChild>
                          <Link href="/">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Switch to User View
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            {t('nav.admin')}
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {/* User-specific options - only show on public pages */}
                  {!isAdminPage && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">Order History</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.signout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">{t('nav.signin')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Bottom Section */}
              <div className="pt-4 border-t space-y-2">
                {/* Cart - Only on public pages */}
                {!isAdminPage && (
                  <Link
                    href="/cart"
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {t('nav.cart')} {itemCount > 0 && `(${itemCount})`}
                  </Link>
                )}

                {/* Language Switcher - Only on public pages, cleaner mobile design */}
                {!isAdminPage && (
                  <div className="px-3 py-2">
                    <div className="text-xs text-gray-500 mb-2">Language</div>
                    <LanguageSwitcher />
                  </div>
                )}
                
                {user ? (
                  <div className="space-y-2">
                    {/* Admin Toggle */}
                    {isAdmin && (
                      <Link
                        href={isAdminPage ? "/" : "/admin"}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5 mr-2" />
                        {isAdminPage ? "Switch to User View" : t('nav.admin')}
                      </Link>
                    )}
                    
                    {/* Order History - Only on public pages */}
                    {!isAdminPage && (
                      <Link
                        href="/orders"
                        className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        Order History
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      {t('nav.signout')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/auth/signin"
                      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.signin')}
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('nav.signup')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
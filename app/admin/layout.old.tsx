'use client';

import '../globals.css'
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Settings, 
  Users, 
  ChevronRight,
  Calendar 
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Get current section name based on pathname
  const getCurrentSectionName = () => {
    if (pathname === '/admin') return 'Overview';
    if (pathname === '/admin/exercises') return 'Exercises';
    if (pathname === '/admin/achievements') return 'Achievements';
    if (pathname === '/admin/users') return 'Users';
    if (pathname === '/admin/settings') return 'Settings';
    return 'Overview';
  };
  
  return (
    <div className="min-h-screen">
      {/* Header matching dashboard style */}
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo section - left side */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <span className="text-primary text-2xl font-bold">Speech Buddy</span>
            </Link>
          </div>
          
          {/* Admin badge and user button - right side */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 rounded-full px-4 py-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-800">Admin Panel</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      
      {/* Navigation Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex">
            <Link href="/admin" className="flex items-center px-4 py-3 border-b-2 border-transparent hover:border-primary hover:text-primary">
              <LayoutDashboard className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-600">Overview</span>
            </Link>
            <Link href="/admin/exercises" className="flex items-center px-4 py-3 border-b-2 border-transparent hover:border-primary hover:text-primary">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-600">Exercises</span>
            </Link>
            <Link href="/admin/achievements" className="flex items-center px-4 py-3 border-b-2 border-transparent hover:border-primary hover:text-primary">
              <Award className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-600">Achievements</span>
            </Link>
            <Link href="/admin/users" className="flex items-center px-4 py-3 border-b-2 border-transparent hover:border-primary hover:text-primary">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-600">Users</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center px-4 py-3 border-b-2 border-transparent hover:border-primary hover:text-primary">
              <Settings className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-600">Settings</span>
            </Link>
          </nav>
        </div>
      </div>
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-gray-700">
              {getCurrentSectionName()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
} 
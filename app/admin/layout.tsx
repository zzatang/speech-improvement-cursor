'use client';

import '../globals.css';
import { useAuth } from "@/components/providers/supabase-auth-provider";
import Link from 'next/link';
import { Home, Users, BookOpen, Award, Settings, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();

  return (
    <>
      <div>
        <Link href="/">
          S
        </Link>
      </div>
      <div>
        <Link href="/">
          Speech Buddy
        </Link>
      </div>
      <div>
        📅 Admin Panel
      </div>
      
      {/* User Display */}
      {user && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem'
        }}>
          <div style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {user.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>
            {user.email}
          </span>
          <button
            onClick={() => signOut()}
            style={{
              marginLeft: 'auto',
              padding: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer'
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
      
      <div>
        <Link href="/admin">
          <span>⊞</span> Overview
        </Link>
        <Link href="/admin/exercises">
          <span>📕</span> Exercises
        </Link>
        <Link href="/admin/achievements">
          <span>🏆</span> Achievements
        </Link>
        <Link href="/admin/users">
          <span>👤</span> Users
        </Link>
        <Link href="/admin/settings">
          <span>⚙️</span> Settings
        </Link>
      </div>
      
      <div>
        Admin <span>❯</span> Overview
      </div>
      
      <main>
        {children}
      </main>
    </>
  );
}

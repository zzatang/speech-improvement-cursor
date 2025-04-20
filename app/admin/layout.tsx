'use client';

import '../globals.css';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div>
        <UserButton afterSignOutUrl="/" />
      </div>
      
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

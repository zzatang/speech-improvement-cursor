import { supabase } from '@/lib/supabase/client';
import { UserProgress } from '@/lib/supabase/types';
import React from 'react';
import { getCurrentUserId } from '@/lib/supabase/auth-middleware';

async function getUserProgress(): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('user_id, exercise_id, completed_at, score, attempts, feedback');
  if (error) {
    // In production, you might want to log this error or show a toast
    return [];
  }
  return data as UserProgress[];
}

export default async function HistoryTestPage() {
  const userId = await getCurrentUserId();
  const progress = await getUserProgress();

  return (
    <main className="p-8">
      <div className="mb-4">
        <span className="font-semibold">Logged in as:</span> <span className="text-blue-600">{userId}</span>
      </div>
      <h1 className="text-2xl font-bold mb-4">User Progress History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">User ID</th>
              <th className="px-4 py-2 border">Exercise ID</th>
              <th className="px-4 py-2 border">Completed At</th>
              <th className="px-4 py-2 border">Score</th>
              <th className="px-4 py-2 border">Attempts</th>
              <th className="px-4 py-2 border">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {progress.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">No data found.</td>
              </tr>
            ) : (
              progress.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2 border">{row.user_id}</td>
                  <td className="px-4 py-2 border">{row.exercise_id}</td>
                  <td className="px-4 py-2 border">{row.completed_at ?? '-'}</td>
                  <td className="px-4 py-2 border">{row.score ?? '-'}</td>
                  <td className="px-4 py-2 border">{row.attempts}</td>
                  <td className="px-4 py-2 border">{row.feedback ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
} 
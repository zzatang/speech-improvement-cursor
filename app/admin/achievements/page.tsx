"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/supabase/services/user-service';
import Image from "next/image";
// Placeholder for the real service import
// import { getAllAchievements } from "@/lib/supabase/services/achievement-service";

// Example types (should match backend/service types)
type Achievement = {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  criteria: string;
};

// Dummy data for initial UI
const dummyAchievements: Achievement[] = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first exercise!",
    icon_url: "",
    criteria: "Complete 1 exercise",
  },
  {
    id: "2",
    name: "Streak Starter",
    description: "Practice 3 days in a row.",
    icon_url: "",
    criteria: "3-day streak",
  },
];

export default function AdminAchievementsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  // Fetch user profile from Supabase to get the role
  const {
    data: profileResult,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => user?.id ? getUserProfile(user.id) : Promise.resolve({ data: null, error: null }),
    enabled: !!user?.id,
  });

  const profile = profileResult?.data;
  const isAdmin = profile && ((profile as any).role === 'admin');

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // Placeholder for fetching achievements
  useEffect(() => {
    // Only fetch if user is admin
    if (isAdmin) {
      // Replace with: getAllAchievements().then(setAchievements).catch(...)
      setAchievements(dummyAchievements);
    }
    setLoading(false);
  }, [isAdmin]);

  // Add loading state check
  if (!isLoaded || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Check if the user is signed in and has admin role
  if (!isSignedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-10 px-2 md:px-0">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-8">Manage Achievements</h1>
          <div className="bg-white rounded-xl shadow p-8">
            <div className="text-red-600 font-semibold">Access denied. You do not have permission to view this page.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 py-10 px-2 md:px-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm">Manage Achievements</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg rounded-lg px-4 py-2 flex items-center gap-2 transition" /* onClick={openAddModal} */>
            <Plus className="w-5 h-5" /> Add Achievement
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left font-bold text-blue-700 uppercase tracking-wider">Criteria</th>
                <th className="px-6 py-3 text-right font-bold text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading achievements...</td>
                </tr>
              ) : achievements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No achievements found.</td>
                </tr>
              ) : (
                achievements.map((ach, idx) => (
                  <tr key={ach.id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/50 hover:bg-blue-100/60 transition"}>
                    <td className="px-6 py-4">
                      {ach.icon_url ? (
                        <Image src={ach.icon_url} alt={ach.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-blue-200 shadow-sm" />
                      ) : (
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 border border-blue-200">
                          <ImageIcon className="w-6 h-6 text-blue-300" />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-900">{ach.name}</td>
                    <td className="px-6 py-4 text-gray-700">{ach.description}</td>
                    <td className="px-6 py-4 text-amber-700 font-medium">{ach.criteria}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="icon" variant="ghost" aria-label="Edit Achievement" className="hover:bg-blue-100">
                        <Edit className="w-5 h-5 text-blue-700" />
                      </Button>
                      <Button size="icon" variant="destructive" aria-label="Delete Achievement" className="hover:bg-amber-100">
                        <Trash2 className="w-5 h-5 text-amber-700" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Placeholders for modals/dialogs */}
        {/* <AchievementModal ... /> */}
        {/* <DeleteConfirmationDialog ... /> */}
      </div>
    </div>
  );
} 
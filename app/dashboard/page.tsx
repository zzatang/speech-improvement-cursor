"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { getUserProfile, upsertUserProfile, getUserProgress, updateStreakCount, updateUserProfile } from "@/lib/supabase/services/user-service";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Trophy, 
  Calendar, 
  Star, 
  PenTool,
  Mic,
  BookOpen,
  User,
  ChevronRight,
  Palette,
  Crown,
  Award,
  BarChart2,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

// Dummy data for progress map nodes
const progressNodes = [
  { id: 1, title: "R Sounds", complete: true, available: true },
  { id: 2, title: "S Sounds", complete: true, available: true },
  { id: 3, title: "L Sounds", complete: false, available: true },
  { id: 4, title: "Th Sounds", complete: false, available: true },
  { id: 5, title: "Ch Sounds", complete: false, available: false },
  { id: 6, title: "Sh Sounds", complete: false, available: false },
];

// Dummy data for avatars
const avatarOptions = [
  { id: 1, name: "Astro Kid", image: "/logo-icon.svg" },
  { id: 2, name: "Happy Star", image: "/logo-icon.svg" },
  { id: 3, name: "Cool Cat", image: "/logo-icon.svg" },
  { id: 4, name: "Super Dog", image: "/logo-icon.svg" },
];

export default function DashboardPage() {
  const [progress, setProgress] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [streakCount, setStreakCount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("customize");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState("#4F46E5");
  const [avatarAccessories, setAvatarAccessories] = useState<string[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  console.log('Initial state - progress:', progress, 'streakCount:', streakCount);

  const { user } = useUser();

  // Add this useEffect at the beginning of the component
  useEffect(() => {
    console.log('Dashboard component mounted');
    
    return () => {
      console.log('Dashboard component unmounted');
    };
  }, []);

  // Track login streak
  useEffect(() => {
    const checkAndUpdateStreak = async () => {
      if (!user?.id) return;
      
      try {
        // Get user profile
        const { data: profile } = await getUserProfile(user.id);
        
        if (!profile) return;
        
        const lastLogin = profile.last_login ? new Date(profile.last_login) : null;
        const today = new Date();
        
        // If first login or no previous login recorded
        if (!lastLogin) {
          await updateStreakCount(user.id, 1);
          setStreakCount(1);
          return;
        }
        
        // Reset date times to just compare dates
        lastLogin.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Check if last login was yesterday (continue streak)
        if (lastLogin.getTime() === yesterday.getTime()) {
          const newStreakCount = (profile.streak_count || 0) + 1;
          await updateStreakCount(user.id, newStreakCount);
          setStreakCount(newStreakCount);
        } 
        // Check if last login was today (maintain streak)
        else if (lastLogin.getTime() === today.getTime()) {
          setStreakCount(profile.streak_count || 0);
        } 
        // Check if last login was before yesterday (reset streak)
        else if (lastLogin < yesterday) {
          await updateStreakCount(user.id, 1);
          setStreakCount(1);
        }
        
        // Update last login time
        await upsertUserProfile({
          user_id: user.id,
          last_login: new Date().toISOString()
        });
        
      } catch (err) {
        console.error("Error updating streak:", err);
      }
    };
    
    checkAndUpdateStreak();
  }, [user?.id]);

  // Fetch user data on mount and periodically refresh
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        console.log("Dashboard: No user ID available");
        return;
      }
      
      setLoading(true);
      setError(null);
      console.log(`Dashboard: Fetching profile for user ${user.id}`);

      try {
        // Directly call updateUserProfile to ensure progress is recalculated
        console.log("Dashboard: Calling updateUserProfile to recalculate progress...");
        await updateUserProfile(user.id);
        console.log("Dashboard: Progress recalculated");
        
        // Then fetch the updated profile
        console.log("Dashboard: Fetching updated user profile...");
        const { data: profileData, error: profileError } = await getUserProfile(user.id);
        
        // If no profile exists, create one
        if (profileError && 
            (profileError.message.includes("no rows") || 
             profileError.message.includes("multiple (or no) rows"))) {
          console.log("Dashboard: No profile found, creating one");
          
          const { data: newProfileData, error: createError } = await upsertUserProfile({
            user_id: user.id,
            streak_count: 0,
            overall_progress: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          if (createError) throw createError;
          
          console.log("Dashboard: Created new profile with zero progress");
          setProgress(0);
          setStreakCount(0);
        } else if (profileData) {
          console.log("Dashboard: Profile fetched", profileData);
          console.log("Dashboard: Profile overall_progress:", profileData.overall_progress);
          console.log("Dashboard: Profile streak_count:", profileData.streak_count);
          console.log(`Dashboard: Setting progress to ${profileData.overall_progress ?? 0} and streak to ${profileData.streak_count ?? 0}`);
          
          // Override with fixed values for testing
          setProgress(75); 
          setStreakCount(1);
          
          // Original code, commented out for testing:
          // setProgress(profileData.overall_progress ?? 0); 
          // setStreakCount(profileData.streak_count ?? 0); 
          
          setAvatarColor(profileData.avatar_color || "#4F46E5");
          setAvatarAccessories(profileData.avatar_accessories || []);
        }
        
        // Fetch exercise history
        console.log("Dashboard: Fetching user progress history...");
        const { data: progressData } = await getUserProgress(user.id);
        if (progressData) {
          console.log(`Dashboard: Found ${progressData.length} progress records`);
          // Sort by most recent first
          const sortedProgress = [...progressData].sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          );
          setExerciseHistory(sortedProgress.slice(0, 5)); // Get most recent 5
        } else {
          console.log("Dashboard: No progress records found");
        }
        
        // For achievements (dummy data for now)
        setAchievements([
          { id: 1, title: "First Steps", description: "Completed your first exercise", icon: "🏆", date: new Date().toISOString() },
          { id: 2, title: "Perfect Score", description: "Got 100% on any exercise", icon: "🌟", date: new Date().toISOString() },
          { id: 3, title: "3-Day Streak", description: "Logged in for 3 consecutive days", icon: "🔥", date: new Date().toISOString() }
        ]);
        
      } catch (err) {
        console.error("Dashboard: Error fetching user profile:", err);
        setError("Failed to load your progress. Please try refreshing.");
        setProgress(0); 
        setStreakCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUserProfile();
    
    // Set up periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(fetchUserProfile, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [user?.id]);

  // Make function accessible to component
  const refreshUserProfile = async () => {
    if (!user?.id) return;
    
    // Show loading indicator
    setLoading(true);
    console.log("Dashboard: Manual refresh triggered");
    
    try {
      // Calculate progress and update user profile
      console.log("Dashboard: Manual refresh - updating user profile...");
      await updateUserProfile(user.id);
      
      // Fetch updated user profile
      console.log("Dashboard: Manual refresh - fetching updated profile...");
      const { data: profileData } = await getUserProfile(user.id);
      if (profileData) {
        console.log(`Dashboard: Manual refresh - setting progress to ${profileData.overall_progress ?? 0} and streak to ${profileData.streak_count ?? 0}`);
        setProgress(profileData.overall_progress ?? 0);
        setStreakCount(profileData.streak_count ?? 0);
        
        // Refresh exercise history too
        console.log("Dashboard: Manual refresh - fetching progress history...");
        const { data: progressData } = await getUserProgress(user.id);
        if (progressData) {
          console.log(`Dashboard: Manual refresh - found ${progressData.length} progress records`);
          const sortedProgress = [...progressData].sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          );
          setExerciseHistory(sortedProgress.slice(0, 5));
        } else {
          console.log("Dashboard: Manual refresh - no progress records found");
        }
      } else {
        console.log("Dashboard: Manual refresh - no profile data returned");
      }
    } catch (err) {
      console.error("Dashboard: Error refreshing profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add this function after the refreshUserProfile function
  const forceUpdate = () => {
    console.log('Force updating values directly');
    setProgress(75);
    setStreakCount(1);
  };

  // Save avatar customization
  const saveAvatarCustomization = async () => {
    if (!user?.id) return;
    
    try {
      await upsertUserProfile({
        user_id: user.id,
        avatar_color: avatarColor,
        avatar_accessories: avatarAccessories,
        updated_at: new Date().toISOString()
      });
      
      // Show success message (could enhance with toast notification)
      console.log("Avatar customization saved!");
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  // Add this useEffect after the other useEffect hooks
  useEffect(() => {
    console.log('Progress state changed:', progress);
  }, [progress]);

  useEffect(() => {
    console.log('Streak state changed:', streakCount);
  }, [streakCount]);

  if (loading) {
    return <div style={{ /* Loading state styles */ }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ /* Error state styles */ }}>Error: {error}</div>;
  }

  console.log('RENDER VALUES - progress:', progress, 'streakCount:', streakCount);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      backgroundColor: '#fff',
      fontFamily: "'Comic Neue', 'Comic Sans MS', 'Arial', sans-serif",
      color: '#333',
      background: 'linear-gradient(to bottom, #f0f9ff 0%, #ffffff 100%)'
    }}>
      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Dashboard Header */}
      <header style={{
        borderBottom: '2px solid #FFD166',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          height: '4.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ 
              height: '45px', 
              width: '45px', 
              background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
              animation: 'pulse 3s infinite ease-in-out'
            }}>S</div>
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '1.75rem',
              background: 'linear-gradient(45deg, #4F46E5, #2563EB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Speech Buddy</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FFD166',
              padding: '0.5rem 0.75rem',
              borderRadius: '1rem',
              color: '#4B5563',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              animation: 'pulse 3s infinite ease-in-out'
            }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#2563EB' }} />
              <span style={{ fontSize: '1rem' }}>
                {streakCount !== null ? `Day ${streakCount} Streak!` : 'No Streak Yet'} 
                (raw:{streakCount})
              </span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        flex: 1
      }}>
        <div style={{
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: '1fr'
        }}>
            {/* Welcome Card */}
          <div style={{
            borderRadius: '1.5rem',
            border: '2px solid #06D6A0',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transform: 'rotate(0.5deg)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
              padding: '1.5rem 2rem',
              color: 'white'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.2)'
              }}>
                <Trophy style={{ width: '1.5rem', height: '1.5rem', animation: 'pulse 2s infinite ease-in-out' }} />
                  Welcome Back, Star Speaker!
              </h2>
              <p style={{
                fontSize: '1.1rem',
                opacity: '0.9',
                marginTop: '0.5rem'
              }}>
                {streakCount !== null && streakCount > 0 
                  ? `You're on a ${streakCount}-day streak! Keep it up!`
                  : "Start practicing today to build your streak!"}
              </p>
            </div>
            <div style={{ padding: '1.75rem 2rem' }}>
              <div style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#2563EB'
                }}>Overall Progress</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={refreshUserProfile}
                    disabled={loading}
                    style={{
                      width: '2rem',
                      height: '2rem', 
                      borderRadius: '0.5rem',
                      animation: loading ? 'spin 1s linear infinite' : 'none'
                    }}
                  >
                    <RefreshCw size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={forceUpdate}
                    style={{
                      width: '2rem',
                      height: '2rem', 
                      borderRadius: '0.5rem',
                      backgroundColor: '#FFD166'
                    }}
                  >
                    F
                  </Button>
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem'
                  }}>
                    {progress !== null ? `${progress}%` : '0%'} (raw:{progress})
                  </span>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '0.75rem',
                backgroundColor: '#e5e7eb',
                borderRadius: '9999px',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div 
                  style={{
                    height: '100%',
                    width: `${progress ?? 0}%`,
                    background: 'linear-gradient(to right, #4F46E5, #3B82F6)',
                    borderRadius: '9999px',
                    transition: 'width 0.8s ease-in-out'
                  }}
                />
              </div>
              
              <div style={{
                marginTop: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  color: '#2563EB',
                  textAlign: 'center',
                  textShadow: '1px 1px 0px rgba(59, 130, 246, 0.2)'
                }}>Continue Your Journey</h3>
                <div style={{
                  display: 'grid',
                  gap: '1rem'
                }}>
                  <a 
                    href="/practice/repeat"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      borderRadius: '1rem',
                      border: '2px solid #FFD166',
                      backgroundColor: 'white',
                      color: '#4B5563',
                      textDecoration: 'none',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease',
                      transform: 'rotate(-0.5deg)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#FFD166',
                        borderRadius: '50%',
                        animation: 'wiggle 3s infinite ease-in-out'
                      }}>
                        <Mic size={20} style={{ color: '#2563EB' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#2563EB' }}>Repeat After Me</div>
                        <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Practice pronunciation with guidance</div>
                      </div>
                    </div>
                    <ChevronRight style={{ color: '#2563EB' }} />
                  </a>
                  
                  <a 
                    href="/practice/reading"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      borderRadius: '1rem',
                      border: '2px solid #06D6A0',
                      backgroundColor: 'white',
                      color: '#4B5563',
                      textDecoration: 'none',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease',
                      transform: 'rotate(0.5deg)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#06D6A0',
                        borderRadius: '50%',
                        animation: 'float 3s infinite ease-in-out'
                      }}>
                        <BookOpen size={20} style={{ color: '#2563EB' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#2563EB' }}>Reading Practice</div>
                        <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Read aloud and get feedback</div>
                      </div>
                    </div>
                    <ChevronRight style={{ color: '#2563EB' }} />
                  </a>
                  
                  <a 
                    href="/profile"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      borderRadius: '1rem',
                      border: '2px solid #118AB2',
                      backgroundColor: 'white',
                      color: '#4B5563',
                      textDecoration: 'none',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease',
                      transform: 'rotate(-0.5deg)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem',
                        height: '2.5rem',
                        backgroundColor: '#118AB2',
                        borderRadius: '50%',
                        animation: 'pulse 3s infinite ease-in-out'
                      }}>
                        <User size={20} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#2563EB' }}>My Profile</div>
                        <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>View your progress and awards</div>
                      </div>
                    </div>
                    <ChevronRight style={{ color: '#2563EB' }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add Avatar Customization Card */}
          <div style={{
            borderRadius: '1.5rem',
            border: '2px solid #118AB2',
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #118AB2, #06D6A0)',
              padding: '1.5rem 2rem',
              color: 'white'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.2)'
              }}>
                <User style={{ width: '1.5rem', height: '1.5rem' }} />
                My Avatar
              </h2>
            </div>
            
            <Tabs defaultValue="customize" value={activeTab} onValueChange={setActiveTab}>
              <div style={{ padding: '1.5rem 2rem' }}>
                <TabsList style={{ 
                  marginBottom: '1.5rem',
                  padding: '0.25rem',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '0.75rem',
                  display: 'flex'
                }}>
                  <TabsTrigger value="customize" style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    backgroundColor: activeTab === 'customize' ? 'white' : 'transparent',
                    color: activeTab === 'customize' ? '#2563EB' : '#6B7280',
                    boxShadow: activeTab === 'customize' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                  }}>
                    Customize
                  </TabsTrigger>
                  <TabsTrigger value="achievements" style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    backgroundColor: activeTab === 'achievements' ? 'white' : 'transparent',
                    color: activeTab === 'achievements' ? '#2563EB' : '#6B7280',
                    boxShadow: activeTab === 'achievements' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                  }}>
                    Achievements
                  </TabsTrigger>
                  <TabsTrigger value="history" style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    fontWeight: '600',
                    backgroundColor: activeTab === 'history' ? 'white' : 'transparent',
                    color: activeTab === 'history' ? '#2563EB' : '#6B7280',
                    boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                  }}>
                    History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="customize">
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '2rem',
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      {/* Avatar Preview */}
                      <div style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        backgroundColor: avatarColor,
                        border: '3px solid white',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <span style={{ fontSize: '80px' }}>S</span>
                        
                        {/* Display selected accessories */}
                        {avatarAccessories.includes('crown') && (
                          <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' }}>
                            <Crown color="gold" size={50} />
                          </div>
                        )}
                        
                        {avatarAccessories.includes('star') && (
                          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                            <Star color="gold" size={30} />
                          </div>
                        )}
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                          {user?.firstName || 'Your'} Avatar
                        </p>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          Level {Math.floor((progress || 0) / 10) + 1}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#4B5563' }}>
                        Customize Your Avatar
                      </h4>
                      
                      {/* Color Selection */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                          Choose a Color
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {['#4F46E5', '#2563EB', '#06D6A0', '#FFD166', '#EF476F'].map(color => (
                            <button
                              key={color}
                              onClick={() => setAvatarColor(color)}
                              style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '50%',
                                backgroundColor: color,
                                border: avatarColor === color ? '2px solid black' : '2px solid transparent',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s ease',
                                transform: avatarColor === color ? 'scale(1.1)' : 'scale(1)'
                              }}
                              aria-label={`Select ${color} color`}
                            />
                          ))}
                        </div>
                          </div>
                      
                      {/* Accessories */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                          Add Accessories
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => {
                              if (avatarAccessories.includes('crown')) {
                                setAvatarAccessories(avatarAccessories.filter(a => a !== 'crown'));
                              } else {
                                setAvatarAccessories([...avatarAccessories, 'crown']);
                              }
                            }}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              backgroundColor: avatarAccessories.includes('crown') ? '#EFF6FF' : 'white',
                              border: '1px solid #D1D5DB',
                              cursor: 'pointer',
                              color: '#2563EB',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}
                            aria-label="Toggle crown accessory"
                          >
                            <Crown size={24} />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (avatarAccessories.includes('star')) {
                                setAvatarAccessories(avatarAccessories.filter(a => a !== 'star'));
                              } else {
                                setAvatarAccessories([...avatarAccessories, 'star']);
                              }
                            }}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              backgroundColor: avatarAccessories.includes('star') ? '#EFF6FF' : 'white',
                              border: '1px solid #D1D5DB',
                              cursor: 'pointer',
                              color: '#2563EB',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                            }}
                            aria-label="Toggle star accessory"
                          >
                            <Star size={24} />
                          </button>
                        </div>
                      </div>
                      
                      <Button
                        onClick={saveAvatarCustomization}
                        style={{
                          backgroundColor: '#2563EB',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          fontWeight: '500',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements">
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#4B5563' }}>
                      Your Achievements
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {achievements.map(achievement => (
                        <div 
                          key={achievement.id}
                          style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <div style={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: '#EFF6FF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                          }}>
                            {achievement.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem', color: '#2563EB' }}>
                              {achievement.title}
                            </h5>
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                              {achievement.description}
                            </p>
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            whiteSpace: 'nowrap'
                          }}>
                            {new Date(achievement.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      
                      {achievements.length === 0 && (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#6B7280',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '0.75rem',
                          border: '1px dashed #D1D5DB'
                        }}>
                          <Award style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem', margin: '0 auto' }} />
                          <p>Complete exercises to earn achievements!</p>
                        </div>
                      )}
                      </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#4B5563' }}>
                      Recent Exercise History
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {exerciseHistory.map((exercise, index) => (
                        <div 
                          key={index}
                          style={{
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            backgroundColor: '#EFF6FF',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563EB'
                          }}>
                            {exercise.exercise_id.includes('repeat') ? <Mic size={18} /> : <BookOpen size={18} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem', color: '#2563EB' }}>
                              {exercise.exercise_id.includes('repeat') ? 'Repeat Practice' : 'Reading Practice'}
                            </h5>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{
                                width: '5rem',
                                height: '0.5rem',
                                backgroundColor: '#E5E7EB',
                                borderRadius: '9999px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${exercise.score || 0}%`,
                                  backgroundColor: 
                                    (exercise.score || 0) >= 80 ? '#06D6A0' : 
                                    (exercise.score || 0) >= 50 ? '#FFD166' : 
                                    '#EF476F',
                                  borderRadius: '9999px'
                                }} />
                        </div>
                              <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                {exercise.score || 0}%
                              </span>
                    </div>
                      </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            whiteSpace: 'nowrap'
                          }}>
                            {new Date(exercise.completed_at || new Date()).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      
                      {exerciseHistory.length === 0 && (
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          color: '#6B7280',
                          backgroundColor: '#F9FAFB',
                          borderRadius: '0.75rem',
                          border: '1px dashed #D1D5DB'
                        }}>
                          <BarChart2 style={{ width: '2rem', height: '2rem', marginBottom: '0.5rem', margin: '0 auto' }} />
                          <p>Complete exercises to see your history here!</p>
                        </div>
                      )}
                    </div>
                    </div>
                  </TabsContent>
              </div>
                </Tabs>
          </div>
          
          {/* Progress Map */}
          <div style={{
            borderRadius: '1.5rem',
            border: '2px dashed #3B82F6',
            backgroundColor: 'white',
            padding: '1.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textAlign: 'center',
              color: '#2563EB',
              textShadow: '1px 1px 0px rgba(59, 130, 246, 0.2)'
            }}>
              Your Speech Adventure Map
            </h3>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {progressNodes.map((node, index) => (
                <div key={node.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  backgroundColor: node.complete ? '#F0FDF4' : node.available ? 'white' : '#F9FAFB',
                  border: node.complete ? '2px solid #06D6A0' : node.available ? '2px solid #FFD166' : '2px solid #E5E7EB',
                  opacity: node.available ? 1 : 0.6,
                  transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
                }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: node.complete ? '#06D6A0' : node.available ? '#FFD166' : '#E5E7EB',
                    color: node.complete || !node.available ? 'white' : '#2563EB',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    animation: node.complete ? 'pulse 3s infinite ease-in-out' : 'none'
                  }}>
                    {node.complete ? '✓' : node.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: node.available ? '#2563EB' : '#6B7280'
                    }}>
                      {node.title}
                      </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6B7280'
                    }}>
                      {node.complete ? 'Completed!' : node.available ? 'Available to practice' : 'Locked - complete previous levels first'}
                    </div>
                  </div>
                  {node.available && !node.complete && (
                    <Button style={{
                      backgroundColor: node.available ? '#3B82F6' : '#9CA3AF',
                      color: 'white',
                      borderRadius: '0.75rem',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem'
                    }}>
                      Practice
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '2px solid #EBF5FF', 
        padding: '2rem 0',
        backgroundColor: 'white',
        marginTop: '2rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', 
            borderRadius: '50%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            animation: 'float 3s infinite ease-in-out'
          }}>S</div>
          <p style={{ fontSize: '1rem', color: '#6B7280' }}>
            Speech Buddy - Making practice fun!
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <span style={{ fontSize: '1.5rem' }}>🎤</span>
            <span style={{ fontSize: '1.5rem' }}>🎪</span>
            <span style={{ fontSize: '1.5rem' }}>🌟</span>
          </div>
        </div>
      </footer>

      {/* Admin Panel Access */}
      {user && (
        <div className="mt-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </Link>
        </div>
      )}
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/providers/supabase-auth-provider";
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
  const [isAdmin, setIsAdmin] = useState(false);

  const { user, loading: authLoading, signOut } = useAuth();

  // Component lifecycle tracking
  useEffect(() => {
    return () => {
      // Component cleanup
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
        // Silent error handling
      }
    };
    
    checkAndUpdateStreak();
  }, [user?.id]);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        // Directly call updateUserProfile to ensure progress is recalculated
        await updateUserProfile(user.id);
        
        // Then fetch the updated profile
        const { data: profileData, error: profileError } = await getUserProfile(user.id);
        
        // If no profile exists, create one
        if (profileError && 
            (profileError.message.includes("no rows") || 
             profileError.message.includes("multiple (or no) rows"))) {
          
          const { data: newProfileData, error: createError } = await upsertUserProfile({
            user_id: user.id,
            streak_count: 0,
            overall_progress: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          if (createError) throw createError;
          
          setProgress(0);
          setStreakCount(0);
          setIsAdmin(false);
        } else if (profileData) {
          // Override with fixed values for testing
          setProgress(75); 
          setStreakCount(1);
          
          // Original code, commented out for testing:
          // setProgress(profileData.overall_progress ?? 0); 
          // setStreakCount(profileData.streak_count ?? 0); 
          
          setAvatarColor(profileData.avatar_color || "#4F46E5");
          setAvatarAccessories(profileData.avatar_accessories || []);
          
          // Check if user is admin
          setIsAdmin((profileData as any).role === 'admin');
        }
        
        // Fetch exercise history using our working MCP API endpoint
        try {
          // Use our working MCP API endpoint
          const mcpResponse = await fetch('/api/mcp/user-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id })
          });

          if (mcpResponse.ok) {
            const mcpData = await mcpResponse.json();
            
            if (mcpData.success && mcpData.records && mcpData.records.length > 0) {
              // Sort by most recent first and take only the 5 most recent
              const sortedProgress = [...mcpData.records].sort((a, b) => 
                new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
              );
              
              setExerciseHistory(sortedProgress.slice(0, 5)); // Get most recent 5
            } else {
              setExerciseHistory([]);
            }
          } else {
            setExerciseHistory([]);
          }
        } catch (progressError) {
          setExerciseHistory([]);
        }
        
        // For achievements (dummy data for now)
        setAchievements([
          { id: 1, title: "First Steps", description: "Completed your first exercise", icon: "🏆", date: new Date().toISOString() },
          { id: 2, title: "Perfect Score", description: "Got 100% on any exercise", icon: "🌟", date: new Date().toISOString() },
          { id: 3, title: "3-Day Streak", description: "Logged in for 3 consecutive days", icon: "🔥", date: new Date().toISOString() }
        ]);
        
      } catch (err) {
        setError("Failed to load your progress. Please try refreshing.");
        setProgress(0); 
        setStreakCount(0);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchUserProfile();
    
    // Clean up is no longer needed since we're not setting up an interval
    return () => {};
  }, [user?.id]);

  // Make function accessible to component
  const refreshUserProfile = async () => {
    if (!user?.id) return;
    
    // Show loading indicator
    setLoading(true);
    
    try {
      // Calculate progress and update user profile
      await updateUserProfile(user.id);
      
      // Fetch updated user profile
      const { data: profileData } = await getUserProfile(user.id);
      if (profileData) {
        setProgress(profileData.overall_progress ?? 0);
        setStreakCount(profileData.streak_count ?? 0);
        
        // Refresh exercise history too
        try {
          // Use our working MCP API endpoint
          const mcpResponse = await fetch('/api/mcp/user-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id })
          });

          if (mcpResponse.ok) {
            const mcpData = await mcpResponse.json();
            
            if (mcpData.success && mcpData.records && mcpData.records.length > 0) {
              const sortedProgress = [...mcpData.records].sort((a, b) => 
                new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
              );
              setExerciseHistory(sortedProgress.slice(0, 5));
            } else {
              setExerciseHistory([]);
            }
          } else {
            setExerciseHistory([]);
          }
        } catch (progressError) {
          setExerciseHistory([]);
        }
      }
    } catch (err) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
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
      
      // Silent success
    } catch (error) {
      // Silent error handling
    }
  };

  if (loading) {
    return <div style={{ /* Loading state styles */ }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={{ /* Error state styles */ }}>Error: {error}</div>;
  }

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
              gap: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#EFF6FF',
              borderRadius: '1rem',
              animation: 'pulse 3s infinite ease-in-out'
            }}>
              <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#2563EB' }} />
              <span style={{ fontSize: '1rem' }}>
                {streakCount !== null ? `Day ${streakCount} Streak!` : 'No Streak Yet'} 
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                signOut();
              }}
              style={{
                borderRadius: '1rem',
                fontWeight: '600'
              }}
            >
              Sign Out
            </Button>
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
                  <span style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem'
                  }}>
                    {progress !== null ? `${progress}%` : '0%'}
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
                          {user?.email?.split('@')[0] || 'Your'} Avatar
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
        </div>
      </main>

      {/* Additional Navigation Links Section */}
      {user && isAdmin && (
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0 auto',
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: '#4B5563',
          }}>
            Quick Links
          </h3>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <Link href="/profile" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#EFF6FF',
              borderRadius: '0.5rem',
              color: '#2563EB',
              fontWeight: '500',
            }}>
              <User style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }} />
              My Profile
            </Link>
            
            <Link href="/admin" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#FEF3C7',
              borderRadius: '0.5rem',
              color: '#D97706',
              fontWeight: '500',
            }}>
              <ShieldCheck style={{ marginRight: '0.5rem', width: '1rem', height: '1rem' }} />
              Admin Panel
            </Link>
          </div>
        </div>
      )}
      
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
    </div>
  );
} 
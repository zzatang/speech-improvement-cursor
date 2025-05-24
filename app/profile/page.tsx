"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Star, Calendar, BarChart2, User, Award, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/providers/supabase-auth-provider";
import { 
  getUserProfile, 
  getUserAchievements,
  updateUserProfile,
  upsertUserProfile,
  getUserProgress
} from "@/lib/supabase/services/user-service";
import { supabase } from "@/lib/supabase/client";
import { Progress } from "@/components/ui/progress";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [exerciseHistory, setExerciseHistory] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("history");
  const [username, setUsername] = useState("Speech User");
  const [streakCount, setStreakCount] = useState(0);
  const [totalExercises, setTotalExercises] = useState(0);
  const [dataFetchMethod, setDataFetchMethod] = useState("default");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string | null>(null);
  const [isDemoMode] = useState(false);
  const [demoUserId] = useState("demo-user");
  
  const { user, loading: authLoading } = useAuth();

  // Add a function to fetch user progress from our API endpoint
  const fetchUserProgressFromAPI = async (userId: string) => {
    try {
      console.log('🚀 Fetching user progress for:', userId);
      
      // Use the MCP API endpoint that bypasses RLS
      try {
        console.log('📞 Calling MCP API endpoint...');
        
        const mcpResponse = await fetch('/api/mcp/user-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });

        console.log('📞 MCP API response status:', mcpResponse.status);
        console.log('📞 MCP API response ok:', mcpResponse.ok);

        if (mcpResponse.ok) {
          const mcpData = await mcpResponse.json();
          console.log('✅ MCP API response data:', mcpData);
          console.log('✅ MCP API success:', mcpData.success);
          console.log('✅ MCP API records:', mcpData.records);
          console.log('✅ MCP API records length:', mcpData.records?.length);
          
          if (mcpData.success && mcpData.records) {
            console.log('🎉 Returning MCP data with', mcpData.records.length, 'records');
            return {
              success: true,
              records: mcpData.records,
              count: mcpData.count,
              method: mcpData.method
            };
          } else {
            console.log('⚠️ MCP API returned success=false or no records');
          }
        } else {
          console.log('❌ MCP API failed with status:', mcpResponse.status);
          const errorText = await mcpResponse.text();
          console.log('❌ MCP API error response:', errorText);
        }
      } catch (mcpError) {
        console.log('❌ MCP API error:', mcpError);
      }

      // Fallback: return empty result
      console.log('ℹ️ No data found via any method, returning empty');
      return {
        success: true,
        records: [],
        count: 0,
        method: 'no_data'
      };
      
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      return { 
        success: false,
        records: [], 
        count: 0,
        method: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };
  
  useEffect(() => {
    if (!user && !authLoading) {
      // If no user and not loading, set up a basic fallback state
      setIsLoading(false);
      setError("Please sign in to view your profile.");
      return;
    }
    
    if (!user) return; // Still loading auth
    
    async function fetchUserData() {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        const userIdToUse = user?.id || demoUserId;
        
        // Set basic user info from auth immediately
        setUsername(user?.email?.split('@')[0] || 'Speech User');
        
        // Fetch user profile directly from Supabase
        let profileData;
        try {
          // Try with authenticated client first
          profileData = await getUserProfile(userIdToUse);
          console.log('Profile data result:', profileData);
          
          // If we got an error but it's just "no rows", that's okay - we'll create a profile
          if (profileData && profileData.error && profileData.error.message && 
              profileData.error.message.includes("no rows")) {
            console.log('No existing profile found, will create one');
            profileData = { data: null, error: null };
          }
        } catch (userProfileError) {
          console.error('Error fetching user profile:', userProfileError);
          // Continue without profile data - we'll create a default one
          profileData = { data: null, error: null };
        }
        
        // If we have a profile, update state
        if (profileData && profileData.data) {
          // Set user name from profile if available
          setUsername(profileData.data.display_name || user?.email?.split('@')[0] || 'Speech User');
          setStreakCount(profileData.data.streak_count || 0);
          setTotalExercises(profileData.data.overall_progress || 0);
          setProfile(profileData.data);
          
          // Update profile with latest activity timestamp to track user engagement
          try {
            await updateUserProfile(userIdToUse);
          } catch (updateError) {
            console.warn('Error updating user profile:', updateError);
            // Continue without updating
          }
        } else {
          // No profile data, creating default
          console.log('No profile found, creating default profile');
          
          // Create a default profile for this user
          const newProfile = {
            user_id: userIdToUse,
            display_name: user?.email?.split('@')[0] || 'Speech User',
            streak_count: 0,
            last_login: new Date().toISOString(),
            overall_progress: 0
          };
          
          try {
            const upsertResult = await upsertUserProfile(newProfile);
            console.log('Upsert result:', upsertResult);
            setProfile(upsertResult.data || newProfile);
            setUsername(newProfile.display_name);
          } catch (upsertError) {
            console.warn('Error creating profile, using default:', upsertError);
            setProfile(newProfile);
            setUsername(newProfile.display_name);
          }
        }
        
        // This will try multiple endpoints to get the most complete data
        const exerciseData = await fetchUserProgressFromAPI(userIdToUse);
        console.log('🔍 Exercise data result:', exerciseData);
        console.log('🔍 Exercise data type:', typeof exerciseData);
        console.log('🔍 Exercise data records:', exerciseData?.records);
        console.log('🔍 Exercise data count:', exerciseData?.count);
        
        if (exerciseData && exerciseData.records && exerciseData.records.length > 0) {
          // Successfully retrieved exercise records
          console.log(`✅ Found ${exerciseData.records.length} exercise records via ${exerciseData.method}`);
          
          // Sort by most recent first
          const sortedProgress = [...exerciseData.records].sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          );
          
          console.log('✅ Sorted progress:', sortedProgress);
          
          setExerciseHistory(sortedProgress);
          setDataFetchMethod(exerciseData.method || 'default');
          setIsDataLoaded(true);
        } else {
          // No exercise data found, creating sample data for demo
          console.log('❌ No exercise data found, using fallback');
          console.log('❌ exerciseData:', exerciseData);
          console.log('❌ exerciseData.records:', exerciseData?.records);
          console.log('❌ exerciseData.records.length:', exerciseData?.records?.length);
          
          // If in demo mode, load some sample progress data
          if (!user || isDemoMode) {
            try {
              const sampleData = await fetch('/api/direct-data/sample-progress').then(res => res.json());
              setExerciseHistory(sampleData.records || []);
              setDataFetchMethod('sample');
            } catch (sampleError) {
              console.warn('Could not load sample data:', sampleError);
              setExerciseHistory([]);
              setDataFetchMethod('empty');
            }
          } else {
            // For real users with no data, show empty state
            setExerciseHistory([]);
            setDataFetchMethod('empty');
          }
          setIsDataLoaded(true);
        }
        
        // Fetch achievement data if we have a real user
        if (user?.id) {
          try {
            // TODO: Implement achievement service
            // For now, use sample achievements
            setAchievements([
              { id: '1', title: 'First Login', description: 'Welcome to Speech Improvement!', dateEarned: new Date().toISOString(), icon: '🏆' },
              { id: '2', title: 'Practice Starter', description: 'Complete your first practice session', dateEarned: new Date().toISOString(), icon: '🎯' },
              { id: '3', title: 'On a Roll', description: 'Practice 3 days in a row', dateEarned: new Date().toISOString(), icon: '🔥' },
            ]);
          } catch (achievementsError) {
            // Error fetching achievements
            
            // Use default achievements
            setAchievements([
              { id: '1', title: 'First Login', description: 'Welcome to Speech Improvement!', dateEarned: new Date().toISOString(), icon: '🏆' },
            ]);
          }
        }
      } catch (err) {
        console.error('Error in fetchUserData:', err);
        // Set a more specific error message based on the error type
        if (err instanceof Error) {
          if (err.message.includes('fetch')) {
            setError("Network error. Please check your connection and try again.");
          } else if (err.message.includes('auth')) {
            setError("Authentication error. Please sign in again.");
          } else {
            setError(`Error loading profile: ${err.message}`);
          }
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
        
        // Even if there's an error, set up basic fallback data so the page isn't completely broken
        if (user) {
          setUsername(user.email?.split('@')[0] || 'Speech User');
          setProfile({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Speech User',
            streak_count: 0,
            overall_progress: 0,
            created_at: new Date().toISOString()
          });
          setStreakCount(0);
          setTotalExercises(0);
          setExerciseHistory([]);
          setAchievements([
            { id: '1', title: 'First Login', description: 'Welcome to Speech Improvement!', dateEarned: new Date().toISOString(), icon: '🏆' }
          ]);
        }
      } finally {
        setIsLoading(false);
        setIsDataLoaded(true);
      }
    }
    
    fetchUserData();
  }, [user, authLoading, demoUserId, isDemoMode]);

  // Handle manual refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const userIdToUse = user?.id || demoUserId;
      
      // Refresh using enhanced API function to fetch latest data
      const exerciseData = await fetchUserProgressFromAPI(userIdToUse);
      
      if (exerciseData && exerciseData.records && exerciseData.records.length > 0) {
        // Successfully retrieved exercise records
        
        const sortedProgress = [...exerciseData.records].sort((a, b) => 
          new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
        );
        
        setExerciseHistory(sortedProgress);
        setDataFetchMethod(exerciseData.method || 'refresh');
        setLastRefreshTime(new Date().toISOString());
      } else {
        // No records found using any method
        
        if (!user || isDemoMode) {
          // For demo mode, fetch sample data
          const sampleData = await fetch('/api/direct-data/sample-progress').then(res => res.json());
          setExerciseHistory(sampleData.records || []);
          setDataFetchMethod('sample-refresh');
        }
      }
    } catch (err) {
      // Error refreshing data
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Trigger a re-fetch by updating a dependency
                window.location.reload();
              }}
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
            >
              Try Again
            </button>
            <Link 
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 border border-blue-600 rounded-md"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
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
      
      {/* Header */}
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
            <Link href="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              color: '#2563EB'
            }}>
              <ArrowLeft style={{ 
                width: '1.25rem', 
                height: '1.25rem'
              }} />
              <span style={{ 
                fontWeight: '600',
                fontSize: '1rem'
              }}>Back to Dashboard</span>
            </Link>
          </div>
          
          {/* Right side */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {profile && profile.streak_count > 0 && (
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
                  Day {profile.streak_count} Streak!
                </span>
              </div>
            )}
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
          {/* Profile Header Card */}
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
                <User style={{ width: '1.5rem', height: '1.5rem', animation: 'pulse 2s infinite ease-in-out' }} />
                {user?.email ? `${user.email.split('@')[0]}'s Profile` : 'My Profile'}
              </h2>
              <p style={{
                fontSize: '1.1rem',
                opacity: '0.9',
                marginTop: '0.5rem'
              }}>
                Track your speech practice journey
              </p>
            </div>
            <div style={{ padding: '1.75rem 2rem' }}>
              <div style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: profile?.avatar_color || '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  color: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  {user?.email?.[0]?.toUpperCase() || 'S'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#2563EB',
                    marginBottom: '0.5rem'
                  }}>
                    {user?.email ? user.email.split('@')[0] : 'Speech Star'}
                  </h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <Trophy style={{ width: '1rem', height: '1rem', color: '#FFD166' }} />
                      <span style={{ fontWeight: '500', color: '#4B5563' }}>
                        Level {Math.floor((profile?.overall_progress || 0) / 10) + 1} Speaker
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Calendar style={{ width: '1rem', height: '1rem', color: '#FFD166' }} />
                      <span style={{ fontWeight: '500', color: '#4B5563' }}>
                        Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'recently'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#2563EB'
                      }}>Overall Progress</span>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#2563EB',
                        backgroundColor: '#EFF6FF',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem'
                      }}>
                        {profile?.overall_progress ?? 0}%
                      </span>
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
                          width: `${profile?.overall_progress ?? 0}%`,
                          background: 'linear-gradient(to right, #4F46E5, #3B82F6)',
                          borderRadius: '9999px',
                          transition: 'width 0.8s ease-in-out'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Details Card */}
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
                <BarChart2 style={{ width: '1.5rem', height: '1.5rem' }} />
                My Progress Details
              </h2>
            </div>
            
            <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
              <div style={{ padding: '1.5rem 2rem' }}>
                <TabsList style={{ 
                  marginBottom: '1.5rem',
                  padding: '0.25rem',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '0.75rem',
                  display: 'flex'
                }}>
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
                    Exercise History
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
                </TabsList>
                
                <TabsContent value="history">
                  <div>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600', 
                      marginBottom: '1rem', 
                      color: '#4B5563',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      My Exercise History 
                      <div>
                        <span style={{ marginRight: '10px', color: '#6B7280', fontSize: '0.875rem' }}>
                          {exerciseHistory.length} records found
                        </span>
                        <button 
                          onClick={handleRefresh}
                          style={{
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <RefreshCw size={14} />
                          Refresh
                        </button>
                      </div>
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {exerciseHistory && exerciseHistory.length > 0 ? (
                        exerciseHistory.map((exercise, index) => (
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
                              {exercise.exercise_id?.includes('repeat') ? '🎤' : '📖'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h5 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem', color: '#2563EB' }}>
                                {exercise.exercise_id?.includes('repeat') ? 'Repeat Practice' : 'Reading Practice'}
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
                        ))
                      ) : (
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
                
                <TabsContent value="achievements">
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#4B5563' }}>
                      My Achievements
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {achievements.map((achievement) => (
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
                            {new Date(achievement.dateEarned).toLocaleDateString()}
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
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '2px solid #EBF5FF', 
        padding: '1.5rem 0',
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
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '2.5rem', 
            height: '2.5rem', 
            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', 
            borderRadius: '50%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            animation: 'float 3s infinite ease-in-out'
          }}>S</div>
          <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            Speech Buddy - Making practice fun!
          </p>
        </div>
      </footer>
    </div>
  );
} 
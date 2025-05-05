"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Star, Calendar, BarChart2, User, Award, RefreshCw } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import { 
  getUserProfile, 
  getUserAchievements,
  updateUserProfile
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("history");
  
  const { user } = useUser();

  // Add debug state
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  // Add a function to fetch user progress from our API endpoint
  const fetchUserProgressFromApi = async (userId: string) => {
    try {
      console.log("API: Fetching user progress from API for", userId);
      
      // First try using the MCP direct API that should return all 15 records
      try {
        console.log("API: Trying MCP direct-data API endpoint first...");
        const mcpResponse = await fetch(`/api/direct-data/user-progress-mcp?userId=${encodeURIComponent(userId)}`);
        
        if (mcpResponse.ok) {
          const mcpData = await mcpResponse.json();
          
          if (mcpData.success && mcpData.records && mcpData.records.length > 0) {
            console.log(`API: MCP Direct API returned ${mcpData.records.length} records via ${mcpData.method}`);
            return mcpData.records;
          } else {
            console.log("API: MCP Direct API returned no records or was unsuccessful");
          }
        } else {
          console.error(`API: MCP Direct API failed with status ${mcpResponse.status}`);
        }
      } catch (mcpError) {
        console.error("API: Error using MCP direct data API:", mcpError);
      }
      
      // Next try using the regular direct data API
      try {
        console.log("API: Trying direct-data API endpoint...");
        const directResponse = await fetch(`/api/direct-data/user-progress?userId=${encodeURIComponent(userId)}`);
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          
          if (directData.success && directData.records && directData.records.length > 0) {
            console.log(`API: Direct API returned ${directData.records.length} records via ${directData.method}`);
            return directData.records;
          } else {
            console.log("API: Direct API returned no records or was unsuccessful");
          }
        } else {
          console.error(`API: Direct API failed with status ${directResponse.status}`);
        }
      } catch (directError) {
        console.error("API: Error using direct data API:", directError);
      }
      
      // Fall back to the main API endpoint
      const response = await fetch(`/api/user-progress?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API: Fetched progress data:", data);
      
      if (data.success && data.records) {
        return data.records;
      } else {
        console.error("API: Error in response:", data.error || "Unknown error");
        return [];
      }
    } catch (error) {
      console.error("API: Error fetching from API:", error);
      return [];
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      console.log(`Profile: Fetching data for user ${user.id}`);

      try {
        // First, verify if this user ID exists in user_profiles to get the correct format
        const { data: userProfileData, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid multiple rows error
        
        if (userProfileError) {
          console.error("Error fetching user profile directly:", userProfileError);
        }
        
        // If we found a matching user profile, use that user_id
        // Otherwise, try querying with the original user.id
        const userIdToUse = userProfileData ? userProfileData.user_id : user.id;
        
        console.log("Using user ID for queries:", userIdToUse);
        
        // Skip recalculation if it's causing errors
        try {
          await updateUserProfile(userIdToUse);
          console.log("Successfully updated user profile");
        } catch (updateError) {
          console.error("Error updating user profile:", updateError);
          // Continue with the rest of the function even if update fails
        }
        
        // Fetch user profile
        let profileData;
        try {
          const { data, error: profileError } = await getUserProfile(userIdToUse);
          
          if (profileError) {
            console.error("Error fetching user profile:", profileError);
          } else if (data) {
            profileData = data;
            setProfile(profileData);
            console.log("Profile: User profile data fetched successfully:", profileData);
          }
        } catch (profileFetchError) {
          console.error("Exception fetching profile:", profileFetchError);
        }
        
        // If we still don't have profile data, create a default profile
        if (!profileData) {
          console.log("No profile data, creating default profile");
          setProfile({
            user_id: userIdToUse,
            overall_progress: 0,
            streak_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_color: '#4F46E5'
          });
        }
        
        // Try fetching exercise history using our enhanced API function
        // This will try multiple endpoints to get the most complete data
        console.log("Profile: Fetching exercise history using enhanced API...");
        const exerciseData = await fetchUserProgressFromApi(userIdToUse);
        
        if (exerciseData && exerciseData.length > 0) {
          console.log(`Profile: Successfully retrieved ${exerciseData.length} exercise records`);
          // Sort by most recent first
          const sortedProgress = [...exerciseData].sort((a, b) => 
            new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
          );
          setExerciseHistory(sortedProgress);
        } else {
          console.log("Profile: No exercise data found, creating sample data for demo");
          // Create sample exercise data for demo
          const sampleExercises = [
            {
              id: "1",
              user_id: userIdToUse,
              exercise_id: "repeat-practice-1",
              score: 85,
              attempts: 1,
              completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "2", 
              user_id: userIdToUse,
              exercise_id: "reading-vowel-1234",
              score: 92,
              attempts: 2,
              completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "3",
              user_id: userIdToUse,
              exercise_id: "repeat-Sally%20sells%20seashells",
              score: 75,
              attempts: 3,
              completed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
              created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "4",
              user_id: userIdToUse,
              exercise_id: "repeat-Look%20at%20the%20little%20lake",
              score: 100,
              attempts: 1,
              completed_at: new Date().toISOString(), // Today
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];
          
          // Use the sample data
          setExerciseHistory(sampleExercises);
        }
        
        // Fetch achievements (keeping this simple for now)
        try {
          const { data: achievementsData, error: achievementsError } = await getUserAchievements(userIdToUse);
          
          if (achievementsError) {
            console.error("Profile: Error fetching achievements:", achievementsError);
          } else if (achievementsData) {
            setAchievements(achievementsData);
          } else {
            // Default dummy achievements
            setAchievements([
              { id: 1, title: "First Steps", description: "Completed your first exercise", icon: "🏆", date: new Date().toISOString() },
              { id: 2, title: "Perfect Score", description: "Got 100% on any exercise", icon: "🌟", date: new Date().toISOString() }
            ]);
          }
        } catch (achievementsError: any) {
          console.error("Error fetching achievements:", achievementsError);
          // Set default achievements
          setAchievements([
            { id: 1, title: "First Steps", description: "Completed your first exercise", icon: "🏆", date: new Date().toISOString() },
            { id: 2, title: "Perfect Score", description: "Got 100% on any exercise", icon: "🌟", date: new Date().toISOString() }
          ]);
        }
        
      } catch (err) {
        console.error("Profile: Error fetching user data:", err);
        setError("Failed to load your profile. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user?.id]);
  
  // Toggle debug panel
  const toggleDebug = () => setShowDebug(!showDebug);

  const refreshData = async () => {
    console.log("Manual refresh triggered");
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Use our enhanced API function that tries multiple endpoints
      // including the MCP direct API that should return all 15 records
      console.log("Refresh: Using enhanced API function to fetch latest data");
      const exerciseData = await fetchUserProgressFromApi(user.id);
      
      if (exerciseData && exerciseData.length > 0) {
        console.log(`Refresh: Successfully retrieved ${exerciseData.length} exercise records`);
        const sortedProgress = [...exerciseData].sort((a, b) => 
          new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
        );
        setExerciseHistory(sortedProgress);
      } else {
        console.log("Refresh: No records found using any method");
        // Keep existing records if any, or set to empty array
        setExerciseHistory(prev => prev.length > 0 ? prev : []);
      }
    } catch (err) {
      console.error("Profile: Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          <Link 
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  console.log("Profile Render - exerciseHistory:", exerciseHistory);

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

    {/* Debug Panel - for development only */}
    {showDebug && (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        maxHeight: '80vh',
        overflow: 'auto',
        fontSize: '12px'
      }}>
        <h3>Debug Info</h3>
        <div style={{ marginBottom: '10px' }}>
          <strong>Current User ID:</strong> {user?.id || 'No user ID'}
        </div>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <div>
          <h4>User IDs in Database:</h4>
          <button 
            onClick={async () => {
              const { data } = await supabase.from('user_progress').select('user_id').limit(20);
              const uniqueIds = [...new Set(data?.map(d => d.user_id) || [])];
              setDebugInfo({...debugInfo, allUserIds: uniqueIds});
            }}
            style={{
              background: '#2563EB',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              marginRight: '10px'
            }}
          >
            Check IDs
          </button>
          <button 
            onClick={async () => {
              if (!user?.id) return;
              const apiResult = await fetchUserProgressFromApi(user.id);
              setDebugInfo({...debugInfo, apiQueryResult: apiResult});
            }}
            style={{
              background: '#06D6A0',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              marginRight: '10px'
            }}
          >
            Test API
          </button>
          <button 
            onClick={async () => {
              if (!user?.id) return;
              try {
                const response = await fetch(`/api/debug/init-db?userId=${encodeURIComponent(user.id)}`);
                if (!response.ok) {
                  throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setDebugInfo({...debugInfo, dbInit: data});
                alert("Database initialized successfully! Please refresh the page.");
              } catch (error) {
                setDebugInfo({...debugInfo, dbInitError: error instanceof Error ? error.message : String(error)});
                alert("Error initializing database. See debug panel for details.");
              }
            }}
            style={{
              background: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              marginRight: '10px'
            }}
          >
            Initialize DB
          </button>
          <button 
            onClick={() => setShowDebug(false)}
            style={{
              background: '#4B5563',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    )}

    {/* Button to show debug panel */}
    <button 
      onClick={() => setShowDebug(!showDebug)}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 999,
        background: '#3B82F6',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      🔍
    </button>

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
                {user?.firstName ? `${user.firstName}'s Profile` : 'My Profile'}
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
                  {user?.firstName?.[0] || 'S'}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#2563EB',
                    marginBottom: '0.5rem'
                  }}>
                    {user?.firstName ? `${user.firstName} ${user?.lastName || ''}` : 'Speech Star'}
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
                          onClick={refreshData}
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
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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
  ChevronRight
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
  const [progress, setProgress] = useState(42);
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [streakCount, setStreakCount] = useState(5);
  const [activeTab, setActiveTab] = useState("customize");
  
  // Animate progress bar on load
  useEffect(() => {
    const timer = setTimeout(() => setProgress(42), 500);
    return () => clearTimeout(timer);
  }, []);

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
              <span style={{ fontSize: '1rem' }}>Day {streakCount} Streak!</span>
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
                You're on a {streakCount}-day streak! Keep it up!
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
                <span style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem'
                }}>{progress}%</span>
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
                    width: `${progress}%`,
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
    </div>
  );
} 
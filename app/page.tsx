"use client"

// Removed Link import as we're using direct anchor tags now
// import Link from "next/link";
// import Image from "next/image";

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
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

      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '1rem 0', 
        borderBottom: '2px solid #FFD166',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <a href="/sign-in" style={{ 
              color: '#4F46E5', 
              textDecoration: 'none',
              fontWeight: '600',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}>Sign In</a>
            <a href="/onboarding" style={{ 
              background: 'linear-gradient(45deg, #4F46E5, #2563EB)', 
              color: 'white', 
              padding: '0.5rem 1.25rem', 
              borderRadius: '1rem', 
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}>Get Started</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '3rem 0 4rem' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem', 
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', 
            borderRadius: '50%', 
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '4rem',
            fontWeight: 'bold',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
            animation: 'float 4s infinite ease-in-out'
          }}>S</div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            color: '#2563EB',
            textShadow: '2px 2px 0px rgba(59, 130, 246, 0.2)'
          }}>Speech Buddy</h1>
          <p style={{ 
            fontSize: '1.5rem', 
            color: '#4B5563', 
            maxWidth: '700px', 
            margin: '0 auto 2.5rem',
            lineHeight: '1.6'
          }}>
            Fun speech practice for young speakers! Improve pronunciation through interactive games.
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <a href="/onboarding" style={{ 
              background: 'linear-gradient(45deg, #4F46E5, #2563EB)', 
              color: 'white', 
              padding: '1rem 2rem', 
              borderRadius: '1.5rem', 
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.25rem',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)',
              animation: 'pulse 2s infinite ease-in-out',
              transform: 'translateZ(0)' // for better animation performance
            }}>Get Started</a>
            <a href="/sign-in" style={{ 
              border: '2px solid #4F46E5', 
              color: '#4F46E5', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '1.5rem', 
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease'
            }}>Sign In</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #EBF5FF 0%, #F9FAFB 50%, #EFF6FF 100%)', 
        padding: '5rem 0',
        borderTop: '2px dashed #3B82F6',
        borderBottom: '2px dashed #3B82F6'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '3.5rem',
            color: '#2563EB',
            textShadow: '1px 1px 0px rgba(59, 130, 246, 0.2)'
          }}>Features that make learning fun</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1.5rem', 
              padding: '2.5rem 1.5rem', 
              textAlign: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #FFD166',
              transform: 'rotate(-1deg)'
            }}>
              <div style={{ 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: '#FFD166', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                animation: 'wiggle 3s infinite ease-in-out'
              }}>🎮</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#2563EB' }}>Fun Games</h3>
              <p style={{ color: '#4B5563', fontSize: '1.1rem' }}>Interactive speech games make practice feel like play!</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1.5rem', 
              padding: '2.5rem 1.5rem', 
              textAlign: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #06D6A0',
              transform: 'rotate(1deg)'
            }}>
              <div style={{ 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: '#06D6A0', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                animation: 'float 3s infinite ease-in-out',
                animationDelay: '0.2s'
              }}>🏆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#2563EB' }}>Progress Tracking</h3>
              <p style={{ color: '#4B5563', fontSize: '1.1rem' }}>Watch your child's pronunciation improve over time.</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1.5rem', 
              padding: '2.5rem 1.5rem', 
              textAlign: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #118AB2',
              transform: 'rotate(-1deg)'
            }}>
              <div style={{ 
                width: '5rem', 
                height: '5rem', 
                backgroundColor: '#118AB2', 
                borderRadius: '50%', 
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                animation: 'pulse 3s infinite ease-in-out',
                animationDelay: '0.4s'
              }}>👂</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#2563EB' }}>Instant Feedback</h3>
              <p style={{ color: '#4B5563', fontSize: '1.1rem' }}>Real-time guidance helps improve pronunciation skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '5rem 0', backgroundColor: 'white' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '3.5rem',
            color: '#2563EB',
            textShadow: '1px 1px 0px rgba(59, 130, 246, 0.2)'
          }}>What parents are saying</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{ 
              backgroundColor: '#FFFBEB', 
              borderRadius: '1.5rem', 
              padding: '2rem', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #FFD166',
              transform: 'rotate(-1deg)'
            }}>
              <p style={{ marginBottom: '1.5rem', color: '#4B5563', fontSize: '1.1rem', lineHeight: '1.6' }}>
                "My son used to struggle with his 'r' sounds. After just a few weeks with Speech Buddy, he's made incredible progress!"
              </p>
              <p style={{ fontWeight: '700', color: '#2563EB' }}>- Sarah W., Parent</p>
            </div>
            <div style={{ 
              backgroundColor: '#F0FDF4', 
              borderRadius: '1.5rem', 
              padding: '2rem', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #06D6A0',
              transform: 'rotate(1deg)'
            }}>
              <p style={{ marginBottom: '1.5rem', color: '#4B5563', fontSize: '1.1rem', lineHeight: '1.6' }}>
                "The colorful interface and fun games keep my daughter engaged. She asks to practice every day!"
              </p>
              <p style={{ fontWeight: '700', color: '#2563EB' }}>- Michael T., Parent</p>
            </div>
            <div style={{ 
              backgroundColor: '#EFF6FF', 
              borderRadius: '1.5rem', 
              padding: '2rem', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '2px solid #118AB2',
              transform: 'rotate(-1deg)'
            }}>
              <p style={{ marginBottom: '1.5rem', color: '#4B5563', fontSize: '1.1rem', lineHeight: '1.6' }}>
                "Speech Buddy has been a wonderful supplement to my child's speech therapy. The games reinforce what they learn in sessions."
              </p>
              <p style={{ fontWeight: '700', color: '#2563EB' }}>- Lisa K., Parent</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', 
        padding: '5rem 0', 
        color: 'white',
        borderTop: '4px dashed #FFD166',
        borderBottom: '4px dashed #FFD166'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '2.75rem', 
            fontWeight: 'bold', 
            marginBottom: '1.5rem',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.2)'
          }}>Ready to start your speech adventure?</h2>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '3rem', 
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
            opacity: '0.9'
          }}>
            Join thousands of families who are helping their children improve their speech in a fun, engaging way.
          </p>
          <a href="/onboarding" style={{ 
            backgroundColor: 'white', 
            color: '#3B82F6', 
            padding: '1rem 2.5rem', 
            borderRadius: '2rem', 
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1.25rem',
            display: 'inline-block',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
            animation: 'pulse 2s infinite ease-in-out'
          }}>Create a Free Account</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '2px solid #EBF5FF', 
        padding: '2rem 0',
        backgroundColor: 'white'
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
            Built with ❤️ by the Speech Buddy Team.
            <a href="#" style={{ 
              color: '#3B82F6', 
              marginLeft: '0.5rem', 
              textDecoration: 'none',
              fontWeight: '600'
            }}>GitHub</a>
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🎈</span>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <span style={{ fontSize: '1.5rem' }}>🎪</span>
            <span style={{ fontSize: '1.5rem' }}>🎨</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { BookOpen, Users, Award, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  // Admin dashboard cards
  const adminCards = [
    {
      title: 'Manage Exercises',
      description: 'Create, edit and delete speech exercises',
      icon: <BookOpen style={{ width: '2rem', height: '2rem', color: '#3b82f6' }} />,
      href: '/admin/exercises',
      bgColor: '#eff6ff', // bg-blue-50
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: <Users style={{ width: '2rem', height: '2rem', color: '#10b981' }} />,
      href: '/admin/users',
      bgColor: '#ecfdf5', // bg-green-50
    },
    {
      title: 'Achievements',
      description: 'Configure user achievements and rewards',
      icon: <Award style={{ width: '2rem', height: '2rem', color: '#8b5cf6' }} />,
      href: '/admin/achievements',
      bgColor: '#f5f3ff', // bg-purple-50
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      icon: <Settings style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} />,
      href: '/admin/settings',
      bgColor: '#fffbeb', // bg-amber-50
    },
  ];

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1.5rem'
    }}>
      <style jsx global>{`
        /* Media queries for the grid */
        @media (min-width: 768px) {
          .admin-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1280px) {
          .admin-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        
        /* Card hover effects */
        .admin-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        /* Admin heading styles */
        .admin-heading {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          color: #2563EB;
          text-align: center;
          text-shadow: 1px 1px 0px rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid #EBF5FF;
          padding-bottom: 1rem;
        }
      `}</style>
      
      <h1 className="admin-heading">Admin Dashboard</h1>
      
      <div className="admin-grid" style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      }}>
        {adminCards.map((card, index) => (
          <Link 
            key={index} 
            href={card.href}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="admin-card" style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s ease',
              cursor: 'pointer',
              height: '100%',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '1.5rem 1.5rem 0.5rem 1.5rem',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  width: 'fit-content',
                  backgroundColor: card.bgColor
                }}>
                  {card.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginTop: '1rem',
                  marginBottom: '0.25rem'
                }}>{card.title}</h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0
                }}>{card.description}</p>
              </div>
              <div style={{ padding: '1rem 1.5rem 1.5rem 1.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#3b82f6'
                }}>
                  <span>Access</span>
                  <ArrowRight style={{ 
                    width: '1rem', 
                    height: '1rem', 
                    marginLeft: '0.25rem' 
                  }} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div style={{
        marginTop: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem 1.5rem 0.75rem 1.5rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            margin: '0 0 0.25rem 0',
            color: '#111827'
          }}>Welcome to the Admin Panel</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0
          }}>
            This is where you can manage all aspects of the Speech Buddy application
          </p>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Use the navigation on the left to access different administrative functions. You can manage speech 
            exercises, user accounts, achievements, and application settings from this interface.
          </p>
        </div>
      </div>
    </div>
  );
} 
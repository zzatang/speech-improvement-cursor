"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  getAllExercises, 
  saveExercise, 
  deleteExercise,
  getExerciseById
} from '@/lib/supabase/services/exercise-service';
import { SpeechExercise } from '@/lib/supabase/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Pencil, 
  Trash, 
  AlertCircle, 
  ChevronDown, 
  Loader2 
} from 'lucide-react';

export default function ExercisesAdminPage() {
  const { user } = useUser();
  const [exercises, setExercises] = useState<SpeechExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<SpeechExercise>({
    id: '',
    title: '',
    description: null,
    exercise_type: 'repeat',
    content: {},
    difficulty_level: 1,
    age_group: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // For content editing as a string
  const [contentText, setContentText] = useState('{}');

  useEffect(() => {
    if (!user) return;

    fetchExercises();
  }, [user]);

  // Update contentText when currentExercise changes
  useEffect(() => {
    if (currentExercise.content) {
      try {
        setContentText(JSON.stringify(currentExercise.content, null, 2));
      } catch (err) {
        console.error('Error stringifying content:', err);
        setContentText('{}');
      }
    } else {
      setContentText('{}');
    }
  }, [currentExercise.content]);

  async function fetchExercises() {
    setLoading(true);
    try {
      const { data, error } = await getAllExercises();
      if (error) throw error;
      setExercises(data || []);
    } catch (err) {
      console.error('Error fetching exercises', err);
      setError('Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Parse content from text
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(contentText);
      } catch (err) {
        setError('Invalid JSON in content field. Please check the format.');
        setLoading(false);
        return;
      }
      
      const exerciseData = {
        ...currentExercise,
        content: parsedContent,
        updated_at: new Date().toISOString()
      };
      
      if (!exerciseData.created_at) {
        exerciseData.created_at = new Date().toISOString();
      }
      
      const { data, error } = await saveExercise(exerciseData);
      
      if (error) throw error;
      
      if (isEditing) {
        setExercises(exercises.map(ex => ex.id === data?.id ? data : ex));
      } else {
        if (data) setExercises([data, ...exercises]);
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving exercise', err);
      setError('Failed to save exercise');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(id: string) {
    setLoading(true);
    try {
      const { data, error } = await getExerciseById(id);
      if (error) throw error;
      if (data) {
        setCurrentExercise(data);
        setIsEditing(true);
        // contentText will be updated by the useEffect
      }
    } catch (err) {
      console.error('Error fetching exercise for edit', err);
      setError('Failed to load exercise details');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    setLoading(true);
    try {
      const { error } = await deleteExercise(id);
      if (error) throw error;
      setExercises(exercises.filter(ex => ex.id !== id));
    } catch (err) {
      console.error('Error deleting exercise', err);
      setError('Failed to delete exercise');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCurrentExercise({
      id: '',
      title: '',
      description: null,
      exercise_type: 'repeat',
      content: {},
      difficulty_level: 1,
      age_group: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setContentText('{}');
    setIsEditing(false);
    setError(null);
  }

  if (!user) {
    return (
      <div style={{
        height: '100%',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '400px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textAlign: 'center',
              margin: 0
            }}>Authentication Required</h3>
          </div>
          <div style={{
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              marginBottom: '1rem',
              color: '#6b7280'
            }}>Please sign in to access the admin panel</p>
            <Link href="/sign-in" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '0.375rem',
              fontWeight: '500',
              fontSize: '0.875rem',
              textDecoration: 'none'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1.5rem'
    }}>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Add these CSS classes for heading consistency */
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
      
      <h1 className="admin-heading">Manage Speech Exercises</h1>

      {error && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          borderRadius: '0.375rem',
          borderLeft: '4px solid #ef4444',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '1rem', height: '1rem' }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Exercise Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              margin: 0
            }}>{isEditing ? 'Edit Exercise' : 'Add New Exercise'}</h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="title" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>Title</label>
                <input
                  id="title"
                  value={currentExercise.title}
                  onChange={(e) => setCurrentExercise({...currentExercise, title: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="exercise_type" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>Exercise Type</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="exercise_type"
                    value={currentExercise.exercise_type}
                    onChange={(e) => setCurrentExercise({...currentExercise, exercise_type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.875rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                      appearance: 'none',
                      backgroundColor: 'white',
                      outline: 'none'
                    }}
                  >
                    <option value="repeat">Repeat</option>
                    <option value="reading">Reading</option>
                  </select>
                  <ChevronDown style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1rem',
                    height: '1rem',
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>
              
              <div>
                <label htmlFor="difficulty_level" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>Difficulty Level (1-5)</label>
                <input
                  id="difficulty_level"
                  type="number"
                  min="1"
                  max="5"
                  value={currentExercise.difficulty_level}
                  onChange={(e) => setCurrentExercise({...currentExercise, difficulty_level: parseInt(e.target.value)})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="age_group" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>Age Group</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="age_group"
                    value={currentExercise.age_group || 'none'}
                    onChange={(e) => setCurrentExercise({...currentExercise, age_group: e.target.value === 'none' ? null : e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '0.875rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                      appearance: 'none',
                      backgroundColor: 'white',
                      outline: 'none'
                    }}
                  >
                    <option value="none">-- Select Age Group --</option>
                    <option value="5-7">5-7 years</option>
                    <option value="8-13">8-13 years</option>
                    <option value="14-18">14-18 years</option>
                    <option value="adult">Adult</option>
                  </select>
                  <ChevronDown style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '1rem',
                    height: '1rem',
                    color: '#6b7280',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>Description</label>
                <textarea
                  id="description"
                  value={currentExercise.description || ''}
                  onChange={(e) => setCurrentExercise({...currentExercise, description: e.target.value || null})}
                  rows={2}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="content" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  <span>Content (JSON)</span>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}>
                    {currentExercise.exercise_type === 'repeat' ?
                      'Format: {"phrases": ["Example phrase 1"], "focus": "R Sounds"}' :
                      'Format: {"text": "Example reading text", "focus": "Vowel Sounds"}'
                    }
                  </div>
                </label>
                <textarea
                  id="content"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    borderRadius: '0.375rem',
                    border: '1px solid #d1d5db',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  rows={5}
                  required
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                paddingTop: '1rem'
              }}>
                <button 
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading && <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite'}} />}
                  {loading ? 'Saving...' : (isEditing ? 'Update Exercise' : 'Add Exercise')}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'white',
                      color: '#4b5563',
                      borderRadius: '0.375rem',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                      border: '1px solid #d1d5db',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Exercises Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            margin: 0
          }}>All Exercises</h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          {loading && !exercises.length ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                border: '4px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading exercises...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 0',
              color: '#6b7280'
            }}>
              No exercises found. Add your first exercise to get started.
            </div>
          ) : (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              overflow: 'hidden'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.875rem'
              }}>
                <thead style={{
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <tr>
                    <th style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Title</th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Type</th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Difficulty</th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      color: '#374151'
                    }}>Age Group</th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      fontWeight: '600',
                      color: '#374151',
                      textAlign: 'right'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((exercise) => (
                    <tr key={exercise.id} style={{
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontWeight: '500',
                        color: '#111827'
                      }}>{exercise.title}</td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        color: '#4b5563',
                        textTransform: 'capitalize'
                      }}>{exercise.exercise_type}</td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        color: '#4b5563'
                      }}>{exercise.difficulty_level}</td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        color: '#4b5563'
                      }}>{exercise.age_group || '-'}</td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'right'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleEdit(exercise.id!)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: 'white',
                              color: '#4b5563',
                              borderRadius: '0.375rem',
                              fontWeight: '500',
                              fontSize: '0.75rem',
                              border: '1px solid #d1d5db',
                              cursor: 'pointer'
                            }}
                          >
                            <Pencil style={{ width: '0.875rem', height: '0.875rem' }} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exercise.id!)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              borderRadius: '0.375rem',
                              fontWeight: '500',
                              fontSize: '0.75rem',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash style={{ width: '0.875rem', height: '0.875rem' }} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
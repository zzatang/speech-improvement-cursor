"use client";

import { useState, useRef, useEffect } from "react";
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
import { ArrowLeft, Mic, Play, Square, Volume2, VolumeX, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Sample phrases for practice (fallback if API fails)
const PRACTICE_PHRASES = [
  {
    id: 1,
    text: "The red rabbit runs rapidly.",
    focus: "R Sounds",
    difficulty: "Medium"
  },
  {
    id: 2,
    text: "Sally sells seashells by the seashore.",
    focus: "S Sounds",
    difficulty: "Hard"
  },
  {
    id: 3,
    text: "Look at the little lake.",
    focus: "L Sounds",
    difficulty: "Easy"
  },
  {
    id: 4,
    text: "I think that thing is thin.",
    focus: "Th Sounds",
    difficulty: "Medium"
  }
];

export default function RepeatAfterMePage() {
  // State for the current exercise
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [volume, setVolume] = useState(true);
  const [progress, setProgress] = useState(0);
  const [practicePhrases, setPracticePhrases] = useState(PRACTICE_PHRASES);
  const [loadingPhrase, setLoadingPhrase] = useState(false);
  
  // Audio processing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const currentPhrase = PRACTICE_PHRASES[currentPhraseIndex];
  
  // Function to fetch a practice phrase from the API
  const fetchPracticePhrase = async () => {
    try {
      setLoadingPhrase(true);
      
      // Map focus to sound parameter
      let sound = 'r';
      if (currentPhrase.focus === 'R Sounds') sound = 'r';
      else if (currentPhrase.focus === 'S Sounds') sound = 's';
      else if (currentPhrase.focus === 'L Sounds') sound = 'l';
      else if (currentPhrase.focus === 'Th Sounds') sound = 'th';
      
      // Map string difficulty to numeric level
      let level = 1;
      if (currentPhrase.difficulty === 'Easy') level = 1;
      else if (currentPhrase.difficulty === 'Medium') level = 2;
      else if (currentPhrase.difficulty === 'Hard') level = 3;
      
      // Fetch the practice audio
      const response = await fetch('/api/speech/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sound,
          difficulty: level
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch practice phrase');
      }
      
      // Process the audio directly
      if (audioRef.current) {
        // Get audio as blob and create URL
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Set the audio source and play
        audioRef.current.src = audioUrl;
        audioRef.current.onloadedmetadata = () => {
          setLoadingPhrase(false);
          setLoadingAudio(false);
          setIsPlaying(true);
          audioRef.current?.play();
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl); // Clean up the URL
        };
      }
    } catch (error) {
      console.error('Error fetching practice phrase:', error);
      setLoadingPhrase(false);
      // Fallback to default TTS if the practice API fails
      playAudio();
    }
  };
  
  // Function to play audio directly from a response
  const playAudioFromResponse = async (response: Response) => {
    if (!volume) return;
    
    try {
      setLoadingAudio(true);
      
      // Get audio as blob and create URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onloadedmetadata = () => {
          setLoadingAudio(false);
          setIsPlaying(true);
          audioRef.current?.play();
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl); // Clean up the URL
        };
        
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e);
          setLoadingAudio(false);
          setIsPlaying(false);
        };
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  // Function to play the TTS audio
  const playAudio = async () => {
    if (!volume) return;
    
    try {
      setLoadingAudio(true);
      
      // Call the TTS API to generate audio for the current phrase
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: currentPhrase.text,
          speakingRate: 0.9 // Slightly slower for practice
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }
      
      // Get audio as blob and create URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onloadedmetadata = () => {
          setLoadingAudio(false);
          setIsPlaying(true);
          audioRef.current?.play();
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl); // Clean up the URL
        };
        
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e);
          setLoadingAudio(false);
          setIsPlaying(false);
        };
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  };
  
  // Function to start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setRecordingComplete(true);
        
        // Automatically analyze after recording
        analyzeRecording(audioBlob);
      };
      
      // Start the recording and set a max recording time
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Progress animation
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            stopRecording();
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 5000);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };
  
  // Function to analyze the recorded audio
  const analyzeRecording = async (blob: Blob) => {
    try {
      setLoadingAnalysis(true);
      
      // Create FormData with the audio blob and target parameters
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      
      // Add target sound parameter based on current phrase focus
      let targetSound = '';
      if (currentPhrase.focus.includes('R Sound')) {
        targetSound = 'r';
      } else if (currentPhrase.focus.includes('S Sound')) {
        targetSound = 's';
      } else if (currentPhrase.focus.includes('L Sound')) {
        targetSound = 'l';
      } else if (currentPhrase.focus.includes('Th Sound')) {
        targetSound = 'th';
      }
      
      if (targetSound) {
        formData.append('targetSound', targetSound);
      }
      
      // Add the current phrase as target text (for comparison)
      formData.append('targetText', currentPhrase.text);
      
      // Set the language code to Australian English
      formData.append('languageCode', 'en-AU');
      
      // Make the API call to the ASR endpoint
      const response = await fetch('/api/speech/asr', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`ASR API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we have valid transcription data
      if (!data.transcript) {
        setFeedback("We couldn't hear you clearly. Please try speaking louder or move closer to the microphone.");
        setLoadingAnalysis(false);
        return;
      }
      
      // Save the transcription and analysis data
      const transcription = data.transcript;
      
      // Generate feedback based on API response
      let feedbackMessage = '';
      
      // If we have target sound analysis, use that for feedback
      if (data.targetSoundAnalysis && targetSound) {
        const analysis = data.targetSoundAnalysis;
        const accuracy = analysis.accuracy;
        
        if (accuracy >= 90) {
          feedbackMessage = `Excellent! Your ${currentPhrase.focus} pronunciation was very clear (${accuracy}% accuracy). `;
        } else if (accuracy >= 70) {
          feedbackMessage = `Good job! Your ${currentPhrase.focus} pronunciation was mostly clear (${accuracy}% accuracy). `;
        } else {
          feedbackMessage = `Nice try! Your ${currentPhrase.focus} needs a bit more practice (${accuracy}% accuracy). `;
        }
        
        // Add specific word feedback if available
        if (analysis.incorrectWords.length > 0) {
          feedbackMessage += `Try to focus on these words: ${analysis.incorrectWords.slice(0, 3).join(', ')}.`;
        }
        
        // Add a tip from the suggestions if available
        if (analysis.suggestions.length > 0) {
          feedbackMessage += ` Tip: ${analysis.suggestions[0]}`;
        }
      } else if (data.phoneticAnalysis) {
        // Use general phonetic analysis if target sound analysis isn't available
        const phoneticAnalysis = data.phoneticAnalysis;
        feedbackMessage = `I heard: "${transcription}". Overall pronunciation score: ${phoneticAnalysis.overallScore}%. `;
        
        // Add suggestions if available
        if (phoneticAnalysis.suggestions.length > 0) {
          feedbackMessage += phoneticAnalysis.suggestions[0];
        }
      } else {
        // Fallback to basic feedback
        feedbackMessage = `I heard: "${transcription}". Keep practicing!`;
      }
      
      setFeedback(feedbackMessage);
      setLoadingAnalysis(false);
      
    } catch (error) {
      console.error("Error analyzing recording:", error);
      setLoadingAnalysis(false);
      setFeedback("Sorry, we couldn't analyze your speech. Please try again.");
    }
  };
  
  // Function to move to the next phrase
  const goToNextPhrase = () => {
    setCurrentPhraseIndex(prev => (prev + 1) % PRACTICE_PHRASES.length);
    resetExerciseState();
  };
  
  // Function to move to the previous phrase
  const goToPreviousPhrase = () => {
    setCurrentPhraseIndex(prev => (prev - 1 + PRACTICE_PHRASES.length) % PRACTICE_PHRASES.length);
    resetExerciseState();
  };
  
  // Reset the exercise state when changing phrases
  const resetExerciseState = () => {
    setIsPlaying(false);
    setIsRecording(false);
    setRecordingComplete(false);
    setAudioBlob(null);
    setFeedback(null);
    setProgress(0);
  };
  
  // Cleanup function for when component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Update UI element (play button) based on whether we should use the practice API or standard TTS
  const handlePlayButtonClick = () => {
    if (isPlaying || loadingAudio || isRecording) return;
    
    // For the first time a user clicks play on a new phrase, try using the practice API
    // which will generate a specific practice phrase based on the sound focus
    if (currentPhrase.focus.includes('R Sound')) {
      fetchPracticePhrase(); // This will use the specialized practice endpoint
    } else {
      playAudio(); // This will use the standard TTS endpoint with the predefined phrase
    }
  };
  
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
        @keyframes recording-pulse {
          0%, 100% { transform: scale(1); background-color: #EF476F; }
          50% { transform: scale(1.05); background-color: #FF6B6B; }
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
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => setVolume(!volume)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: volume ? '#EFF6FF' : '#F3F4F6',
                color: volume ? '#2563EB' : '#6B7280',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              {volume ? (
                <Volume2 style={{ width: '1.25rem', height: '1.25rem' }} />
              ) : (
                <VolumeX style={{ width: '1.25rem', height: '1.25rem' }} />
              )}
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '800px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#2563EB',
            textShadow: '1px 1px 0px rgba(59, 130, 246, 0.2)'
          }}>
            Repeat After Me
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#4B5563',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Listen carefully and repeat the phrase to practice your pronunciation!
          </p>
        </div>

        {/* Exercise Card */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          borderRadius: '1.5rem',
          border: '2px solid #FFD166',
          backgroundColor: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          transform: 'rotate(0.5deg)'
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
            color: 'white',
            padding: '1.5rem 2rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.2)'
                }}>
                  {currentPhrase.focus}
                </h2>
                <p style={{
                  fontSize: '1rem',
                  opacity: '0.9'
                }}>
                  Difficulty: {currentPhrase.difficulty}
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FFD166',
                color: '#2563EB',
                fontWeight: '600',
                padding: '0.5rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                Phrase {currentPhraseIndex + 1} of {PRACTICE_PHRASES.length}
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div style={{ padding: '2rem' }}>
            {/* Current Phrase Display */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#EFF6FF',
              borderRadius: '1rem',
              border: '2px dashed #3B82F6',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '1.75rem',
                fontWeight: '600',
                color: '#2563EB',
                lineHeight: '1.5'
              }}>
                {currentPhrase.text}
              </p>
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              {/* Play Button Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#4B5563'
                }}>1. Listen to the phrase</p>
                <button
                  onClick={handlePlayButtonClick}
                  disabled={isPlaying || loadingAudio}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: isPlaying ? '#06D6A0' : '#3B82F6',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                    animation: isPlaying ? 'pulse 1s infinite ease-in-out' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loadingAudio ? (
                    <span style={{ fontSize: '1.25rem' }}>...</span>
                  ) : (
                    <Play style={{ 
                      width: '1.75rem', 
                      height: '1.75rem',
                      marginLeft: '4px' // Slight adjustment for the play icon
                    }} />
                  )}
                </button>
                <audio ref={audioRef} className="hidden" />
              </div>

              {/* Record Button Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <p style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#4B5563'
                }}>2. Now it's your turn</p>
                {isRecording ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '0.75rem',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                      marginBottom: '0.5rem'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: 'linear-gradient(to right, #4F46E5, #3B82F6)',
                          borderRadius: '9999px',
                          transition: 'width 0.1s linear'
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        mediaRecorderRef.current?.stop();
                        setIsRecording(false);
                      }}
                      style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        backgroundColor: '#EF476F',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(239, 71, 111, 0.3)',
                        animation: 'recording-pulse 1.5s infinite',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Square style={{ width: '1.75rem', height: '1.75rem' }} />
                    </button>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#4B5563'
                    }}>
                      Recording... Click to stop
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => startRecording()}
                    disabled={isPlaying || loadingAnalysis}
                    style={{
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '50%',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Mic style={{ width: '1.75rem', height: '1.75rem' }} />
                  </button>
                )}
              </div>

              {/* Feedback Section */}
              {feedback && (
                <div style={{
                  width: '100%',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  backgroundColor: recordingComplete ? '#F0FDF4' : '#FFFBEB',
                  border: recordingComplete ? '2px solid #06D6A0' : '2px solid #FFD166',
                  marginTop: '1rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: recordingComplete ? '#059669' : '#2563EB',
                    textAlign: 'center'
                  }}>
                    {recordingComplete ? 'Great job!' : 'Keep practicing!'}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: '#4B5563',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}>
                    {feedback}
                  </p>
                </div>
              )}

              {loadingAnalysis && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    border: '3px solid #E5E7EB',
                    borderTopColor: '#3B82F6',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>
                    Analyzing your speech...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div style={{
            padding: '1.5rem 2rem',
            borderTop: '2px solid #EFF6FF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={() => {
                if (currentPhraseIndex > 0) {
                  setCurrentPhraseIndex(currentPhraseIndex - 1);
                  setFeedback(null);
                  setRecordingComplete(false);
                  setProgress(0);
                }
              }}
              disabled={currentPhraseIndex === 0}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: currentPhraseIndex === 0 ? '#F3F4F6' : '#EFF6FF',
                color: currentPhraseIndex === 0 ? '#9CA3AF' : '#2563EB',
                fontWeight: '600',
                cursor: currentPhraseIndex === 0 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: currentPhraseIndex === 0 ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              Previous
            </button>
            
            <button
              onClick={() => {
                if (currentPhraseIndex < PRACTICE_PHRASES.length - 1) {
                  setCurrentPhraseIndex(currentPhraseIndex + 1);
                  setFeedback(null);
                  setRecordingComplete(false);
                  setProgress(0);
                }
              }}
              disabled={currentPhraseIndex === PRACTICE_PHRASES.length - 1}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: currentPhraseIndex === PRACTICE_PHRASES.length - 1 ? '#F3F4F6' : '#3B82F6',
                color: currentPhraseIndex === PRACTICE_PHRASES.length - 1 ? '#9CA3AF' : 'white',
                fontWeight: '600',
                cursor: currentPhraseIndex === PRACTICE_PHRASES.length - 1 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: currentPhraseIndex === PRACTICE_PHRASES.length - 1 ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.3)'
              }}
            >
              Next
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        {/* Tips Container */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          marginTop: '2rem',
          borderRadius: '1.5rem',
          border: '2px dashed #06D6A0',
          backgroundColor: 'white',
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          transform: 'rotate(-0.5deg)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textShadow: '1px 1px 0px rgba(5, 150, 105, 0.1)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> Tips for "{currentPhrase.focus}"
          </h3>
          <ul style={{
            listStyleType: 'none',
            padding: '0',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {currentPhrase.focus === "R Sounds" && (
              <>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span> 
                  Pull the tip of your tongue back slightly without touching the roof of your mouth.
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span>
                  Round your lips a little when making the 'r' sound.
                </li>
              </>
            )}
            {currentPhrase.focus === "S Sounds" && (
              <>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span> 
                  Place the tip of your tongue just behind your top front teeth.
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span>
                  Let the air flow over the center of your tongue.
                </li>
              </>
            )}
            {currentPhrase.focus === "L Sounds" && (
              <>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span> 
                  Touch the tip of your tongue to the ridge behind your upper front teeth.
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span>
                  Let the sound come out around the sides of your tongue.
                </li>
              </>
            )}
            {currentPhrase.focus === "Th Sounds" && (
              <>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span> 
                  Place the tip of your tongue between your upper and lower front teeth.
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  color: '#4B5563',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span>
                  Gently blow air out of your mouth to make the 'th' sound.
                </li>
              </>
            )}
          </ul>
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
          gap: '0.75rem',
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
            Speech Buddy - Practice makes perfect!
          </p>
        </div>
      </footer>
    </div>
  );
} 
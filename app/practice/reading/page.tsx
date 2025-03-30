"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  Settings,
  Timer
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Sample reading texts for practice (would be fetched from API in production)
const READING_TEXTS = [
  {
    id: 1,
    title: "The Rainbow",
    text: "Red and yellow and pink and green, purple and orange and blue. I can sing a rainbow, sing a rainbow, sing a rainbow too.",
    focus: "Vowel Sounds",
    difficulty: "Easy",
    targetWordsPerMinute: 80
  },
  {
    id: 2,
    title: "Peter Piper",
    text: "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked. If Peter Piper picked a peck of pickled peppers, where's the peck of pickled peppers Peter Piper picked?",
    focus: "P Sounds",
    difficulty: "Hard",
    targetWordsPerMinute: 110
  },
  {
    id: 3,
    text: "She sells seashells by the seashore. The shells she sells are surely seashells. So if she sells shells on the seashore, I'm sure she sells seashore shells.",
    title: "Seashells",
    focus: "S Sounds",
    difficulty: "Medium",
    targetWordsPerMinute: 95
  },
  {
    id: 4,
    title: "The Weather",
    text: "Whether the weather is warm, whether the weather is hot, we have to put up with the weather, whether we like it or not.",
    focus: "Th and W Sounds",
    difficulty: "Medium",
    targetWordsPerMinute: 90
  }
];

export default function ReadingPracticePage() {
  // State for the current exercise
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [wordsPerMinute, setWordsPerMinute] = useState(60);
  const [showPacingBar, setShowPacingBar] = useState(true);
  const [volume, setVolume] = useState(true);
  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const currentText = READING_TEXTS[currentTextIndex];
  const words = currentText.text.split(" ");
  
  // Calculate word timing based on words per minute
  const wordInterval = 60000 / wordsPerMinute; // milliseconds per word
  
  // Function to start the reading exercise
  const startReading = () => {
    if (isPlaying) {
      pauseReading();
      return;
    }
    
    setIsPlaying(true);
    setCurrentWordIndex(0);
    setProgress(0);
    
    // Start the word highlighting timer
    highlightNextWord();
  };
  
  // Function to highlight words sequentially
  const highlightNextWord = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // If we've reached the end of the text
    if (currentWordIndex >= words.length - 1) {
      if (autoAdvance) {
        // Auto move to the next text
        setTimeout(() => {
          goToNextText();
        }, 1500);
      } else {
        setIsPlaying(false);
        setCurrentWordIndex(-1);
        
        // Show feedback
        setFeedback("Great job! You've completed the reading exercise.");
      }
      return;
    }
    
    // Calculate progress percentage
    const newProgress = ((currentWordIndex + 1) / words.length) * 100;
    setProgress(newProgress);
    
    // Schedule the next word highlight
    timerRef.current = setTimeout(() => {
      setCurrentWordIndex(prev => prev + 1);
      highlightNextWord();
    }, wordInterval);
  };
  
  // Function to pause the reading exercise
  const pauseReading = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
  };
  
  // Function to reset the exercise
  const resetExercise = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    setProgress(0);
    setFeedback(null);
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  };
  
  // Function to move to the next text
  const goToNextText = () => {
    setCurrentTextIndex(prev => (prev + 1) % READING_TEXTS.length);
    resetExercise();
  };
  
  // Function to move to the previous text
  const goToPreviousText = () => {
    setCurrentTextIndex(prev => (prev - 1 + READING_TEXTS.length) % READING_TEXTS.length);
    resetExercise();
  };
  
  // Function to start recording
  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Send the recording to the ASR API for analysis
        analyzeRecording(audioBlob);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start the reading exercise automatically when recording starts
      if (!isPlaying) {
        startReading();
      }
      
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
      
      // Pause the reading exercise
      pauseReading();
    }
  };
  
  // Function to handle speed change
  const handleSpeedChange = (value: number[]) => {
    const newWpm = value[0];
    setWordsPerMinute(newWpm);
    
    // If currently playing, restart with new speed
    if (isPlaying) {
      pauseReading();
      setTimeout(() => {
        startReading();
      }, 100);
    }
  };
  
  // Function to analyze the recorded audio
  const analyzeRecording = async (blob: Blob) => {
    try {
      setFeedback("Analyzing your reading...");
      
      // Create FormData with the audio blob and target parameters
      const formData = new FormData();
      formData.append('audio', blob, 'reading.wav');
      
      // Add target sound parameter based on current text focus
      let targetSound = '';
      if (currentText.focus.includes('P Sound')) {
        targetSound = 'p';
      } else if (currentText.focus.includes('S Sound')) {
        targetSound = 's';
      } else if (currentText.focus.includes('Th')) {
        targetSound = 'th';
      } else if (currentText.focus.includes('Vowel')) {
        targetSound = 'vowel';
      }
      
      if (targetSound) {
        formData.append('targetSound', targetSound);
      }
      
      // Add the current text as target text (for comparison)
      formData.append('targetText', currentText.text);
      
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
          feedbackMessage = `Excellent reading of "${currentText.title}"! Your ${currentText.focus} pronunciation was very clear (${accuracy}% accuracy). `;
        } else if (accuracy >= 70) {
          feedbackMessage = `Good job reading "${currentText.title}"! Your ${currentText.focus} pronunciation was mostly clear (${accuracy}% accuracy). `;
        } else {
          feedbackMessage = `Nice attempt with "${currentText.title}"! Your ${currentText.focus} needs a bit more practice (${accuracy}% accuracy). `;
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
        feedbackMessage = `Great reading of "${currentText.title}"! Overall pronunciation score: ${phoneticAnalysis.overallScore}%. `;
        
        // Add suggestions if available
        if (phoneticAnalysis.suggestions.length > 0) {
          feedbackMessage += phoneticAnalysis.suggestions[0];
        } else {
          feedbackMessage += `Keep practicing to improve your fluency!`;
        }
      } else {
        // Fallback to basic feedback
        feedbackMessage = `Great job reading "${currentText.title}"! Keep practicing to improve your fluency.`;
      }
      
      setFeedback(feedbackMessage);
      
    } catch (error) {
      console.error("Error analyzing recording:", error);
      setFeedback("Sorry, we couldn't analyze your reading. Please try again.");
    }
  };
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Function to determine word style based on index
  const getWordStyle = (index: number) => {
    if (index === currentWordIndex) {
      return "bg-primary text-primary-foreground px-1 py-0.5 rounded animate-pulse-gentle";
    } else if (index < currentWordIndex) {
      return "text-muted-foreground";
    }
    return "";
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
      
      {/* Hide audio element */}
      <audio ref={audioRef} className="hidden" />

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
          
          <UserButton afterSignOutUrl="/" />
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
            Reading Practice
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#4B5563',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Read along with the highlighted words at your own pace. Practice your pronunciation and fluency!
          </p>
        </div>
        
        {/* Reading Card */}
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
                  marginBottom: '0.5rem',
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.2)'
                }}>
                  {currentText.title}
                </h2>
                <p style={{
                  fontSize: '1rem',
                  opacity: '0.9'
                }}>
                  {currentText.focus} - {currentText.difficulty}
                </p>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  width: '2.5rem',
                  height: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Settings style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div style={{ padding: '2rem' }}>
            {/* Settings Panel */}
            {showSettings && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1.5rem',
                backgroundColor: '#F9FAFB',
                borderRadius: '0.75rem',
                border: '1px solid #E5E7EB'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#4B5563'
                }}>Reading Settings</h3>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#4B5563'
                      }}>
                        <Timer style={{ width: '1rem', height: '1rem' }} />
                        <span>Reading Speed: {wordsPerMinute} WPM</span>
                      </label>
                      <button
                        onClick={() => setWordsPerMinute(currentText.targetWordsPerMinute)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: 'white',
                          color: '#3B82F6',
                          border: '1px solid #D1D5DB',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}
                      >
                        Set Recommended ({currentText.targetWordsPerMinute} WPM)
                      </button>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="200" 
                      step="5"
                      value={wordsPerMinute}
                      onChange={(e) => handleSpeedChange([parseInt(e.target.value)])}
                      style={{
                        width: '100%',
                        height: '1rem',
                        accentColor: '#3B82F6',
                        margin: '0.5rem 0'
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}>
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <input
                      type="checkbox"
                      id="pacing-bar"
                      checked={showPacingBar}
                      onChange={(e) => setShowPacingBar(e.target.checked)}
                      style={{
                        width: '1rem',
                        height: '1rem',
                        accentColor: '#3B82F6'
                      }}
                    />
                    <label
                      htmlFor="pacing-bar"
                      style={{
                        fontSize: '0.875rem',
                        color: '#4B5563'
                      }}
                    >
                      Show Pacing Bar
                    </label>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <input
                      type="checkbox"
                      id="auto-advance"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      style={{
                        width: '1rem',
                        height: '1rem',
                        accentColor: '#3B82F6'
                      }}
                    />
                    <label
                      htmlFor="auto-advance"
                      style={{
                        fontSize: '0.875rem',
                        color: '#4B5563'
                      }}
                    >
                      Auto-advance to Next Text
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Pacing Bar */}
            {showPacingBar && (
              <div style={{
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '100%',
                  height: '0.5rem',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: '#3B82F6',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  marginTop: '0.25rem'
                }}>
                  <span>Start</span>
                  <span>End</span>
                </div>
              </div>
            )}

            {/* Reading Text Display */}
            <div 
              ref={containerRef}
              style={{
                padding: '1.5rem',
                backgroundColor: '#F9FAFB',
                borderRadius: '0.75rem',
                fontSize: '1.25rem',
                lineHeight: '1.7',
                letterSpacing: '0.015em'
              }}
            >
              {words.map((word, index) => (
                <span 
                  key={index} 
                  style={{
                    display: 'inline-block',
                    marginRight: '0.25rem',
                    transition: 'all 0.2s ease',
                    padding: index === currentWordIndex ? '0.125rem 0.25rem' : '0',
                    borderRadius: '0.25rem',
                    backgroundColor: index === currentWordIndex ? '#3B82F6' : 'transparent',
                    color: index === currentWordIndex 
                      ? 'white' 
                      : index < currentWordIndex ? '#9CA3AF' : 'inherit',
                    animation: index === currentWordIndex ? 'pulse 1s infinite ease-in-out' : 'none'
                  }}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Controls */}
            <div style={{
              marginTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                {/* Play/Pause Button */}
                <button 
                  onClick={startReading}
                  disabled={isRecording}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: isPlaying ? '#059669' : '#3B82F6',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isRecording ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                    opacity: isRecording ? '0.7' : '1',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isPlaying ? (
                    <Pause style={{ width: '1.5rem', height: '1.5rem' }} />
                  ) : (
                    <Play style={{ width: '1.5rem', height: '1.5rem' }} />
                  )}
                </button>
                
                {/* Record Button */}
                <button 
                  onClick={startRecording}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: isRecording ? '#EF476F' : '#3B82F6',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                    animation: isRecording ? 'recording-pulse 1.5s infinite' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Mic style={{ width: '1.5rem', height: '1.5rem' }} />
                </button>
              </div>
              
              <div style={{
                textAlign: 'center',
                fontSize: '0.875rem'
              }}>
                <p style={{
                  fontWeight: '500',
                  color: '#4B5563',
                  marginBottom: '0.25rem'
                }}>
                  {isPlaying 
                    ? "Follow along with the highlighted words" 
                    : "Press play to start"}
                  {isRecording && " - Recording your voice"}
                </p>
                <p style={{ color: '#6B7280' }}>
                  Current pace: {wordsPerMinute} words per minute
                </p>
              </div>
              
              {/* Feedback */}
              {feedback && (
                <div style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  backgroundColor: '#ECFDF5',
                  borderRadius: '0.75rem',
                  border: '1px solid #D1FAE5',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>⭐</span>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#065F46',
                      margin: 0
                    }}>{feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <button
              onClick={goToPreviousText}
              disabled={isPlaying || isRecording}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: 'white',
                color: '#3B82F6',
                border: '1px solid #D1D5DB',
                borderRadius: '0.5rem',
                fontWeight: '500',
                cursor: (isPlaying || isRecording) ? 'not-allowed' : 'pointer',
                opacity: (isPlaying || isRecording) ? '0.7' : '1'
              }}
            >
              Previous Text
            </button>
            
            <button
              onClick={goToNextText}
              disabled={isPlaying || isRecording}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: (isPlaying || isRecording) ? 'not-allowed' : 'pointer',
                opacity: (isPlaying || isRecording) ? '0.7' : '1'
              }}
            >
              Next Text
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
        
        {/* Tips Section */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          border: '2px solid #E5E7EB',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#4B5563'
          }}>Reading Practice Tips</h3>
          <ul style={{
            paddingLeft: '1.5rem',
            margin: 0,
            color: '#4B5563',
            fontSize: '0.875rem',
            lineHeight: '1.7'
          }}>
            <li>Try to maintain a steady rhythm when reading</li>
            <li>Pay special attention to the focus sounds in each text</li>
            <li>Record yourself to hear how you sound</li>
            <li>Start slower and gradually increase your reading speed</li>
            <li>Take breaks between texts if you need to</li>
          </ul>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #E5E7EB', 
        padding: '1.5rem',
        backgroundColor: 'white',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#6B7280'
      }}>
        Speech Buddy - Fun Reading Practice for Kids
      </footer>
    </div>
  );
} 
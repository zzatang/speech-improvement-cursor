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
import { ArrowLeft, Mic, Play, Square, Volume2, VolumeX, ChevronRight, Pause, RepeatIcon, RefreshCw, Trophy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { STTResponse } from "@/lib/google/speech-to-text";
import { 
  saveUserProgress, 
  getExercisesByType 
} from '@/lib/supabase/services/exercise-service';
import { 
  upsertUserProfile, 
  updateUserProfile, 
  updateStreakCount, 
  getUserProfile 
} from '@/lib/supabase/services/user-service';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SpeechExercise } from '@/lib/supabase/types';

// Extend the STTResponse interface to include the targetSoundAnalysis property
interface ExtendedSTTResponse extends STTResponse {
  targetSoundAnalysis?: {
    accuracy: number;
    correctWords: string[];
    incorrectWords: string[];
    suggestions: string[];
  };
}

// Update PracticePhrase interface to work with Supabase data
interface PracticePhrase {
  id: string | number;
  text: string;
  focus: string;
  difficulty: string;
}

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

// Define feedback type
interface FeedbackData {
  message: string;
  accuracy: number;
  transcription: string;
  suggestions: string[];
}

export default function RepeatAfterMePage() {
  // State for the current exercise
  const [targetSound, setTargetSound] = useState<string>('r');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [practicePhrases, setPracticePhrases] = useState<PracticePhrase[]>(PRACTICE_PHRASES);
  const [loading, setLoading] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  
  // Filter state
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [filteredPhrases, setFilteredPhrases] = useState<PracticePhrase[]>(PRACTICE_PHRASES);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volumeLevel, setVolumeLevel] = useState(0.7);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Analysis state
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  
  // Router and user
  const router = useRouter();
  const { user } = useUser();
  const [streakCount, setStreakCount] = useState<number | null>(null);
  
  // The current phrase is determined by the filtered phrases
  // const currentPhrase = practicePhrases[currentPhraseIndex];
  
  // Fetch exercises from Supabase
  useEffect(() => {
    async function fetchExercises() {
      try {
        setIsLoadingExercises(true);
        console.log("Fetching repeat exercises...");
        
        // Fetch repeat-type exercises from Supabase
        const exercises = await getExercisesByType('repeat');
        console.log("Repeat exercises result:", exercises);
        
        if (exercises && exercises.data && Array.isArray(exercises.data) && exercises.data.length > 0) {
          console.log(`Found ${exercises.data.length} repeat exercises`);
          
          // Convert Supabase exercises to the format used by this component
          const formattedExercises: PracticePhrase[] = exercises.data.map(exercise => {
            // Extract content based on the exercise structure
            const content = exercise.content as any;
            // Get the first phrase from the content.phrases array, or use a default text
            const phraseText = content?.phrases?.length > 0 
              ? content.phrases[0] 
              : (typeof content?.text === 'string' ? content.text : "Practice phrase");
            
            // Map difficulty level to string
            let difficultyText = "Easy";
            if ([3, 4].includes(exercise.difficulty_level)) difficultyText = "Medium";
            else if (exercise.difficulty_level === 5) difficultyText = "Hard";
            
            return {
              id: exercise.id,
              text: phraseText,
              focus: content?.focus || "Speech Practice",
              difficulty: difficultyText
            };
          });
          
          if (formattedExercises.length > 0) {
            console.log("Setting formatted exercises:", formattedExercises);
            setPracticePhrases(formattedExercises);
          } else {
            console.warn("No formatted exercises found, using fallback data");
            // Keep default phrases as fallback
          }
        } else {
          console.warn("No exercises found in database or error occured, using fallback data");
          // Check if we're using mock client
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn("Using sample data because Supabase credentials are missing");
          }
          
          // Provide some sample data for local development or when DB connection fails
          const sampleExercises: PracticePhrase[] = [
            {
              id: "sample-1",
              text: "The red rabbit runs rapidly around the room.",
              focus: "R Sounds",
              difficulty: "Medium"
            },
            {
              id: "sample-2",
              text: "Sally sells seashells by the seashore.",
              focus: "S Sounds",
              difficulty: "Hard"
            },
            {
              id: "sample-3",
              text: "Look at the little lion lounging lazily.",
              focus: "L Sounds",
              difficulty: "Easy"
            },
            {
              id: "sample-4",
              text: "Three thin thinkers thought thoughtful thoughts.",
              focus: "Th Sounds",
              difficulty: "Hard"
            },
            {
              id: "sample-5",
              text: "Please play with the purple and pink puppies.",
              focus: "P Sounds",
              difficulty: "Medium"
            }
          ];
          
          setPracticePhrases(sampleExercises);
        }
      } catch (error) {
        console.error("Error loading exercises from Supabase:", error);
        // Use the default phrases in case of error
      } finally {
        setIsLoadingExercises(false);
        setLoading(false);
      }
    }
    
    fetchExercises();
  }, []);
  
  // Apply difficulty filter whenever it changes or when practice phrases change
  useEffect(() => {
    if (!difficultyFilter) {
      // If no filter is set, show all phrases
      setFilteredPhrases(practicePhrases);
      // Reset to first phrase when filter changes
      setCurrentPhraseIndex(0);
      return;
    }
    
    // Filter the phrases based on difficulty
    const filtered = practicePhrases.filter(phrase => phrase.difficulty === difficultyFilter);
    setFilteredPhrases(filtered);
    
    // Reset to the first phrase when filter changes
    setCurrentPhraseIndex(0);
  }, [difficultyFilter, practicePhrases]);
  
  // Use filteredPhrases instead of practicePhrases for displaying and navigation
  const currentPhrase = filteredPhrases[currentPhraseIndex] || practicePhrases[0];
  
  // Function to fetch a practice phrase from the API
  const fetchPracticePhrase = async () => {
    try {
      setLoadingPhrase(true);
      setLoadingAudio(true);
      
      // Clear any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Map focus to sound parameter - fix the incorrect mapping
      let sound = '';
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
          difficulty: level,
          returnText: true // Request the text of the generated phrase
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch practice phrase: ${response.status} ${response.statusText}`);
      }
      
      // Check if we got a JSON response with the text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // This is a JSON response with text information
        const data = await response.json();
        
        if (data.text) {
          // Update the current phrase text to match what's being spoken
          const updatedPhrases = [...practicePhrases];
          updatedPhrases[currentPhraseIndex] = {
            ...updatedPhrases[currentPhraseIndex],
            text: data.text
          };
          
          setPracticePhrases(updatedPhrases);
          
          // Now fetch the audio separately
          const audioResponse = await fetch('/api/speech/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: data.text,
              speakingRate: 0.9 // Slightly slower for practice
            })
          });
          
          if (!audioResponse.ok) {
            throw new Error(`TTS API error: ${audioResponse.status} ${audioResponse.statusText}`);
          }
          
          // Process the audio
          await processAudioResponse(audioResponse);
        }
      } else {
        // This is a direct audio response, process it
        await processAudioResponse(response);
      }
    } catch (error) {
      // Error fetching practice phrase
      setLoadingPhrase(false);
      setLoadingAudio(false);
      // Fallback to default TTS if the practice API fails
      playAudio();
    }
  };
  
  // Helper function to process audio response
  const processAudioResponse = async (response: Response) => {
      // Process the audio directly
      if (audioRef.current) {
        // Get audio as blob and create URL
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Set the audio source and play
        audioRef.current.src = audioUrl;
        audioRef.current.volume = isMuted ? 0 : volumeLevel;
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
  };
  
  // Function to play audio directly from a response
  const playAudioFromResponse = async (response: Response) => {
    try {
      setLoadingAudio(true);
      
      // Get audio as blob and create URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.volume = volume ? volumeLevel : 0; // Apply current volume setting
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
          // Audio playback error
          setLoadingAudio(false);
          setIsPlaying(false);
        };
      }
    } catch (error) {
      // Error playing audio
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  // Function to play the TTS audio
  const playAudio = async () => {
    if (!volume) {
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
    
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
        audioRef.current.volume = isMuted ? 0 : volumeLevel;
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
          // Audio playback error
          setLoadingAudio(false);
          setIsPlaying(false);
        };
      }
    } catch (error) {
      // Error playing audio
      setLoadingAudio(false);
      setIsPlaying(false);
    }
  };
  
  // Function to start recording
  const startRecording = async () => {
    try {
      // Request audio with a specific sample rate
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      // Create MediaRecorder with specific MIME type and bitrate
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
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
      // Error starting recording
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
  const analyzeRecording = async (audioBlob: Blob) => {
    try {
      setLoadingAnalysis(true);
      setFeedback(null);

      // Use the user from the component level 
      const userId = user?.id;
      if (!userId) {
        throw new Error('You must be logged in to analyze recordings');
      }

      // Create form data for API request
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('targetText', currentPhrase.text);
      
      // Send audio to the ASR API
      const response = await fetch('/api/speech/recognize', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error analyzing speech: ${response.statusText}`);
      }

      // Process the response
      const data: ExtendedSTTResponse = await response.json();
      
      // Check if we have a transcript or a "No speech detected" error
      const transcript = data.transcript || '';
      
      // Special handling for "No speech detected" error
      if (data.error === 'No speech detected') {
        setFeedback({
          message: 'I couldn\'t detect any speech. Please try speaking louder or check your microphone.',
          accuracy: 0,
          transcription: '',
          suggestions: [
            'Make sure your microphone is working properly',
            'Speak clearly and directly into your microphone',
            'Try recording in a quieter environment'
          ]
        });
        setRecordingComplete(true);
        return;
      }
      
      // Calculate accuracy score
      const scorePercentage = calculateAccuracy(currentPhrase.text, transcript);
      
      // Prepare feedback message and suggestions
      let feedbackMsg = '';
      const suggestions: string[] = [];
      
      if (scorePercentage > 80) {
        feedbackMsg = 'Excellent pronunciation! Your speech was very clear and accurate.';
      } else if (scorePercentage > 60) {
        feedbackMsg = 'Good effort! Your pronunciation is improving.';
        suggestions.push('Try speaking a bit slower for better clarity.');
        suggestions.push('Focus on the words that were misunderstood in the transcription.');
        } else {
        feedbackMsg = 'Keep practicing! Pronunciation takes time to develop.';
        suggestions.push('Try breaking the phrase into smaller parts and practice each part.');
        suggestions.push('Listen to the audio sample again and pay attention to the rhythm.');
        suggestions.push('Speak more slowly and enunciate each word clearly.');
      }
      
      // Set feedback using the new structure
      setFeedback({
        message: feedbackMsg,
        accuracy: scorePercentage,
        transcription: transcript,
        suggestions: suggestions
      });
      
      // Save user progress to Supabase
      // Create a consistent exercise ID format that includes phrase focus and difficulty
      const exerciseId = `repeat_${currentPhrase.focus.toLowerCase().replace(/\s+/g, '_')}_${currentPhraseIndex}`;
      
      await saveUserProgress({
        user_id: userId,
        exercise_id: exerciseId,
        score: scorePercentage,
        completed_at: new Date().toISOString(),
        feedback: `Accuracy: ${scorePercentage}%. Transcript: "${transcript}"`,
        attempts: 1
      });
      
      // Update user profile progress using the service function
      // This will correctly calculate overall progress based on all exercises
      await updateUserProfile(userId);
      
      // Update streak count to maintain activity streak
      await updateStreakCount(userId, 1);
      
      setRecordingComplete(true);
    } catch (error) {
      // Error analyzing recording
      setFeedback({
        message: 'Sorry, there was an error analyzing your recording.',
        accuracy: 0,
        transcription: '',
        suggestions: ['Please try again later.']
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Helper function to calculate accuracy between target and actual text
  const calculateAccuracy = (target: string, actual: string): number => {
    if (!actual) return 0;
    
    // Normalize strings for comparison
    const normalizedTarget = target.toLowerCase().trim();
    const normalizedActual = actual.toLowerCase().trim();
    
    // Simple word-based comparison for demo
    const targetWords = normalizedTarget.split(/\s+/);
    const actualWords = normalizedActual.split(/\s+/);
    
    let matchedWords = 0;
    
    // Count words that appear in both strings
    actualWords.forEach(word => {
      if (targetWords.includes(word)) {
        matchedWords++;
      }
    });
    
    // Calculate percentage
    const maxWords = Math.max(targetWords.length, actualWords.length);
    return Math.round((matchedWords / maxWords) * 100);
  };
  
  // Function to move to the next phrase
  const goToNextPhrase = () => {
    if (currentPhraseIndex < filteredPhrases.length - 1) {
      setCurrentPhraseIndex(prevIndex => prevIndex + 1);
      resetExerciseState();
    }
  };
  
  // Function to move to the previous phrase
  const goToPreviousPhrase = () => {
    setCurrentPhraseIndex(prev => (prev - 1 + filteredPhrases.length) % filteredPhrases.length);
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
    
    // Clear the audio source when changing phrases to force a new fetch
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
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
  
  // Effect to clear audio when phrase index changes
  useEffect(() => {
    // Clear audio source when changing phrases
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
    }
  }, [currentPhraseIndex, currentPhrase]);
  
  // Effect to update audio volume when the volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volumeLevel;
    }
  }, [isMuted, volumeLevel]);
  
  // Update UI element (play button) based on whether we should use the practice API or standard TTS
  const handlePlayButtonClick = () => {
    if (loadingAudio) return;
    
    if (isPlaying) {
      // If already playing, pause the audio
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }
    
    // If audio is already loaded but paused, just play it
    // Check for src that's not empty or blob:null
    if (audioRef.current && audioRef.current.src && 
        audioRef.current.src !== '' && 
        !audioRef.current.src.endsWith('null') &&
        audioRef.current.readyState > 0) {
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(e => {
              // If play() fails, fall back to fetching new audio
              playAudio();
            });
        }
      } catch (e) {
        // If there's an error playing, fall back to fetching new audio
        playAudio();
      }
      return;
    }
    
    // Always use standard TTS to play the currently displayed text without changing it
    playAudio();
  };
  
  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await getUserProfile(user.id);
        if (profile) {
          setStreakCount(profile.streak_count || 0);
        }
      } catch (err) {
        // Error fetching user profile
      }
    };
    
    fetchUserProfile();
  }, [user?.id]);
  
  // Handle playing audio automatically when it's loaded
  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement && audioElement.src && 
        audioElement.src !== '' && 
        !audioElement.src.endsWith('null') && 
        !isRecording && !recordingComplete) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(e => {
            // Audio playback error - silent fail
            setIsPlaying(false);
          });
      }
    }
  }, [audioRef.current?.src, isRecording, recordingComplete]);
  
  // Toggle mute state
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    if (audioRef.current) {
      audioRef.current.volume = newMuteState ? 0 : volumeLevel;
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
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '0.5rem'
            }}>
              {/* Volume Control */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleMute}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isMuted ? '#9CA3AF' : '#3B82F6',
                  marginRight: '0.25rem',
                  padding: '0.5rem',
                  borderRadius: '0.375rem'
                }}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </Button>
              
              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={audioRef.current?.volume || 1}
                onChange={(e) => {
                  const newLevel = parseFloat(e.target.value);
                  setVolumeLevel(newLevel);
                  // If volume is set to 0, also update the mute state
                  setIsMuted(newLevel === 0);
                  if (audioRef.current) {
                    audioRef.current.volume = newLevel;
                  }
                }}
                style={{
                  width: '100px',
                  accentColor: '#3B82F6'
                }}
                disabled={isMuted}
              />
            </div>
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
        
        {/* Difficulty Filter */}
        {!isLoadingExercises && practicePhrases.length > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <label style={{
                marginRight: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#4B5563'
              }}>
                Difficulty Level:
              </label>
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => setDifficultyFilter(null)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    backgroundColor: !difficultyFilter ? '#3B82F6' : '#f3f4f6',
                    color: !difficultyFilter ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  All
                </button>
                {['Easy', 'Medium', 'Hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      border: 'none',
                      backgroundColor: difficultyFilter === level ? '#3B82F6' : '#f3f4f6',
                      color: difficultyFilter === level ? 'white' : '#6b7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Phrase counter */}
            <div style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '1rem',
              backgroundColor: '#FFD166',
              color: '#2563EB',
              fontWeight: '600',
              fontSize: '0.875rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Phrase {currentPhraseIndex + 1} of {filteredPhrases.length}
            </div>
          </div>
        )}
          
        {/* Loading state for exercises */}
        {isLoadingExercises ? (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              border: '3px solid #E5E7EB',
              borderTopColor: '#3B82F6',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }}></div>
            <p style={{ color: '#4B5563' }}>Loading speech exercises...</p>
          </div>
        ) : practicePhrases.length === 0 ? (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#EF4444', marginBottom: '1rem' }}>No practice exercises found.</p>
            <Link href="/dashboard" style={{
              display: 'inline-flex',
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: '#3B82F6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none'
            }}>
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              Return to Dashboard
            </Link>
          </div>
        ) : (
          /* Exercise Card */
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
                  Phrase {currentPhraseIndex + 1} of {filteredPhrases.length}
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
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <button
                      onClick={handlePlayButtonClick}
                      disabled={loadingAudio}
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
                      ) : isPlaying ? (
                        <Pause style={{ 
                          width: '1.75rem', 
                          height: '1.75rem'
                        }} />
                      ) : (
                        <Play style={{ 
                          width: '1.75rem', 
                          height: '1.75rem',
                          marginLeft: '4px' // Slight adjustment for the play icon
                        }} />
                      )}
                    </button>
                  </div>
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
                    backgroundColor: '#F0F9FF', // Light blue background
                    borderRadius: '0.75rem',
                    border: '1px solid #BFDBFE',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    marginTop: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {/* Score section */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#1E40AF',
                          margin: 0
                        }}>
                          Pronunciation Assessment
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: '#EFF6FF',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontWeight: '600'
                        }}>
                          <Trophy style={{ width: '1rem', height: '1rem', color: '#FFD166' }} />
                          <span style={{ color: '#2563EB' }}>
                            {feedback.accuracy}% Score
                      </span>
                        </div>
                      </div>
                      
                      {/* Score progress bar */}
                      <div style={{
                        width: '100%',
                        height: '0.75rem',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                        marginBottom: '1rem'
                      }}>
                        <div 
                          style={{
                            height: '100%',
                            width: `${feedback.accuracy}%`,
                            background: 
                              feedback.accuracy >= 80 ? 'linear-gradient(to right, #059669, #10B981)' : 
                              feedback.accuracy >= 50 ? 'linear-gradient(to right, #FFD166, #FBBF24)' : 
                              'linear-gradient(to right, #EF4444, #F87171)',
                            borderRadius: '9999px',
                            transition: 'width 0.8s ease-in-out'
                          }}
                        />
                          </div>
                      
                      {/* Feedback message */}
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        border: '1px solid #E5E7EB'
                      }}>
                        <p style={{
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          color: '#4B5563',
                          marginBottom: '0.5rem'
                        }}>
                          {feedback.message}
                        </p>
                        
                        {/* Show transcript */}
                        {feedback.transcription && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '0.375rem',
                            border: '1px dashed #D1D5DB'
                          }}>
                            <p style={{
                              fontSize: '0.85rem',
                              color: '#6B7280',
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              "<span style={{ color: '#4B5563', fontWeight: '500' }}>{feedback.transcription}</span>"
                            </p>
                        </div>
                      )}
                    </div>
                      
                      {/* Suggestions list */}
                      {feedback.suggestions.length > 0 && (
                        <div style={{
                          marginTop: '0.5rem'
                        }}>
                          <h4 style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#4B5563',
                            marginBottom: '0.5rem'
                          }}>
                            Tips for improvement:
                          </h4>
                          <ul style={{
                            padding: '0 0 0 1.25rem',
                            margin: 0,
                            fontSize: '0.85rem',
                            color: '#6B7280'
                          }}>
                            {feedback.suggestions.map((suggestion, index) => (
                              <li key={index} style={{ marginBottom: '0.25rem' }}>{suggestion}</li>
                            ))}
                          </ul>
                    </div>
                  )}
                  
                      {/* Action buttons */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '1rem'
                      }}>
                        <button
                          onClick={() => handlePlayButtonClick()}
                          disabled={isPlaying || isRecording}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#3B82F6',
                            cursor: 'pointer'
                          }}
                        >
                          <RepeatIcon style={{ width: '1rem', height: '1rem' }} />
                          Listen Again
                        </button>
                        
                        <button
                          onClick={() => {
                            setFeedback(null);
                            setRecordingComplete(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'white',
                            border: '1px solid #D1D5DB',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#3B82F6',
                            cursor: 'pointer'
                          }}
                        >
                          <RefreshCw style={{ width: '1rem', height: '1rem' }} />
                          Try Again
                        </button>
                      </div>
                      </div>
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
                    resetExerciseState();
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
                  if (currentPhraseIndex < filteredPhrases.length - 1) {
                    setCurrentPhraseIndex(currentPhraseIndex + 1);
                    resetExerciseState();
                  }
                }}
                disabled={currentPhraseIndex === filteredPhrases.length - 1}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  backgroundColor: currentPhraseIndex === filteredPhrases.length - 1 ? '#F3F4F6' : '#3B82F6',
                  color: currentPhraseIndex === filteredPhrases.length - 1 ? '#9CA3AF' : 'white',
                  fontWeight: '600',
                  cursor: currentPhraseIndex === filteredPhrases.length - 1 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: currentPhraseIndex === filteredPhrases.length - 1 ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.3)'
                }}
              >
                Next
                <ChevronRight style={{ width: '1rem', height: '1rem' }} />
              </button>
                </div>
          </div>
        )}

        {/* Tips Container - only show when exercises are loaded and available */}
        {!isLoadingExercises && practicePhrases.length > 0 && (
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
              <span style={{ fontSize: '1.5rem' }}>💡</span> Tips for Practice
            </h3>
            <ul style={{
              listStyleType: 'none',
              padding: '0',
              margin: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <li style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '1rem',
                color: '#4B5563',
                lineHeight: '1.5'
              }}>
                <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span> 
                Listen to the audio carefully before attempting to repeat.
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
                Practice speaking slowly and clearly for better results.
              </li>
            </ul>
          </div>
        )}
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
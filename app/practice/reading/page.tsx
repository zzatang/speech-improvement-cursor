"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  Timer,
  Headphones,
  Loader2,
  Trophy,
  RepeatIcon,
  RefreshCw,
  Square
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getUserProfile, 
  upsertUserProfile, 
  updateUserProfile,
  updateStreakCount
} from '@/lib/supabase/services/user-service';
import { 
  saveUserProgress, 
  getExercisesByType 
} from '@/lib/supabase/services/exercise-service';
import { SpeechExercise } from '@/lib/supabase/types';

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

// Interface for reading exercise from Supabase
interface ReadingText {
  id: string | number;
  title: string;
  text: string;
  focus: string;
  difficulty: string;
  targetWordsPerMinute?: number;
}

// Add this interface after the READING_TEXTS array
interface FeedbackData {
  message: string;
  score: number;
  transcript: string;
  suggestions: string[];
}

export default function ReadingPracticePage() {
  // State cleaned of visual pacing vars
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [volume, setVolume] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(0.7);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false); 
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [readingTexts, setReadingTexts] = useState<ReadingText[]>(READING_TEXTS);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  
  // Add filter state
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [filteredTexts, setFilteredTexts] = useState<ReadingText[]>(READING_TEXTS);
  
  // Refs cleaned of timerRef
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Add state for progress and recordingComplete
  const [progress, setProgress] = useState(0);
  const [recordingComplete, setRecordingComplete] = useState(false);
  
  // Use filteredTexts for the current text
  const currentText = filteredTexts[currentTextIndex];
  
  // Apply difficulty filter whenever it changes or when reading texts change
  useEffect(() => {
    if (!difficultyFilter) {
      // If no filter is set, show all texts
      setFilteredTexts(readingTexts);
      // Reset to first text when filter changes
      setCurrentTextIndex(0);
      return;
    }
    
    // Filter the texts based on difficulty
    const filtered = readingTexts.filter(text => text.difficulty === difficultyFilter);
    setFilteredTexts(filtered);
    
    // Reset to the first text when filter changes
    setCurrentTextIndex(0);
  }, [difficultyFilter, readingTexts]);
  
  // Fetch exercises from Supabase
  useEffect(() => {
    async function fetchExercises() {
      try {
        setIsLoadingExercises(true);
        console.log("Fetching reading exercises...");
        
        // Fetch reading-type exercises from Supabase
        const exercises = await getExercisesByType('reading');
        console.log("Reading exercises result:", exercises);
        
        if (exercises && exercises.data && Array.isArray(exercises.data) && exercises.data.length > 0) {
          console.log(`Found ${exercises.data.length} reading exercises`);
          
          // Convert Supabase exercises to the format used by this component
          const formattedExercises: ReadingText[] = exercises.data.map(exercise => {
            // Extract content based on the exercise structure
            const content = exercise.content as any;
            
            // Map difficulty level to string
            let difficultyText = "Easy";
            if ([3, 4].includes(exercise.difficulty_level)) difficultyText = "Medium";
            else if (exercise.difficulty_level === 5) difficultyText = "Hard";
            
            return {
              id: exercise.id,
              title: exercise.title || "Reading Exercise",
              text: content?.text || "Practice reading this text",
              focus: content?.focus || "Reading Practice",
              difficulty: difficultyText,
              targetWordsPerMinute: content?.targetWordsPerMinute || 90
            };
          });
          
          if (formattedExercises.length > 0) {
            console.log("Setting formatted reading exercises:", formattedExercises);
            setReadingTexts(formattedExercises);
          } else {
            console.warn("No formatted reading exercises found, using fallback data");
            // Keep default texts as fallback
          }
        } else {
          console.warn("No reading exercises found in database or error occurred, using fallback data");
          // Check if we're using mock client
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.warn("Using sample data because Supabase credentials are missing");
          }
          
          // Provide some sample data for local development or when DB connection fails
          const sampleTexts: ReadingText[] = [
            {
              id: "sample-1",
              title: "The Rainbow",
              text: "Red and yellow and pink and green, purple and orange and blue. I can sing a rainbow, sing a rainbow, sing a rainbow too.",
              focus: "Vowel Sounds",
              difficulty: "Easy",
              targetWordsPerMinute: 80
            },
            {
              id: "sample-2",
              title: "Peter Piper",
              text: "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked. If Peter Piper picked a peck of pickled peppers, where's the peck of pickled peppers Peter Piper picked?",
              focus: "P Sounds",
              difficulty: "Hard",
              targetWordsPerMinute: 110
            },
            {
              id: "sample-3",
              text: "She sells seashells by the seashore. The shells she sells are surely seashells. So if she sells shells on the seashore, I'm sure she sells seashore shells.",
              title: "Seashells",
              focus: "S Sounds",
              difficulty: "Medium",
              targetWordsPerMinute: 95
            },
            {
              id: "sample-4",
              title: "The Weather",
              text: "Whether the weather is warm, whether the weather is hot, we have to put up with the weather, whether we like it or not.",
              focus: "Th and W Sounds",
              difficulty: "Medium",
              targetWordsPerMinute: 90
            },
            {
              id: "sample-5",
              title: "Fuzzy Wuzzy",
              text: "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn't fuzzy, was he?",
              focus: "Z and W Sounds",
              difficulty: "Easy",
              targetWordsPerMinute: 85
            }
          ];
          
          setReadingTexts(sampleTexts);
        }
      } catch (error) {
        console.error("Error loading reading exercises from Supabase:", error);
        // Use the default texts in case of error
      } finally {
        setIsLoadingExercises(false);
      }
    }
    
    fetchExercises();
  }, []);
  
  // Memoized stopRecording function
  const stopRecording = () => {
    console.log('[Reading] stopRecording called');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      console.log('[Reading] stopRecording: MediaRecorder stopped and tracks closed');
    } else {
      console.log('[Reading] stopRecording: MediaRecorder not recording or not initialized');
    }
  };

  // Functions cleaned of visual pacing logic
  const resetExercise = useCallback(() => {
    console.log('[Reading] resetExercise called, isRecording:', isRecording);
    // Reset audio state
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear audio source
    }
    setIsPlayingAudio(false);
    setIsLoadingAudio(false);

    // Reset recording state
    setFeedback(null);
    if (isRecording) {
      console.log('[Reading] resetExercise: calling stopRecording');
      stopRecording(); // Make sure recording stops if exercise resets
    }
  }, [isRecording, stopRecording, audioRef, setFeedback, setIsPlayingAudio, setIsLoadingAudio]); // Updated dependencies for resetExercise
  
  const goToNextText = () => {
    setCurrentTextIndex(prev => (prev + 1) % filteredTexts.length);
    resetExercise();
  };
  
  const goToPreviousText = () => {
    setCurrentTextIndex(prev => (prev - 1 + filteredTexts.length) % filteredTexts.length);
    resetExercise();
  };
  
  const startRecording = async () => {
    console.log('[Reading] startRecording called');
    if (isRecording) {
      console.log('[Reading] startRecording: calling stopRecording because already recording');
      stopRecording();
      return;
    }
    // Stop any audio playback before recording
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      console.log('[Reading] Microphone stream acquired', stream);
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('[Reading] ondataavailable', event);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('[Reading] audioChunksRef.current length:', audioChunksRef.current.length);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        console.log('[Reading] onstop called');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        console.log('[Reading] audioBlob size:', audioBlob.size);
        setRecordingComplete(true);
        analyzeRecording(audioBlob);
      };
      setIsRecording(true);
      setProgress(0);
      mediaRecorderRef.current.start();
      console.log('[Reading] MediaRecorder started');
      // Progress animation
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
      console.error('[Reading] Error in startRecording', error);
    }
  };
  
  const analyzeRecording = async (blob: Blob) => {
    console.log('[Reading] analyzeRecording called, blob size:', blob.size);
    try {
      setFeedback({
        message: "Analyzing your reading...",
        score: 0,
        transcript: "",
        suggestions: []
      });
      const formData = new FormData();
      formData.append('audio', blob, 'reading.wav');
      
      let targetSound = '';
      if (currentText.focus.includes('P Sound')) targetSound = 'p';
      else if (currentText.focus.includes('S Sound')) targetSound = 's';
      else if (currentText.focus.includes('Th')) targetSound = 'th';
      else if (currentText.focus.includes('Vowel')) targetSound = 'vowel';
      
      if (targetSound) formData.append('targetSound', targetSound);
      formData.append('targetText', currentText.text);
      formData.append('languageCode', 'en-AU');
      
      // Get the current user ID from Clerk
      const { userId } = await fetch('/api/auth').then(res => res.json());
      if (!userId) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch('/api/speech/asr', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`ASR API failed: ${response.status}`);
      const data = await response.json();
      
      const transcript = data.transcript;
      if (!transcript) {
        setFeedback({
          message: "Couldn't hear clearly. Try speaking louder?",
          score: 0,
          transcript: "",
          suggestions: [
            "Speak louder and clearer",
            "Make sure your microphone is working properly",
            "Try in a quieter environment"
          ]
        });
        return;
      }
      
      // Calculate accuracy score based on word matching algorithm
      // Similar to the one in repeat/page.tsx
      const calculateAccuracy = (target: string, actual: string): number => {
        if (!actual) return 0;
        
        // Normalize strings for comparison
        const normalizedTarget = target.toLowerCase().trim();
        const normalizedActual = actual.toLowerCase().trim();
        
        // Simple word-based comparison
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
      
      let exerciseScore = 0;
      let feedbackMessage = '';
      let suggestions: string[] = [];
      
      // Check if the phoneticAnalysis or targetSoundAnalysis exists
      if (data.phoneticAnalysis && typeof data.phoneticAnalysis.overallScore === 'number' && data.pronunciationAssessment) { 
          // This block will likely NOT be hit for en-AU due to missing pronunciationAssessment
          exerciseScore = data.phoneticAnalysis.overallScore;
          if (exerciseScore >= 90) {
            feedbackMessage = `Excellent reading! Pronunciation score: ${exerciseScore}%.`;
            suggestions = ["Continue practicing to maintain your skills"];
          }
          else if (exerciseScore >= 70) {
            feedbackMessage = `Good job! Pronunciation score: ${exerciseScore}%.`;
            suggestions = ["Focus on speaking a bit more clearly", "Pay attention to the rhythm of the words"];
          }
          else {
            feedbackMessage = `Nice try! Pronunciation score: ${exerciseScore}%.`;
            suggestions = ["Try reading slower and more clearly", "Practice each sound separately before putting them together"];
          }
          
          if (data.phoneticAnalysis.suggestions && data.phoneticAnalysis.suggestions.length > 0) {
              suggestions.unshift(data.phoneticAnalysis.suggestions[0]);
          }
      } else if (data.targetSoundAnalysis && targetSound) {
          // Use target sound analysis if available
          const analysis = data.targetSoundAnalysis;
          exerciseScore = analysis.accuracy;
          
          if (exerciseScore >= 90) {
            feedbackMessage = `Excellent reading! Your ${currentText.focus} pronunciation was very clear.`;
            suggestions = ["Continue practicing to maintain your skills", "Try more challenging texts"];
          } else if (exerciseScore >= 70) {
            feedbackMessage = `Good job! Your ${currentText.focus} pronunciation was mostly clear.`;
            suggestions = ["Focus on sounds that were challenging", "Practice saying the difficult words slowly"];
        } else {
            feedbackMessage = `Nice try! Your ${currentText.focus} needs a bit more practice.`;
            suggestions = [
              `Focus on the ${currentText.focus} sounds specifically`,
              "Try breaking down difficult words into smaller sounds",
              "Listen to the audio again and repeat after it"
            ];
        }
      } else {
        // Fallback for en-AU (or any case where assessment fails)
        // Calculate accuracy using the word matching algorithm
        exerciseScore = calculateAccuracy(currentText.text, transcript);
        
        if (exerciseScore >= 80) {
          feedbackMessage = `Excellent reading! I understood your speech very clearly.`;
          suggestions = [
            "Detailed pronunciation scoring is not available for this accent.",
            "Continue practicing with different texts to maintain your skills.",
            "Try reading with more expression and varying your pace."
          ];
        } else if (exerciseScore >= 60) {
          feedbackMessage = `Good effort! I understood most of what you said.`;
          suggestions = [
            "Detailed pronunciation scoring is not available for this accent.",
            "Try reading a bit slower for better clarity.",
            "Focus on the words that might have been misunderstood in the transcript."
          ];
        } else {
          feedbackMessage = `Keep practicing! Reading aloud takes time to develop.`;
          suggestions = [
            "Detailed pronunciation scoring is not available for this accent.",
            "Try breaking the text into smaller parts and practice each part.",
            "Listen to the audio again and pay attention to the rhythm.",
            "Speak more slowly and enunciate each word clearly."
          ];
        }
      }
      
      setFeedback({
        message: feedbackMessage,
        score: exerciseScore,
        transcript: transcript,
        suggestions: suggestions
      });
      
      // Save the user's progress to Supabase
      try {
        // Import the saveUserProgress function and user service
        const { saveUserProgress } = await import('@/lib/supabase/services/exercise-service');
        
        // Create a consistent exercise ID format that includes text title and focus
        const exerciseId = typeof currentText.id === 'string' ? 
          currentText.id : // Use the actual Supabase ID if it's a string
          `reading_${currentText.title.toLowerCase().replace(/\s+/g, '_')}_${currentTextIndex}`;
        
        // Prepare feedback message for storage
        const storageFeedbackMsg = `Score: ${exerciseScore}%. Transcript: "${transcript}". ${feedbackMessage}`;
        
        // Save the progress
        const progressResult = await saveUserProgress({
          user_id: userId,
          exercise_id: exerciseId,
          score: exerciseScore,
          completed_at: new Date().toISOString(),
          feedback: storageFeedbackMsg,
          attempts: 1
        });
        
        if (progressResult.error) {
          throw new Error("Error saving reading progress");
        }
        
        // Update the user's overall progress using the service function
        // This will correctly calculate overall progress based on all exercises
        const { updateUserProfile, updateStreakCount } = await import('@/lib/supabase/services/user-service');
        
        // Update overall progress (this recalculates based on all progress records)
        await updateUserProfile(userId);
        
        // Update streak count to maintain activity streak
        await updateStreakCount(userId, 1);
      } catch (saveError) {
        throw new Error("Failed to save reading progress");
      }
    } catch (error) {
      setFeedback({
        message: "Sorry, couldn't analyze your reading.",
        score: 0,
        transcript: "",
        suggestions: ["Please try again later", "Check your microphone connection"]
      });
    }
  };
  
  const playAudio = async () => {
    try {
      setIsLoadingAudio(true);
      setIsPlayingAudio(false);
      
      // Create a new audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      // Clear any existing audio
      audioRef.current.pause();
      audioRef.current.src = '';
      
      // Set up volume control
      audioRef.current.volume = volume ? volumeLevel : 0;
      
      // Fetch audio from TTS API
      const response = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText.text,
          voice: 'en-AU-Standard-B', // Australian male voice
          speakingRate: 1.0,
          pitch: 0.0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // TTS API error details
        throw new Error('Failed to get audio from TTS API');
      }
      
      // Create object URL from audio blob
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Set up audio playback
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl); // Clean up the URL
      };
      
      // Play the audio
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlayingAudio(true);
              setIsLoadingAudio(false);
            })
            .catch((e) => {
              // Handle play() rejection (e.g., user hasn't interacted with document yet)
              setIsPlayingAudio(false);
              setIsLoadingAudio(false);
            });
        }
      } catch (playError) {
        setIsPlayingAudio(false);
        setIsLoadingAudio(false);
      }
    } catch (error) {
      // Error playing audio
      setIsPlayingAudio(false);
      setIsLoadingAudio(false);
    }
  };
  
  // Reset the exercise when changing texts
  useEffect(() => {
    resetExercise();
  }, [currentTextIndex, resetExercise]);

  // ... rest of component ...
  
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
      
      {/* Add the hidden audio element here */}
      <audio ref={audioRef} />
      
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
          
          {/* Right side controls */}          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem' 
          }}>
            {/* Volume Control Group */} 
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Button 
                variant="outline"
                    size="icon"
                onClick={() => setVolume(!volume)}
                aria-label={volume ? "Mute volume" : "Unmute volume"}
                style={{ width: '2.5rem', height: '2.5rem' }}
                  >
                {volume ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  </Button>
              <Slider
                value={[volumeLevel * 100]}
                max={100}
                step={1}
                className="w-[100px]"
                onValueChange={(value) => {
                  const newLevel = value[0] / 100;
                  setVolumeLevel(newLevel);
                  if (!volume && newLevel > 0) { setVolume(true); }
                }}
                disabled={!volume}
              />
                </div>
            
            {/* Settings Button */}
                        <Button 
                          variant="outline" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Reading settings"
              style={{ width: '2.5rem', height: '2.5rem' }}
            >
              <Settings className="h-5 w-5" />
                        </Button>

            {/* User Button */} 
            <UserButton afterSignOutUrl="/" />
                      </div>
                      </div>
      </header>
      
      {/* Main Content Area */}
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
        
        {/* Difficulty Filter */}
        {!isLoadingExercises && readingTexts.length > 0 && (
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
            
            {/* Filter indicator */}
            {difficultyFilter && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '1rem',
                backgroundColor: '#EFF6FF',
                color: '#3B82F6',
                fontWeight: '500',
                fontSize: '0.875rem',
                border: '1px solid #BFDBFE'
              }}>
                Showing {filteredTexts.length} of {readingTexts.length} texts
              </div>
            )}
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
            <p style={{ color: '#4B5563' }}>Loading reading exercises...</p>
          </div>
        ) : readingTexts.length === 0 ? (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#EF4444', marginBottom: '1rem' }}>No reading exercises found.</p>
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
        /* Reading Card */
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
                  {currentText.title}
                </h2>
                <p style={{
                  fontSize: '1rem',
                  opacity: '0.9'
                }}>
                  {currentText.focus} - {currentText.difficulty}
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
                Text {currentTextIndex + 1} of {filteredTexts.length}
              </div>
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
              
              {/* Reading Text Display */}
              <div 
                ref={containerRef}
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: '#EFF6FF',
                borderRadius: '1rem',
                border: '2px dashed #3B82F6',
                textAlign: 'center'
              }}
            >
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#2563EB',
                lineHeight: '1.5'
              }}>
                {currentText.text}
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
                }}>1. Listen to the passage</p>
                <button 
                  onClick={playAudio}
                  disabled={isLoadingAudio || isRecording}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    borderRadius: '50%',
                    backgroundColor: isPlayingAudio ? '#06D6A0' : '#3B82F6',
                    color: 'white',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (isLoadingAudio || isRecording) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                    animation: isPlayingAudio ? 'pulse 1s infinite ease-in-out' : 'none',
                    opacity: (isLoadingAudio || isRecording) ? '0.7' : '1',
                    transition: 'all 0.2s ease'
                  }}
                  aria-label={isPlayingAudio ? "Pause" : "Play"}
                >
                  {isLoadingAudio ? (
                    <Loader2 style={{ width: '1.75rem', height: '1.75rem' }} className="animate-spin" />
                  ) : isPlayingAudio ? (
                    <Pause style={{ width: '1.75rem', height: '1.75rem' }} />
                  ) : (
                    <Play style={{ width: '1.75rem', height: '1.75rem', marginLeft: '4px' }} />
                  )}
                </button>
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
                  <button
                    onClick={stopRecording}
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
                ) : (
                  <button
                    onClick={startRecording}
                    disabled={isPlayingAudio || isLoadingAudio}
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
                      cursor: (isPlayingAudio || isLoadingAudio) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
                      opacity: (isPlayingAudio || isLoadingAudio) ? '0.7' : '1',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Mic style={{ width: '1.75rem', height: '1.75rem' }} />
                  </button>
                )}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#4B5563'
                }}>
                  {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                </p>
                </div>
                
              {/* Feedback section - enhanced */}
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
                        Reading Assessment
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
                          {feedback.score}% Score
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
                          width: `${feedback.score}%`,
                          background: 
                            feedback.score >= 80 ? 'linear-gradient(to right, #059669, #10B981)' : 
                            feedback.score >= 50 ? 'linear-gradient(to right, #FFD166, #FBBF24)' : 
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
                      {feedback.transcript && (
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
                            "<span style={{ color: '#4B5563', fontWeight: '500' }}>{feedback.transcript}</span>"
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
                        onClick={playAudio}
                        disabled={isPlayingAudio || isRecording}
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
                  onClick={goToPreviousText}
              disabled={isPlayingAudio || isRecording || isLoadingAudio}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: currentTextIndex === 0 ? '#F3F4F6' : '#EFF6FF',
                color: currentTextIndex === 0 ? '#9CA3AF' : '#2563EB',
                fontWeight: '600',
                cursor: currentTextIndex === 0 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: currentTextIndex === 0 ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              Previous
            </button>
            
            <button
                  onClick={goToNextText}
              disabled={isPlayingAudio || isRecording || isLoadingAudio || currentTextIndex === filteredTexts.length - 1}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                backgroundColor: currentTextIndex === filteredTexts.length - 1 ? '#F3F4F6' : '#3B82F6',
                color: currentTextIndex === filteredTexts.length - 1 ? '#9CA3AF' : 'white',
                fontWeight: '600',
                cursor: currentTextIndex === filteredTexts.length - 1 ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: currentTextIndex === filteredTexts.length - 1 ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.3)'
              }}
            >
              Next
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
        )}
          
          {/* Tips Section - only show when exercises are loaded and available */}
          {!isLoadingExercises && filteredTexts.length > 0 && (
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
              <span style={{ fontSize: '1.5rem' }}>💡</span> 
              Tips for "{currentText.focus}"
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
                Try to maintain a steady rhythm when reading
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
                Pay special attention to the focus sounds in each text
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
                Start slower and gradually increase your reading speed
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
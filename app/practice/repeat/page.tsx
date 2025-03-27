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

// Sample phrases for practice (would be fetched from API in production)
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
  
  // Audio processing
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const currentPhrase = PRACTICE_PHRASES[currentPhraseIndex];
  
  // Function to play the TTS audio
  const playAudio = async () => {
    if (!volume) return;
    
    try {
      setLoadingAudio(true);
      
      // In a real implementation, this would call the TTS API
      // For now, we'll simulate the API call
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, we would fetch from the API:
      // const response = await fetch('/api/speech/tts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: currentPhrase.text })
      // });
      // const audioBlob = await response.blob();
      
      // For demo purposes, we'll just use a static audio file
      if (audioRef.current) {
        audioRef.current.src = `/demo-audio-${currentPhraseIndex + 1}.mp3`;
        audioRef.current.onloadedmetadata = () => {
          setLoadingAudio(false);
          setIsPlaying(true);
          audioRef.current?.play();
        };
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
        };
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoadingAudio(false);
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
      
      // In a real implementation, this would call the ASR API
      // For now, we'll simulate the API call
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, we would send to the API:
      // const formData = new FormData();
      // formData.append('audio', blob, 'recording.wav');
      // formData.append('targetText', currentPhrase.text);
      // 
      // const response = await fetch('/api/speech/asr', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      
      // Simulate different feedback based on the phrase
      let simulatedFeedback = "";
      if (currentPhraseIndex === 0) {
        simulatedFeedback = "Great job with the 'r' sounds! Try to emphasize the 'r' in 'rapidly' a bit more.";
      } else if (currentPhraseIndex === 1) {
        simulatedFeedback = "Good attempt! The 's' sounds were clear, but try to slow down when saying 'seashells'.";
      } else if (currentPhraseIndex === 2) {
        simulatedFeedback = "Excellent! Your 'l' sounds were very clear.";
      } else {
        simulatedFeedback = "Nice try! The 'th' sound in 'think' was perfect, but the 'th' in 'thin' needs a bit more practice.";
      }
      
      setFeedback(simulatedFeedback);
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
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <Image 
                src="/logo-icon.svg" 
                alt="Speech Buddy" 
                width={24} 
                height={24}
                className="animate-pulse-soft"
              />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container max-w-3xl flex-1 px-4 py-8">
        <div className="space-y-6">
          {/* Exercise Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary">Repeat After Me</h1>
            <p className="text-muted-foreground">
              Listen to the phrase, then record yourself saying it. We'll give you feedback on your pronunciation!
            </p>
          </div>
          
          {/* Exercise Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  {currentPhrase.focus} Practice
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setVolume(!volume)}
                  >
                    {volume ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm font-medium">
                    Difficulty: {currentPhrase.difficulty}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Phrase Display */}
              <div className="mb-6 rounded-lg bg-muted p-6 text-center">
                <h3 className="text-xl font-medium tracking-wide">
                  {currentPhrase.text}
                </h3>
              </div>
              
              {/* Controls */}
              <div className="space-y-6">
                {/* Audio Playback */}
                <div className="flex flex-col items-center gap-4">
                  <Button 
                    onClick={playAudio}
                    disabled={isPlaying || loadingAudio || isRecording}
                    className="h-16 w-16 rounded-full"
                  >
                    {loadingAudio ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  <span className="text-sm font-medium">
                    {loadingAudio 
                      ? "Loading audio..." 
                      : isPlaying 
                        ? "Playing..." 
                        : "Listen to the phrase"}
                  </span>
                </div>
                
                {/* Recording */}
                {!recordingComplete ? (
                  <div className="flex flex-col items-center gap-4">
                    <Button 
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isPlaying || loadingAudio || (isRecording && progress < 20)}
                      className={`h-16 w-16 rounded-full ${isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                    >
                      {isRecording ? (
                        <Square className="h-6 w-6" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                    </Button>
                    <span className="text-sm font-medium">
                      {isRecording 
                        ? "Recording... (tap to stop)" 
                        : "Record your voice"}
                    </span>
                    
                    {isRecording && (
                      <div className="w-full space-y-2">
                        <Progress value={progress} className="h-2 w-full" />
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">0s</span>
                          <span className="text-xs text-muted-foreground">5s</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="space-y-2 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Mic className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Recording complete!</span>
                    </div>
                  </div>
                )}
                
                {/* Feedback */}
                {loadingAnalysis && (
                  <div className="rounded-lg bg-muted p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>Analyzing your speech...</span>
                    </div>
                  </div>
                )}
                
                {feedback && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <AlertDescription className="py-2">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">🎯</span>
                          <p>{feedback}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="border-t bg-card p-4">
              <div className="flex w-full items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousPhrase}
                  disabled={loadingAnalysis}
                >
                  Previous Phrase
                </Button>
                
                <Button
                  onClick={goToNextPhrase}
                  disabled={loadingAnalysis}
                  className="gap-2"
                >
                  Next Phrase
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Better Pronunciation</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2">
                <li>Speak slowly and clearly when practicing new sounds</li>
                <li>Watch your mouth in a mirror to see how you're forming sounds</li>
                <li>Try to practice in a quiet environment for better recordings</li>
                <li>Listen to the phrase multiple times if needed before recording</li>
                <li>Don't worry about making mistakes - practice makes perfect!</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 
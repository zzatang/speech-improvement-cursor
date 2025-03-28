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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hidden audio element for potential TTS */}
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
            <h1 className="text-2xl font-bold text-primary">Reading Practice</h1>
            <p className="text-muted-foreground">
              Read along with the highlighted words at your own pace. Practice your pronunciation and fluency!
            </p>
          </div>
          
          {/* Reading Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {currentText.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentText.focus} - {currentText.difficulty}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Settings Panel */}
              {showSettings && (
                <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="mb-4 font-medium">Reading Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="wpm" className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          <span>Reading Speed: {wordsPerMinute} WPM</span>
                        </Label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setWordsPerMinute(currentText.targetWordsPerMinute)}
                          className="h-7 text-xs"
                        >
                          Set Recommended ({currentText.targetWordsPerMinute} WPM)
                        </Button>
                      </div>
                      <Slider 
                        id="wpm"
                        min={30} 
                        max={200} 
                        step={5}
                        value={[wordsPerMinute]} 
                        onValueChange={handleSpeedChange}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pacing-bar"
                        checked={showPacingBar}
                        onCheckedChange={setShowPacingBar}
                      />
                      <Label htmlFor="pacing-bar">Show Pacing Bar</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-advance"
                        checked={autoAdvance}
                        onCheckedChange={setAutoAdvance}
                      />
                      <Label htmlFor="auto-advance">Auto-advance to Next Text</Label>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pacing Bar */}
              {showPacingBar && (
                <div className="mb-4 space-y-1">
                  <Progress value={progress} className="h-2 w-full" />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Start</span>
                    <span className="text-xs text-muted-foreground">End</span>
                  </div>
                </div>
              )}
              
              {/* Reading Text Display */}
              <div 
                ref={containerRef}
                className="rounded-lg bg-muted p-6 text-lg leading-relaxed tracking-wide"
              >
                {words.map((word, index) => (
                  <span 
                    key={index} 
                    className={`mr-1 inline-block transition-all duration-200 ${getWordStyle(index)}`}
                  >
                    {word}
                  </span>
                ))}
              </div>
              
              {/* Controls */}
              <div className="mt-6 space-y-6">
                <div className="flex justify-center gap-4">
                  {/* Play/Pause Button */}
                  <Button 
                    onClick={startReading}
                    disabled={isRecording}
                    className="h-14 w-14 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                  
                  {/* Record Button */}
                  <Button 
                    onClick={startRecording}
                    className={`h-14 w-14 rounded-full ${isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                  >
                    <Mic className="h-6 w-6" />
                  </Button>
                </div>
                
                <div className="text-center text-sm">
                  <p className="font-medium">
                    {isPlaying 
                      ? "Follow along with the highlighted words" 
                      : "Press play to start"}
                    {isRecording && " - Recording your voice"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Current pace: {wordsPerMinute} words per minute
                  </p>
                </div>
                
                {/* Feedback */}
                {feedback && (
                  <Alert className="border-primary/20 bg-primary/5">
                    <AlertDescription className="py-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">⭐</span>
                        <p>{feedback}</p>
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
                  onClick={goToPreviousText}
                  disabled={isPlaying || isRecording}
                >
                  Previous Text
                </Button>
                
                <Button
                  onClick={goToNextText}
                  disabled={isPlaying || isRecording}
                  className="gap-2"
                >
                  Next Text
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reading Practice Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2">
                <li>Try to maintain a steady rhythm when reading</li>
                <li>Pay special attention to the focus sounds in each text</li>
                <li>Record yourself to hear how you sound</li>
                <li>Start slower and gradually increase your reading speed</li>
                <li>Take breaks between texts if you need to</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 
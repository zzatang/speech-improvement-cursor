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
  
  // Animate progress bar on load
  useEffect(() => {
    const timer = setTimeout(() => setProgress(42), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Dashboard Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image 
              src="/logo-icon.svg" 
              alt="Speech Buddy" 
              width={32} 
              height={32}
              className="animate-pulse-soft"
            />
            <h1 className="text-xl font-bold text-primary logo-text">Speech Buddy</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Day {streakCount}</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container flex-1 px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* Welcome Card */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Welcome Back, Star Speaker!
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  You're on a {streakCount}-day streak! Keep it up!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 w-full" />
                
                <div className="mt-6 flex flex-col gap-4">
                  <h3 className="text-lg font-medium">Continue Your Journey</h3>
                  <div className="grid gap-3">
                    <Link href="/practice/repeat">
                      <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Mic className="h-4 w-4 text-primary" />
                          </div>
                          <span>Repeat After Me</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/practice/reading">
                      <Button variant="outline" className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
                            <BookOpen className="h-4 w-4 text-secondary" />
                          </div>
                          <span>Reading Practice</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Speech Adventure Map
                </CardTitle>
                <CardDescription>
                  Track your progress through speech sounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Path */}
                  <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-muted" />
                  
                  {/* Progress Nodes */}
                  <div className="relative space-y-8 py-2">
                    {progressNodes.map((node) => (
                      <div 
                        key={node.id}
                        className={`relative flex flex-col items-center ${!node.available ? 'opacity-50' : ''}`}
                      >
                        <div 
                          className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 
                            ${node.complete 
                              ? 'border-primary bg-primary text-primary-foreground' 
                              : node.available 
                                ? 'border-primary bg-background' 
                                : 'border-muted bg-muted'}`}
                        >
                          {node.complete ? (
                            <Star className="h-5 w-5" />
                          ) : (
                            <span className="font-medium">{node.id}</span>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <h4 className="font-medium">{node.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {node.complete 
                              ? 'Completed!' 
                              : node.available 
                                ? 'In progress' 
                                : 'Locked'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Avatar Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Your Speech Buddy
                </CardTitle>
                <CardDescription>
                  Customize your companion for your speech journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="avatar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="avatar">Choose Avatar</TabsTrigger>
                    <TabsTrigger value="customize">Customize</TabsTrigger>
                  </TabsList>
                  <TabsContent value="avatar" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {avatarOptions.map((avatar) => (
                        <div 
                          key={avatar.id}
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={`flex cursor-pointer flex-col items-center rounded-lg p-4 transition-colors hover:bg-muted/50 ${
                            selectedAvatar === avatar.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <Image
                              src={avatar.image}
                              alt={avatar.name}
                              width={64}
                              height={64}
                              className={selectedAvatar === avatar.id ? "animate-bounce-gentle" : ""}
                            />
                          </div>
                          <span className="text-center text-sm font-medium">{avatar.name}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="customize" className="mt-4">
                    <div className="flex flex-col gap-6">
                      <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
                        <Image
                          src={avatarOptions.find(a => a.id === selectedAvatar)?.image || '/logo-icon.svg'}
                          alt="Selected Avatar"
                          width={96}
                          height={96}
                          className="animate-bounce-gentle"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Accessories</h4>
                          <div className="flex gap-2">
                            {['Hat', 'Glasses', 'Bowtie', 'Cape'].map((item, i) => (
                              <Button key={i} variant="outline" size="sm">
                                {item}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Colors</h4>
                          <div className="flex gap-2">
                            {['blue', 'red', 'green', 'purple'].map((color, i) => (
                              <div 
                                key={i}
                                className={`h-8 w-8 cursor-pointer rounded-full border-2 border-border ${
                                  color === 'blue' 
                                    ? 'bg-blue-500' 
                                    : color === 'red' 
                                      ? 'bg-red-500' 
                                      : color === 'green' 
                                        ? 'bg-green-500' 
                                        : 'bg-purple-500'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button className="w-full">Save My Buddy</Button>
              </CardFooter>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  See the badges you've earned so far!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { name: "First Login", icon: "🎉", unlocked: true },
                    { name: "3-Day Streak", icon: "🔥", unlocked: true },
                    { name: "R Master", icon: "🏆", unlocked: true },
                    { name: "S Champion", icon: "⭐", unlocked: true },
                    { name: "Word Wizard", icon: "📚", unlocked: false },
                    { name: "Sentence Pro", icon: "🎯", unlocked: false },
                  ].map((badge, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col items-center rounded-lg p-4 text-center ${
                        !badge.unlocked ? 'opacity-50' : ''
                      }`}
                    >
                      <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full 
                        ${badge.unlocked ? 'bg-primary/10' : 'bg-muted'}`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                      </div>
                      <span className="text-xs font-medium">{badge.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {badge.unlocked ? 'Earned' : 'Locked'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 
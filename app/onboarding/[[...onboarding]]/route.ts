import { NextRequest, NextResponse } from "next/server";

// Function to handle static path generation for our onboarding routes
export function generateStaticParams() {
  return [
    { onboarding: [] },
    { onboarding: ['sign-up'] }
  ];
}

// Placeholder GET function to make the route valid
export async function GET(request: NextRequest) {
  // In practice, this won't be called directly since the page.tsx handles the rendering
  return NextResponse.redirect(new URL("/onboarding", request.url));
} 
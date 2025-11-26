"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignUpButton, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import ThumbnailGenerator from "@/components/ThumbnailGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="sticky top-0 z-10 bg-black/50 backdrop-blur-md p-4 border-b border-white/10 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎨</span>
          <span className="font-bold text-white text-lg">
            Clickbait Thumbnail Generator
          </span>
        </div>
        <UserButton />
      </header>
      <main className="p-8">
        <Authenticated>
          <AuthenticatedContent />
        </Authenticated>
        <Unauthenticated>
          <UnauthenticatedContent />
        </Unauthenticated>
      </main>
    </div>
  );
}

function AuthenticatedContent() {
  const { user } = useUser();
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 mb-4">
          Generate Viral Thumbnails
        </h1>
        <p className="text-gray-300 text-lg">
          Upload your image and get 10 eye-catching clickbait thumbnail
          variations powered by AI
        </p>
      </div>
      <ThumbnailGenerator userId={user?.id || "anonymous"} />
    </div>
  );
}

function UnauthenticatedContent() {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 mb-4">
          Clickbait Thumbnail Generator
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Transform your boring images into attention-grabbing thumbnails that
          get clicks!
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Get Started</h2>
        <div className="flex flex-col gap-4">
          <SignInButton mode="modal">
            <button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl border border-white/30 transition-all">
              Create Account
            </button>
          </SignUpButton>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-3xl mb-2">🚀</div>
          <div className="text-white font-semibold">10 Variations</div>
          <div className="text-gray-400 text-sm">Per upload</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-white font-semibold">AI Powered</div>
          <div className="text-gray-400 text-sm">Gemini AI</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-white font-semibold">Click Worthy</div>
          <div className="text-gray-400 text-sm">Viral styles</div>
        </div>
      </div>
    </div>
  );
}

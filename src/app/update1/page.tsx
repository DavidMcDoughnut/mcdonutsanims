'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

export default function UpdatePage() {
  return (
    <>
      {/* SVG Filter Definition */}
      <svg className="fixed w-0 h-0 z-[9999]">
        <defs>
          <filter id='roughpaper' x='0%' y='0%' width='100%' height="100%">
            <feTurbulence type="fractalNoise" baseFrequency='0.12' result='noise' numOctaves="4" />
            <feDiffuseLighting in='noise' lightingColor='white' surfaceScale='8'>
              <feDistantLight azimuth='45' elevation='40' />
            </feDiffuseLighting>
          </filter>
        </defs>
      </svg>

      <main className="h-[100dvh] overflow-hidden">
        <div className="fixed inset-0">
          <Image
            src="/optimized/formbggrad.webp"
            alt="Background"
            fill
            priority
            className="object-cover animate-fade-to-dim"
          />
        </div>
        <div className="h-full overflow-y-auto px-4 md:px-8 py-4 md:py-8">
          <div className="relative flex min-h-full justify-center">
            <div 
              id="formcard" 
              className="w-full max-w-2xl p-4 md:px-12 md:pb-12 md:pt-6 border-2 border-blue rounded-3xl shadow-paper bg-white/80 backdrop-blur-md opacity-0 animate-fade-in-up relative overflow-hidden"
            >
              {/* Paper texture overlay */}
              <div 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  filter: 'url(#roughpaper)',
                  opacity: 0.04,
                  zIndex: 1
                }}
              />
              {/* Content container */}
              <div className="relative z-10">
                <div className="w-full mb-8">
                  <Image
                    src="/update-head.png"
                    alt="RSVP for Lauren & David"
                    width={800}
                    height={100}
                    className="w-full h-auto"
                    priority
                  />
                </div>
                {/* Your static content will go here */}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 
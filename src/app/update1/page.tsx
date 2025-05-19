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
        <div className="h-full overflow-y-auto px-4 md:px-8 py-4">
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
              <div className="relative z-10 text-blue">
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

                {/* Title Section */}
                <div className="text-start mb-12">
                  <div className="flex items-baseline gap-3">
                    <h1 className="text-2xl font-bold">May 19</h1>
                    <h2 className="text-lg">1 Month Out!</h2>
                  </div>
                </div>

                {/* Band Update Section */}
                <div className="mb-16">
                  <h2 className="text-xl font-semibold mb-4">Favorite New Band: <span className="text-green">Confirmed</span></h2>
                  <div className="space-y-4 text-default">
                    <p>Our favorite tropical Band/DJ duo is jamming with us Saturday!</p>
                    <p className="text-sm">Bon Entendeur, a French-Tropical-Electro-Duo, has been exploding recently and they're our favorite new group. You won't recognize the name (yet) but you'll probably recognize their songs and become a megafan like us</p>
                    <p className="text-sm">Their vibes are immaculate, not to mention PERFECT for this exact occasion. We can't wait to jam together with everyone</p>
                  </div>
                  <div className="mt-6">
                    {/* Band Images Placeholder */}
                  </div>
                  <div className="mt-6">
                    {/* Spotify Embed */}
                    <iframe 
                      style={{ borderRadius: '12px' }}
                      src="https://open.spotify.com/embed/artist/2lwjwKfYZCuPEJOo8t32CD?utm_source=generator" 
                      width="100%" 
                      height="352" 
                      frameBorder="0" 
                      allowFullScreen 
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Welcome Party Section */}
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-4">Welcome Party: New Location</h2>
                  <div className="space-y-4 text-default">
                    <p>We've moved the welcome party to Edmunds, right in the middle of the Cap Ferrat Marina</p>
                    <p>We wanted to optimize for convenience since people are traveling so far, and this is <em>much</em> closer to where most guests are staying, ~10min walk for most.</p>
                    <p>Not to mention, Cap Ferrat Marina is one of our favorite places in the world, we can't wait to share.</p>
                  </div>
                  <div className="mt-6">
                    {/* Welcome Party Images Placeholder */}
                  </div>
                </div>

                {/* Dress Code Section */}
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-4">Dress Code: More Info + Inspo</h2>
                  <div className="space-y-4 text-default">
                    <p>Thurs Welcome party: Riviera Casual</p>
                    <p>Fri Wedding: Riviera Formal</p>
                    <p>Sat Beach Club: Riviera Chic</p>
                  </div>
                  <div className="mt-6">
                    {/* Dress Code Images Placeholder */}
                  </div>
                </div>

                {/* Travel Section */}
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-4">Flights and Lodging: Best Time to Book!</h2>
                  <div className="space-y-4 text-default">
                    <p><strong>Flights:</strong> It's not too late to book, in fact best prices are now! The Great Trade War is sub-optimal timing, but one benefit is that flight prices have gone down a lot.</p>
                    <p><strong>Lodging:</strong> We still have plenty of Hotel rooms and AirBnBs held for guests that are already paid for, please reach out if interested!</p>
                    <p>We hope you won't let the travel logistics get in the way of joining us and we're here to help.</p>
                    <p>If you're still on the fence, please know we've pre-booked Airbnbs to make things as easy as possible <strong>(our treat!)</strong> and we are masters with miles <strong>(which we have to use anyways!)</strong></p>
                  </div>
                  <div className="mt-6">
                    {/* Travel Images Placeholder */}
                  </div>
                </div>

                {/* RSVP Section */}
                <div className="mb-16">
                  <h2 className="text-2xl font-semibold mb-4">RSVP</h2>
                  <div className="space-y-4 text-default">
                    {/* RSVP form or content will go here */}
                  </div>
                  <div className="mt-6">
                    {/* RSVP Images Placeholder */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 
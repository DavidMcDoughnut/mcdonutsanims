'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
              className="w-full max-w-2xl p-4 md:px-12 md:pb-12 md:pt-4 border-2 border-blue rounded-3xl shadow-paper bg-white/80 backdrop-blur-md opacity-0 animate-fade-in-up relative overflow-hidden"
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
                <div className="w-full mb-8 flex items-center justify-between">
                  {/* Home Button */}
                  <a 
                    href="https://themcdonuts.com" 
                    className="flex flex-col items-center cursor-pointer group/btn"
                  >
                    <Image
                      src="/villa-icon-1k.png"
                      alt="Home"
                      width={80}
                      height={80}
                      className="w-20 h-20 transform-gpu origin-center transition-transform duration-300 ease-out group-hover/btn:scale-[1.15]"
                    />
                    <span className="text-blue group-hover/btn:text-green text-sm tracking-widest group-hover/btn:tracking-[.25em] font-semibold uppercase transition-all duration-300 ease-out text-center">
                      Home
                    </span>
                  </a>

                  {/* Center Image */}
                  <div className="flex-1 mx-8 flex justify-center">
                    <Image
                      src="/update-head-clean.png"
                      alt="Updates"
                      width={500}
                      height={67}
                      className="h-auto"
                      priority
                    />
                  </div>

                  {/* RSVP Button */}
                  <a 
                    href="/rsvp" 
                    className="flex flex-col items-center cursor-pointer group/btn"
                  >
                    <Image
                      src="/brella-icon-1k.png"
                      alt="RSVP"
                      width={80}
                      height={80}
                      className="w-20 h-20 transform-gpu origin-center transition-transform duration-300 ease-out group-hover/btn:scale-[1.15]"
                    />
                    <span className="text-blue group-hover/btn:text-green text-sm tracking-widest group-hover/btn:tracking-[.25em] font-semibold uppercase transition-all duration-300 ease-out text-center">
                      RSVP
                    </span>
                  </a>
                </div>

                {/* Title Section */}
                <div className="text-start mb-12">
                  <div className="flex items-baseline gap-3">
                    <p className="text-xl md:text-2xl font-semibold tracking-wider">May 19: <span className="text-green font-semibold tracking-wider">1 Month Out!</span></p>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    <p className="text-sm tracking-wider leading-relaxed">Vendors are confirmed, temperatures are rising and The Great Trade War is (hopefully) ending... <span className="font-bold">Let's celebrate!</span></p>
                    <p className="text-sm tracking-wider leading-relaxed">We've been busy planning what we think will be a truly epic weekend and we can't wait to enjoy it with everyone.</p>
                    <p className="text-sm">If you haven't yet, <a href="https://themcdonuts.com/rsvp" target="_blank" rel="noopener noreferrer" className=" font-bold text-pink hover:text-green inline-flex items-center gap-1">Confirm Your RSVP Info<ArrowRight className="w-5 h-5" /></a></p>
                  </div>
                </div>

                {/* Band Update Section */}
                <div className="mb-16">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-wider mb-4">Favorite Band: <span className="text-green">Confirmed!</span></h2>
                  <div className="space-y-4 text-default">
                    <p className="text-sm tracking-wider leading-relaxed">We landed our favorite DJ duo to jam with us Saturday!</p>
                    <p className="text-sm tracking-wider leading-relaxed"><a href="https://www.instagram.com/bon_entendeur" target="_blank" rel="noopener noreferrer" className="text-pink font-bold hover:text-green">Bon Entendeur</a> is a French-Disco-Tropical-Electro-Duo that we absolutely LOVE and they're starting to explode. You might not know them (yet) but you'll recognize their songs and will become new megafans like us.</p>
                    <p className="text-sm tracking-wider leading-relaxed">Their vibes are immaculate, and they couldn't be a more PERFECT fit for this exact occasion. We can't wait to jam together with everyone!</p>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {/* Band Images */}
                    <div className="col-span-1 aspect-[3/4] relative border-2 border-white rounded-xl overflow-hidden">
                      <Image
                        src="/optimized/be-beach.webp"
                        alt="Bon Entendeur at the beach"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="col-span-1 aspect-[3/4] relative border-2 border-white rounded-xl overflow-hidden">
                      <Image
                        src="/optimized/be-tour3.webp"
                        alt="Bon Entendeur performing"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="col-span-1 aspect-[3/4] relative border-2 border-white rounded-xl overflow-hidden">
                      <Image
                        src="/optimized/be-tour2.webp"
                        alt="Bon Entendeur on stage"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  {/* Instagram Script */}
                  <script async src="//www.instagram.com/embed.js" />
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
                  <h2 className="text-xl md:text-2xl font-semibold tracking-wider mb-4">Welcome Party: <span className="text-green">Hot New Spot!</span></h2>
                  <div className="space-y-4 text-default">
                    <p className="text-sm tracking-wider leading-relaxed">We moved the welcome party to <a href="https://edmundsocialclub.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-pink hover:text-green">Edmunds Social Club</a> in the heart of the Cap Ferrat Marina</p>
                    <p className="text-sm tracking-wider leading-relaxed">We wanted to optimize for convenience given the travel. Edmunds is a ~10min walk from most of the hotels & Airbnbs</p>
                    <p className="text-sm tracking-wider leading-relaxed">Not to mention, the Cap Ferrat Marina is one of our favorite places in the world, we can't wait to share.</p>
                  </div>
                  <div className="mt-6">
                    {/* Welcome Party Images */}
                    <Image
                      src="/optimized/map-updated.webp"
                      alt="Map showing location of Edmunds Social Club in Cap Ferrat Marina"
                      width={3200}
                      height={2400}
                      className="w-full h-auto rounded-xl"
                      priority
                    />
                  </div>
                </div>

                {/* Dress Code Section */}
                <div className="mb-16">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-wider mb-4">Dress Code: <span className="text-green">Info + Inspo!</span><span className="text-orange"> (LB WIP)</span></h2>
                  <div className="space-y-4 text-default">
                    <p className="text-sm tracking-wider leading-relaxed">Welcome party: Riviera Casual</p>
                    <p className="text-sm tracking-wider leading-relaxed">Welcome party: Riviera Casual</p>
                    <p className="text-sm tracking-wider leading-relaxed">Fri Wedding: Riviera Formal</p>
                    <p className="text-sm tracking-wider leading-relaxed">Sat Beach Club: Riviera Chic</p>
                  </div>
                  <div className="mt-6">
                    {/* Dress Code Images Placeholder */}
                  </div>
                </div>

                {/* Travel Section */}
                <div className="mb-16">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-wider mb-4">Travel: <span className="text-green">Best Prices in 6 Months!</span></h2>
                  <div className="space-y-4 text-default">
                    <p className="text-sm tracking-wider leading-relaxed"><strong>It's not too late to book: </strong>Prices are at their lowest right now since I started tracking in Sept. The Great Trade War is sub-optimal timing, but one benefit is that flight prices have gone down a lot.</p>
                    <p className="text-sm tracking-wider leading-relaxed"><strong>Flights: </strong> The Trade War and Newark chaos aren't great for wedding planning but the benefit is that ticket prices have gone way down</p>
                    <p className="text-sm tracking-wider leading-relaxed"><strong>Lodging: </strong> We still have plenty of Hotel rooms and AirBnBs held for guests that are already paid for, please reach out if interested!</p>
                    <p className="text-sm tracking-wider leading-relaxed"><strong>REMINDER: </strong> <span className="text-orange font-bold">Weds 6/18 is a Market Holiday in the US for Juneteenth </span> Many companies have the day off.</p>
                    <p className="text-sm tracking-wider leading-relaxed">We hope you won't let the travel logistics get in the way of joining us and we're here to help.</p>
                    <p className="text-sm tracking-wider leading-relaxed">If you're still on the fence, please know we've pre-booked Airbnbs to make things as easy as possible <strong>(our treat!)</strong> and we are masters with miles <strong>(which we have to use anyways!)</strong></p>
                  </div>
                  <div className="mt-6">
                    <div className="border-2 border-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <Image
                        src="/optimized/flightprices.webp"
                        alt="Current flight prices trending lower"
                        width={2032}
                        height={796}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Childcare Section */}
                <div className="mb-16">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-wider mb-4">Childcare: <span className="text-green">Available!</span></h2>
                  <div className="space-y-4 text-default">
                    <p className="text-sm tracking-wider leading-relaxed">We've hired a professional babysitting agency from Paris to be onsite Friday & Saturday if it makes things easier for parents.</p>
                    <p className="text-sm tracking-wider leading-relaxed">The agency is <a href="https://www.baby-prestige.com/en" target="_blank" rel="noopener noreferrer" className="text-pink font-semibold underline hover:text-green">Baby Prestige</a> and is very highly recommended.</p>
                    <p className="text-sm tracking-wider leading-relaxed">They handle all ages, including boomers, and your babies will be fluent in French by the flight home. Talk about culture:</p>
                  </div>
                  <div className="mt-6">
                    <div className="border-2 border-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <a 
                        href="https://www.baby-prestige.com/en"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer transition-opacity "
                      >
                        <Image
                          src="/optimized/baby-prestige.webp"
                          alt="Baby Prestige - Professional Childcare Services"
                          width={2800}
                          height={1400}
                          className="w-full h-auto"
                        />
                      </a>
                    </div>
                  </div>
                </div>

                {/* RSVP Section */}
                <div className="mb-8">
                  <div className="space-y-6">
                    <p className="text-sm tracking-wider leading-relaxed">PLEASE reach out with any questions or anything at all we can do to make your life easier! <span className="font-bold">We're so insanely excited!</span></p>
                    <a 
                      href="https://themcdonuts.com/rsvp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue hover:bg-green text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-xl font-semibold tracking-wider transition-colors"
                    >
                      RSVP! ALLONS-Y!
                      <ArrowRight className="w-5 h-5" />
                    </a>
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
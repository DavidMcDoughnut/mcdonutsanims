'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { LottieRefCurrentProps } from 'lottie-react';

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => null,
});

// Easing function for smoother opacity transition
const easeOutExpo = (x: number): number => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

export default function Home() {
  const [animationData, setAnimationData] = useState<any>(null);
  const [paintData, setPaintData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [opacity, setOpacity] = useState(1);
  const paintRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      // Calculate linear progress
      const linearProgress = Math.min(1, scrollPosition / (windowHeight * 0.5));
      // Apply easing to the progress
      const easedProgress = easeOutExpo(linearProgress);
      // Calculate opacity with easing
      const newOpacity = Math.max(0, 1 - easedProgress);
      setOpacity(newOpacity);

      // Update paint animation progress (keeping this linear)
      if (paintRef.current?.animationItem) {
        const totalFrames = paintRef.current.animationItem.totalFrames;
        const currentFrame = Math.min(linearProgress * totalFrames, totalFrames);
        paintRef.current.animationItem.goToAndStop(currentFrame, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        // Load main animation
        const response = await fetch('/script.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (text.startsWith('PK')) {
          throw new Error('The Lottie file appears to be in ZIP format. Please export it as a plain JSON file from your animation tool.');
        }
        const data = JSON.parse(text);
        setAnimationData(data);

        // Load paint animation
        const paintResponse = await fetch('/paint clean.json');
        if (!paintResponse.ok) {
          throw new Error(`HTTP error! status: ${paintResponse.status}`);
        }
        const paintText = await paintResponse.text();
        const paintData = JSON.parse(paintText);
        setPaintData(paintData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading animation';
        console.error('Error loading animation:', err);
        setError(errorMessage);
      }
    };
    
    loadAnimations();
  }, []);

  return (
    <main className="relative min-h-[150vh] w-full overflow-x-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat transition-opacity duration-100"
        style={{
          backgroundImage: 'url("/ve%20hero%20bg.png")',
          opacity
        }}
      />
      
      {/* Lottie Animation */}
      <div className="fixed w-full flex justify-center mt-[4vh]">
        <div className="h-[20rem] w-auto">
          {error ? null : animationData && (
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{ height: '100%', width: 'auto' }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet'
              }}
            />
          )}
        </div>
      </div>

      {/* Static Image Overlay */}
      <div className="fixed w-full flex justify-center mt-[4vh] transition-opacity duration-100">
        <div className="h-[20rem] w-auto">
          <img 
            src="/script.png" 
            alt="Script"
            className="h-full w-auto"
            style={{ opacity: 1 - opacity }}
          />
        </div>
      </div>

      {/* Foreground Image */}
      <div 
        className="fixed inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat pointer-events-none transition-opacity duration-100"
        style={{
          backgroundImage: 'url("/ve%20fg.png")',
          opacity
        }}
      />

      {/* Paint Animation Container */}
      <div className="fixed inset-x-0 top-0 h-screen w-screen">
        {/* Paint Lottie Animation */}
        <div className="absolute inset-0 [&>div]:w-full [&>div]:h-full [&>div>svg]:w-full [&>div>svg]:h-full [&>div>svg]:object-cover">
          {error ? null : paintData && (
            <Lottie
              lottieRef={paintRef}
              animationData={paintData}
              loop={false}
              autoplay={false}
              style={{ 
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMin slice'
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
} 
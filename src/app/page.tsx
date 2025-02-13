'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';

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
  const [sketchData, setSketchData] = useState<any>(null);
  const [script2Data, setScript2Data] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [opacity, setOpacity] = useState(1);
  const [heroBottomOpacity, setHeroBottomOpacity] = useState(0);
  const sketchRef = useRef<LottieRefCurrentProps>(null);
  const script2Ref = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate opacity progress (over half viewport)
      const opacityProgress = Math.min(1, scrollPosition / (windowHeight * 0.5));
      const easedProgress = easeOutExpo(opacityProgress);
      const newOpacity = Math.max(0, 1 - easedProgress);
      setOpacity(newOpacity);

      // Update sketch animation progress (over full viewport)
      if (sketchRef.current?.animationItem) {
        const totalFrames = sketchRef.current.animationItem.totalFrames;
        const sketchProgress = Math.min(1, scrollPosition / windowHeight);
        const currentFrame = Math.min(sketchProgress * totalFrames, totalFrames);
        sketchRef.current.animationItem.goToAndStop(currentFrame, true);

        // Calculate hero bottom opacity
        // Start fading in when we're 80% through the sketch animation
        const fadeStartPoint = windowHeight * 0.8;
        if (scrollPosition >= fadeStartPoint) {
          const fadeDistance = windowHeight * 0.2; // Fade over the last 20% of the viewport
          const fadeProgress = (scrollPosition - fadeStartPoint) / fadeDistance;
          setHeroBottomOpacity(Math.min(1, fadeProgress));
        } else {
          setHeroBottomOpacity(0);
        }
      }

      // Update script2 animation progress (starting at 1/3 viewport height)
      if (script2Ref.current?.animationItem) {
        const totalFrames = script2Ref.current.animationItem.totalFrames;
        const startScrollPoint = windowHeight / 3;
        const adjustedScrollPosition = Math.max(0, scrollPosition - startScrollPoint);
        const script2Progress = Math.min(1, adjustedScrollPosition / (windowHeight - startScrollPoint));
        const currentFrame = Math.min(script2Progress * totalFrames, totalFrames);
        script2Ref.current.animationItem.goToAndStop(currentFrame, true);
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

        // Load sketch animation
        const sketchResponse = await fetch('/sketch.json');
        if (!sketchResponse.ok) {
          throw new Error(`HTTP error! status: ${sketchResponse.status}`);
        }
        const sketchText = await sketchResponse.text();
        const sketchData = JSON.parse(sketchText);
        setSketchData(sketchData);

        // Load script2 animation
        const script2Response = await fetch('/script2.json');
        if (!script2Response.ok) {
          throw new Error(`HTTP error! status: ${script2Response.status}`);
        }
        const script2Text = await script2Response.text();
        const script2Data = JSON.parse(script2Text);
        setScript2Data(script2Data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading animation';
        console.error('Error loading animation:', err);
        setError(errorMessage);
      }
    };
    
    loadAnimations();
  }, []);

  return (
    <main className="relative min-h-[200vh] w-full overflow-x-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat transition-opacity duration-100 z-0"
        style={{
          backgroundImage: 'url("/ve%20hero%20bg.png")',
          opacity
        }}
      />
      
      {/* Script1 Lottie Animation */}
      <div className="fixed w-full flex justify-center mt-[2vh] transition-opacity duration-100 z-10">
        <div className="h-[20rem] w-auto">
          {error ? null : animationData && (
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{ 
                height: '100%', 
                width: 'auto',
                opacity
              }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet'
              }}
            />
          )}
        </div>
      </div>

      {/* Foreground Image */}
      <div 
        className="fixed inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat pointer-events-none transition-opacity duration-100 z-20"
        style={{
          backgroundImage: 'url("/ve%20fg.png")',
          opacity
        }}
      />

      {/* Sketch Animation Container */}
      <div className="fixed inset-x-0 top-0 h-screen w-screen z-30">
        {/* Sketch Lottie Animation */}
        <div className="absolute inset-0 [&>div]:w-full [&>div]:h-full [&>div>svg]:w-full [&>div>svg]:h-full [&>div>svg]:object-cover">
          {error ? null : sketchData && (
            <Lottie
              lottieRef={sketchRef}
              animationData={sketchData}
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

      {/* Script2 Overlay (Topmost Layer) */}
      <div className="fixed w-full flex justify-center mt-[2vh] transition-opacity duration-100 z-40">
        <div className="h-[20rem] w-auto">
          {error ? null : script2Data && (
            <Lottie
              lottieRef={script2Ref}
              animationData={script2Data}
              loop={false}
              autoplay={false}
              style={{ 
                height: '100%', 
                width: 'auto',
                opacity: 1 - opacity
              }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet'
              }}
            />
          )}
        </div>
      </div>

      {/* HeroBottom Container */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-[50vh] flex flex-col items-center justify-center gap-4 transition-opacity duration-1000 z-50"
        style={{ opacity: heroBottomOpacity }}
      >
        {/* Lauren & David SVG */}
        <div className="w-[600px] flex justify-center">
          <Image
            src="/lauren david.svg"
            alt="Lauren & David"
            width={800}
            height={100}
            className="text-[#4B6CFF]"
          />
        </div>

        {/* Date */}
        <div className="w-[800px] flex justify-center">
          <p className="wedding-text text-4xl">
            Juin 19-21, 2025
          </p>
        </div>

        {/* Location */}
        <div className="w-[800px] flex justify-center">
          <p className="wedding-text text-xl">
            Saint-Jean-Cap-Ferrat, Côte d'Azur, France
          </p>
        </div>

        {/* Villa SVG */}
        <div className="w-[600px] flex justify-center">
          <Image
            src="/villa.svg"
            alt="Villa Ephrussi de Rothschild"
            width={800}
            height={100}
            className="text-[#4B6CFF]"
          />
        </div>
      </div>
    </main>
  );
} 
'use client';
import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';

// Add AnimationItem type for proper Lottie typing
import type { AnimationItem } from 'lottie-web';

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
  const [error, setError] = useState<string>('');
  const [scrollVh, setScrollVh] = useState(0);
  const [isChrome, setIsChrome] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const [hasPlayedThroughOnce, setHasPlayedThroughOnce] = useState(false);
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const lastPlayedFrame = useRef<number>(0);
  const lastScrollPosition = useRef(0);
  const hasReachedThirtyPercent = useRef(false);
  const animationLoadAttempted = useRef(false);

  // Add event listener for animation frame updates and handle initial autoplay
  useEffect(() => {
    if (lottieRef.current?.animationItem && !initialAnimationComplete && isAnimationReady) {
      // console.log('[Debug] Animation setup - initial state:', {
      //   hasScrolled,
      //   initialAnimationComplete,
      //   hasReachedThirtyPercent: hasReachedThirtyPercent.current,
      //   isAnimationReady
      // });

      const handleFrame = () => {
        const currentFrame = lottieRef.current?.animationItem?.currentFrame || 0;
        const totalFrames = lottieRef.current?.animationItem?.totalFrames || 0;
        lastPlayedFrame.current = currentFrame;
        const progress = currentFrame / totalFrames;

        // Log every 10% for debugging
        // if (Math.floor(progress * 10) > Math.floor((lastPlayedFrame.current / totalFrames) * 10)) {
        //   console.log(`[Debug] Animation progress: ${(progress * 100).toFixed(1)}%`);
        // }

        // Only pause at 30% if we haven't scrolled yet
        if (!hasReachedThirtyPercent.current && (currentFrame / totalFrames) >= 0.3 && !hasScrolled) {
          // console.log('[Debug] Pausing at 30% - No scroll detected');
          lottieRef.current?.animationItem?.pause();
          hasReachedThirtyPercent.current = true;
          setInitialAnimationComplete(true);
        }

        // If user starts scrolling before 30%, pause autoplay and let scroll take over
        if (hasScrolled && !hasReachedThirtyPercent.current) {
          // console.log('[Debug] User scrolled before 30% - Pausing autoplay');
          lottieRef.current?.animationItem?.pause();
          hasReachedThirtyPercent.current = true;
          setInitialAnimationComplete(true);
        }
      };
      
      lottieRef.current.animationItem.addEventListener('enterFrame', handleFrame);
      // console.log('[Debug] Frame listener attached');
      
      return () => {
        // console.log('[Debug] Cleaning up frame listener');
        lottieRef.current?.animationItem?.removeEventListener('enterFrame', handleFrame);
      };
    }
  }, [initialAnimationComplete, hasScrolled, lottieRef.current?.animationItem, isAnimationReady]);

  useEffect(() => {
    // Set pageLoaded to true after a delay
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Browser detection
    const detectBrowser = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
      const isChromeBrowser = /chrome/.test(userAgent) && !/edge|opr|opera/.test(userAgent);
      setIsChrome(!isMobile && isChromeBrowser);
    };

    detectBrowser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const newScrollVh = scrollPosition / windowHeight;
      setScrollVh(newScrollVh);

      if (!hasScrolled && scrollPosition > 0) {
        setHasScrolled(true);
      }

      // Handle animation control based on scroll
      if (lottieRef.current?.animationItem) {
        const totalFrames = lottieRef.current.animationItem.totalFrames;
        lastScrollPosition.current = scrollPosition;

        // If we've played through once, map scroll to full animation range
        if (hasPlayedThroughOnce) {
          const scrollProgress = Math.max(0, Math.min(1, newScrollVh / 1));
          requestAnimationFrame(() => {
            lottieRef.current?.animationItem?.goToAndStop(scrollProgress * totalFrames, true);
          });
          return;
        }

        // Initial scroll behavior remains the same until we've played through once
        if (scrollPosition === 0) {
          const currentProgress = hasReachedThirtyPercent.current ? 0.3 : 0;
          requestAnimationFrame(() => {
            lottieRef.current?.animationItem?.goToAndStop(currentProgress * totalFrames, true);
          });
          return;
        }

        // Calculate progress starting from current position when scroll begins
        const scrollProgress = Math.max(0, Math.min(1, (newScrollVh - 0.01) / 0.99));
        const currentPosition = hasReachedThirtyPercent.current ? 0.3 : 0;
        const finalProgress = currentPosition + (scrollProgress * (1 - currentPosition));

        // If we reach 100%, mark that we've played through once
        if (finalProgress >= 1) {
          setHasPlayedThroughOnce(true);
        }
        
        requestAnimationFrame(() => {
          lottieRef.current?.animationItem?.goToAndStop(finalProgress * totalFrames, true);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasScrolled, hasPlayedThroughOnce]);

  useEffect(() => {
    const loadAnimation = async () => {
      // Prevent double loading
      if (animationLoadAttempted.current) {
        // console.log('[Debug] Animation load already attempted, skipping');
        return;
      }
      
      animationLoadAttempted.current = true;
      
      try {
        // console.log('[Debug] Starting animation data load');
        const response = await fetch('/anim4k.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (text.startsWith('PK')) {
          throw new Error('The Lottie file appears to be in ZIP format. Please export it as a plain JSON file from your animation tool.');
        }
        const data = JSON.parse(text);
        // console.log('[Debug] Animation data loaded successfully');
        setAnimationData(data);
        // Wait for next frame to ensure animation data is processed
        requestAnimationFrame(() => {
          setIsAnimationReady(true);
          // console.log('[Debug] Animation ready for playback');
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading animation';
        console.error('[Debug] Error loading animation:', err);
        setError(errorMessage);
      }
    };
    
    loadAnimation();
  }, []);

  // Modify the Lottie component to respect animation ready state
  const renderLottieAnimation = () => {
    if (!animationData) return null;
    
    return (
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={!initialAnimationComplete && isAnimationReady}
        style={{ 
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden'
        }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMin slice',
          progressiveLoad: true,
          hideOnTransparent: true
        }}
      />
    );
  };

  // Comment out debug logging effects
  // useEffect(() => {
  //   if (hasScrolled) {
  //     console.log('[Debug] Scroll state changed - hasScrolled:', hasScrolled);
  //   }
  // }, [hasScrolled]);

  // useEffect(() => {
  //   console.log('[Debug] Animation completion state changed:', {
  //     initialAnimationComplete,
  //     hasPlayedThroughOnce
  //   });
  // }, [initialAnimationComplete, hasPlayedThroughOnce]);

  return (
    <main className="relative min-h-[200vh] w-full overflow-x-hidden">
      {/* Debug Scroll Counter - Temporarily Hidden
      <div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg font-mono text-sm z-[1000]">
        {scrollVh.toFixed(2)}vh
      </div>
      */}

      {/* Chrome Intro Animation Container */}
      {isChrome && (
        <div id="chrome-intro" 
          className="relative h-screen"
          style={{ 
            position: scrollVh >= 1.3 ? 'absolute' : 'fixed',
            top: scrollVh >= 1.3 ? '130vh' : 0,
            left: 0,
            right: 0,
            transform: 'translate3d(0,0,0)',
            willChange: 'transform'
          }}
        >
          {/* Static Background Image - Fallback and Initial Load */}
          <div className="absolute inset-0 [&>div]:w-full [&>div]:h-full z-[1]">
            <Image
              src="/vebg-static.png"
              alt="Background"
              fill
              priority
              className="object-cover object-top"
              style={{ 
                transform: 'translate3d(0,0,0)',
                backfaceVisibility: 'hidden'
              }}
            />
          </div>

          {/* Chrome Border */}
          <div 
            id="chrome-border-div"
            className="fixed border-[2px] sm:border-[4px] border-[#4B6CFF] pointer-events-none z-[9999] transition-all ease-out rounded-[12px] sm:rounded-[24px]"
            style={{
              top: '50%',
              left: '50%',
              width: 'calc(100% - 16px)',
              height: 'calc(100% - 16px)',
              transform: scrollVh >= 1.3 
                ? 'translate(-50%, -150vh)' 
                : `translate(-50%, -50%) scale(${1 + (0.05 * Math.max(0, Math.min(1, 1 - ((scrollVh - 0.26) / 0.1))))})`,
              transformOrigin: 'center center',
              opacity: scrollVh >= 1.3 ? 0 : 100,
              transitionDuration: scrollVh >= 1.3 ? '500ms' : '0ms'
            }}
          />

          {/* New Palm Animation Container - TEMPORARILY HIDDEN
          <div 
            className="fixed h-[600px] w-full z-[20]"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <div className="relative h-full w-full">
              <div className="absolute right-0 h-[600px] aspect-square">
                <Image
                  src="/palmrt.png"
                  alt="Palm Right"
                  fill
                  className="object-contain object-right"
                  priority
                />
              </div>
            </div>
          </div>
          */}

          {/* Background Image */}
          <div 
            className="absolute inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat z-0"
            style={{
              backgroundImage: 'url("/vebg-static.png")',
              position: scrollVh >= 1.3 ? 'absolute' : 'fixed',
              opacity: Math.max(0, Math.min(1, 1 - ((scrollVh - 0.4) / 0.2))) // Transition from 100% to 0% between 0.4vh and 0.6vh
            }}
          />

          {/* Single Lottie Animation */}
          <div className="absolute inset-0 [&>div]:w-full [&>div]:h-full [&>div>svg]:w-full [&>div>svg]:h-full [&>div>svg]:object-cover z-10">
            {error ? null : renderLottieAnimation()}
          </div>

          {/* HeroBottom Container */}
          <div 
            className="bottom-0 left-0 right-0 h-[50vh] flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 z-50"
            style={{ 
              position: scrollVh >= 1.3 ? 'absolute' : 'fixed'
            }}
          >
            {/* Lauren & David SVG */}
            <div className="w-[90vw] sm:w-[80vw] md:w-[600px] flex justify-center mt-1vh [transition:transform_500ms_ease-out]"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollVh - 0.9) / (1 - 0.9))),
                transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 0.9) / (1 - 0.9)))}px)`
              }}>
              <Image
                src="/lauren david hero.svg"
                alt="Lauren & David"
                width={800}
                height={100}
                className="text-[#4B6CFF] w-full h-auto"
              />
            </div>

            {/* Date */}
            <div className="w-[90vw] sm:w-[80vw] md:w-[800px] flex justify-center [transition:transform_500ms_ease-out]"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollVh - 0.94) / (1 - 0.9))),
                transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 0.94) / (1 - 0.9)))}px)`
              }}>
              <p className="wedding-text text-2xl sm:text-3xl md:text-4xl leading-[200%]">
                Juin 19-21, 2025
              </p>
            </div>

            {/* Villa SVG */}
            <div className="w-[90vw] sm:w-[80vw] md:w-[600px] flex justify-center [transition:transform_500ms_ease-out]"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollVh - 0.98) / (1 - 0.9))),
                transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 0.98) / (1 - 0.9)))}px)`
              }}>
              <Image
                src="/villa hero.svg"
                alt="Villa Ephrussi de Rothschild"
                width={800}
                height={100}
                className="text-[#4B6CFF] w-full h-auto"
              />
            </div>

            {/* Location */}
            <div className="w-[90vw] sm:w-[80vw] md:w-[800px] flex justify-center [transition:transform_500ms_ease-out]"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollVh - 1.02) / (1 - 0.9))),
                transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 1.02) / (1 - 0.9)))}px)`
              }}>
              <p className="wedding-text text-base sm:text-lg md:text-xl leading-[200%] text-center">
                <span className="md:hidden">
                  Saint-Jean-Cap-Ferrat
                  <br />
                  Côte d'Azur, France
                </span>
                <span className="hidden md:inline">
                  Saint-Jean-Cap-Ferrat, Côte d'Azur, France
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Safari/Mobile Intro Container */}
      {!isChrome && (
        <div id="safari-intro"
          className="relative h-screen"
          style={{ 
            position: 'relative',
            transform: 'translate3d(0,0,0)',
            willChange: 'transform'
          }}
        >
          {/* Safari Border */}
          <div 
            id="safari-border-div"
            className="fixed border-[2px] sm:border-[4px] border-[#4B6CFF] pointer-events-none z-[9999] transition-all ease-out rounded-[12px] sm:rounded-[24px]"
            style={{
              top: '50%',
              left: '50%',
              width: 'calc(100% - 16px)',
              height: 'calc(100% - 16px)',
              transform: pageLoaded 
                ? 'translate(-50%, -50%) scale(1)' 
                : 'translate(-50%, -50%) scale(1.05)',
              transformOrigin: 'center center',
              opacity: 100,
              transitionDuration: '1000ms',
              transitionDelay: '2000ms'
            }}
          />

          {/* Background Video */}
          <video 
            className="absolute inset-x-0 top-0 h-screen w-full object-cover object-top z-0"
            playsInline
            muted
            ref={(videoElement) => {
              if (videoElement && !videoElement.hasAttribute('data-init')) {
                videoElement.setAttribute('data-init', 'true');
                videoElement.addEventListener('loadedmetadata', () => {
                  videoElement.playbackRate = 1.5;
                  videoElement.play();
                });
                videoElement.addEventListener('ended', () => {
                  videoElement.currentTime = videoElement.duration;
                });
              }
            }}
          >
            <source src="/anim4k-vid.webm" type="video/webm" />
          </video>

          {/* Bottom Gradient Overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[100px] z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
            }}
          />

          {/* HeroBottom Container */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[54vh] sm:h-[50vh] md:h-[46vh] flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 z-50"
          >
            {/* Lauren & David SVG */}
            <div 
              className={`w-[90vw] sm:w-[80vw] md:w-[600px] flex justify-center mt-0 transition-all duration-1000 ease-out delay-[6000ms] ${
                pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Image
                src="/lauren david hero.svg"
                alt="Lauren & David"
                width={800}
                height={100}
                className="text-[#4B6CFF] w-full h-auto"
              />
            </div>

            {/* Date */}
            <div 
              className={`w-[90vw] sm:w-[80vw] md:w-[800px] flex justify-center transition-all duration-1000 ease-out delay-[6200ms] ${
                pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="wedding-text text-2xl sm:text-3xl md:text-4xl leading-[200%]">
                Juin 19-21, 2025
              </p>
            </div>

            {/* Villa SVG */}
            <div 
              className={`w-[90vw] sm:w-[80vw] md:w-[600px] flex justify-center transition-all duration-1000 ease-out delay-[6400ms] ${
                pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Image
                src="/villa hero.svg"
                alt="Villa Ephrussi de Rothschild"
                width={800}
                height={100}
                className="text-[#4B6CFF] w-full h-auto"
              />
            </div>

            {/* Location */}
            <div 
              className={`w-[90vw] sm:w-[80vw] md:w-[800px] flex justify-center transition-all duration-1000 ease-out delay-[6600ms] ${
                pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="wedding-text text-base sm:text-lg md:text-xl leading-[200%] text-center">
                <span className="md:hidden">
                  Saint-Jean-Cap-Ferrat
                  <br />
                  Côte d'Azur, France
                </span>
                <span className="hidden md:inline">
                  Saint-Jean-Cap-Ferrat, Côte d'Azur, France
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections Container - Only starts after hero animation completes */}
      <div className={`relative ${isChrome ? 'mt-[220vh]' : 'mt-[0vh]'} z-[200]`}>
        {/* SVG Filter Definition*/}
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id='roughpaper' x='0%' y='0%' width='100%' height="100%">
              <feTurbulence type="fractalNoise" baseFrequency='0.12' result='noise' numOctaves="4" />
              <feDiffuseLighting in='noise' lighting-color='white' surfaceScale='8'>
                <feDistantLight azimuth='45' elevation='40' />
              </feDiffuseLighting>
            </filter>
          </defs>
        </svg>
        

        {/* Apply the filter to a background div that covers all content */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            filter: 'url(#roughpaper)',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 200,
            minHeight: '400vh' // Make sure it covers all content sections
          }}
        />

        {/* Events Section */}
        <section id="events" className="relative min-h-screen py-2 sm:py-16 flex flex-col items-center">
          {/* Events Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-4 mt-8 sm:mb-16 sm:mt-24 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/events title mobile.png"
                alt="Events"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/events title.png"
                alt="Events"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          {/* Event Cards */}
          <div className="w-full text-[#4B6CFF]">
            {/* Welcome Drinks */}
            <div className="w-full py-2 group">
              <div className="w-[1200px] max-w-full px-5 sm:px-4 mx-auto flex flex-col-reverse md:flex-row gap-1 md:gap-8">
                <a href="https://www.mayssabeach.fr/en/restaurant" target="_blank" rel="noopener noreferrer" className="block w-full md:w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/welcome drinks.png"
                      alt="Welcome Drinks B&W"
                      fill
                      className="object-contain rounded-lg md:block hidden"
                    />
                    <Image
                      src="/welcome drinks color.png"
                      alt="Welcome Drinks Color"
                      fill
                      className="object-contain rounded-lg md:opacity-0 md:transition-opacity md:duration-300 md:ease-linear md:group-hover:opacity-100 block md:block"
                    />
                  </div>
                </a>
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 md:space-y-6">
                  <h3 className="text-[#FF89A9] text-lg sm:text-xl font-extralight tracking-widest">Thursday June 19</h3>
                  <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest">WELCOME DRINKS</h2>
                  <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr] gap-x-2 sm:gap-x-4 gap-y-2 tracking-wider text-sm sm:text-base">
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">8pm onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.mayssabeach.fr/en/restaurant" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] font-bold">Mayssa Beach</a>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] ml-1">(map)</a>
                      </div>
                    </div>
                    <div className="contents">
                      <span className="font-light">Wear</span>
                      <span className="font-bold">Riviera casual</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Event */}
            <div className="w-full py-2 group">
              <div className="w-[1200px] max-w-full px-5 sm:px-4 mx-auto flex flex-col-reverse md:flex-row gap-1 md:gap-8">
                <a href="https://www.villa-ephrussi.com/en" target="_blank" rel="noopener noreferrer" className="block w-full md:w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/main event.png"
                      alt="Main Event B&W"
                      fill
                      className="object-contain rounded-lg md:block hidden"
                    />
                    <Image
                      src="/main event color.png"
                      alt="Main Event Color"
                      fill
                      className="object-contain rounded-lg md:opacity-0 md:transition-opacity md:duration-300 md:ease-linear md:group-hover:opacity-100 block md:block"
                    />
                  </div>
                </a>
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 md:space-y-6">
                  <h3 className="text-[#FF89A9] text-lg sm:text-xl font-extralight tracking-widest">Friday June 20</h3>
                  <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest">MAIN EVENT</h2>
                  <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr] gap-x-2 sm:gap-x-4 gap-y-2 tracking-wider text-sm sm:text-base">
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">5pm Onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.villa-ephrussi.com/en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] font-bold">Villa Ephrussi de Rothschild</a>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] ml-1">(map)</a>
                      </div>
                    </div>
                    <div className="contents">
                      <span className="font-light">Wear</span>
                      <span className="font-bold">Riviera semi-formal (Not black tie)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* La Vie en Rosé */}
            <div className="w-full py-2 group">
              <div className="w-[1200px] max-w-full px-5 sm:px-4 mx-auto flex flex-col-reverse md:flex-row gap-1 md:gap-8">
                <a href="https://www.plage-de-passable.fr/" target="_blank" rel="noopener noreferrer" className="block w-full md:w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/la vie en rose.png"
                      alt="La Vie en Rosé B&W"
                      fill
                      className="object-contain rounded-lg md:block hidden"
                    />
                    <Image
                      src="/la vie en color.png"
                      alt="La Vie en Rosé Color"
                      fill
                      className="object-contain rounded-lg md:opacity-0 md:transition-opacity md:duration-300 md:ease-linear md:group-hover:opacity-100 block md:block"
                    />
                  </div>
                </a>
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 md:space-y-6">
                  <h3 className="text-[#FF89A9] text-lg sm:text-xl font-extralight tracking-widest">Saturday June 21</h3>
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest">LA VIE EN ROSÉ</h2>
                    <h3 className="text-lg sm:text-xl font-extralight tracking-widest">BEACH CLUB RECOVERY LOUNGE</h3>
                  </div>
                  <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr] gap-x-2 sm:gap-x-4 gap-y-2 tracking-wider text-sm sm:text-base">
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">2pm-ish Onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.plage-de-passable.fr/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] font-bold">Plage de Passable</a>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] ml-1">(map)</a>
                      </div>
                    </div>
                    <div className="contents">
                      <span className="font-light">Wear</span>
                      <span className="font-bold">Max-chic, Euro-Trendy beach outfit</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">What</span>
                      <span className="font-bold">Relaxed, casual lounge à la plage*</span>
                    </div>
                    <div className="col-span-2 italic text-xs sm:text-sm mt-4 leading-[160%]">*If brunch + beach chic turn into vibey, sexy-sax, tropical-house, sunset dance party on the Riviera... Fantastique!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Section */}
        <section id="stay" className="min-h-screen py-2 sm:py-16 flex flex-col items-center">
          {/* Stay Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-4 sm:mb-16 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/stay title mobile.png"
                alt="Stay"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/stay title.png"
                alt="Stay"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          <div className="w-[800px] max-w-full px-5 sm:px-4 space-y-12 sm:space-y-16 text-[#4B6CFF]">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest">TLDR</h2>
              <p className="text-sm sm:text-base leading-[200%]">Hotels & AirBnBs in Cap Ferrat are the best option, but supply is limited & costly... this is the most painful part of this location. Villefranche and Beaulieu-sur-mer are very close (5min drive) and you really can't go wrong.</p>
            </div>

            <div className="space-y-8 sm:space-y-12">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-extralight tracking-widest mb-4">HOTELS</h3>
                <p className="text-sm sm:text-base leading-[200%]">Hotels in the region can be a bit… tricky… and don't do room blocks the same way as the US. The luxe hotels also block-off summer wknd room availability on their websites, even when they do have rooms available. You might have to call the hotel to get the actual room availability or search for more than 3 days.</p>
                <p className="mt-4 text-sm sm:text-base leading-[200%]">The prices for the high-end hotels that target Americans/foreigners are pretty extreme, but below is our rough breakdown of the hotel market:</p>
              </div>
              <div>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">5 STARS</h4>
                  <p className="italic leading-[200%] text-sm">Max luxe, max price... money no object</p>
                </div>
                <ul className="space-y-2 list-disc md:pl-8 pl-4 marker:text-[#4B6CFF] font-bold text-sm md:text-base">
                  <li className="pl-2 md:pl-4"><a href="https://www.fourseasons.com/capferrat/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Four Seasons: The Grand Hotel du Cap-Ferrat</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.capestel.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Hotel Cap-Estel</a></li>
                </ul>
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">4.5 STARS</h4>
                  <p className="italic text-sm leading-[200%]">Approachable luxury... pricey but less crazy</p>
                </div>
                <ul className="space-y-1 list-disc md:pl-8 pl-4 marker:text-[#4B6CFF] font-bold text-sm md:text-base">
                  <li className="pl-2 md:pl-4"><a href="https://www.lareservebeaulieu.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">La Reserve de Beaulieu</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.royal-riviera.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Royal Riviera</a></li>
                </ul>
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">4 STARS</h4>
                  <p className="italic leading-[200%] text-sm">Local boutique, upscale, more reasonable</p>
                </div>
                <ul className="space-y-1 list-disc md:pl-8 pl-4 marker:text-[#4B6CFF] font-bold text-sm md:text-base">
                  <li className="pl-2 md:pl-4"><a href="https://www.villa-capferrat.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">La Villa Cap Ferrat, Boutique Hotel & Spa</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.hotel-carlton-beaulieu.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Carlton Hotel, Beaulieu sur mer</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.welcomehotel.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Welcome Hotel, Villefranche sur mer</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.hotelversailles.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Hotel Versailles, Villefranche sur mer</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.hotel-provencale.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Hotel Provençale, Villefranche sur mer</a></li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl font-extralight tracking-widest mb-4">AIRBNBs</h3>
              <p className="text-sm sm:text-base leading-[200%]">AirBnBs are a great option for larger groups/families and there is an abundance of options. Please note that these are public beaches and beautiful marinas with gorgeous restaurants, bars and shops all within walking distance so what some of these lack in amenity offerings, is more made up for in the neighborhoods.</p>
              <p className="text-sm sm:text-base leading-[200%] mt-4">Please note we have personally reserved a number of the Cap Ferrat AirBnB listings and are planning to help organize larger groups.</p>
            </div>
          </div>
        </section>

        {/* Travel Section */}
        <section id="travel" className="min-h-screen py-12 sm:py-8 flex flex-col items-center">
          {/* Travel Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-12 sm:mb-16 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/travel title mobile.png"
                alt="Travel"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/travel title.png"
                alt="Travel"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          <div className="w-[800px] max-w-full px-5 sm:px-4 space-y-12 sm:space-y-16 text-[#4B6CFF]">
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest">TLDR</h2>
              <div className="space-y-1">
                <p className="text-sm sm:text-base leading-[200%]"><span className="font-bold">Nice (NCE) Côte d'Azur Airport</span> is where to fly. It's a ~25 min drive, clean, modern and easy</p>
                <p className="text-sm sm:text-base leading-[200%]"><span className="font-bold">No need to rent a car</span> unless you want to. Everything is within ~20 min walk or quick/easy Uber</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">GETTING THERE</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-bold leading-[200%]">Airport Options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://www.google.com/maps/place/Nice+C%C3%B4te+d'Azur+Airport/@43.6584014,7.2029736,14z/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">Nice (NCE) Côte d'Azur Airport </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Large, modern intl airport, 25 min drive from Cap Ferrat</li>
                    </ul>
                  </li>
                  <li><a href="https://www.google.com/maps/place/Marseille+Provence+Airport/@43.4366961,5.2133322,14z/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">Marseille (MRS) Provence Airport</a> 
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">2 hr drive from Cap Ferrat (not ideal,never been)</li>
                    </ul>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-bold leading-[200%]">Flight Options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://www.google.com/travel/flights/search?tfs=CBwQAhopEgoyMDI1LTA2LTE4ag0IAhIJL20vMDJfMjg2cgwIAxIIL20vMGNwNncaKRIKMjAyNS0wNi0yMmoMCAMSCC9tLzBjcDZ3cg0IAhIJL20vMDJfMjg2QAFIAXABggELCP___________wGYAQE&tfu=EgYIABABGAA&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">From the US </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Direct flights from from NY, Boston and DC on major carriers</li>
                      <li className="text-sm sm:text-base leading-[200%]">Most east coast flights are 8hr redeyes, leave 6-8pm ET, landing early AM France time</li>
                    </ul>
                  </li>
                  <li><a href="https://www.google.com/travel/flights/search?tfs=CBwQAhooEgoyMDI1LTA2LTE5agwIAxIIL20vMDRqcGxyDAgDEggvbS8wY3A2dxooEgoyMDI1LTA2LTIyagwIAxIIL20vMGNwNndyDAgDEggvbS8wNGpwbEABSAFwAYIBCwj___________8BmAEB&tfu=EgYIABABGAA&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">From the UK </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Direct ~2hr flights from London on B, Air France & budget carriers</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-extralight tracking-widest">GETTING AROUND</h3>
              <p className="text-sm sm:text-base leading-[200%]">Cap Ferrat itself and the greater area are both very small, so getting around is pretty easy. You don't need a car at all. FYI, some of the roads are a bit tricky/tight/windy which is relevant for both walking or rental cars.</p>

              <div className="space-y-4">
                <p className="text-sm sm:text-base font-bold leading-[200%]">Transportation options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-bold">Ubers + walking</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Ubers are very reliable, easy, safe and reasonably priced.</li>
                      <li className="text-sm sm:text-base leading-[200%]">All of the venues are very walkable, its europe.</li>
                    </ul>
                  </li>
                  <li><span className="font-bold">Rental Cars</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Definitely not needed but nice to have if you really want to explore the extended area</li>
                    </ul>
                  </li>
                  <li><span className="font-bold">Shuttles</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">We'll provide shuttle service on Friday for main event to/from most locations</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="min-h-screen py-12 sm:py-16 flex flex-col items-center">
          {/* FAQ Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-12 sm:mb-16 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/faq title mobile.png"
                alt="FAQ"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/faq title.png"
                alt="FAQ"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          <div className="w-[800px] max-w-full px-5 sm:px-4 space-y-8 sm:space-y-12 text-[#4B6CFF]">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">DRESS CODE</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">More details to come, but directionally you can't go wrong with Riviera Chic: light, airy & elegant linens & pastels.</p>
                <p className="text-sm sm:text-base leading-[200%]">The temperature is usually in the 70's and 80's. (Definitely no black tie)</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">CHILDCARE</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">For anyone planning to bring their children to France and may be looking for local childcare options, we have been recommended English-speaking Silly Billy's English speaking babysitters in France . Please make enquiries directly.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">GIFTS</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">We are extremely grateful anyone would make the journey to celebrate with us in France and we do not take for granted the large time/effort/cost commitment. Your presence is the greatest present.</p>
                <p className="text-sm sm:text-base leading-[200%]">In lieu of gifts, we simply ask that you contribute generously to the European economy during your stay (and/or donate to your favorite charity).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Area Section */}
        <section id="area" className="min-h-screen py-12 sm:py-16 flex flex-col items-center">
          {/* Area Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-12 sm:mb-16 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/area title mobile.png"
                alt="Area"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/area title.png"
                alt="Area"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          <div className="w-[800px] max-w-full px-5 sm:px-4 text-[#4B6CFF]">
            <p className="text-2xl leading-[200%]">COMING SOON</p>
          </div>
        </section>
      </div>
    </main>
  );
} 
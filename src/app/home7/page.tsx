'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

type CapFerratLayers = {
  events: boolean;
  hotels: boolean;
  walkTime: boolean;
  paintMap: boolean;
  googleMap: boolean;
};

type RivieraLayers = {
  florida: boolean;
  driveTime: boolean;
  reference: boolean;
  paintMap: boolean;
  googleMap: boolean;
};

// Add this before the Home component
const LazySpotifyEmbed = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const spotifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading when user is 200px away
    );

    if (spotifyRef.current) {
      observer.observe(spotifyRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={spotifyRef} className="w-full min-h-[352px]">
      {shouldLoad && (
        <iframe 
          style={{ borderRadius: '12px' }} 
          src="https://open.spotify.com/embed/playlist/7uVwfbZk2S4eOMNzxhXVGx?utm_source=generator" 
          width="100%" 
          height="352" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        />
      )}
    </div>
  );
};

// Add this new function at the top level, after the existing imports
const useImagePreloader = (imagePaths: string[]) => {
  useEffect(() => {
    imagePaths.forEach((path) => {
      const img = new (window.Image || Image)();
      img.src = path;
    });
  }, [imagePaths]);
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
  const [mapLayers, setMapLayers] = useState<CapFerratLayers>({
    events: true,
    hotels: false,
    walkTime: false,
    paintMap: true,
    googleMap: false
  });

  const [rivieraLayers, setRivieraLayers] = useState<RivieraLayers>({
    florida: false,
    driveTime: false,
    reference: true,
    paintMap: true,
    googleMap: false
  });

  // Add new state for video readiness
  const [videoReady, setVideoReady] = useState(false);

  const router = useRouter();

  // Add preloading for critical images
  const criticalImages = [
    '/optimized/welcome drinks.webp',
    '/optimized/welcome drinks color.webp',
    '/optimized/main event.webp',
    '/optimized/main event color.webp',
    '/optimized/la vie en rose.webp',
    '/optimized/la vie en color.webp',
    '/optimized/cf paint map updated.webp',
    '/optimized/cf goog map.webp',
    '/optimized/cf walk layer.webp',
    '/optimized/cf hotel layer.webp',
    '/optimized/cf event layer updated.webp'
  ];
  
  useImagePreloader(criticalImages);

  // Add new state for tracking viewport
  const [visibleSection, setVisibleSection] = useState('hero');
  const sectionRefs = {
    events: useRef<HTMLElement>(null),
    area: useRef<HTMLElement>(null),
    stay: useRef<HTMLElement>(null)
  };

  // Add intersection observer for sections
  useEffect(() => {
    const observerOptions = {
      rootMargin: '500px 0px', // Increased from 100px to 500px to start loading much earlier
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSection(entry.target.id);
        }
      });
    }, observerOptions);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Add this effect to handle Vercel Vitals reporting
  useEffect(() => {
    // Report route change to Vercel Analytics
    const reportWebVitals = (metric: any) => {
      console.log(metric);
      // You can send this to your analytics
    };

    // @ts-ignore - web vitals are injected by Next.js
    if (window.reportWebVitals) {
      // @ts-ignore
      window.reportWebVitals(reportWebVitals);
    }
  }, []);

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
    // More precise browser detection
    const detectBrowser = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isChromeBrowser = /chrome/.test(userAgent) && !/edge|opr|opera/.test(userAgent);
      
      // Only use Lottie on desktop Chrome
      const shouldUseLottie = !isMobile && isChromeBrowser;
      
      // Set state for conditional rendering
      setIsChrome(shouldUseLottie);
      
      // Log device info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Device detection:', {
          isMobile,
          isIOS,
          isAndroid,
          isChromeBrowser,
          shouldUseLottie
        });
      }
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
        return;
      }
      
      // Don't even attempt to load animation if not Chrome desktop
      if (!isChrome) {
        return;
      }
      
      animationLoadAttempted.current = true;
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Animation load timeout')), 10000);
        });

        const fetchPromise = fetch('/anim4k-opt.json');
        const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

        if (!response || !response.ok) {
          throw new Error(`Failed to load animation: ${response?.status || 'unknown error'}`);
        }

        const data = await response.json();
        setAnimationData(data);
        
        // Wait for next frame to ensure animation data is processed
        requestAnimationFrame(() => {
          setIsAnimationReady(true);
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading animation';
        console.error('[Debug] Error loading animation:', errorMessage);
        setError(errorMessage);
        
        // Show static background as fallback
        if (isChrome) {
          const staticContainer = document.querySelector('.absolute.inset-0') as HTMLElement;
          if (staticContainer) {
            staticContainer.style.opacity = '1';
          }
        }
      }
    };
    
    loadAnimation();
  }, [isChrome]);

  // Optimize video loading for mobile
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isChrome && videoRef.current) {
      const video = videoRef.current;
      
      // Force video attributes that help with mobile playback
      video.playsInline = true;
      video.muted = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      
      // Set playback speed and ensure it plays
      const handleCanPlay = () => {
        video.playbackRate = 1.5;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Video autoplay failed:', err);
            // Try playing again after user interaction
            const playVideo = () => {
              video.play();
              document.removeEventListener('touchstart', playVideo);
            };
            document.addEventListener('touchstart', playVideo);
          });
        }
      };
      
      video.addEventListener('canplay', handleCanPlay);
      return () => video.removeEventListener('canplay', handleCanPlay);
    }
  }, [isChrome]);

  // Update video component with ref and optimizations
  const renderVideo = () => (
    <div className="absolute inset-0">
      {/* Static background image that shows immediately */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/optimized/vebg-static.webp"
          alt="Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
          style={{ 
            transform: 'translate3d(0,0,0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </div>
      
      {/* Video that fades in once it starts playing */}
      <video 
        ref={videoRef}
        className="absolute inset-x-0 top-0 h-screen w-full object-cover object-top z-[1] opacity-0 transition-opacity duration-500"
        playsInline
        muted
        autoPlay
        preload="auto"
        poster="/optimized/vebg-static.webp"
        style={{ 
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden'
        }}
        onPlay={() => {
          const video = videoRef.current;
          if (video) {
            // Fade in the video
            video.classList.remove('opacity-0');
            video.classList.add('opacity-100');
            // Set video ready state immediately when playback starts
            setVideoReady(true);
          }
        }}
      >
        <source src="/anim4k-vid-hb3.mp4" type="video/mp4" />
      </video>
    </div>
  );

  const toggleLayer = (
    layer: keyof CapFerratLayers | keyof RivieraLayers,
    isRiviera: boolean = false
  ) => {
    if (isRiviera) {
      if (layer === 'paintMap' || layer === 'googleMap') {
        setRivieraLayers(prev => ({
          ...prev,
          paintMap: layer === 'paintMap',
          googleMap: layer === 'googleMap',
          // Deselect florida layer when google map is selected
          florida: layer === 'googleMap' ? false : prev.florida
        }));
      } else if (layer === 'florida' || layer === 'driveTime' || layer === 'reference') {
        setRivieraLayers(prev => ({
          ...prev,
          [layer]: !prev[layer]
        }));
      }
    } else {
      if (layer === 'paintMap' || layer === 'googleMap') {
        setMapLayers(prev => ({
          ...prev,
          paintMap: layer === 'paintMap',
          googleMap: layer === 'googleMap'
        }));
      } else if (layer === 'events' || layer === 'hotels' || layer === 'walkTime') {
        setMapLayers(prev => ({
          ...prev,
          [layer]: !prev[layer]
        }));
      }
    }
  };

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

  // HeroBottom animations with CSS transitions and delays
  const getHeroItemClass = (delay: number) => `
    w-[90vw] sm:w-[80vw] md:w-[600px] 
    flex justify-center mt-0 
    transition-all duration-1000 ease-out
    ${videoReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
    ${videoReady ? `transition-delay-[${delay}ms]` : ''}
  `;

  return (
    <main className="relative min-h-[200vh] w-full overflow-x-hidden">
      {/* SVG Filter Definition - Moved to top level */}
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

      {/* Paper texture overlay for intro section */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{
          filter: 'url(#roughpaper)',
          opacity: 0.04,
          zIndex: 100
        }}
      />

      {/* Fixed Border Container */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {/* White Border Mask - Creates the masking effect */}
        <div 
          className="absolute border-[32px] sm:border-[48px] border-white rounded-[44px] sm:rounded-[72px] transition-transform duration-1000 ease-out w-[calc(100%-16px+64px)] h-[calc(100%-24px+64px)] sm:w-[calc(100%-16px+80px)] sm:h-[calc(100%-16px+80px)]"
          style={{
            top: '50%',
            left: '50%',
            transform: pageLoaded 
              ? 'translate(-50%, -50%) scale(1)' 
              : 'translate(-50%, -50%) scale(1.05)',
            transformOrigin: 'center center'
          }}
        />
        
        {/* Blue Border - Main visual border */}
        <div 
          className="absolute border-[2px] sm:border-[4px] border-[#4B6CFF] rounded-[12px] sm:rounded-[24px] transition-transform duration-1000 ease-out w-[calc(100%-16px)] h-[calc(100%-24px)] sm:w-[calc(100%-32px)] sm:h-[calc(100%-32px)]"
          style={{
            top: '50%',
            left: '50%',
            transform: pageLoaded 
              ? 'translate(-50%, -50%) scale(1)' 
              : 'translate(-50%, -50%) scale(1.05)',
            transformOrigin: 'center center',
            boxShadow: '0 0 16px 0 rgba(0,0,0, .6)'
          }}
        />
      </div>

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
              src="/optimized/vebg-static.webp"
              alt="Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
              style={{ 
                transform: 'translate3d(0,0,0)',
                backfaceVisibility: 'hidden'
              }}
            />
          </div>

          {/* Background Image */}
          <div 
            className="absolute inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat z-0"
            style={{
              backgroundImage: 'url("/optimized/vebg-static.webp")',
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
          {/* Background Video */}
          {renderVideo()}

          {/* Bottom Gradient Overlay */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-[100px] z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
            }}
          />

          {/* HeroBottom Container */}
          <div className="absolute bottom-0 left-0 right-0 h-[54vh] sm:h-[50vh] md:h-[46vh] flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 z-50">
            {/* Lauren & David SVG */}
            <div style={{ transitionDelay: videoReady ? '6000ms' : '0ms' }}
              className={`w-[90vw] sm:w-[80vw] md:w-[600px] 
                flex justify-center mt-0 
                transition-all duration-1000 ease-out
                ${videoReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                ${videoReady ? `transition-delay-[6000ms]` : ''}
              `}
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
            <div style={{ transitionDelay: videoReady ? '6200ms' : '0ms' }}
              className={`w-[90vw] sm:w-[80vw] md:w-[800px] flex justify-center transition-all duration-1000 ease-out ${
                videoReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="wedding-text text-2xl sm:text-3xl md:text-4xl leading-[200%]">
                Juin 19-21, 2025
              </p>
            </div>

            {/* Villa SVG */}
            <div style={{ transitionDelay: videoReady ? '6400ms' : '0ms' }}
              className={`w-[90vw] sm:w-[80vw] md:w-[600px] flex justify-center transition-all duration-1000 ease-out ${
                videoReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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
            <div style={{ transitionDelay: videoReady ? '6600ms' : '0ms' }}
              className={`w-[90vw] sm:w-[80vw] md:w-[800px] flex justify-center transition-all duration-1000 ease-out ${
                videoReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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
        {/* Paper texture overlay for content sections
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            filter: 'url(#roughpaper)',
            opacity: 0.04,
            zIndex: 200,
            minHeight: '400vh'
          }}
        />
 */}
        {/* Events Section */}
        <section ref={sectionRefs.events} id="events" className="min-h-screen py-12 sm:py-16 flex flex-col items-center">
          {/* Events Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-4 mt-8 sm:mb-16 sm:mt-24 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/optimized/events title mobile.webp"
                alt="Events"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
                priority
              />
              <Image
                src="/optimized/events title.webp"
                alt="Events"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
                priority
              />
            </div>
          </div>

          {/* Event Cards */}
          <div className="w-full max-w-[1200px] px-5 sm:px-4">
            {/* Welcome Drinks */}
            <div className="w-full py-2 group">
              <div className="w-[1200px] max-w-full px-5 sm:px-4 mx-auto flex flex-col-reverse md:flex-row gap-1 md:gap-8">
                <a href="https://www.edmundsocialclub.com/" target="_blank" rel="noopener noreferrer" className="block w-full md:w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/optimized/edmunds masked bw40.webp"
                      alt="Welcome Drinks B&W"
                      fill
                      loading="eager" // Changed from lazy to eager
                      priority={visibleSection === 'events'}
                      className="object-contain rounded-lg md:block hidden"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                    <Image
                      src="/optimized/edmunds masked color.webp"
                      alt="Welcome Drinks Color"
                      fill
                      loading="eager" // Changed from lazy to eager
                      priority={visibleSection === 'events'}
                      className="object-contain rounded-lg md:opacity-0 md:transition-opacity md:duration-300 md:ease-linear md:group-hover:opacity-100 block md:block"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                </a>
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 md:space-y-6">
                  <h3 className="text-[#FF7DC5] text-lg sm:text-xl font-extralight tracking-widest">Thursday June 19</h3>
                  <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest text-[#4B6CFF]">WELCOME DRINKS</h2>
                  <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr] gap-x-2 sm:gap-x-4 gap-y-2 tracking-wider text-sm sm:text-base text-[#4B6CFF]">
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">8pm onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.edmundsocialclub.com/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5] font-bold">Edmunds Social Club</a>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5] ml-1">(map)</a>
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
                      src="/optimized/main event.webp"
                      alt="Main Event B&W"
                      fill
                      loading="eager" // Changed from lazy to eager
                      priority={visibleSection === 'events'}
                      className="object-contain rounded-lg md:block hidden"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                    <Image
                      src="/optimized/main event color.webp"
                      alt="Main Event Color"
                      fill
                      loading="eager" // Changed from lazy to eager
                      priority={visibleSection === 'events'}
                      className="object-contain rounded-lg md:opacity-0 md:transition-opacity md:duration-300 md:ease-linear md:group-hover:opacity-100 block md:block"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                </a>
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 md:space-y-6">
                  <h3 className="text-[#FF7DC5] text-lg sm:text-xl font-extralight tracking-widest">Friday June 20</h3>
                  <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest text-[#4B6CFF]">MAIN EVENT</h2>
                  <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr] gap-x-2 sm:gap-x-4 gap-y-2 tracking-wider text-sm sm:text-base text-[#4B6CFF]">
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">5pm Onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.villa-ephrussi.com/en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5] font-bold">Villa Ephrussi de Rothschild</a>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5] ml-1">(map)</a>
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
                      src="/optimized/la vie en rose.webp"
                      alt="La Vie en Rosé B&W"
                      fill
                      loading="eager" // Changed from lazy to eager
                      priority={visibleSection === 'events'}
                      className="object-contain rounded-lg md:block hidden"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                    <Image
                      src="/optimized/la vie en color.webp"
                      alt="La Vie en Rosé Color"
                      fill
                      loading="eager" // Changed from lazy to eager
                      priority={visibleSection === 'events'}
                      className="object-contain rounded-lg md:opacity-0 md:transition-opacity md:duration-300 md:ease-linear md:group-hover:opacity-100 block md:block"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                </a>
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-2 md:space-y-6">
                  <h3 className="text-[#FF7DC5] text-lg sm:text-xl font-extralight tracking-widest">Saturday June 21</h3>
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest text-[#4B6CFF]">LA VIE EN ROSÉ</h2>
                    <h3 className="text-lg sm:text-xl font-extralight tracking-widest text-[#4B6CFF]">BEACH CLUB RECOVERY LOUNGE</h3>
                  </div>
                  <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr] gap-x-2 sm:gap-x-4 gap-y-2 tracking-wider text-sm sm:text-base text-[#4B6CFF]">
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">2pm-ish Onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.plage-de-passable.fr/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5] font-bold">Plage de Passable</a>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5] ml-1">(map)</a>
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

        {/* Area Section */}
        <section ref={sectionRefs.area} id="area" className="min-h-screen py-12 sm:py-16 flex flex-col items-center">
          {/* Area Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-4 sm:mb-16 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/optimized/area title mobile.webp"
                alt="Area"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/optimized/area title.webp"
                alt="Area"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          <div className="w-full max-w-[1200px] px-5 sm:px-4 text-[#4B6CFF]">
          <div className="space-y-4 sm:space-y-6 mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-extralight tracking-widest">TLDR</h2>
              <p className="text-sm sm:text-base leading-[200%]">We've put together an interactive map of the area to give people context on the location. Hopefully this helps with booking and/or planning to explore the area before, during or after the wedding.</p>
            </div>
            <h3 className="text-2xl sm:text-3xl font-light tracking-wide mb-4 sm:mb-8">Cap Ferrat Local Area</h3>
            
            {/* Interactive Map Component */}
            <div className="w-full mb-2 sm:mb-2">
              {/* Filter Buttons Row */}
              <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-4 sm:gap-2">
                {/* Left side text buttons */}
                <div className="flex gap-2">
                  <button 
                    className={`px-2 sm:px-6 py-1 sm:py-2 rounded-xl text-sm sm:text-base md:text-lg border-[1px] sm:border-2 transition-all duration-200 ${
                      mapLayers.events 
                        ? 'border-[#FF7700] text-[#FF7700] bg-[#FF7700] bg-opacity-10 [@media(hover:hover)]:hover:opacity-50' 
                        : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                    }`}
                    onClick={() => toggleLayer('events')}
                  >
                    Events
                  </button>
                  <button 
                    className={`px-2 sm:px-6 py-1 sm:py-2 rounded-xl text-sm sm:text-base md:text-lg border-[1px] sm:border-2 transition-all duration-200 ${
                      mapLayers.hotels 
                        ? 'border-[#4B6CFF] text-[#4B6CFF] bg-[#4B6CFF] bg-opacity-10 [@media(hover:hover)]:hover:opacity-50' 
                        : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                    }`}
                    onClick={() => toggleLayer('hotels')}
                  >
                    Hotels
                  </button>
                  <button 
                    className={`px-2 sm:px-6 py-1 sm:py-2 rounded-xl text-sm sm:text-base md:text-lg border-[1px] sm:border-2 transition-all duration-200 ${
                      mapLayers.walkTime 
                        ? 'border-[#FF7DC5] text-[#FF7DC5] bg-[#FF7DC5] bg-opacity-10 [@media(hover:hover)]:hover:opacity-50' 
                        : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                    }`}
                    onClick={() => toggleLayer('walkTime')}
                  >
                    Walk Time
                  </button>
                </div>
                
                {/* Right side icon buttons */}
                <div className="flex gap-2">
                  <button 
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border-[1px] sm:border-2 transition-all duration-200 ${
                      mapLayers.paintMap 
                        ? 'border-[#00B4AC] text-[#00B4AC] [@media(hover:hover)]:hover:opacity-50' 
                        : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                    }`}
                    onClick={() => toggleLayer('paintMap')}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src="/optimized/paint btn.webp"
                        alt="Paint Map Toggle"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </button>
                  <button 
                    className={`w-12 h-12 flex items-center justify-center rounded-xl border-[1px] sm:border-2 transition-all duration-200 ${
                      mapLayers.googleMap 
                        ? 'border-[#00B4AC] text-[#00B4AC] [@media(hover:hover)]:hover:opacity-50' 
                        : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                    }`}
                    onClick={() => toggleLayer('googleMap')}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src="/optimized/goog btn.webp"
                        alt="Google Map Toggle"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Map Layers Container */}
              <div className="relative w-full">
                <div className="relative w-full">
                  {/* Walk Layer - Top (z-index: 50) */}
                  <Image
                    src="/optimized/cf walk layer sm.webp"
                    alt="Walk Times"
                    width={1600}
                    height={1200}
                    loading="eager"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[50] ${
                      mapLayers.walkTime ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                  
                  {/* Hotel Layer (z-index: 40) */}
                  <Image
                    src="/optimized/cf hotel layer.webp"
                    alt="Hotels"
                    width={1200}
                    height={675}
                    loading="eager" // Changed from lazy to eager
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[40] ${
                      mapLayers.hotels ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                  
                  {/* Event Layer (z-index: 30) */}
                  <Image
                    src="/optimized/cf event layer updated sm.webp"
                    alt="Events"
                    width={1600}
                    height={1200}
                    loading="eager"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[30] ${
                      mapLayers.events ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                  
                  {/* Paint Map Layer (z-index: 20) */}
                  <Image
                    src="/optimized/cf paint map updated sm.webp"
                    alt="Painted Map"
                    width={1600}
                    height={1200}
                    loading="eager"
                    quality={60}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[20] ${
                      mapLayers.paintMap ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  
                  {/* Google Layer - Bottom (z-index: 10) */}
                  <Image
                    src="/optimized/cf goog map sm.webp"
                    alt="Google Map"
                    width={1600}
                    height={1200}
                    loading="eager"
                    quality={60}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 relative z-[10] ${
                      mapLayers.googleMap ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />

                  {/* Hotel Layer (z-index: 40) */}
                  <Image
                    src="/optimized/cf hotel layer sm.webp"
                    alt="Hotels"
                    width={1600}
                    height={1200}
                    loading="eager"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[40] ${
                      mapLayers.hotels ? 'opacity-100' : 'opacity-0'
                    }`}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
              </div>
            </div>

            {/* Riviera Map Component */}
            <div className="w-full mb-8">
              <div className="relative">
                {/* Map Layers Container */}
                <div className="relative w-full">
                  <div className="relative w-full">
                    {/* Reference Layer - Top (z-index: 50) */}
                    <Image
                      src="/optimized/riv ref layer.webp"
                      alt="Reference Layer"
                      width={1600}
                      height={1511}
                      loading="eager"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[50] ${
                        rivieraLayers.reference ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                    
                    {/* Drive Layer (z-index: 40) */}
                    <Image
                      src="/optimized/riv drive layer sm.webp"
                      alt="Drive Times"
                      width={1600}
                      height={1511}
                      loading="eager"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[40] ${
                        rivieraLayers.driveTime ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                    
                    {/* Florida Layer (z-index: 30) */}
                    <Image
                      src="/optimized/riv fla layer sm.webp"
                      alt="Florida Translation"
                      width={1600}
                      height={1511}
                      loading="eager"
                      quality={75}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[30] ${
                        rivieraLayers.florida ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                    
                    {/* Paint Map Layer (z-index: 20) */}
                    <Image
                      src="/optimized/riv paint map sm.webp"
                      alt="Painted Map"
                      width={1600}
                      height={1511}
                      loading="eager"
                      quality={60}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 absolute top-0 left-0 z-[20] ${
                        rivieraLayers.paintMap ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                    
                    {/* Google Layer - Bottom (z-index: 10) */}
                    <Image
                      src="/optimized/riv goog map sm.webp"
                      alt="Google Map"
                      width={1600}
                      height={1511}
                      loading="eager"
                      quality={60}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qQEE4OD5BPjIuMT5RS1FIVUJLU0tLV2JYVVlR/2wBDARVFxceGh4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR4eHR7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      className={`w-full h-auto object-contain rounded-lg transition-opacity duration-300 relative z-[10] ${
                        rivieraLayers.googleMap ? 'opacity-100' : 'opacity-0'
                      }`}
                      sizes="(max-width: 1200px) 100vw, 1200px"
                    />
                  </div>
                </div>

                {/* Title and Filter Buttons Container - Below map on mobile, overlaid on larger screens */}
                <div className="block sm:absolute sm:top-24 left-0 right-0 z-[60] mt-0 sm:mt-0">
                  {/* Riviera Map Title */}
                  <h3 className="text-2xl sm:text-3xl font-light tracking-wide mb-4 sm:mb-8">French Riviera, Côte d'Azur</h3>

                  {/* Filter Buttons Row for Riviera Map */}
                  <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-2">
                    {/* Left side text buttons */}
                    <div className="flex gap-2">
                      <button 
                        className={`px-2 sm:px-6 py-1 sm:py-2 rounded-xl text-sm sm:text-base md:text-lg border-[1px] sm:border-2 transition-all duration-200 ${
                          rivieraLayers.florida 
                            ? 'border-[#FF7700] text-[#FF7700] bg-[#FF7700] bg-opacity-10 [@media(hover:hover)]:hover:opacity-50' 
                            : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                        }`}
                        onClick={() => toggleLayer('florida', true)}
                      >
                        Florida Translation
                      </button>
                      <button 
                        className={`px-2 sm:px-6 py-1 sm:py-2 rounded-xl text-sm sm:text-base md:text-lg border-[1px] sm:border-2 transition-all duration-200 ${
                          rivieraLayers.driveTime 
                            ? 'border-[#FF7DC5] text-[#FF7DC5] bg-[#FF7DC5] bg-opacity-10 [@media(hover:hover)]:hover:opacity-50' 
                            : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                        }`}
                        onClick={() => toggleLayer('driveTime', true)}
                      >
                        Drive Time
                      </button>
                    </div>
                    
                    {/* Right side icon buttons */}
                    <div className="flex gap-2">
                      <button 
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border-[1px] sm:border-2 transition-all duration-200 ${
                          rivieraLayers.paintMap 
                            ? 'border-[#00B4AC] text-[#00B4AC] [@media(hover:hover)]:hover:opacity-50' 
                            : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                        }`}
                        onClick={() => toggleLayer('paintMap', true)}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src="/optimized/paint btn.webp"
                            alt="Paint Map Toggle"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </button>
                      <button 
                        className={`w-12 h-12 flex items-center justify-center rounded-xl border-[1px] sm:border-2 transition-all duration-200 ${
                          rivieraLayers.googleMap 
                            ? 'border-[#00B4AC] text-[#00B4AC] [@media(hover:hover)]:hover:opacity-50' 
                            : 'border-[#4B6CFF] border-opacity-50 text-[#4B6CFF] opacity-50 [@media(hover:hover)]:hover:opacity-100'
                        }`}
                        onClick={() => toggleLayer('googleMap', true)}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src="/optimized/goog btn.webp"
                            alt="Google Map Toggle"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 mt-12 mb-0 sm:mb-0">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-widest text-[#FF7DC5]">NOTE!</h2>
              <p className="text-sm sm:text-base leading-[200%]">There is a different town in France named Cap FerrEt, with an "E" not an "A". This is a different place, very far away. We'll be in Cap FerrAt, with an "A".  Don't get these confused or we will be sad.</p>
            </div>
          </div>
        </section>

        {/* Stay Section */}
        <section ref={sectionRefs.stay} id="stay" className="min-h-screen py-2 sm:py-16 flex flex-col items-center">
          {/* Stay Section Title */}
          <div className="w-full max-w-[2000px] px-5 sm:px-4 mb-4 sm:mb-16 relative overflow-visible">
            <div className="relative w-full">
              <Image
                src="/optimized/stay title mobile.webp"
                alt="Stay"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/optimized/stay title.webp"
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
                  <li className="pl-2 md:pl-4"><a href="https://www.fourseasons.com/capferrat/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Four Seasons: The Grand Hotel du Cap-Ferrat</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.capestel.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Hotel Cap-Estel</a></li>
                </ul>
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">4.5 STARS</h4>
                  <p className="italic text-sm leading-[200%]">Approachable luxury... pricey but less crazy</p>
                </div>
                <ul className="space-y-1 list-disc md:pl-8 pl-4 marker:text-[#4B6CFF] font-bold text-sm md:text-base">
                  <li className="pl-2 md:pl-4"><a href="https://www.lareservebeaulieu.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">La Reserve de Beaulieu</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.royal-riviera.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Royal Riviera</a></li>
                </ul>
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">4 STARS</h4>
                  <p className="italic leading-[200%] text-sm">Local boutique, upscale, more reasonable</p>
                </div>
                <ul className="space-y-1 list-disc md:pl-8 pl-4 marker:text-[#4B6CFF] font-bold text-sm md:text-base">
                  <li className="pl-2 md:pl-4"><a href="https://www.villa-capferrat.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">La Villa Cap Ferrat, Boutique Hotel & Spa</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.hotel-carlton-beaulieu.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Carlton Hotel, Beaulieu sur mer</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.welcomehotel.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Welcome Hotel, Villefranche sur mer</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.hotelversailles.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Hotel Versailles, Villefranche sur mer</a></li>
                  <li className="pl-2 md:pl-4"><a href="https://www.hotel-provencale.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF7DC5]">Hotel Provençale, Villefranche sur mer</a></li>
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
                src="/optimized/travel title mobile.webp"
                alt="Travel"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/optimized/travel title.webp"
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
                  <li><a href="https://www.google.com/maps/place/Nice+C%C3%B4te+d'Azur+Airport/@43.6584014,7.2029736,14z/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF7DC5]">Nice (NCE) Côte d'Azur Airport </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Large, modern intl airport, 25 min drive from Cap Ferrat</li>
                    </ul>
                  </li>
                  <li><a href="https://www.google.com/maps/place/Marseille+Provence+Airport/@43.4366961,5.2133322,14z/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF7DC5]">Marseille (MRS) Provence Airport</a> 
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">2 hr drive from Cap Ferrat (not ideal,never been)</li>
                    </ul>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm sm:text-base font-bold leading-[200%]">Flight Options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://www.google.com/travel/flights/search?tfs=CBwQAhopEgoyMDI1LTA2LTE8ag0IAhIJL20vMDJfMjg2cgwIAxIIL20vMGNwNncaKRIKMjAyNS0wNi0yMmoMCAMSCC9tLzBjcDZ3cg0IAhIJL20vMDJfMjg2QAFIAXABggELCP___________wGYAQE&tfu=EgYIABABGAA&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF7DC5]">From the US </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="text-sm sm:text-base leading-[200%]">Direct flights from from NY, Boston and DC on major carriers</li>
                      <li className="text-sm sm:text-base leading-[200%]">Most east coast flights are 8hr redeyes, leave 6-8pm ET, landing early AM France time</li>
                    </ul>
                  </li>
                  <li><a href="https://www.google.com/travel/flights/search?tfs=CBwQAhooEgoyMDI1LTA2LTE5agwIAxIIL20vMDRqcGxyDAgDEggvbS8wY3A2dxooEgoyMDI1LTA2LTIyagwIAxIIL20vMGNwNndyDAgDEggvbS8wNGpwbEABSAFwAYIBCwj___________8BmAEB&tfu=EgYIABABGAA&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF7DC5]">From the UK </a>
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
                src="/optimized/faq title mobile.webp"
                alt="FAQ"
                width={2000}
                height={100}
                className="w-full h-auto md:hidden"
              />
              <Image
                src="/optimized/faq title.webp"
                alt="FAQ"
                width={2000}
                height={100}
                className="w-full h-auto hidden md:block"
              />
            </div>
          </div>

          <div className="w-[800px] max-w-full px-5 sm:px-4 space-y-8 sm:space-y-12 text-[#4B6CFF]">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">DRESS CODE?</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">More details to come, but directionally you can't go wrong with Riviera Chic: light, airy & elegant linens & pastels.</p>
                <p className="text-sm sm:text-base leading-[200%]">The temperature is usually in the 70's and 80's. (Definitely no black tie)</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">CHILDCARE?</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">For anyone planning to bring their children to France and may be looking for local childcare options, we have been recommended English-speaking Silly Billy's English speaking babysitters in France. The hotels all also provide top-class childcare services. While the main event is for adults, we can potentially provide nanny services suring the main event and beach club day if needed, please let us know.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">GIFTS?</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">We are extremely grateful anyone would make the journey to celebrate with us in France and we do not take for granted the large time/effort/cost commitment. Your presence is the greatest present.</p>
                <p className="text-sm sm:text-base leading-[200%]">In lieu of gifts, we simply ask that you contribute generously to the European economy during your stay (and/or donate to your favorite charity).</p>
              </div>
            </div>

            {/* Playlist Section */}
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-extralight tracking-widest">PLAYLIST?</h3>
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-[200%]">Say no more, start vibing.</p>
                <LazySpotifyEmbed />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Image */}
        <div className="w-full relative">
          <div className="w-full relative">
            <Image
              src="/optimized/ld sheep txt.webp"
              alt="Footer Decoration"
              width={2000}
              height={667}
              className="w-full h-auto"
              priority={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 
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
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const newScrollVh = scrollPosition / windowHeight;
      setScrollVh(newScrollVh);

      // Control Lottie animation progress based on scroll
      if (lottieRef.current?.animationItem) {
        // Calculate progress (0 to 1) between 0.01vh and 1.00vh
        const progress = Math.max(0, Math.min(1, (newScrollVh - 0.01) / 0.99));
        // Use requestAnimationFrame for smooth performance
        requestAnimationFrame(() => {
          lottieRef.current?.animationItem?.goToAndStop(progress * lottieRef.current.animationItem.totalFrames, true);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animfull.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        if (text.startsWith('PK')) {
          throw new Error('The Lottie file appears to be in ZIP format. Please export it as a plain JSON file from your animation tool.');
        }
        const data = JSON.parse(text);
        setAnimationData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading animation';
        console.error('Error loading animation:', err);
        setError(errorMessage);
      }
    };
    
    loadAnimation();
  }, []);

  return (
    <main className="relative min-h-[200vh] w-full overflow-x-hidden">
      {/* Site Border */}
      <div className="fixed inset-0 border-[6px] border-[#4B6CFF] pointer-events-none z-[9999]" />

      {/* Debug Scroll Counter */}
      <div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg font-mono text-sm z-[1000]">
        {scrollVh.toFixed(2)}vh
      </div>

      {/* Intro Animation Container */}
      <div id="intro" 
        className="relative h-screen"
        style={{ 
          position: scrollVh >= 1.3 ? 'absolute' : 'fixed',
          top: scrollVh >= 1.3 ? '130vh' : 0,
          left: 0,
          right: 0,
          transform: 'translate3d(0,0,0)', // Hardware acceleration
          willChange: 'transform' // Optimization hint
        }}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat z-0"
          style={{
            backgroundImage: 'url("/ve%20hero%20bg.png")',
            position: scrollVh >= 1.3 ? 'absolute' : 'fixed',
            opacity: Math.max(0, Math.min(1, 1 - ((scrollVh - 0.4) / 0.2))) // Transition from 100% to 0% between 0.4vh and 0.6vh
          }}
        />

        {/* Single Lottie Animation */}
        <div className="absolute inset-0 [&>div]:w-full [&>div]:h-full [&>div>svg]:w-full [&>div>svg]:h-full [&>div>svg]:object-cover z-10">
          {error ? null : animationData && (
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop={false}
              autoplay={false}
              style={{ 
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translate3d(0,0,0)', // Hardware acceleration
                backfaceVisibility: 'hidden' // Additional optimization
              }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMin slice',
                progressiveLoad: true, // Load animation progressively
                hideOnTransparent: true // Optimization
              }}
            />
          )}
        </div>

        {/* HeroBottom Container */}
        <div 
          className="bottom-0 left-0 right-0 h-[50vh] flex flex-col items-center justify-center gap-2 z-50"
          style={{ 
            position: scrollVh >= 1.3 ? 'absolute' : 'fixed'
          }}
        >
          {/* Lauren & David SVG */}
          <div className="w-[600px] flex justify-center mt 1vh [transition:transform_500ms_ease-out]"
            style={{
              opacity: Math.max(0, Math.min(1, (scrollVh - 0.9) / (1 - 0.9))),
              transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 0.9) / (1 - 0.9)))}px)`
            }}>
            <Image
              src="/lauren david hero.svg"
              alt="Lauren & David"
              width={800}
              height={100}
              className="text-[#4B6CFF]"
            />
          </div>

          {/* Date */}
          <div className="w-[800px] flex justify-center [transition:transform_500ms_ease-out]"
            style={{
              opacity: Math.max(0, Math.min(1, (scrollVh - 0.94) / (1 - 0.9))),
              transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 0.94) / (1 - 0.9)))}px)`
            }}>
            <p className="wedding-text text-4xl leading-[200%]">
              Juin 19-21, 2025
            </p>
          </div>

          {/* Villa SVG */}
          <div className="w-[600px] flex justify-center [transition:transform_500ms_ease-out]"
            style={{
              opacity: Math.max(0, Math.min(1, (scrollVh - 0.98) / (1 - 0.9))),
              transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 0.98) / (1 - 0.9)))}px)`
            }}>
            <Image
              src="/villa hero.svg"
              alt="Villa Ephrussi de Rothschild"
              width={800}
              height={100}
              className="text-[#4B6CFF]"
            />
          </div>

          {/* Location */}
          <div className="w-[800px] flex justify-center [transition:transform_500ms_ease-out]"
            style={{
              opacity: Math.max(0, Math.min(1, (scrollVh - 1.02) / (1 - 0.9))),
              transform: `translateY(${Math.max(0, 30 * (1 - (scrollVh - 1.02) / (1 - 0.9)))}px)`
            }}>
            <p className="wedding-text text-xl leading-[200%]">
              Saint-Jean-Cap-Ferrat, Côte d'Azur, France
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections Container - Only starts after hero animation completes */}
      <div className="relative mt-[220vh] z-[100]">
        {/* SVG Filter Definition
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
        */}

        {/* Apply the filter to a background div that covers all content */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            filter: 'url(#roughpaper)',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 121,
            minHeight: '400vh' // Make sure it covers all content sections
          }}
        />

        {/* Events Section */}
        <section id="events" className="relative min-h-screen py-24 flex flex-col items-center">
          <div className="w-full max-w-[2000px] px-4 mb-16">
            <Image
              src="/events title.svg"
              alt="Events"
              width={2000}
              height={100}
              className="w-full h-auto"
            />
          </div>

          {/* Event Cards */}
          <div className="w-full text-[#4B6CFF]">
            {/* Welcome Drinks */}
            <div className="w-full py-8 group">
              <div className="w-[1200px] max-w-full px-4 mx-auto flex gap-8">
                <a href="https://www.mayssabeach.fr/en/restaurant" target="_blank" rel="noopener noreferrer" className="block w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/welcome drinks.png"
                      alt="Welcome Drinks B&W"
                      fill
                      className="object-contain rounded-lg"
                    />
                    <Image
                      src="/welcome drinks color.png"
                      alt="Welcome Drinks Color"
                      fill
                      className="object-contain rounded-lg opacity-0 transition-opacity duration-300 ease-linear group-hover:opacity-100"
                    />
                  </div>
                </a>
                <div className="w-1/2 flex flex-col justify-center space-y-6">
                  <h3 className="text-[#FF89A9] text-xl font-extralight tracking-widest">Thursday June 19</h3>
                  <h2 className="text-3xl font-extralight tracking-widest">WELCOME DRINKS</h2>
                  <div className="grid grid-cols-[72px_1fr] gap-x-2 gap-y-2 tracking-wider">
                    {/* <div className="contents">
                      <span className="font-light">Who</span>
                      <span className="font-bold">Everyone</span>
                    </div> */}
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
            <div className="w-full py-8 group">
              <div className="w-[1200px] max-w-full px-4 mx-auto flex gap-8">
                <a href="https://www.villa-ephrussi.com/en" target="_blank" rel="noopener noreferrer" className="block w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/main event.png"
                      alt="Main Event B&W"
                      fill
                      className="object-contain rounded-lg"
                    />
                    <Image
                      src="/main event color.png"
                      alt="Main Event Color"
                      fill
                      className="object-contain rounded-lg opacity-0 transition-opacity duration-300 ease-linear group-hover:opacity-100"
                    />
                  </div>
                </a>
                <div className="w-1/2 flex flex-col justify-center space-y-6">
                  <h3 className="text-[#FF89A9] text-xl font-extralight tracking-widest">Friday June 20</h3>
                  <h2 className="text-3xl font-extralight tracking-widest">MAIN EVENT</h2>
                  <div className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-2 tracking-wider">
                    {/* <div className="contents">
                      <span className="font-light">Who</span>
                      <span className="font-bold">Everyone</span>
                    </div> */}
                    <div className="contents">
                      <span className="font-light">When</span>
                      <span className="font-bold">5pm Onwards</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">Where</span>
                      <div>
                        <a href="https://www.villa-ephrussi.com/en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] font-bold">Villa Ephrussi de Rothschild</a>
                        <span className="font-regular text-[#4B6CFF] leading-[100%]">&nbsp;&nbsp;|&nbsp;</span>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9] ml-1">map</a>
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
            <div className="w-full py-8 group">
              <div className="w-[1200px] max-w-full px-4 mx-auto flex gap-8">
                <a href="https://www.plage-de-passable.fr/" target="_blank" rel="noopener noreferrer" className="block w-1/2 cursor-pointer">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/la vie en rose.png"
                      alt="La Vie en Rosé B&W"
                      fill
                      className="object-contain rounded-lg"
                    />
                    <Image
                      src="/la vie en color.png"
                      alt="La Vie en Rosé Color"
                      fill
                      className="object-contain rounded-lg opacity-0 transition-opacity duration-300 ease-linear group-hover:opacity-100"
                    />
                  </div>
                </a>
                <div className="w-1/2 flex flex-col justify-center space-y-6">
                  <h3 className="text-[#FF89A9] text-xl font-extralight tracking-widest">Saturday June 21</h3>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-extralight tracking-widest">LA VIE EN ROSÉ</h2>
                    <h3 className="text-xl font-extralight tracking-widest">BEACH CLUB RECOVERY LOUNGE</h3>
                  </div>
                  <div className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-2 tracking-wider">
                    {/* <div className="contents">
                      <span className="font-light">Who</span>
                      <span className="font-bold">Everyone</span>
                    </div> */}
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
                      <span className="font-bold">Maximum-chic, Hawtest, Euro-med beach attire</span>
                    </div>
                    <div className="contents">
                      <span className="font-light">What</span>
                      <span className="font-bold">Relaxed & casual lounge day à la plage*</span>
                    </div>
                    <div className="col-span-2 italic text-sm mt-4 leading-[160%]">*If brunch + beach chic turn into vibey, sexy-sex, tropical-house, sunset dance party on the Riviera... Fantastique!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Section */}
        <section id="stay" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-full max-w-[2000px] px-4 mb-16">
            <Image
              src="/stay title.svg"
              alt="Stay"
              width={2000}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 space-y-16 text-[#4B6CFF]">
            <div className="space-y-6">
              <h2 className="text-3xl font-extralight tracking-widest">TLDR</h2>
              <p className="leading-[200%]">Hotels & AirBnBs in Cap Ferrat are the best option, but supply is limited & costly... this is the most painful part of this location. Villefranche and Beaulieu-sur-mer are very close (5min drive) and you really can't go wrong.</p>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-[#4B6CFF] text-2xl font-extralight tracking-widest mb-4">HOTELS</h3>
                <p className="leading-[200%]">Hotels in the region can be a bit… tricky… and don't do room blocks the same way as the US. The luxe hotels also block-off summer wknd room availability on their websites, even when they do have rooms available. You might have to call the hotel to get the actual room availability or search for more than 3 days.</p>
                <p className="mt-4 leading-[200%]">The prices for the high-end hotels that target Americans/foreigners are pretty extreme, but below is our rough breakdown of the hotel market:</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">5 STARS</h4>
                  <p className="leading-[200%] italic text-sm">Max luxe, max price... money no object</p>
                </div>
                <ul className="space-y-2 list-disc marker:text-[#4B6CFF] pl-8 font-bold">
                  <li className="pl-4"><a href="https://www.fourseasons.com/capferrat/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Four Seasons: The Grand Hotel du Cap-Ferrat</a></li>
                  <li className="pl-4"><a href="https://www.capestel.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Hotel Cap-Estel</a></li>
                </ul>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">4.5 STARS</h4>
                  <p className="italic text-sm leading-[200%]">Approachable luxury... pricey but less crazy</p>
                </div>
                <ul className="space-y-1 list-disc marker:text-[#4B6CFF] pl-8 font-bold">
                  <li className="pl-4"><a href="https://www.lareservebeaulieu.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">La Reserve de Beaulieu</a></li>
                  <li className="pl-4"><a href="https://www.royal-riviera.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Royal Riviera</a></li>
                </ul>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-4">
                  <h4 className="text-large font-bold tracking-widest">4 STARS</h4>
                  <p className="italic leading-[200%] text-sm">Local boutique, upscale experience, "reasonable" cost</p>
                </div>
                <ul className="space-y-1 list-disc marker:text-[#4B6CFF] pl-8 font-bold">
                  <li className="pl-4"><a href="https://www.villa-capferrat.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">La Villa Cap Ferrat, Boutique Hotel & Spa</a></li>
                  <li className="pl-4"><a href="https://www.hotel-carlton-beaulieu.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Carlton Hotel, Beaulieu sur mer</a></li>
                  <li className="pl-4"><a href="https://www.welcomehotel.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Welcome Hotel, Villefranche sur mer</a></li>
                  <li className="pl-4"><a href="https://www.hotelversailles.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Hotel Versailles, Villefranche sur mer</a></li>
                  <li className="pl-4"><a href="https://www.hotel-provencale.com" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] transition-colors duration-150 hover:text-[#FF89A9]">Hotel Provençale, Villefranche sur mer</a></li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl font-extralight tracking-widest mb-4">AIRBNBs</h3>
              <p className="leading-[200%]">AirBnBs are a great option for larger groups/families and there is an abundance of options. Please note that these are public beaches and beautiful marinas with gorgeous restaurants, bars and shops all within walking distance so what some of these lack in amenity offerings, is more than made up for in the neighborhoods.</p>
              <p className="mt-4 leading-[200%]">Please note we have personally reserved a number of the Cap Ferrat AirBnB listings and are planning to help organize larger groups.</p>
            </div>
          </div>
        </section>

        {/* Travel Section */}
        <section id="travel" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-full max-w-[2000px] px-4 mb-16">
            <Image
              src="/travel title.svg"
              alt="Travel"
              width={2000}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 space-y-16 text-[#4B6CFF]">
            <div className="space-y-6">
              <h2 className="text-3xl font-extralight tracking-widest">TLDR</h2>
              <div className="space-y-1">
                <p className="leading-[200%]"><span className="font-bold">Nice (NCE) Côte d'Azur Airport</span> is where to fly. It's a ~25 min drive, clean, modern and easy</p>
                <p className="leading-[200%]"><span className="font-bold">No need to rent a car</span> unless you want to. Everything is within ~20 min walk or quick/easy Uber</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-extralight tracking-widest">GETTING THERE</h3>
              <div className="space-y-4">
                <p className="font-bold leading-[200%]">Airport Options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://www.google.com/maps/place/Nice+C%C3%B4te+d'Azur+Airport/@43.6584014,7.2029736,14z/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">Nice (NCE) Côte d'Azur Airport </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">Large, modern intl airport, 25 min drive from Cap Ferrat</li>
                    </ul>
                  </li>
                  <li><a href="https://www.google.com/maps/place/Marseille+Provence+Airport/@43.4366961,5.2133322,14z/" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">Marseille (MRS) Provence Airport</a> 
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">2 hr drive from Cap Ferrat (not ideal,never been)</li>
                    </ul>
                  </li>
                </ul>
              </div>
              

              <div className="space-y-4">
              <p className="font-bold leading-[200%]">Flight Options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><a href="https://www.google.com/travel/flights/search?tfs=CBwQAhopEgoyMDI1LTA2LTE4ag0IAhIJL20vMDJfMjg2cgwIAxIIL20vMGNwNncaKRIKMjAyNS0wNi0yMmoMCAMSCC9tLzBjcDZ3cg0IAhIJL20vMDJfMjg2QAFIAXABggELCP___________wGYAQE&tfu=EgYIABABGAA&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">From the US </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">Direct flights from from NY, Boston and DC on major carriers</li>
                      <li className="leading-[200%]">Most east coast flights are 8hr redeyes, leave 6-8pm ET, landing early AM France time</li>
                    </ul>
                  </li>
                  <li><a href="https://www.google.com/travel/flights/search?tfs=CBwQAhooEgoyMDI1LTA2LTE5agwIAxIIL20vMDRqcGxyDAgDEggvbS8wY3A2dxooEgoyMDI1LTA2LTIyagwIAxIIL20vMGNwNndyDAgDEggvbS8wNGpwbEABSAFwAYIBCwj___________8BmAEB&tfu=EgYIABABGAA&hl=en" target="_blank" rel="noopener noreferrer" className="text-[#00B4AC] font-bold transition-colors duration-150 hover:text-[#FF89A9]">From the UK </a>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">Direct ~2hr flights from London on B, Air France & budget carriers</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-extralight tracking-widest">GETTING AROUND</h3>
              <p className="leading-[200%]">Cap Ferrat itself and the greater area are both very small, so getting around is pretty easy. You don't need a car at all. FYI, some of the roads are a bit tricky/tight/windy which is relevant for both walking or rental cars.</p>

              <div className="space-y-4">
                <p className="font-bold leading-[200%]">Transportation options:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-bold">Ubers + walking</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">Ubers are very reliable, easy, safe and reasonably priced.</li>
                      <li className="leading-[200%]">All of the venues are very walkable, its europe.</li>
                    </ul>
                  </li>
                  <li><span className="font-bold">Rental Cars</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">Definitely not needed but nice to have if you really want to explore the extended area</li>
                    </ul>
                  </li>
                  <li><span className="font-bold">Shuttles</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li className="leading-[200%]">We'll provide shuttle service on Friday for main event to/from most locations</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>



        {/* FAQ Section */}
        <section id="faq" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-full max-w-[2000px] px-4 mb-16">
            <Image
              src="/faq title.svg"
              alt="FAQ"
              width={2000}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 space-y-12 text-[#4B6CFF]">
            <div className="space-y-6">
              <h3 className="text-2xl font-extralight tracking-widest">DRESS CODE</h3>
              <div className="space-y-4">
                <p className="leading-[200%]">More details to come, but directionally you can't go wrong with Riviera Chic: light, airy & elegant linens & pastels.</p>
                <p className="leading-[200%]">The temperature is usually in the 70's and 80's. (Definitely no black tie)</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-extralight tracking-widest">CHILDCARE</h3>
              <div>
                <p className="leading-[200%]">For anyone planning to bring their children to France and may be looking for local childcare options, we have been recommended English-speaking Silly Billy's English speaking babysitters in France . Please make enquiries directly.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-extralight tracking-widest">GIFTS</h3>
              <div className="space-y-4">
                <p className="leading-[200%]">We are extremely grateful anyone would make the journey to celebrate with us in France and we do not take for granted the large time/effort/cost commitment. Your presence is the greatest present.</p>
                <p className="leading-[200%]">In lieu of gifts, we simply ask that you contribute generously to the European economy during your stay (and/or donate to your favorite charity).</p>
              </div>
            </div>
          </div>
        </section>


        {/* Area Section */}
        <section id="area" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-full max-w-[2000px] px-4 mb-16">
            <Image
              src="/area title.svg"
              alt="Area"
              width={2000}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 text-[#4B6CFF]">
            <p className="text-2xl leading-[200%]">COMING SOON</p>
          </div>
        </section>




      </div>
    </main>
  );
} 
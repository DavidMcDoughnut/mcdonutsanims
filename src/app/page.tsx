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
  const [introOpacity, setIntroOpacity] = useState(1);
  const [scrollVh, setScrollVh] = useState(0);
  const sketchRef = useRef<LottieRefCurrentProps>(null);
  const script2Ref = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Update scroll progress in vh units
      setScrollVh(scrollPosition / windowHeight);

      // Calculate opacity progress (over half viewport)
      const opacityProgress = Math.min(1, scrollPosition / (windowHeight * 0.5));
      const easedProgress = easeOutExpo(opacityProgress);
      const newOpacity = Math.max(0, 1 - easedProgress);
      setOpacity(newOpacity);

      // Calculate intro section opacity (between 100vh and 150vh)
      const introFadeStart = windowHeight; // Start fading at 100vh
      const introFadeEnd = windowHeight * 1.5; // Complete fade by 150vh
      const introProgress = Math.max(0, Math.min(1, (scrollPosition - introFadeStart) / (introFadeEnd - introFadeStart)));
      setIntroOpacity(1 - introProgress);

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
      {/* Debug Scroll Counter */}
      <div className="fixed top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg font-mono text-sm z-[1000]">
        {scrollVh.toFixed(2)}vh
      </div>

      {/* Intro Animation Container */}
      <div id="intro" 
        className="relative h-screen"
        style={{ 
          position: scrollVh >= 1 ? 'absolute' : 'fixed',
          top: scrollVh >= 1 ? '100vh' : 0,
          left: 0,
          right: 0,
          pointerEvents: introOpacity === 0 ? 'none' : 'auto'
        }}
      >
        {/* Background Image */}
        <div 
          className="inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat transition-opacity duration-100 z-0"
          style={{
            backgroundImage: 'url("/ve%20hero%20bg.png")',
            opacity,
            position: scrollVh >= 1 ? 'absolute' : 'fixed'
          }}
        />
        
        {/* Script1 Lottie Animation */}
        <div className="w-full flex justify-center mt-[2vh] transition-opacity duration-100 z-10"
          style={{
            position: scrollVh >= 1 ? 'absolute' : 'fixed'
          }}>
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
          className="inset-x-0 top-0 h-screen bg-cover bg-top bg-no-repeat pointer-events-none transition-opacity duration-100 z-20"
          style={{
            backgroundImage: 'url("/ve%20fg.png")',
            opacity,
            position: scrollVh >= 1 ? 'absolute' : 'fixed'
          }}
        />

        {/* Sketch Animation Container */}
        <div className="inset-x-0 top-0 h-screen w-screen z-30"
          style={{
            position: scrollVh >= 1 ? 'absolute' : 'fixed'
          }}>
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
        <div className="w-full flex justify-center mt-[2vh] transition-opacity duration-100 z-40"
          style={{
            position: scrollVh >= 1 ? 'absolute' : 'fixed'
          }}>
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
          className="bottom-0 left-0 right-0 h-[50vh] flex flex-col items-center justify-center gap-4 transition-opacity duration-1000 z-50"
          style={{ 
            opacity: heroBottomOpacity,
            position: scrollVh >= 1 ? 'absolute' : 'fixed'
          }}
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
      </div>

      {/* Content Sections Container - Only starts after hero animation completes */}
      <div className="relative mt-[200vh] z-[100] ">
        {/* Events Section */}
        <section id="events" className="relative min-h-screen py-24 flex flex-col items-center">
          <div className="w-[800px] max-w-full px-4 mb-16">
            <Image
              src="/events title.svg"
              alt="Events"
              width={800}
              height={100}
              className="w-full h-auto"
            />
          </div>

          {/* Event Cards */}
          <div className="w-[1200px] max-w-full px-4 space-y-24">
            {/* Welcome Drinks */}
            <div className="space-y-6">
              <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg">
                <Image
                  src="/welcome drinks.png"
                  alt="Welcome Drinks"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-[#FF89A9] text-xl">Thursday June 19</h3>
                <h2 className="text-[#4B6CFF] text-3xl font-light">WELCOME DRINKS</h2>
                <div className="space-y-2 text-gray-600">
                  <p>Who: Everyone</p>
                  <p>When: 8pm onwards</p>
                  <p>Where: Mayssa Beach <span className="text-[#4B6CFF]">(map)</span></p>
                  <p>Wear: Riviera casual</p>
                </div>
              </div>
            </div>

            {/* Main Event */}
            <div className="space-y-6">
              <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg">
                <Image
                  src="/main event.png"
                  alt="Main Event"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-[#FF89A9] text-xl">Friday June 20</h3>
                <h2 className="text-[#4B6CFF] text-3xl font-light">MAIN EVENT</h2>
                <div className="space-y-2 text-gray-600">
                  <p>Who: Everyone</p>
                  <p>When: 5pm Onwards</p>
                  <p>Where: Villa Ephrussi de Rothschild <span className="text-[#4B6CFF]">(map)</span></p>
                  <p>Wear: Riviera semi-formal (Not black tie)</p>
                </div>
              </div>
            </div>

            {/* La Vie en Rosé */}
            <div className="space-y-6">
              <div className="relative w-full aspect-[2/1] overflow-hidden rounded-lg">
                <Image
                  src="/la vie en rose.png"
                  alt="La Vie en Rosé"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-[#FF89A9] text-xl">Saturday June 21</h3>
                <h2 className="text-[#4B6CFF] text-3xl font-light">LA VIE EN ROSÉ</h2>
                <h3 className="text-[#4B6CFF] text-xl font-light">BEACH CLUB RECOVERY LOUNGE</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Who: Everyone</p>
                  <p>When: 2pm-ish Onwards</p>
                  <p>Where: Plage de Passable <span className="text-[#4B6CFF]">(map)</span></p>
                  <p>Wear: Maximum-chic, Hawtest, Euro-med beach attire</p>
                  <p>What: Relaxed & casual lounge day à la plage</p>
                  <p className="italic text-sm mt-4">If brunch + beach chic turn into vibey, sexy-sex, tropical-house, sunset dance party on the Riviera... Fantastique!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Section */}
        <section id="stay" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-[800px] max-w-full px-4 mb-16">
            <Image
              src="/stay title.svg"
              alt="Stay"
              width={800}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 space-y-12">
            <div className="text-center text-gray-600">
              <p>Hotels & AirBnBs in Cap Ferrat are the best option, but supply is limited & costly... this is the most painful part of this location. Villefranche and Beaulieu-sur-mer are very close (5min drive) and you really can't go wrong.</p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[#4B6CFF] text-2xl mb-2">5 STARS</h3>
                <p className="text-gray-500 italic mb-4">Max luxe, max price... money no object</p>
                <ul className="space-y-1 text-[#4B6CFF]">
                  <li>• Four Seasons: The Grand Hotel du Cap-Ferrat</li>
                  <li>• Hotel Cap-Estel</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#4B6CFF] text-2xl mb-2">4.5 STARS</h3>
                <p className="text-gray-500 italic mb-4">Approachable luxury, expensive but this wedding weekend is a treat!</p>
                <ul className="space-y-1 text-[#4B6CFF]">
                  <li>• La Reserve de Beaulieu</li>
                  <li>• Royal Riviera</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#4B6CFF] text-2xl mb-2">4 STARS</h3>
                <p className="text-gray-500 italic mb-4">Local boutique, upscale cool experience at reasonable cost</p>
                <ul className="space-y-1 text-[#4B6CFF]">
                  <li>• La Villa Cap Ferrat, Boutique Hotel & Spa</li>
                  <li>• Carlton Hotel, Beaulieu sur mer</li>
                  <li>• Welcome Hotel, Villefranche sur mer</li>
                  <li>• Hotel Versailles, Villefranche sur mer</li>
                  <li>• Hotel Provençale, Villefranche sur mer</li>
                </ul>
              </div>
            </div>

            <div className="text-center text-gray-600 mt-12">
              <h3 className="text-[#4B6CFF] text-2xl mb-4">AIRBNBs</h3>
              <p>AirBnBs are a great option for larger groups/families and there is an abundance of options. Please note that these are public beaches and beautiful marinas with gorgeous restaurants, bars and shops all within walking distance so what some of these lack in amenity offerings, is more than made up for in the neighborhoods.</p>
              <p className="mt-4">Please note we have personally reserved a number of the Cap Ferrat AirBnB listings and are planning to help organize larger groups.</p>
            </div>
          </div>
        </section>

        {/* Travel Section */}
        <section id="travel" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-[800px] max-w-full px-4 mb-16">
            <Image
              src="/travel title.svg"
              alt="Travel"
              width={800}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 space-y-12">
            <div className="text-center space-y-4">
              <h3 className="text-[#4B6CFF] text-2xl">TLDR</h3>
              <p className="text-gray-600">Nice (NCE) Côte d'Azur Airport is where to fly. It's a ~25 min drive, clean, modern and easy.</p>
              <p className="text-gray-600">No need to rent a car unless you want to. Everything is within ~20 min walk or quick/easy Uber.</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl">GETTING THERE</h3>
              <div className="space-y-4">
                <p className="text-[#4B6CFF] font-medium">Airport Options:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Nice (NCE) Côte d'Azur Airport (strongly recommended!)
                    <p className="mt-1">• Large, international airport, 25 min drive from Cap Ferrat. Very nice, clean airport.</p>
                  </li>
                  <li>Marseille (MRS) Provence Airport (not ideal)
                    <p className="mt-1">• 2 hour drive from Cap Ferrat (never been)</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-[#4B6CFF] font-medium">From the US</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>~8hr direct flights from from NY, Boston and DC on the major US airlines.</li>
                  <li>Most of the east coast flights are redeye leaving 6-8pm ET, landing</li>
                </ul>
              </div>

              <div className="space-y-4">
                <p className="text-[#4B6CFF] font-medium">From the UK</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>~2hr direct flights from London on BA and budget carriers</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl">GETTING AROUND</h3>
              <p className="text-gray-600">Cap Ferrat itself and the greater area are both very small, so getting around is pretty easy. You don't need a car at all. FYI, some of the roads are a bit tricky/tight/windy which is relevant for both walking or rental cars.</p>

              <div className="space-y-4">
                <p className="text-[#4B6CFF] font-medium">Transportation options:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Ubers + walking (recommended!)
                    <p className="mt-1">• Ubers are very reliable, easy, safe and reasonably priced.</p>
                    <p>• All of the venus are very walkable, its europe.</p>
                  </li>
                  <li>Rental Car
                    <p className="mt-1">• Definitely not needed but nice to have if you really want to explore the extended area</p>
                  </li>
                  <li>Shuttle
                    <p className="mt-1">• We'll provide shuttle service on Friday for main event to/from most locations</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Area Section */}
        <section id="area" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-[800px] max-w-full px-4 mb-16">
            <Image
              src="/area title.svg"
              alt="Area"
              width={800}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 flex justify-center">
            <p className="text-[#4B6CFF] text-2xl">COMING SOON</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="min-h-screen py-24 flex flex-col items-center">
          <div className="w-[800px] max-w-full px-4 mb-16">
            <Image
              src="/faq title.svg"
              alt="FAQ"
              width={800}
              height={100}
              className="w-full h-auto"
            />
          </div>

          <div className="w-[800px] max-w-full px-4 space-y-12">
            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl">DRESS CODE</h3>
              <div className="text-gray-600 space-y-4">
                <p>More details to come, but directionally you can't go wrong with Riviera Chic: light, airy & elegant linens & pastels.</p>
                <p>The temperature is usually in the 70's and 80's. (Definitely no black tie)</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl">CHILDCARE</h3>
              <div className="text-gray-600">
                <p>For anyone planning to bring their children to France and may be looking for local childcare options, we have been recommended English-speaking Silly Billy's English speaking babysitters in France . Please make enquiries directly.</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[#4B6CFF] text-2xl">GIFTS</h3>
              <div className="text-gray-600 space-y-4">
                <p>We are extremely grateful anyone would make the journey to celebrate with us in France and we do not take for granted the large time/effort/cost commitment. Your presence is the greatest present.</p>
                <p>In lieu of gifts, we simply ask that you contribute generously to the European economy during your stay (and/or donate to your favorite charity).</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 
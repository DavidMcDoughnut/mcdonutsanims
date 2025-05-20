const puppeteer = require('puppeteer');

async function captureWebsite() {
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 60000
  });
  
  const page = await browser.newPage();
  
  try {
    // Set viewport to a laptop-like width
    await page.setViewport({
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    });

    // Navigate with a long timeout
    await page.goto('http://localhost:3002/updates', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 5000));

    // First handle the Spotify iframe specifically
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const spotifyIframe = document.querySelector('iframe[src*="spotify"]');
        if (spotifyIframe) {
          // Create a new iframe with same attributes but force loading
          const newFrame = document.createElement('iframe');
          newFrame.src = spotifyIframe.src;
          newFrame.style.cssText = `
            border-radius: 12px;
            width: 100%;
            height: 352px;
            border: none;
            opacity: 1;
            visibility: visible;
            display: block;
          `;
          newFrame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
          newFrame.loading = "eager";
          
          // Replace the old iframe
          spotifyIframe.parentNode.replaceChild(newFrame, spotifyIframe);
          
          // Wait for the new iframe to load
          newFrame.onload = () => {
            setTimeout(resolve, 5000); // Give extra time for Spotify to initialize
          };
        } else {
          resolve();
        }
      });
    });

    // Now handle the rest of the page
    await page.evaluate(() => {
      // Remove scrolling constraints
      document.querySelector('main').style.height = 'auto';
      document.querySelector('main').style.overflow = 'visible';
      document.querySelector('.h-full.overflow-y-auto').style.height = 'auto';
      document.querySelector('.h-full.overflow-y-auto').style.overflow = 'visible';
      
      // Clean up form card
      const formCard = document.querySelector('#formcard');
      formCard.style.backgroundColor = 'white';
      formCard.style.backdropFilter = 'none';
      formCard.style.opacity = '1';
      formCard.style.animation = 'none';
      
      // Remove background
      document.querySelector('.fixed.inset-0').style.display = 'none';
      document.body.style.backgroundColor = 'white';

      // Handle all images, including those in buttons/links
      document.querySelectorAll('img').forEach(img => {
        // Get the actual src from Next.js image
        const actualSrc = img.currentSrc || img.src;
        
        // Create a new image element
        const newImg = document.createElement('img');
        newImg.src = actualSrc;
        newImg.style.width = getComputedStyle(img).width;
        newImg.style.height = getComputedStyle(img).height;
        newImg.style.opacity = '1';
        newImg.style.animation = 'none';
        newImg.style.transition = 'none';
        newImg.style.objectFit = 'cover';
        
        // Replace the original image
        img.parentNode.replaceChild(newImg, img);
      });

      // Remove hover effects from parent elements
      document.querySelectorAll('a, button').forEach(el => {
        el.style.transform = 'none';
        el.style.transition = 'none';
        el.className = ''; // Remove Tailwind classes that might affect display
      });

      // Force any background images to load
      document.querySelectorAll('*').forEach(el => {
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          el.style.opacity = '1';
          el.style.animation = 'none';
          el.style.transition = 'none';
        }
      });
    });

    // Wait for everything to settle
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Take the screenshot
    const formCard = await page.$("#formcard");
    if (!formCard) {
      throw new Error('Could not find form card element');
    }
    
    await formCard.screenshot({
      path: 'updates-page.png',
      omitBackground: false
    });

    console.log('Screenshot has been generated as updates-page.png');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureWebsite(); 
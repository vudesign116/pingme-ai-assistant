// iOS Safari viewport fixes
export const setupIOSViewport = () => {
  // Check if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (!isIOS) return;

  // Fix for iOS Safari viewport height issues
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set initial value
  setVH();

  // Update on resize (includes keyboard show/hide)
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });

  // Handle focus events for input elements
  const handleInputFocus = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      // Scroll to input after keyboard appears
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }, 300);
    }
  };

  const handleInputBlur = () => {
    // Reset viewport height when keyboard hides
    setTimeout(setVH, 300);
  };

  document.addEventListener('focusin', handleInputFocus);
  document.addEventListener('focusout', handleInputBlur);

  // Prevent body scroll when chat is focused
  const preventBodyScroll = (e) => {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer && chatContainer.contains(e.target)) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
  };

  const allowBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  };

  document.addEventListener('focusin', preventBodyScroll);
  document.addEventListener('focusout', allowBodyScroll);

  // Cleanup function
  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
    document.removeEventListener('focusin', handleInputFocus);
    document.removeEventListener('focusout', handleInputBlur);
    document.removeEventListener('focusin', preventBodyScroll);
    document.removeEventListener('focusout', allowBodyScroll);
  };
};
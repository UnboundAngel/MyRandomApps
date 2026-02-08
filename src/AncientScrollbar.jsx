import React, { useRef, useEffect } from 'react';

/**
 * AncientScrollbar Component
 * A self-contained scrollbar component with an "Ancient/Medieval" theme.
 */
const AncientScrollbar = ({ children, className = '' }) => {
  const wrapperRef = useRef(null);
  const uiContainerRef = useRef(null);
  const bottomRollRef = useRef(null);
  const paperRef = useRef(null);
  
  const dragRef = useRef({
    isDragging: false,
    startY: 0,
    startTop: 0,
    rollHeight: 32
  });

  const updateThumbPosition = () => {
    const wrapper = wrapperRef.current;
    const uiContainer = uiContainerRef.current;
    const bottomRoll = bottomRollRef.current;
    const paper = paperRef.current;
    
    if (!wrapper || !uiContainer || !bottomRoll || !paper) return;
    
    const { isDragging, rollHeight } = dragRef.current;
    if (isDragging) return;

    const { scrollTop, scrollHeight, clientHeight } = wrapper;
    const maxScroll = scrollHeight - clientHeight;
    
    if (maxScroll <= 0) {
      bottomRoll.style.display = 'none';
      paper.style.display = 'none';
      return;
    }

    bottomRoll.style.display = 'block';
    paper.style.display = 'block';

    const scrollPercentage = scrollTop / maxScroll;
    const trackAvailableHeight = uiContainer.clientHeight - rollHeight;
    const newTop = scrollPercentage * trackAvailableHeight;

    bottomRoll.style.top = `${newTop}px`;
    paper.style.height = `${newTop}px`;
  };

  useEffect(() => {
    const bottomRoll = bottomRollRef.current;

    const handleMouseDown = (e) => {
      e.preventDefault();
      const style = window.getComputedStyle(bottomRoll);
      
      dragRef.current.isDragging = true;
      dragRef.current.startY = e.clientY;
      dragRef.current.startTop = parseInt(style.top) || 0;
      
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!dragRef.current.isDragging) return;
      
      const wrapper = wrapperRef.current;
      const uiContainer = uiContainerRef.current;
      const bottomRoll = bottomRollRef.current;
      const paper = paperRef.current;

      if (!wrapper || !uiContainer || !bottomRoll || !paper) return;
      
      const { startY, startTop, rollHeight } = dragRef.current;
      const deltaY = e.clientY - startY;
      const trackAvailableHeight = uiContainer.clientHeight - rollHeight;
      
      let newTop = startTop + deltaY;

      if (newTop < 0) newTop = 0;
      if (newTop > trackAvailableHeight) newTop = trackAvailableHeight;

      // Update Visuals
      bottomRoll.style.top = `${newTop}px`;
      paper.style.height = `${newTop}px`;

      // Update Scroll
      const scrollPercentage = newTop / trackAvailableHeight;
      const maxScroll = wrapper.scrollHeight - wrapper.clientHeight;
      
      wrapper.scrollTop = scrollPercentage * maxScroll;
    };

    const handleMouseUp = () => {
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    if (bottomRoll) bottomRoll.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Observers
    const resizeObserver = new ResizeObserver(() => updateThumbPosition());
    if (wrapperRef.current) {
        wrapperRef.current.addEventListener('scroll', updateThumbPosition);
        resizeObserver.observe(wrapperRef.current);
        if (wrapperRef.current.firstElementChild) {
            resizeObserver.observe(wrapperRef.current.firstElementChild);
        }
    }

    // Initial positioning
    setTimeout(updateThumbPosition, 50);

    return () => {
      if (bottomRoll) bottomRoll.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (wrapperRef.current) {
          wrapperRef.current.removeEventListener('scroll', updateThumbPosition);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`ancient-scrollbar-container ${className}`} style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden' }}>
      <style>{`
        .ancient-scroll-wrapper {
          width: 100%;
          height: 100%;
          overflow-y: auto !important;
          padding-right: 80px; 
          box-sizing: border-box;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
          scroll-behavior: auto !important;
        }
        .ancient-scroll-wrapper::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
        }

        .ancient-scroll-ui {
          position: absolute;
          top: 40px;
          bottom: 40px;
          right: 30px;
          width: 60px;
          z-index: 9999;
          pointer-events: none;
          filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.5));
        }

        .ancient-wood-roll {
          width: 70px;
          height: 32px;
          position: absolute;
          left: -5px;
          z-index: 2;
          border-radius: 4px;
          cursor: pointer;
          pointer-events: auto;
          background-color: #3e2723;
          background-image: 
            radial-gradient(ellipse at 30% 30%, rgba(0,0,0,0.3) 0%, transparent 20%),
            radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.3) 0%, transparent 20%),
            repeating-linear-gradient(92deg, transparent, transparent 1px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.2) 3px),
            linear-gradient(to bottom, #5d4037 0%, #3e2723 50%, #1a0f0a 100%);
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.1), 0 5px 15px rgba(0,0,0,0.9);
          border: 1px solid #1a0f0a;
        }
        
        .ancient-wood-roll::before, .ancient-wood-roll::after {
          content: '';
          position: absolute;
          top: -1px; bottom: -1px;
          width: 8px;
          background: linear-gradient(90deg, #2c2c2c, #4a4a4a 40%, #1a1a1a);
          border: 1px solid #000;
          border-radius: 2px;
          box-shadow: inset 0 0 2px rgba(255,255,255,0.1);
        }
        .ancient-wood-roll::before { left: -4px; }
        .ancient-wood-roll::after { right: -4px; }

        .ancient-top-roll { top: 0; cursor: default; }

        .ancient-bottom-roll {
          top: 0;
          transition: transform 0.1s;
        }
        .ancient-bottom-roll:active { cursor: grabbing; }
        .ancient-bottom-roll:hover { transform: scale(1.05); filter: brightness(1.1); }
        
        .ancient-bottom-roll::after {
          content: '';
          position: absolute;
          bottom: -8px; left: 50%;
          transform: translateX(-50%);
          width: 20px; height: 20px;
          border: 3px solid #1a0f0a;
          border-radius: 50%;
          z-index: -1;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .ancient-unrolled-paper {
          position: absolute;
          top: 16px;
          left: 5px;
          width: 50px;
          height: 0px;
          background-color: #c2a170;
          z-index: 1;
          transform-origin: top;
          overflow: hidden;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.6);
          border-left: 1px solid rgba(0,0,0,0.3);
          border-right: 1px solid rgba(0,0,0,0.3);
          background-image: 
            radial-gradient(circle at 50% 50%, transparent 0%, rgba(62, 39, 35, 0.4) 100%),
            url("data:image/svg+xml;charset=UTF-8,%3Csvg width='50' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3Etext%7Bfont:12px serif;fill:%235d4037;opacity:0.5;text-anchor:middle%7D%3C/style%3E%3Ctext x='25' y='20'%3Eᚠᚢᚦ%3C/text%3E%3Ctext x='25' y='45'%3Eᚨᚱᚲ%3C/text%3E%3Ctext x='25' y='70'%3Eᚷᚹᚺ%3C/text%3E%3Ctext x='25' y='95'%3Eᚾᛁᛃ%3C/text%3E%3Ctext x='25' y='120'%3Eᛇᛈᛉ%3C/text%3E%3Ctext x='25' y='145'%3Eᛊᛏᛒ%3C/text%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E");
          background-repeat: no-repeat, repeat-y, repeat;
          background-size: 100% 100%, 50px auto, 200px 200px;
        }
      `}</style>

      <div 
        ref={wrapperRef} 
        className="ancient-scroll-wrapper" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      <div ref={uiContainerRef} className="ancient-scroll-ui">
        <div className="ancient-wood-roll ancient-top-roll"></div>
        <div ref={paperRef} className="ancient-unrolled-paper"></div>
        <div ref={bottomRollRef} className="ancient-wood-roll ancient-bottom-roll"></div>
      </div>
    </div>
  );
};

export default AncientScrollbar;
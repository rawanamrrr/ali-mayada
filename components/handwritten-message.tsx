"use client"

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/translations';

export default function HandwrittenMessage() {
  const t = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [name, setName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' as 'success' | 'error' | 'info' | '' });
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(3);
  const [history, setHistory] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'drawn' | 'written'>('drawn');
  const [writtenText, setWrittenText] = useState('');

  // Pen color options with translations
  const penColors = [
    { color: '#000000', name: t('colorBlack') },
    { color: '#EF4444', name: t('colorRed') },
    { color: '#3B82F6', name: t('colorBlue') },
    { color: '#10B981', name: t('colorGreen') },
    { color: '#8B5CF6', name: t('colorPurple') },
    { color: '#F59E0B', name: t('colorOrange') },
  ];

  // Pen width options with translations
  const penWidths = [
    { width: 2, name: t('widthThin') },
    { width: 3, name: t('widthMedium') },
    { width: 5, name: t('widthThick') },
    { width: 8, name: t('widthBold') },
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const setCanvasSize = (isInitial = false) => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const width = Math.min(1000, rect.width * 0.95); // Increased max width
        // Only update canvas dimensions if they actually changed significantly
        if (Math.abs(canvas.width - width) > 5 || canvas.height !== 600) {
          canvas.width = width;
          canvas.height = 600; // Increased height for larger writing area
        }
        canvas.style.border = '2px solid #e5e7eb';
        canvas.style.borderRadius = '0.5rem';
        // Only fill background on initial setup, not on resize
        if (isInitial) {
          canvas.style.backgroundColor = 'white';
        }
      }
    };

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set initial drawing styles
    context.lineWidth = currentWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = currentColor;
    // Only fill background on initial setup
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    setCtx(context);
    setCanvasSize(true); // Initial setup

    const handleResize = () => setCanvasSize(false); // Resize without clearing
    window.addEventListener('resize', handleResize);

    // Debounced scroll handler to prevent excessive canvas operations
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Check if canvas size needs adjustment after scroll
        const container = canvas.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          const currentWidth = canvas.width;
          const newWidth = Math.min(1000, rect.width * 0.95);
          // Only resize if the width actually changed significantly
          if (Math.abs(currentWidth - newWidth) > 10) {
            setCanvasSize(false);
          }
        }
      }, 100); // Debounce scroll events
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Update drawing context when color or width changes
  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
    }
  }, [currentColor, currentWidth, ctx]);

  // Refs for drawing state
  const points = useRef<Array<{x: number, y: number, pressure: number}>>([]);
  const rafId = useRef<number | null>(null);
  const lastWidth = useRef(currentWidth);
  const hasDrawn = useRef(false);
  const hasSavedInitialState = useRef(false);
  const canvasStateBeforeDrawing = useRef<ImageData | null>(null);
  const isProcessingStop = useRef(false);
  const hasSavedToHistory = useRef(false);
  const lastTouchTime = useRef(0);

  const getPressure = (e: Touch | MouseEvent | React.Touch | React.MouseEvent): number => {
    // Check if the device supports pressure (like iPad with Apple Pencil)
    const event = e as any; // Type assertion to access force property
    if ('force' in event && event.force) {
      return Math.min(Math.max(event.force, 0.1), 1);
    }
    return 0.5; // Default pressure
  };

  const drawSmoothLine = () => {
    if (!canvasRef.current || points.current.length < 3) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const pointsToDraw = [...points.current];
    
    ctx.beginPath();
    ctx.moveTo(pointsToDraw[0].x, pointsToDraw[0].y);
    
    // Draw a smooth curve through the points
    for (let i = 1; i < pointsToDraw.length - 2; i++) {
      const xc = (pointsToDraw[i].x + pointsToDraw[i + 1].x) / 2;
      const yc = (pointsToDraw[i].y + pointsToDraw[i + 1].y) / 2;
      ctx.quadraticCurveTo(pointsToDraw[i].x, pointsToDraw[i].y, xc, yc);
    }
    
    // Connect the last two points
    if (pointsToDraw.length > 1) {
      const i = pointsToDraw.length - 2;
      ctx.quadraticCurveTo(
        pointsToDraw[i].x, 
        pointsToDraw[i].y, 
        pointsToDraw[i + 1].x, 
        pointsToDraw[i + 1].y
      );
    }
    
    // Use the average pressure of the points for the line width
    const avgPressure = pointsToDraw.reduce((sum, p) => sum + p.pressure, 0) / pointsToDraw.length;
    const targetWidth = currentWidth * (0.5 + avgPressure * 0.5);
    
    // Smooth width transition
    const width = lastWidth.current + (targetWidth - lastWidth.current) * 0.3;
    lastWidth.current = width;
    
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const getCanvasCoordinates = (
    e: MouseEvent | React.MouseEvent<HTMLCanvasElement> | 
       Touch | React.TouchEvent<HTMLCanvasElement> | 
       { clientX: number; clientY: number }
  ) => {
  if (!canvasRef.current) return null;
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  let clientX: number;
  let clientY: number;

  // Handle different event types
  if ('touches' in e && e.touches) {
    // It's a TouchEvent with touches array
    const touch = e.touches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else if ('clientX' in e) {
    // It's a MouseEvent, Touch object, or similar
    clientX = e.clientX;
    clientY = e.clientY;
  } else if ('nativeEvent' in e) {
    // Handle React synthetic events
    const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
    if ('touches' in nativeEvent && nativeEvent.touches.length > 0) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else if ('clientX' in nativeEvent) {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    } else {
      return null;
    }
  } else {
    return null;
  }
  
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  
  return { x, y };
};

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent mouse events if touch event just fired (mobile browsers fire both)
    if ('touches' in e) {
      lastTouchTime.current = Date.now();
    } else {
      // If this is a mouse event within 500ms of a touch event, ignore it
      if (Date.now() - lastTouchTime.current < 500) {
        return;
      }
    }
    
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const coords = getCanvasCoordinates('touches' in e ? e.touches[0] : e.nativeEvent);
    if (!coords) return;
    
    // Save the current canvas state before we start drawing
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      canvasStateBeforeDrawing.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    const pressure = getPressure('touches' in e ? e.touches[0] : e.nativeEvent);
    points.current = [{ x: coords.x, y: coords.y, pressure }];
    hasDrawn.current = false;
    hasSavedInitialState.current = false;
    isProcessingStop.current = false;
    hasSavedToHistory.current = false;
    setIsDrawing(true);
    
    // Start the drawing loop
    const drawLoop = () => {
      // Only draw if we have at least 3 points (a real stroke, not just a tap)
      if (points.current.length >= 3) {
        drawSmoothLine();
        // Save initial state after first actual draw
        if (!hasSavedInitialState.current && canvasRef.current) {
          hasSavedInitialState.current = true;
        }
        // Keep only the last few points to maintain performance
        if (points.current.length > 10) {
          points.current = points.current.slice(-10);
        }
      }
      rafId.current = requestAnimationFrame(drawLoop);
    };
    
    rafId.current = requestAnimationFrame(drawLoop);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent mouse events if touch event just fired
    if ('touches' in e) {
      lastTouchTime.current = Date.now();
    } else {
      if (Date.now() - lastTouchTime.current < 500) {
        return;
      }
    }
    
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    
    const coords = getCanvasCoordinates('touches' in e ? e.touches[0] : e.nativeEvent);
    if (!coords) return;
    
    const pressure = getPressure('touches' in e ? e.touches[0] : e.nativeEvent);
    
    // Add the new point with scaled coordinates
    points.current.push({ x: coords.x, y: coords.y, pressure });
    hasDrawn.current = true;
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent mouse events if touch event just fired
    if (e) {
      if ('touches' in e || 'changedTouches' in e) {
        lastTouchTime.current = Date.now();
      } else {
        if (Date.now() - lastTouchTime.current < 500) {
          return;
        }
      }
    }
    
    // Guard against double execution
    if (!isDrawing || isProcessingStop.current) return;
    
    // Mark that we're processing to prevent re-entry
    isProcessingStop.current = true;
    
    // Set isDrawing to false to prevent any further operations
    setIsDrawing(false);
    
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
    if (!canvasRef.current || points.current.length === 0) {
      points.current = [];
      hasDrawn.current = false;
      hasSavedInitialState.current = false;
      canvasStateBeforeDrawing.current = null;
      isProcessingStop.current = false;
      return;
    }
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !canvasStateBeforeDrawing.current) {
      points.current = [];
      hasDrawn.current = false;
      hasSavedInitialState.current = false;
      canvasStateBeforeDrawing.current = null;
      isProcessingStop.current = false;
      return;
    }
    
    // Determine if this was a dot (tap) or a stroke (drag)
    const isDot = points.current.length < 3;
    
    if (isDot) {
      // It's a dot - restore canvas to clean state first
      ctx.putImageData(canvasStateBeforeDrawing.current, 0, 0);
      // Now draw a clean dot
      const point = points.current[0];
      ctx.beginPath();
      ctx.arc(point.x, point.y, currentWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = currentColor;
      ctx.fill();
    }
    
    // Save to history exactly once per drawing session
    // Use requestAnimationFrame to ensure canvas is fully rendered
    if (!hasSavedToHistory.current) {
      hasSavedToHistory.current = true;
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL();
          setHistory(prev => [...prev, dataUrl]);
        }
      });
    }
    
    // Clean up
    points.current = [];
    hasDrawn.current = false;
    hasSavedInitialState.current = false;
    canvasStateBeforeDrawing.current = null;
    isProcessingStop.current = false;
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([]);
  };

  const undoLastStroke = () => {
    if (!canvasRef.current || !ctx || history.length === 0) return;
    
    // Remove the last state from history
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // If there's a previous state, restore it
    if (newHistory.length > 0) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = newHistory[newHistory.length - 1];
    }
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setMessage({ text: t('messageError'), type: 'error' });
      return;
    }

    // Validate based on message type
    if (messageType === 'drawn') {
      if (!canvasRef.current) {
        setMessage({ text: t('messageError'), type: 'error' });
        return;
      }
    } else {
      if (!writtenText.trim()) {
        setMessage({ text: t('messageError'), type: 'error' });
        return;
      }
    }

    setIsSending(true);
    setMessage({ text: t('sendingMessage'), type: 'info' });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('name', name.trim());
      
      if (messageType === 'drawn') {
        // Convert canvas to blob for drawn messages
        const blob = await new Promise<Blob | null>((resolve) => {
          canvasRef.current?.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        });

        if (!blob) {
          throw new Error('Failed to create image from drawing');
        }

        formData.append('message', 'A new drawn message from the engagement website');
        formData.append('image', blob, 'drawing.png');
      } else {
        // Send text message for written messages
        formData.append('message', writtenText.trim());
        formData.append('textMessage', writtenText.trim());
      }

      // Send data to API route
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });

      // Try to parse JSON; if not JSON, fall back to text for better error visibility
      const contentType = response.headers.get('content-type') || '';
      let responseData: any = null;
      if (contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (e) {
          console.error('Failed to parse JSON response:', e);
          const rawText = await response.text().catch(() => '');
          responseData = { raw: rawText };
        }
      } else {
        const rawText = await response.text().catch(() => '');
        responseData = { raw: rawText };
      }

      if (!response.ok) {
        console.error('Server error:', response.status, response.statusText, responseData);
        const msg = responseData?.message
          || responseData?.error
          || (typeof responseData?.raw === 'string' && responseData.raw.trim() ? responseData.raw : '')
          || 'Failed to send message';
        throw new Error(msg);
      }

      if (!responseData.success) {
        console.error('API error:', responseData);
        throw new Error(responseData.message || 'Message sending failed');
      }

      setMessage({ 
        text: t('messageSent'),
        type: 'success' as const
      });
      
      // Reset form if successful
      if (messageType === 'drawn') {
        clearCanvas();
        setHistory([]);
      } else {
        setWrittenText('');
      }
      setName('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : t('messageError'), 
        type: 'error' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section 
      id="message" 
      className="relative py-20 px-4 md:py-32 bg-[#ebebeb] overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative z-10">
        <motion.div 
          className="mb-12 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-handwritten text-7xl md:text-9xl text-[#661314] mb-12 tracking-tight">
            {t('guestbookTitle')}
          </h2>
          <p className="font-serif text-lg md:text-xl text-[#661314]/80 italic mt-4">
            {t('writeUsDescription')}
          </p>
        </motion.div>
        
        <div className="w-full max-w-2xl bg-transparent border border-[#661314]/20 rounded-lg p-8 md:p-12 shadow-sm">
          {/* Message Type Tabs - Prominent Button Style */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              type="button"
              onClick={() => setMessageType('drawn')}
              className={`flex-1 px-4 py-3 text-sm font-serif rounded-lg transition-all duration-300 border ${
                messageType === 'drawn'
                  ? 'bg-[#661314] text-white border-[#661314]'
                  : 'bg-transparent text-[#661314] border-[#661314]/30 hover:border-[#661314]/60'
              }`}
            >
              {t('drawnMessage')}
            </button>
            <button
              type="button"
              onClick={() => setMessageType('written')}
              className={`flex-1 px-4 py-3 text-sm font-serif rounded-lg transition-all duration-300 border ${
                messageType === 'written'
                  ? 'bg-[#661314] text-white border-[#661314]'
                  : 'bg-transparent text-[#661314] border-[#661314]/30 hover:border-[#661314]/60'
              }`}
            >
              {t('writtenMessage')}
            </button>
          </div>

          {/* Drawn Message Section */}
          {messageType === 'drawn' && (
            <>
              <div className="mb-6">
                <div className="flex flex-wrap gap-4 justify-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif text-[#661314]/60 uppercase tracking-widest">{t('color')}:</span>
                    <div className="flex gap-1">
                      {penColors.map((pen) => (
                        <button
                          key={pen.color}
                          type="button"
                          onClick={() => setCurrentColor(pen.color)}
                          className={`w-6 h-6 rounded-full border ${
                            currentColor === pen.color ? 'border-[#661314]' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: pen.color }}
                          title={pen.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="relative border border-[#661314]/20 rounded-lg overflow-hidden mb-6 bg-white">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onTouchCancel={stopDrawing}
                    className="w-full h-[400px] touch-none cursor-crosshair"
                    style={{ touchAction: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Written Message Section */}
          {messageType === 'written' && (
            <div className="mb-6">
              <textarea
                value={writtenText}
                onChange={(e) => setWrittenText(e.target.value)}
                placeholder={t('writeYourMessage')}
                rows={6}
                className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg focus:outline-none focus:border-[#661314] transition-all font-serif resize-none"
                required={messageType === 'written'}
              />
            </div>
          )}

          <form onSubmit={sendEmail} className="space-y-4">
            <div className="mb-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('yourName')}
                className="w-full px-4 py-3 bg-transparent border border-[#661314]/30 rounded-lg focus:outline-none focus:border-[#661314] transition-all font-serif"
                required
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="w-full px-8 py-4 text-white bg-[#661314] rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-serif text-lg font-medium shadow-sm transform hover:scale-[1.02] disabled:transform-none"
                disabled={isSending}
              >
                {isSending ? t('sendingMessage') : t('sendMessage')}
              </button>

              {messageType === 'drawn' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={undoLastStroke}
                    className="flex-1 px-4 py-2 text-[#661314] bg-transparent border border-[#661314]/30 rounded-lg hover:border-[#661314]/60 transition-all font-serif text-sm"
                    disabled={isSending || history.length === 0}
                  >
                    {t('undo')}
                  </button>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex-1 px-4 py-2 text-[#661314] bg-transparent border border-[#661314]/30 rounded-lg hover:border-[#661314]/60 transition-all font-serif text-sm"
                    disabled={isSending}
                  >
                    {t('clearDrawing')}
                  </button>
                </div>
              )}
            </div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-4 rounded-lg text-center font-serif ${
                  message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 
                  message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                  'bg-green-50 text-green-700 border border-green-100'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
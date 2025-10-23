import { useMemo } from 'react';

const Marquee = ({ text, speed = 50, count = 3, className = '' }) => {
  const duration = useMemo(() => {
    // Calculate duration based on text length and speed
    // speed is in pixels per second
    const textLength = text.length * 10; // Approximate pixel width per character
    return textLength / speed;
  }, [text, speed]);

  const repeatedText = useMemo(() => {
    return Array(count).fill(text).join(' • ');
  }, [text, count]);

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="inline-block animate-marquee"
        style={{
          animation: `marquee ${duration}s linear infinite`,
        }}
      >
        <span className="inline-block px-4">{repeatedText}</span>
        <span className="inline-block px-4">{repeatedText}</span>
      </div>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default Marquee;

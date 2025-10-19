import React, { useState, useRef, useEffect } from 'react';

const DualThumbSlider = ({ 
  min = 0, 
  max = 100, 
  step = 1, 
  value = [min, max], 
  onChange, 
  className = '',
  label = '',
  formatValue = (val) => val,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = (val) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPercentage = (percentage) => {
    return min + (percentage / 100) * (max - min);
  };

  const handleMouseDown = (thumb) => (e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(thumb);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    let newValues = [...localValue];
    
    if (isDragging === 'min') {
      newValues[0] = Math.min(clampedValue, localValue[1]);
    } else {
      newValues[1] = Math.max(clampedValue, localValue[0]);
    }

    setLocalValue(newValues);
    onChange && onChange(newValues);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, localValue]);

  const minPercentage = getPercentage(localValue[0]);
  const maxPercentage = getPercentage(localValue[1]);

  return (
    <div className={`dual-thumb-slider ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-pointer"
          onMouseDown={handleMouseDown('min')}
        >
          {/* Track */}
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
          
          {/* Active range */}
          <div
            className="absolute h-2 bg-primary-500 rounded-lg"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          ></div>
          
          {/* Min thumb */}
          <div
            className={`absolute w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-lg transform -translate-y-1 cursor-pointer hover:scale-110 transition-transform ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleMouseDown('min')}
          ></div>
          
          {/* Max thumb */}
          <div
            className={`absolute w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-lg transform -translate-y-1 cursor-pointer hover:scale-110 transition-transform ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleMouseDown('max')}
          ></div>
        </div>
        
        {/* Value labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatValue(localValue[0])}</span>
          <span>{formatValue(localValue[1])}</span>
        </div>
      </div>
    </div>
  );
};

export default DualThumbSlider;
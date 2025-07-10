import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface SmartTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  showIcon?: boolean;
  delay?: number;
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  showIcon = false,
  delay = 500
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if tooltip would go outside viewport and adjust
      if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewport.height) {
        newPosition = 'top';
      } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
        newPosition = 'right';
      } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewport.width) {
        newPosition = 'left';
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  const showTooltip = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    } else {
      setIsVisible(!isVisible);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const getTooltipClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg max-w-xs';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform translate-x-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
      onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
      onClick={trigger === 'click' ? showTooltip : undefined}
    >
      <div className="flex items-center space-x-1">
        {children}
        {showIcon && (
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isVisible && (
        <div ref={tooltipRef} className={getTooltipClasses()}>
          <div className={getArrowClasses()} />
          {content}
        </div>
      )}
    </div>
  );
};

export default SmartTooltip;
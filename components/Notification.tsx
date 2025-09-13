'use client';

import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Notification({ message, type, duration = 4000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'text-black border border-current';
      case 'error':
        return 'bg-red-600 text-white border border-red-500';
      case 'info':
      default:
        return 'bg-neutral-800 text-white border border-neutral-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'info':
      default:
        return 'ⓘ';
    }
  };

  return (
    <div
      className={`notification fixed top-4 right-4 z-50 px-6 py-4 slide-up hover-lift cursor-pointer transition-all duration-300 ${getTypeStyles()} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      onClick={() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }}
      style={type === 'success' ? { backgroundColor: 'var(--accent)' } : {}}
    >
      <div className="flex items-center space-x-3">
        <span className="font-bold text-lg">{getIcon()}</span>
        <span className="font-medium" style={{ fontFamily: 'Source Serif Pro, Georgia, serif' }}>
          {message}
        </span>
        <button className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Utility function to show notifications programmatically
export const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) => {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 slide-up hover-lift cursor-pointer transition-all duration-300 ${
    type === 'success' 
      ? 'text-black border border-current' 
      : type === 'error' 
      ? 'bg-red-600 text-white border border-red-500'
      : 'bg-neutral-800 text-white border border-neutral-600'
  }`;
  
  if (type === 'success') {
    notification.style.backgroundColor = 'var(--accent)';
  }

  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ⓘ';
  
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="font-bold text-lg">${icon}</span>
      <span class="font-medium" style="font-family: 'Source Serif Pro, Georgia, serif'">${message}</span>
      <button class="ml-4 opacity-70 hover:opacity-100 transition-opacity close-btn">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;

  const closeNotification = () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-8px)';
    setTimeout(() => notification.remove(), 300);
  };

  // Add click to close functionality
  notification.addEventListener('click', closeNotification);
  notification.querySelector('.close-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeNotification();
  });

  // Auto remove after duration
  setTimeout(closeNotification, duration);

  document.body.appendChild(notification);
};
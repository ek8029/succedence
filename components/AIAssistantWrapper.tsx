'use client';

import { useState } from 'react';
import AIAssistant from './AIAssistant';

export default function AIAssistantWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  return <AIAssistant isOpen={isOpen} onToggle={toggleAssistant} />;
}
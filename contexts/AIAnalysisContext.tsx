'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AIAnalysisContextType {
  // Track analysis completion to trigger refetching in other components
  analysisCompletedTrigger: number;
  triggerAnalysisRefetch: () => void;

  // Track which analyses exist for a listing
  existingAnalyses: Record<string, string[]>; // listingId -> analysisTypes[]
  setExistingAnalyses: (listingId: string, analysisTypes: string[]) => void;

  // Force refresh mechanism
  forceRefreshAll: () => void;
  refreshTrigger: number;
}

const AIAnalysisContext = createContext<AIAnalysisContextType | undefined>(undefined);

export function AIAnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisCompletedTrigger, setAnalysisCompletedTrigger] = useState(0);
  const [existingAnalyses, setExistingAnalysesState] = useState<Record<string, string[]>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerAnalysisRefetch = useCallback(() => {
    setAnalysisCompletedTrigger(prev => prev + 1);
  }, []);

  const setExistingAnalyses = useCallback((listingId: string, analysisTypes: string[]) => {
    setExistingAnalysesState(prev => ({
      ...prev,
      [listingId]: analysisTypes
    }));
  }, []);

  const forceRefreshAll = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    setAnalysisCompletedTrigger(prev => prev + 1);
  }, []);

  return (
    <AIAnalysisContext.Provider
      value={{
        analysisCompletedTrigger,
        triggerAnalysisRefetch,
        existingAnalyses,
        setExistingAnalyses,
        forceRefreshAll,
        refreshTrigger,
      }}
    >
      {children}
    </AIAnalysisContext.Provider>
  );
}

export function useAIAnalysis() {
  const context = useContext(AIAnalysisContext);
  if (context === undefined) {
    throw new Error('useAIAnalysis must be used within an AIAnalysisProvider');
  }
  return context;
}
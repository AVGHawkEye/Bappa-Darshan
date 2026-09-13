/**
 * Typed Navigation Framework
 * Provides a React Native-style navigation context with type-safe screens and param passing
 */

import React, { createContext, ReactNode, useContext, useState } from 'react';
import { RootTabParamList, ScreenName } from '../types';

interface NavigationContextType {
  currentScreen: ScreenName;
  screenParams: RootTabParamList[ScreenName];
  navigate: <T extends ScreenName>(screen: T, params?: RootTabParamList[T]) => void;
  goBack: () => void;
  history: Array<{ screen: ScreenName; params?: unknown }>;
  // Modal presentation support for Visit Marking & Photo Upload
  activeModal: {
    type: 'mark_visit' | 'upload_photo' | 'pandal_detail' | null;
    data?: any;
  } | null;
  openModal: (type: 'mark_visit' | 'upload_photo' | 'pandal_detail', data?: any) => void;
  closeModal: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Map');
  const [screenParams, setScreenParams] = useState<RootTabParamList[ScreenName]>(undefined);
  const [history, setHistory] = useState<Array<{ screen: ScreenName; params?: unknown }>>([
    { screen: 'Map', params: undefined },
  ]);
  const [activeModal, setActiveModal] = useState<{
    type: 'mark_visit' | 'upload_photo' | 'pandal_detail' | null;
    data?: any;
  } | null>(null);

  const navigate = <T extends ScreenName>(screen: T, params?: RootTabParamList[T]) => {
    setScreenParams(params);
    setCurrentScreen(screen);
    setHistory((prev) => [...prev, { screen, params }]);
  };

  const goBack = () => {
    if (history.length > 1) {
      const nextHistory = [...history];
      nextHistory.pop(); // remove current
      const prevEntry = nextHistory[nextHistory.length - 1];
      setHistory(nextHistory);
      setCurrentScreen(prevEntry.screen);
      setScreenParams(prevEntry.params as RootTabParamList[ScreenName]);
    }
  };

  const openModal = (type: 'mark_visit' | 'upload_photo' | 'pandal_detail', data?: any) => {
    setActiveModal({ type, data });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        screenParams,
        navigate,
        goBack,
        history,
        activeModal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return ctx;
}

export function useRoute<T extends ScreenName>() {
  const ctx = useNavigation();
  return {
    name: ctx.currentScreen as T,
    params: ctx.screenParams as RootTabParamList[T],
  };
}

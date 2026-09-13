/**
 * NetInfo Network Abstraction Layer
 * Provides React Native-compatible NetInfo API with offline simulation for field tests
 */

import { useEffect, useState } from 'react';
import { NetInfoState } from '../../types';

type NetInfoListener = (state: NetInfoState) => void;

class NetInfoService {
  private listeners: Set<NetInfoListener> = new Set();
  private isSimulatedOffline: boolean = false;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public getCurrentState(): NetInfoState {
    const effectiveOnline = !this.isSimulatedOffline && this.isOnline;
    return {
      isConnected: effectiveOnline,
      isInternetReachable: effectiveOnline,
      type: effectiveOnline ? 'wifi' : 'none',
      isSimulatedOffline: this.isSimulatedOffline,
    };
  }

  public fetch(): Promise<NetInfoState> {
    return Promise.resolve(this.getCurrentState());
  }

  public addEventListener(listener: NetInfoListener): () => void {
    this.listeners.add(listener);
    // Emit current state immediately
    listener(this.getCurrentState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Field testing utility: allows developer/user to toggle simulated offline mode
   * to test offline-first visit marking & sync queueing
   */
  public setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    this.notify();
  }

  public toggleSimulatedOffline(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    this.notify();
    return this.isSimulatedOffline;
  }

  private notify() {
    const state = this.getCurrentState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in NetInfo listener:', err);
      }
    });
  }
}

export const NetInfo = new NetInfoService();

/**
 * Custom React Hook for consuming network state
 */
export function useNetInfo(): NetInfoState {
  const [state, setState] = useState<NetInfoState>(NetInfo.getCurrentState());

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((nextState) => {
      setState(nextState);
    });
    return unsubscribe;
  }, []);

  return state;
}

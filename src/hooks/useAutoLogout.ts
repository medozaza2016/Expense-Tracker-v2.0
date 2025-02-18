import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { settingsService } from '../services/settingsService';

export function useAutoLogout() {
  const { signOut } = useAuth();
  const logoutTimeRef = useRef<number>(30 * 60 * 1000); // Default 30 minutes in ms
  const lastSettingsFetchRef = useRef<number>(0);

  const fetchSettings = useCallback(async () => {
    try {
      // Only fetch settings every 5 minutes
      const now = Date.now();
      if (now - lastSettingsFetchRef.current < 5 * 60 * 1000) {
        return;
      }

      const settings = await settingsService.getSettings();
      logoutTimeRef.current = settings.auto_logout_minutes * 60 * 1000;
      lastSettingsFetchRef.current = now;
    } catch (error) {
      console.error('Error fetching auto logout settings:', error);
    }
  }, []);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    const existingTimer = window.localStorage.getItem('logoutTimer');
    if (existingTimer) {
      window.clearTimeout(parseInt(existingTimer));
    }

    // Set new timer using cached logout time
    const timerId = window.setTimeout(() => {
      signOut();
    }, logoutTimeRef.current);

    // Store timer ID
    window.localStorage.setItem('logoutTimer', timerId.toString());
  }, [signOut]);

  useEffect(() => {
    // Initial settings fetch
    fetchSettings();

    // Debounced user activity handler
    let activityTimeout: number;
    const handleUserActivity = () => {
      // Debounce the activity handler to prevent excessive timer resets
      window.clearTimeout(activityTimeout);
      activityTimeout = window.setTimeout(() => {
        resetTimer();
      }, 1000); // Wait 1 second after last activity before resetting timer
    };

    // Add event listeners with passive option for better performance
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove', 'click', 'keypress'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      window.clearTimeout(activityTimeout);
      const existingTimer = window.localStorage.getItem('logoutTimer');
      if (existingTimer) {
        window.clearTimeout(parseInt(existingTimer));
        window.localStorage.removeItem('logoutTimer');
      }
    };
  }, [resetTimer, fetchSettings]);
}

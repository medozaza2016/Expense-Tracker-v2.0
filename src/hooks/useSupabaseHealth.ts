import { useState, useEffect } from 'react';
import { checkSupabaseConnection, reconnectSupabase } from '../services/supabase';

export function useSupabaseHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let mounted = true;

    const checkHealth = async () => {
      if (isChecking || !mounted) return;
      
      setIsChecking(true);
      const healthy = await checkSupabaseConnection();
      
      if (mounted) {
        setIsHealthy(healthy);
        setIsChecking(false);

        if (!healthy) {
          // Wait 5 seconds before attempting to reconnect
          timeoutId = window.setTimeout(async () => {
            if (mounted) {
              await reconnectSupabase();
            }
          }, 5000);
        }
      }
    };

    // Check health every 30 seconds
    const intervalId = window.setInterval(checkHealth, 30000);
    
    // Initial check
    checkHealth();

    return () => {
      mounted = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  return { isHealthy, isChecking };
}

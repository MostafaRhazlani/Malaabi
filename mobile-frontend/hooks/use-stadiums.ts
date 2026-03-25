import { useState, useEffect } from 'react';
import { Stadium } from '@/interfaces/stadium.interface';
import { StadiumService } from '@/services/stadium.service';

export function useStadiums(type?: string) {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await StadiumService.getAll(type);
        if (!cancelled) setStadiums(data);
      } catch (e) {
        if (!cancelled) setError('Failed to load stadiums');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [type]);

  return { stadiums, loading, error };
}

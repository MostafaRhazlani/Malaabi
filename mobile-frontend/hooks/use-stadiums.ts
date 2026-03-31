import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Stadium } from '@/interfaces/stadium.interface';
import { StadiumService } from '@/services/stadium.service';

export function useStadiums(type?: string) {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchQuery = useSelector((state: RootState) => state.search.home);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        let data: Stadium[] = [];
        
        if (searchQuery.trim().length > 0) {
          // If a query exists, use the search endpoint
          data = await StadiumService.search(searchQuery.trim());

          if (type && data.length > 0) {
            data = data.filter(s => s.stadiumType === type);
          }
        } else {
          data = await StadiumService.getAll(type);
        }

        if (!cancelled) setStadiums(data);
      } catch {
        if (!cancelled) setError('Failed to load stadiums');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // adding small debounce for search query
    const timeoutId = setTimeout(() => {
      fetch();
    }, 300);

    return () => { 
      cancelled = true; 
      clearTimeout(timeoutId);
    };
  }, [type, searchQuery]);

  return { stadiums, loading, error };
}

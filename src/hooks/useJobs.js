import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Aktif')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sortedJobs = (data || []).sort((a, b) => {
        const premiumA = a.featured || a.is_featured || false;
        const premiumB = b.featured || b.is_featured || false;
        return Number(premiumB) - Number(premiumA);
      });

      setJobs(sortedJobs);
    } catch (error) {
      console.error('Gagal memuat data lowongan:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    setJobs,
    refetch: fetchJobs,
  };
}

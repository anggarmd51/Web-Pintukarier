import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('jobs').select('*');

      if (error) throw error;

      setJobs(data || []);
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

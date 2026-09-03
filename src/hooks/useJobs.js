import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { defaultJobs } from '../data/defaultJobs';

const normalizeJobs = (items = []) => {
  const fallbackDates = [
    '2026-08-28T09:30:00.000Z',
    '2026-08-29T11:00:00.000Z',
    '2026-08-30T14:45:00.000Z',
    '2026-08-25T08:15:00.000Z',
  ];
  return (items || []).map((job, idx) => {
    if (job && (job.created_at || job.date)) return job;
    return {
      ...job,
      created_at: fallbackDates[idx % fallbackDates.length],
    };
  });
};

export default function useJobs() {
  const [jobs, setJobs] = useState(() => normalizeJobs(defaultJobs));
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const normalized = normalizeJobs(data);
        setJobs(normalized);
      } else {
        setJobs(normalizeJobs(defaultJobs));
      }
    } catch (error) {
      console.warn('Gagal memuat data lowongan dari Supabase, menggunakan data default:', error.message);
      setJobs(normalizeJobs(defaultJobs));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const activeJobs = jobs.filter((job) => job.status === 'Aktif');

  return {
    jobs,
    activeJobs,
    loading,
    setJobs,
    refetch: fetchJobs,
  };
}

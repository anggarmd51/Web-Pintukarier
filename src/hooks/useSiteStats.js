import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT_FALLBACK_VIEWS = 1250;
const SESSION_STORAGE_KEY = 'pintukarier_visit_logged_v1';

export default function useSiteStats() {
  const [totalViews, setTotalViews] = useState(DEFAULT_FALLBACK_VIEWS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const hasRecordedRef = useRef(false);

  // Fungsi membaca statistik saat ini dari Supabase
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('site_stats')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        // Jika belum ada akses RLS atau tabel belum di-grant
        console.warn('[Supabase] site_stats query note:', fetchErr.message);
        setError(fetchErr);
        // Tetap gunakan fallback view yang elegan
        setTotalViews((prev) => prev || DEFAULT_FALLBACK_VIEWS);
      } else if (data) {
        // Ambil properti yang paling sesuai (total_views, views, count, visits, dll)
        const viewsCount =
          data.total_views ??
          data.views ??
          data.count ??
          data.total_visits ??
          data.visits ??
          data.value ??
          DEFAULT_FALLBACK_VIEWS;
        setTotalViews(Number(viewsCount));
      } else {
        setTotalViews(DEFAULT_FALLBACK_VIEWS);
      }
    } catch (err) {
      console.warn('[Supabase] site_stats exception:', err.message);
      setError(err);
      setTotalViews(DEFAULT_FALLBACK_VIEWS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fungsi mencatat kunjungan halaman (increment view counter)
  const recordPageView = useCallback(async () => {
    // Hindari duplikasi penghitungan dalam sesi browser yang sama
    if (typeof window === 'undefined') return;
    if (hasRecordedRef.current) return;
    if (sessionStorage.getItem(SESSION_STORAGE_KEY)) return;

    hasRecordedRef.current = true;
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');

    try {
      // 1. Coba panggil RPC increment_site_views jika tersedia
      const { data: rpcData, error: rpcErr } = await supabase.rpc('increment_site_views');

      if (!rpcErr && typeof rpcData === 'number') {
        setTotalViews(rpcData);
        return;
      }

      // 2. Jika RPC belum dibuat atau ditolak, lakukan operasi table update / insert langsung
      const { data: existingRow, error: checkErr } = await supabase
        .from('site_stats')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (checkErr) {
        console.warn('[Supabase] site_stats record error (RLS/Permissions):', checkErr.message);
        // Optimistic counter
        setTotalViews((prev) => (Number(prev) || DEFAULT_FALLBACK_VIEWS) + 1);
        return;
      }

      if (existingRow) {
        const currentCount =
          existingRow.total_views ??
          existingRow.views ??
          existingRow.count ??
          DEFAULT_FALLBACK_VIEWS;
        const newCount = Number(currentCount) + 1;

        const updatePayload = {
          total_views: newCount,
          updated_at: new Date().toISOString(),
        };

        const { error: updateErr } = await supabase
          .from('site_stats')
          .update(updatePayload)
          .eq('id', existingRow.id);

        if (!updateErr) {
          setTotalViews(newCount);
        } else {
          console.warn('[Supabase] Gagal update site_stats row:', updateErr.message);
          setTotalViews((prev) => (Number(prev) || DEFAULT_FALLBACK_VIEWS) + 1);
        }
      } else {
        // Jika tabel kosong, insert baris pertama
        const insertPayload = {
          id: 1,
          total_views: DEFAULT_FALLBACK_VIEWS + 1,
          updated_at: new Date().toISOString(),
        };

        const { error: insertErr } = await supabase
          .from('site_stats')
          .insert([insertPayload]);

        if (!insertErr) {
          setTotalViews(DEFAULT_FALLBACK_VIEWS + 1);
        }
      }
    } catch (err) {
      console.warn('[Supabase] Exception saat mencatat page view:', err.message);
      // Fallback optimis di UI
      setTotalViews((prev) => (Number(prev) || DEFAULT_FALLBACK_VIEWS) + 1);
    }
  }, []);

  // Jalankan fetch stats dan aktifkan realtime subscription
  useEffect(() => {
    fetchStats();

    // Supabase Realtime Subscription untuk pembaruan live jika ada row change
    let channel;
    try {
      if (supabase && typeof supabase.channel === 'function') {
        channel = supabase
          .channel('site_stats_changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'site_stats' },
            (payload) => {
              if (payload.new) {
                const updatedCount =
                  payload.new.total_views ??
                  payload.new.views ??
                  payload.new.count ??
                  payload.new.total_visits ??
                  payload.new.value;
                if (updatedCount !== undefined) {
                  setTotalViews(Number(updatedCount));
                  setIsLive(true);
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsLive(true);
            }
          });
      }
    } catch (realtimeErr) {
      console.warn('[Supabase Realtime] Tidak dapat terhubung ke channel:', realtimeErr.message);
    }

    return () => {
      if (channel && supabase && typeof supabase.removeChannel === 'function') {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchStats]);

  return {
    totalViews,
    loading,
    error,
    isLive,
    fetchStats,
    recordPageView,
  };
}

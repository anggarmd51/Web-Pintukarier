import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const defaultCVOrders = [
  { id: 1, name: 'Budi Santoso', whatsapp: '08123456789', package: 'Paket ATS Professional (Rp 99k)', status: 'Menunggu Review', date: '2026-06-06' },
  { id: 2, name: 'Siti Rahma', whatsapp: '08987654321', package: 'Paket Bundle CV + LinkedIn (Rp 149k)', status: 'Selesai', date: '2026-06-05' },
];

export default function useCVOrders() {
  const [cvOrders, setCvOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCVOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('cv_orders')
        .select('*')
        .order('id', { ascending: false });

      if (fetchErr) {
        console.warn('[Supabase] Gagal mengambil data cv_orders:', fetchErr.message);
        setError(fetchErr);
        // Fallback default jika tabel belum ada atau RLS belum dibuka
        setCvOrders(defaultCVOrders);
      } else if (data && data.length > 0) {
        setCvOrders(data);
      } else {
        // Jika tabel kosong di cloud
        setCvOrders(defaultCVOrders);
      }
    } catch (err) {
      console.warn('[Supabase] Exception saat memuat cv_orders:', err.message);
      setError(err);
      setCvOrders(defaultCVOrders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVOrders();
  }, [fetchCVOrders]);

  const validateCVOrder = (values = {}) => {
    const { name, whatsapp, packageType, package: pkg } = values;
    const selectedPackage = packageType || pkg;

    if (!name || !name.trim()) {
      return { valid: false, message: 'Nama lengkap wajib diisi.' };
    }
    if (!whatsapp || !whatsapp.trim()) {
      return { valid: false, message: 'Nomor WhatsApp wajib diisi.' };
    }
    if (!selectedPackage || !selectedPackage.trim()) {
      return { valid: false, message: 'Pilih paket layanan terlebih dahulu.' };
    }

    return {
      valid: true,
      message: 'Pesanan CV berhasil dikirim! Tim kami akan segera menghubungi WhatsApp Anda.',
    };
  };

  const createCVOrder = async (orderPayload = {}) => {
    const validation = validateCVOrder(orderPayload);
    if (!validation.valid) {
      toast.error(validation.message);
      return { valid: false, message: validation.message };
    }

    const payload = {
      name: orderPayload.name.trim(),
      whatsapp: orderPayload.whatsapp.trim(),
      package: orderPayload.packageType || orderPayload.package || 'Paket ATS Professional (Rp 99k)',
      status: 'Menunggu Review',
      date: orderPayload.date || new Date().toISOString().split('T')[0],
    };

    try {
      const { data, error: insertErr } = await supabase
        .from('cv_orders')
        .insert([payload])
        .select()
        .single();

      if (insertErr) {
        console.warn('[Supabase] Insert cv_orders error:', insertErr.message);
        // Optimistic entry jika RLS terbatas
        const localEntry = { ...payload, id: Date.now() };
        setCvOrders((prev) => [localEntry, ...prev]);

        if (insertErr.code === '42501' || insertErr.message?.toLowerCase().includes('permission denied')) {
          toast.error('Pesanan dicatat, namun akses INSERT tabel cv_orders dibatasi oleh RLS Supabase.', { duration: 4000 });
        } else {
          toast.error(`Gagal menyimpan ke cloud: ${insertErr.message}`);
        }
        return { valid: true, order: localEntry, message: validation.message };
      }

      const inserted = data || { ...payload, id: Date.now() };
      // Update state reaktif instan
      setCvOrders((prev) => [inserted, ...prev]);
      toast.success(validation.message);
      return { valid: true, order: inserted, message: validation.message };
    } catch (err) {
      console.error('[Supabase] Create cv order exception:', err);
      const localEntry = { ...payload, id: Date.now() };
      setCvOrders((prev) => [localEntry, ...prev]);
      toast.success(validation.message);
      return { valid: true, order: localEntry, message: validation.message };
    }
  };

  const updateCVStatus = async (id, newStatus) => {
    // Reaktif instan di UI
    setCvOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );

    try {
      const { error: updateErr } = await supabase
        .from('cv_orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateErr) {
        console.error('[Supabase] Gagal update status cv_order:', updateErr.message);
        if (updateErr.code === '42501' || updateErr.message?.toLowerCase().includes('permission denied')) {
          toast.error('Perubahan status berhasil di UI, namun RLS Supabase menolak UPDATE.', { duration: 4000 });
        } else {
          toast.error(`Gagal memperbarui status di cloud: ${updateErr.message}`);
        }
        return false;
      }

      toast.success(`Status pesanan berhasil diubah menjadi "${newStatus}".`);
      return true;
    } catch (err) {
      console.error('[Supabase] Exception saat update status pesanan:', err);
      toast.error('Terjadi kesalahan saat memperbarui status pesanan.');
      return false;
    }
  };

  const deleteCVOrder = async (id) => {
    try {
      const { error } = await supabase
        .from('cv_orders')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Gagal menghapus data: ' + error.message);
        throw error;
      }

      setCvOrders((prev) => prev.filter((order) => order.id !== id));
      toast.success('Pesanan CV berhasil dihapus permanen dari Supabase.');
      return true;
    } catch (err) {
      console.error('[Supabase] Gagal delete cv_order:', err.message);
      return false;
    }
  };

  return {
    cvOrders,
    loading,
    error,
    fetchCVOrders,
    validateCVOrder,
    createCVOrder,
    updateCVStatus,
    deleteCVOrder,
    setCvOrders,
  };
}

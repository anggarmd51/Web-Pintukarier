import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const sortJobsByFeatured = (items = []) =>
  [...items].sort((a, b) => Number(b.featured || false) - Number(a.featured || false));

const isRlsError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42501' || message.includes('row-level security') || message.includes('permission denied for table');
};

export default function useJobActions({ jobs, setJobs }) {
  const createJob = async (newJob) => {
    try {
      const payload = {
        ...newJob,
        status: 'Menunggu Persetujuan',
        applicantsCount: Number(newJob.applicantsCount || 0),
        featured: Boolean(newJob.featured),
      };

      let insertedJob = payload;

      try {
        const { data, error } = await supabase.from('jobs').insert([payload]).select('*').single();

        if (error) {
          throw error;
        }

        insertedJob = data || payload;
      } catch (error) {
        const fallbackId = Date.now();
        insertedJob = {
          ...payload,
          id: fallbackId,
          created_at: new Date().toISOString(),
        };

        if (isRlsError(error)) {
          toast.error('Izin insert dibatasi oleh policy Supabase. Pastikan admin sudah login dan policy INSERT untuk tabel jobs diizinkan.', { duration: 5000 });
        } else {
          toast.error(`Lowongan disimpan lokal sementara: ${error?.message || 'Gagal mengakses Supabase'}`, { duration: 5000 });
        }
      }

      // Masukkan ke state agar langsung tampil di Manajemen Loker Admin
      setJobs((prevJobs) => sortJobsByFeatured([insertedJob, ...prevJobs]));
      toast.success('Lowongan berhasil dikirim dan menunggu persetujuan admin.');
      return insertedJob;
    } catch (error) {
      console.error('Gagal menambah lowongan:', error.message);
      return null;
    }
  };

  const updateJob = async (updatedJob) => {
    try {
      const safePayload = { ...updatedJob };
      delete safePayload.id;

      const { error } = await supabase
        .from('jobs')
        .update(safePayload)
        .eq('id', updatedJob.id);

      if (error) throw error;

      setJobs((prevJobs) =>
        sortJobsByFeatured(
          prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
        )
      );

      return true;
    } catch (error) {
      console.error('Gagal memperbarui lowongan:', error.message);
      if (isRlsError(error)) {
        toast.error('Akses UPDATE dibatasi oleh RLS Supabase. Pastikan akun admin terautentikasi dan policy UPDATE sudah diizinkan.');
      }
      setJobs((prevJobs) =>
        sortJobsByFeatured(
          prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
        )
      );
      return false;
    }
  };

  const updateJobStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === id ? { ...job, status: newStatus } : job
        )
      );

      toast.success(`Status lowongan berhasil diperbarui menjadi ${newStatus}.`);
      return true;
    } catch (error) {
      console.error('Gagal mengubah status lowongan:', error.message);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === id ? { ...job, status: newStatus } : job
        )
      );
      if (isRlsError(error)) {
        toast.error('Status tidak bisa diubah karena policy RLS Supabase memblokir UPDATE. Cek policy admin pada tabel jobs.');
      } else {
        toast.error('Gagal memperbarui status lowongan.');
      }
      return false;
    }
  };

  const toggleFeatured = async (id, currentVal) => {
    const newVal = !currentVal;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ featured: newVal })
        .eq('id', id);

      if (error) throw error;

      setJobs((prevJobs) =>
        sortJobsByFeatured(
          prevJobs.map((job) =>
            job.id === id ? { ...job, featured: newVal } : job
          )
        )
      );

      toast.success(`Status Premium lowongan ${newVal ? 'diaktifkan' : 'dinonaktifkan'}.`);
      return true;
    } catch (error) {
      console.error('Gagal mengubah status premium lowongan:', error.message);
      setJobs((prevJobs) =>
        sortJobsByFeatured(
          prevJobs.map((job) =>
            job.id === id ? { ...job, featured: newVal } : job
          )
        )
      );
      if (isRlsError(error)) {
        toast.error('Premium toggle diblokir oleh RLS Supabase. Pastikan akun admin memiliki izin UPDATE pada tabel jobs.');
      } else {
        toast.error('Gagal mengubah status premium lowongan.');
      }
      return false;
    }
  };

  const deleteJob = async (id) => {
    try {
      const { error } = await supabase.from('jobs').delete().eq('id', id);

      if (error) throw error;

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));

      return true;
    } catch (error) {
      console.error('Gagal menghapus lowongan:', error.message);
      if (isRlsError(error)) {
        toast.error('Hapus lowongan dibatasi oleh RLS Supabase. Cek policy DELETE untuk tabel jobs.');
      }
      return false;
    }
  };

  return {
    jobs,
    createJob,
    updateJob,
    updateJobStatus,
    toggleFeatured,
    deleteJob,
  };
}
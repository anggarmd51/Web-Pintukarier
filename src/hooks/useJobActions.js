import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function useJobActions({ jobs, setJobs }) {
  const createJob = async (newJob) => {
    try {
      const { data, error } = await supabase.from('jobs').insert([newJob]).select();

      if (error) throw error;

      const insertedJob = data?.[0] || newJob;
      setJobs((prevJobs) => [insertedJob, ...prevJobs]);

      return insertedJob;
    } catch (error) {
      console.error('Gagal menambah lowongan:', error.message);
      return null;
    }
  };

  const updateJob = async (updatedJob) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update(updatedJob)
        .eq('id', updatedJob.id);

      if (error) throw error;

      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );

      return true;
    } catch (error) {
      console.error('Gagal memperbarui lowongan:', error.message);
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
      toast.error('Gagal memperbarui status lowongan.');
      return false;
    }
  };

  const toggleFeatured = async (id, currentVal) => {
    const newVal = !currentVal;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ featured: newVal, is_featured: newVal })
        .eq('id', id);

      if (error) throw error;

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === id ? { ...job, featured: newVal, is_featured: newVal } : job
        )
      );

      return true;
    } catch (error) {
      console.error('Gagal mengubah status premium lowongan:', error.message);
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

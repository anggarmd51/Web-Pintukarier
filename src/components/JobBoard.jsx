import React, { useState } from 'react';
import useJobs from '../hooks/useJobs';
import useJobActions from '../hooks/useJobActions';
import useJobForm from '../hooks/useJobForm';

export default function JobBoard() {
  const { jobs, loading, setJobs } = useJobs();
  const { createJob, updateJob, updateJobStatus, toggleFeatured, deleteJob } = useJobActions({ jobs, setJobs });
  const { submitJobApplication } = useJobForm();
  const [searchTerm, setSearchTerm] = useState('');

  const handleApply = (job) => {
    const result = submitJobApplication(job);

    if (!result.ok && result.message) {
      alert(result.message);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pusat Lowongan Pekerjaan Pintukarier.id</h1>
        <p className="text-gray-600 mt-2">Temukan peluang karier terbaik yang sesuai dengan keahlian Anda.</p>
      </div>

      {/* Kotak Pencarian */}
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="Cari posisi, perusahaan, lokasi, atau kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Daftar Lowongan */}
      {loading ? (
        <p className="text-center text-gray-500">Memuat data lowongan...</p>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border">
          <p className="text-gray-500">Belum ada lowongan pekerjaan yang tersedia atau sesuai pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                    {job.category || 'Umum'}
                  </span>
                  {job.urgent && (
                    <span className="bg-red-100 text-red-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                      Urgent
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                <p className="text-blue-600 font-medium mt-1">{job.company}</p>
                
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
                  <span>📍 {job.location}</span>
                  <span>•</span>
                  <span>💼 {job.type}</span>
                  {job.salary && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">💰 {job.salary}</span>
                    </>
                  )}
                </div>

                <p className="text-gray-600 mt-3 text-sm">{job.desc}</p>

                {/* Menampilkan Requirements jika ada */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Persyaratan:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                      {job.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Pelamar: {job.applicantsCount || 0} orang</span>
                <button 
                  onClick={() => handleApply(job)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Lamar Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
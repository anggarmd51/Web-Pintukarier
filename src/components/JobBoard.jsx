import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Facebook, Instagram, Linkedin, Moon, Music2, Search, SearchX, Sun } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useJobs from '../hooks/useJobs';
import useJobActions from '../hooks/useJobActions';
import useJobForm from '../hooks/useJobForm';
import useCVOrders from '../hooks/useCVOrders';
import useSiteStats from '../hooks/useSiteStats';
import useDarkMode from '../hooks/useDarkMode';
import RequirementsInput, { parseRequirements, formatRequirementsToText } from './RequirementsInput';
import { JobFeedSkeleton } from './LoadingSkeleton';
import JobPostingSchema from './JobPostingSchema';
import QuickShareButton from './QuickShareButton';

const defaultJobs = [
  {
    id: 1,
    title: 'Sales Executive',
    company: 'PT. Nusanet',
    location: 'Medan',
    type: 'Full Time',
    salary: 'Rp 6jt - 9jt',
    category: 'Sales & Marketing',
    status: 'Aktif',
    featured: true,
    urgent: false,
    created_at: '2026-08-28T09:30:00.000Z',
    desc: 'Mengelola ekspansi klien B2B, penawaran layanan internet bisnis, dan membangun hubungan strategis korporat.',
    requirements: ['Pengalaman B2B min. 1 tahun', 'Memiliki relasi korporat yang luas', 'Kemampuan negosiasi dan komunikasi yang sangat baik'],
    applyType: 'whatsapp',
    applyTarget: '08123456789',
    applicantsCount: 18,
  },
  {
    id: 2,
    title: 'HRIS Specialist',
    company: 'PT. Nusawork',
    location: 'Jakarta (Remote)',
    type: 'Remote',
    salary: 'Rp 8jt - 12jt',
    category: 'HR',
    status: 'Aktif',
    featured: true,
    urgent: false,
    created_at: '2026-08-29T11:00:00.000Z',
    desc: 'Bertanggung jawab atas implementasi sistem HRIS, pengelolaan modul kehadiran, dan dukungan klien korporat.',
    requirements: ['Menguasai sistem HR & payroll', 'Pernah menghandle implementasi software HRIS', 'Teliti dan berorientasi pada detail'],
    applyType: 'email',
    applyTarget: 'hr@nusawork.com',
    applicantsCount: 24,
  },
  {
    id: 3,
    title: 'Frontend Web Developer',
    company: 'PT. Pintukarier Tech',
    location: 'Remote',
    type: 'Freelance',
    salary: 'Rp 7jt - 11jt',
    category: 'Tech',
    status: 'Aktif',
    featured: false,
    urgent: false,
    created_at: '2026-08-30T14:45:00.000Z',
    desc: 'Membangun antarmuka web platform karier menggunakan React, Tailwind CSS, dan integrasi modern.',
    requirements: ['Menguasai React.js & Tailwind CSS', 'Terbiasa dengan Git dan REST API', 'Portofolio web responsif'],
    applyType: 'gform',
    applyTarget: 'https://forms.gle/contoh',
    applicantsCount: 9,
  },
  {
    id: 4,
    title: 'Content Creator & Copywriter (Closed)',
    company: 'PT. Media Pintar Nusantara',
    location: 'Bandung',
    type: 'Part Time',
    salary: 'Rp 4jt - 6jt',
    category: 'Creative',
    status: 'Tidak Aktif',
    featured: false,
    urgent: false,
    created_at: '2026-08-25T08:15:00.000Z',
    desc: 'Lowongan ini telah ditutup/tidak aktif dan hanya muncul di panel admin.',
    requirements: ['Portofolio copywriting', 'Kreatif'],
    applyType: 'email',
    applyTarget: 'hr@mediapintar.com',
    applicantsCount: 12,
  },
];

const defaultCVOrders = [
  { id: 1, name: 'Budi Santoso', whatsapp: '08123456789', package: 'Paket ATS Professional (Rp 99k)', status: 'Menunggu Review', date: '2026-06-06' },
  { id: 2, name: 'Siti Rahma', whatsapp: '08987654321', package: 'Paket Bundle CV + LinkedIn (Rp 149k)', status: 'Selesai', date: '2026-06-05' },
];

const publicCategories = ['IT & Software', 'Sales & Marketing', 'Keuangan/Akuntansi', 'HRD/Personalia', 'Administrasi', 'Teknik/Engineering', 'Logistik/Operasional', 'Pelayanan Pelanggan'];

const formatJobDate = (dateVal) => {
  if (!dateVal) return 'Baru Saja';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return String(dateVal);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatJobTime = (dateVal) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
};

const sortJobsByFeatured = (items = []) =>
  [...items].sort((a, b) => Number(b.featured || b.is_featured || false) - Number(a.featured || a.is_featured || false));

const setMetaTag = (selector, attr, value, content) => {
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

const updateOpenGraphMeta = (job = null) => {
  const siteName = 'Pintukarier.id';
  const defaultTitle = 'Pintukarier.id | Portal Lowongan Kerja & CV ATS';
  const defaultDescription = 'Temukan lowongan kerja terbaru, peluang karier, dan layanan pembuatan CV ATS profesional di Pintukarier.id.';
  const defaultImage = '/IMG-20260728-WA0012 (1).png';

  document.title = job ? `${job.title} | ${job.company} - ${siteName}` : defaultTitle;

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', job ? `${job.title} di ${job.company}` : defaultTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', job ? `${job.company} • ${job.location} • ${job.salary}. ${job.desc?.slice(0, 150) || 'Lihat detail lowongan dan segera kirim lamaran.'}` : defaultDescription);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', job ? defaultImage : defaultImage);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', window.location.href);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteName);
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', job ? `${job.title} di ${job.company}` : defaultTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', job ? `${job.company} • ${job.location} • ${job.salary}` : defaultDescription);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', defaultImage);
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
};

const Navbar = ({ onOpenPostJob, onOpenAdminLogin, isAdmin, isDark, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (callback) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-xs sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/logo.png" alt="Logo Pintukarier" className="h-9 sm:h-10 w-auto object-contain" />
              <div className="flex items-center bg-navy px-2.5 sm:px-3 py-1.5 sm:py-2.5 rounded-xl shadow-xs ring-1 ring-slate-200/10">
                <span className="antialiased text-[10px] sm:text-xs lg:text-sm font-bold text-white tracking-[0.16em] sm:tracking-[0.24em] uppercase whitespace-nowrap">PINTU KARIER.ID</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {/* Tombol Cepat Mode Gelap di Mobile Navbar */}
              <button
                type="button"
                aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                onClick={toggleDarkMode}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-400 shadow-xs active:scale-95 transition cursor-pointer"
              >
                {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
              </button>

              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs active:bg-slate-100 dark:active:bg-slate-700 transition cursor-pointer"
              >
                <span className="flex flex-col gap-1.5">
                  <span className={`block h-0.5 w-5 rounded-full bg-slate-700 dark:bg-slate-300 transition-all duration-300 ease-out ${isOpen ? 'translate-y-2 rotate-45' : ''}`} />
                  <span className={`block h-0.5 w-5 rounded-full bg-slate-700 dark:bg-slate-300 transition-all duration-300 ease-out ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`block h-0.5 w-5 rounded-full bg-slate-700 dark:bg-slate-300 transition-all duration-300 ease-out ${isOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                </span>
              </button>
            </div>
          </div>

          <div className="hidden md:flex space-x-3 lg:space-x-5 font-medium text-slate-600 dark:text-slate-300 items-center text-sm">
            <a href="#jobs" className="hover:text-teal dark:hover:text-teal transition">Cari Kerja</a>
            <a href="#cv-service" className="hover:text-teal dark:hover:text-teal transition">Buat CV ATS</a>
            <a href="#community" className="hover:text-teal dark:hover:text-teal transition">Komunitas</a>

            {/* Tombol Toggle Mode Gelap Desktop */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer active:scale-95 text-xs font-semibold"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
              <span>{isDark ? 'Terang' : 'Gelap'}</span>
            </button>

            <button onClick={onOpenPostJob} className="bg-teal hover:bg-teal/90 text-navy font-bold px-4 py-2.5 rounded-xl shadow-xs transition text-sm cursor-pointer active:scale-98">Pasang Lowongan</button>
            <button onClick={onOpenAdminLogin} className="border border-slate-300 dark:border-slate-700 hover:border-teal text-slate-700 dark:text-slate-200 hover:text-teal px-3.5 py-2.5 rounded-xl font-medium transition text-sm cursor-pointer active:scale-98">{isAdmin ? 'Dashboard Admin' : '🔑 Login'}</button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            isOpen
              ? 'mt-2.5 max-h-96 opacity-100 visible rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl'
              : 'max-h-0 opacity-0 invisible mt-0 border-0'
          }`}
        >
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 p-1.5">
            {[
              { href: '#jobs', label: '🔍 Cari Kerja' },
              { href: '#cv-service', label: '📄 Buat CV ATS' },
              { href: '#community', label: '💬 Komunitas Loker' }
            ].map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all duration-300 ease-out hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 rounded-lg ${
                  isOpen ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
                }`}
                style={{ transitionDelay: isOpen ? `${index * 60}ms` : '0ms' }}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => handleNavClick(onOpenPostJob)}
              className={`mt-1 px-4 py-3.5 text-left text-sm font-bold text-navy bg-teal/15 transition-all duration-300 ease-out hover:bg-teal/25 active:bg-teal/30 rounded-xl cursor-pointer ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
              }`}
              style={{ transitionDelay: isOpen ? '180ms' : '0ms' }}
            >
              + Pasang Lowongan Kerja
            </button>
            <button
              onClick={() => handleNavClick(onOpenAdminLogin)}
              className={`mt-1 px-4 py-3.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 transition-all duration-300 ease-out hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 rounded-xl cursor-pointer ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
              }`}
              style={{ transitionDelay: isOpen ? '220ms' : '0ms' }}
            >
              {isAdmin ? '⚙️ Dashboard Admin' : '🔑 Login Superadmin'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ searchTerm, setSearchTerm, selectedTag, setSelectedTag }) => {
  const tags = ['Semua', ...publicCategories];

  return (
    <div className="bg-navy text-white py-10 sm:py-16 px-4 text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <span className="bg-teal/15 text-teal text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Portal Karier & B2B Talent Terpercaya</span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight">Wujudkan Karier Impianmu Bersama Perusahaan Terbaik</h1>
        <p className="text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-xs sm:text-sm lg:text-base leading-relaxed">Ribuan lowongan terverifikasi dan layanan optimasi CV profesional siap mengantar kesuksesan kariermu.</p>

        <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto border border-white/20">
          <div className="flex items-center flex-1 px-3 py-1 sm:py-2">
            <Search className="h-5 w-5 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari posisi, perusahaan, atau lokasi..."
              className="w-full text-slate-800 placeholder:text-slate-400 focus:outline-none text-xs sm:text-sm bg-transparent py-1.5"
            />
          </div>
          <button
            type="button"
            onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="bg-teal hover:bg-teal/90 text-navy font-bold px-6 sm:px-8 py-3 rounded-xl transition text-xs sm:text-sm w-full sm:w-auto shadow-xs active:scale-98 cursor-pointer"
          >
            Cari Loker
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px] sm:text-xs">Kategori Populer:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === 'Semua' ? '' : tag)}
              className={`px-3 py-1.5 rounded-full transition border cursor-pointer active:scale-95 text-[11px] sm:text-xs ${selectedTag === (tag === 'Semua' ? '' : tag) ? 'bg-teal border-teal text-navy font-bold shadow-xs' : 'bg-white/10 border-white/10 text-slate-200 hover:bg-white/20'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsBar = ({ totalJobs, totalCompanies, totalApplicants }) => (
  <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-6 sm:py-8 shadow-xs transition-colors">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
      <div className="bg-slate-50/70 dark:bg-slate-800/80 sm:bg-transparent p-3 sm:p-2 rounded-xl border border-slate-100 dark:border-slate-800 sm:border-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy dark:text-teal">{totalJobs}+</div>
        <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Lowongan Aktif</div>
      </div>
      <div className="bg-slate-50/70 dark:bg-slate-800/80 sm:bg-transparent p-3 sm:p-2 rounded-xl border border-slate-100 dark:border-slate-800 sm:border-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy dark:text-teal">{totalCompanies}+</div>
        <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Perusahaan Mitra</div>
      </div>
      <div className="bg-slate-50/70 dark:bg-slate-800/80 sm:bg-transparent p-3 sm:p-2 rounded-xl border border-slate-100 dark:border-slate-800 sm:border-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy dark:text-teal">{totalApplicants}+</div>
        <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Pencari Kerja Aktif</div>
      </div>
      <div className="bg-slate-50/70 dark:bg-slate-800/80 sm:bg-transparent p-3 sm:p-2 rounded-xl border border-slate-100 dark:border-slate-800 sm:border-0">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-navy dark:text-teal">95%</div>
        <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">Tingkat Kepuasan CV</div>
      </div>
    </div>
  </div>
);

const JobFeed = ({ jobs, onSelectJob, searchTerm, selectedTag, onResetFilters, loading }) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredJobs = jobs.filter((job) => {
    // Sembunyikan lowongan tidak aktif dari halaman publik
    if (job.status !== 'Aktif') return false;

    const search = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (job.title && job.title.toLowerCase().includes(search)) ||
      (job.company && job.company.toLowerCase().includes(search)) ||
      (job.location && job.location.toLowerCase().includes(search));
    const matchesTag = !selectedTag || selectedTag === 'Semua' || job.category === selectedTag;
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    const aFeatured = a.featured || a.is_featured || false;
    const bFeatured = b.featured || b.is_featured || false;
    return (bFeatured ? 1 : 0) - (aFeatured ? 1 : 0);
  });

  useEffect(() => {
    setVisibleCount(6);
  }, [searchTerm, selectedTag]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  return (
    <div id="jobs" className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-navy dark:text-white">Lowongan Kerja Terbaru</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">Peluang karier pilihan untuk profesional Indonesia</p>
        </div>
        <span className="inline-flex self-start sm:self-auto text-xs sm:text-sm font-semibold text-teal bg-teal/10 px-3 py-1 rounded-full">{filteredJobs.length} Lowongan Tersedia</span>
      </div>

      {loading ? (
        <JobFeedSkeleton count={6} />
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-12 sm:py-16 text-center shadow-sm px-4">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 shadow-inner ring-1 ring-slate-200 dark:ring-slate-600">
            <SearchX className="h-8 w-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-navy dark:text-white">Lowongan tidak ditemukan</h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Belum ada hasil yang cocok dengan pencarian atau filter saat ini. Coba ubah kata kunci atau reset filter untuk melihat seluruh lowongan aktif.</p>
          <button
            onClick={onResetFilters}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-navy dark:bg-teal dark:text-navy px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:hover:bg-teal/90"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {visibleJobs.map((job, index) => {
              const isFeatured = job.featured || job.is_featured || false;
              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border bg-white dark:bg-slate-800 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6 ${isFeatured ? 'border-teal ring-1 ring-teal/50' : 'border-slate-200 dark:border-slate-700'}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {isFeatured && (
                    <span className="absolute -top-3 right-4 bg-teal text-navy text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">🔥 PREMIUM</span>
                  )}

                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-base font-bold text-navy dark:text-white transition group-hover:text-teal sm:text-lg">{job.title}</h3>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">{job.company}</p>
                    </div>
                    <span className="inline-flex shrink-0 rounded bg-teal/10 px-2.5 py-1 text-[10px] font-bold text-teal sm:text-xs">{job.category}</span>
                  </div>

                  <div>
                    <p className="mb-4 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 sm:text-xs">{job.desc}</p>
                  </div>
                  <div>
                    <div className="mb-3 flex justify-between gap-2 rounded bg-slate-50 dark:bg-slate-700/50 p-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200 sm:text-xs">
                      <span>Gaji:</span> <span className="text-right font-bold text-teal">{job.salary}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mb-3">
                      <span className="max-w-[60%] truncate rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-1 text-slate-600 dark:text-slate-300">{job.location}</span>
                      <span className="font-bold text-teal">{job.type}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/70 pt-2.5 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-teal shrink-0" />
                        <span>{formatJobDate(job.created_at || job.date)}</span>
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-teal group-hover:underline">
                        Lihat Detail →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="bg-navy dark:bg-slate-800 hover:bg-navy/90 dark:hover:bg-slate-700 text-white font-bold px-5 sm:px-6 py-3 rounded-xl shadow transition w-full sm:w-auto border border-transparent dark:border-slate-700 cursor-pointer active:scale-98"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CVServicePromo = ({ onOrderCV }) => (
  <div id="cv-service" className="bg-gradient-to-r from-navy to-[#2A3D63] py-10 sm:py-16 text-white my-8 sm:my-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
      <div className="max-w-xl text-center md:text-left">
        <span className="bg-teal/20 text-teal text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Layanan Karir Profesional</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-3 sm:mb-4">Buat CV ATS-Friendly & Optimasi LinkedIn</h2>
        <p className="text-slate-300 text-xs sm:text-sm md:text-base mb-6 leading-relaxed">Sering ditolak sistem ATS perusahaan? Tingkatkan peluang lolos seleksi HR hingga 3x lipat dengan format CV standar industri.</p>
        <button onClick={onOrderCV} className="bg-teal hover:bg-teal/95 active:bg-teal text-navy font-bold px-6 py-3.5 sm:py-3 rounded-xl shadow-xs transition w-full sm:w-auto text-xs sm:text-sm cursor-pointer active:scale-98">Pesan Pembuatan CV Sekarang</button>
      </div>
      <div className="bg-white/15 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/15 max-w-sm w-full">
        <h3 className="font-bold text-base sm:text-lg mb-3">Paket Unggulan</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-200 mb-5 sm:mb-6">
          <li>✓ Format ATS Teruji & Lolos HR</li>
          <li>✓ Redaksi Bahasa Profesional & SEO</li>
          <li>✓ Konsultasi & Revisi Tanpa Batas</li>
        </ul>
        <div className="text-teal font-extrabold text-lg sm:text-xl">Mulai Rp 99.000</div>
      </div>
    </div>
  </div>
);

const CommunitySection = () => (
  <div id="community" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div className="bg-teal/10 border border-teal/20 rounded-2xl p-6 sm:p-12 shadow-xs">
      <h2 className="text-xl sm:text-3xl font-bold text-navy mb-2 sm:mb-3">Gabung Komunitas Loker Pintukarier.id</h2>
      <p className="text-slate-600 max-w-xl mx-auto mb-5 sm:mb-6 text-xs sm:text-sm leading-relaxed">Dapatkan info lowongan kerja pilihan setiap hari langsung di handphone-mu tanpa ketinggalan.</p>
      <a href="https://chat.whatsapp.com/E00jf6uXmuF742oQjkvn39?s=cl&p=a&mlu=4" target="_blank" className="bg-teal hover:bg-teal/90 active:bg-teal text-navy font-bold px-6 sm:px-8 py-3.5 sm:py-3 rounded-xl shadow-xs transition inline-block w-full sm:w-auto text-xs sm:text-sm cursor-pointer active:scale-98">Gabung Grup Komunitas Loker</a>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-navy text-white pt-12 pb-6 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-block bg-white/5 px-4 py-2 rounded-xl mb-2">
        <span className="text-lg font-bold tracking-[0.2em] uppercase text-white">PINTU KARIER.ID</span>
      </div>
      <p className="text-slate-400 text-sm mb-5 max-w-lg mx-auto">Pintu Menuju Karier Impianmu • Platform Informasi Lowongan Kerja & B2B Talent Terpercaya.</p>

      <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
        <a href="https://www.instagram.com/pintukarier.id?igsi=bTZmamhmbnNkYmto" target="_blank" rel="noreferrer" aria-label="Instagram Pintukarier.id" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-400/60 hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-orange-400/20 hover:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-pink-300 transition-colors duration-300 group-hover:bg-pink-500/20 group-hover:text-pink-200">
            <Instagram className="h-4 w-4" />
          </span>
          <span className="font-medium">@pintukarier.id</span>
        </a>
        <a href="https://www.tiktok.com/@pintukarier.id?_r=1&_t=ZS-99NYB9OYGmb" target="_blank" rel="noreferrer" aria-label="TikTok Pintukarier.id" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/60 hover:bg-slate-100/10 hover:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-200 transition-colors duration-300 group-hover:bg-slate-100/20 group-hover:text-white">
            <Music2 className="h-4 w-4" />
          </span>
          <span className="font-medium">@pintukarier.id</span>
        </a>
        <a href="https://www.linkedin.com/company/pintukarierid/" target="_blank" rel="noreferrer" aria-label="LinkedIn Pintukarier.id" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-blue-300 transition-colors duration-300 group-hover:bg-blue-500/20 group-hover:text-blue-100">
            <Linkedin className="h-4 w-4" />
          </span>
          <span className="font-medium">pintukarier.id</span>
        </a>
        <a href="https://www.facebook.com/share/1KyKUkA7UQ/" target="_blank" rel="noreferrer" aria-label="Facebook Pintukarier.id" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/60 hover:bg-blue-600/10 hover:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-blue-400 transition-colors duration-300 group-hover:bg-blue-600/20 group-hover:text-blue-100">
            <Facebook className="h-4 w-4" />
          </span>
          <span className="font-medium">pintukarier.id</span>
        </a>
      </div>

      <p className="text-slate-500 text-xs">© {new Date().getFullYear()} Pintukarier.id. Seluruh hak cipta dilindungi.</p>
    </div>
  </footer>
);

const normalizeWhatsappNumber = (value = '') => {
  const raw = String(value).trim();
  if (!raw) return '';

  const withoutSpaces = raw.replace(/\s+/g, '');
  let normalized = withoutSpaces.replace(/[^\d+]/g, '');

  if (!normalized) return '';
  if (normalized.startsWith('62')) return normalized;
  if (normalized.startsWith('0')) return `62${normalized.slice(1)}`;
  return normalized.startsWith('+') ? normalized.replace('+', '') : normalized;
};

const JobDetailModal = ({ job, onClose, onApplyTrack }) => {
  if (!job) return null;
  if (job.status && job.status !== 'Aktif') return null;

  const handleApply = () => {
    if (!job.applyTarget || !job.applyTarget.trim()) {
      toast.error(`Informasi lamaran untuk posisi ${job.title} belum tersedia.`);
      return;
    }

    onApplyTrack(job.id);

    const applyType = (job.applyType || '').toLowerCase();
    const safeTarget = job.applyTarget.trim();

    if (applyType === 'whatsapp') {
      const normalizedWa = normalizeWhatsappNumber(safeTarget);
      if (!normalizedWa) {
        toast.error(`Informasi lamaran untuk posisi ${job.title} belum tersedia.`);
        return;
      }

      const message = encodeURIComponent(`Halo, saya ingin melamar posisi ${job.title} di ${job.company} melalui Pintukarier.id`);
      window.open(`https://wa.me/${normalizedWa}?text=${message}`, '_blank');
      toast.success(`Lamaran untuk ${job.title} siap dikirim melalui WhatsApp.`);
      return;
    }

    if (applyType === 'email') {
      window.location.href = `mailto:${safeTarget}?subject=${encodeURIComponent(`Lamaran ${job.title} - ${job.company}`)}`;
      toast.success(`Lamaran untuk ${job.title} siap dikirim via email.`);
      return;
    }

    let targetUrl = safeTarget;
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
    window.open(targetUrl, '_blank');
    toast.success(`Lamaran untuk ${job.title} sedang dibuka di form pelamaran.`);
  };

  const buttonClass = (job.applyType || '').toLowerCase() === 'whatsapp'
    ? 'w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3.5 sm:py-3 rounded-xl transition shadow text-center block cursor-pointer active:scale-98'
    : 'w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 sm:py-3 rounded-xl transition shadow text-center block cursor-pointer active:scale-98';

  const jobReqs = Array.isArray(job.requirements)
    ? job.requirements
    : parseRequirements(job.requirements);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-transparent dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 transition font-bold text-base z-20 shadow-xs cursor-pointer"
          title="Tutup Modal"
          aria-label="Tutup"
        >
          ✕
        </button>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3 pr-12 sm:pr-14">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs font-bold text-teal bg-teal/10 px-2.5 sm:px-3 py-1 rounded-full">{job.category}</span>
            {(job.featured || job.is_featured) && (
              <span className="text-[10px] sm:text-xs font-extrabold text-navy bg-teal px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">🔥 PREMIUM</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-2.5 py-1 rounded-full shadow-xs">
            <Calendar className="h-3.5 w-3.5 text-teal shrink-0" />
            <span>Dipasang: {formatJobDate(job.created_at || job.date)}</span>
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy dark:text-white mt-1 mb-1 leading-snug">{job.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 font-semibold mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">{job.company} • {job.location}</p>
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-xl mb-4 text-xs sm:text-sm space-y-2 border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between gap-3 text-slate-700 dark:text-slate-200"><strong>Kisaran Gaji:</strong> <span className="text-teal font-bold text-right">{job.salary}</span></div>
          <div className="flex justify-between gap-3 text-slate-700 dark:text-slate-200"><strong>Tipe Pekerjaan:</strong> <span className="text-right">{job.type}</span></div>
        </div>
        <h3 className="font-bold text-navy dark:text-white mb-1.5 text-xs sm:text-sm md:text-base">Deskripsi Pekerjaan:</h3>
        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed">{job.desc}</p>

        {jobReqs && jobReqs.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-navy dark:text-white mb-2 text-xs sm:text-sm md:text-base flex items-center justify-between">
              <span>Persyaratan / Kualifikasi:</span>
              <span className="text-[10px] sm:text-xs font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                {jobReqs.length} Butir
              </span>
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm bg-slate-50/80 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
              {jobReqs.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Share Button (WhatsApp, Telegram, LinkedIn, Copy Link) */}
        <QuickShareButton job={job} className="mb-5" />

        <button onClick={handleApply} className={`${buttonClass} text-xs sm:text-sm md:text-base min-h-[46px]`}>
          Kirim Lamaran Sekarang ({job.applyType ? job.applyType.toUpperCase() : 'WEB'})
        </button>
      </div>
    </div>
  );
};

const OrderCVModal = ({ isOpen, onClose, onSubmitOrder }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [packageType, setPackageType] = useState('Paket ATS Professional (Rp 99k)');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await onSubmitOrder({ name, whatsapp, packageType });
      if (result && result.valid) {
        setName('');
        setWhatsapp('');
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition font-bold text-base z-20 cursor-pointer shadow-xs"
          title="Tutup"
        >
          ✕
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-navy mb-4 pr-8">Pesan Layanan CV ATS Profesional</h2>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          <div><label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Masukkan nama..." /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label><input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Contoh: 08123456789" /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Pilih Paket Layanan</label><select value={packageType} onChange={e => setPackageType(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none"><option>Paket ATS Professional (Rp 99k)</option><option>Paket Bundle CV + LinkedIn (Rp 149k)</option></select></div>
          <button type="submit" disabled={submitting} className="w-full bg-teal hover:bg-teal/90 active:bg-teal/95 disabled:opacity-60 text-navy font-bold py-3.5 rounded-xl shadow-xs transition cursor-pointer min-h-[46px] active:scale-98 mt-2 flex items-center justify-center gap-2">
            {submitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />}
            <span>{submitting ? 'Menyimpan ke Cloud...' : 'Kirim Pesanan Sekarang'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const PostJobModal = ({ isOpen, onClose, onAddJob, isAdminMode = false }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('IT & Software');
  const [type, setType] = useState('Full Time');
  const [applyType, setApplyType] = useState('whatsapp');
  const [applyTarget, setApplyTarget] = useState('');
  const [requirementsText, setRequirementsText] = useState(
    '• Pendidikan minimal D3 / S1 semua jurusan\n• Pengalaman kerja minimal 1-2 tahun di bidang terkait\n• Komunikatif dan mampu bekerja sama dalam tim'
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedReqs = parseRequirements(requirementsText);
    const newJob = {
      title,
      company,
      location: location || 'Remote',
      type,
      salary: salary || 'Kompetitif',
      category,
      status: isAdminMode ? 'Aktif' : 'Menunggu Persetujuan',
      featured: false,
      urgent: false,
      created_at: new Date().toISOString(),
      desc,
      requirements: parsedReqs.length > 0 ? parsedReqs : ['Pengalaman relevan di bidangnya', 'Mampu bekerja dalam tim', 'Inisiatif dan proaktif'],
      applyType,
      applyTarget,
      applicantsCount: 0,
    };
    await onAddJob(newJob);

    if (!isAdminMode) {
      const adminWa = '085179905019';
      const waMessage = encodeURIComponent('Halo Admin, saya ingin memasang lowongan kerja di website Pintukarier.id');
      window.open(`https://wa.me/62${adminWa.replace(/^0/, '')}?text=${waMessage}`, '_blank');
      alert('Lowongan berhasil diajukan! Anda akan diarahkan ke WhatsApp Admin untuk konfirmasi persetujuan.');
    } else {
      toast.success(`Lowongan "${title}" berhasil ditambahkan.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition font-bold text-base z-20 cursor-pointer shadow-xs"
          title="Tutup"
        >
          ✕
        </button>
        <h2 className="text-lg sm:text-2xl font-bold text-navy mb-1.5 pr-8 leading-snug">
          {isAdminMode ? 'Tambah Lowongan Baru (Superadmin)' : 'Pasang Lowongan Pekerjaan Baru'}
        </h2>
        <p className="text-slate-500 text-[11px] sm:text-xs mb-4">
          {isAdminMode
            ? 'Lowongan yang ditambahkan oleh admin akan langsung berstatus Aktif di portal.'
            : 'Lowongan akan ditinjau admin setelah Anda melakukan konfirmasi via WhatsApp.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          <div><label className="block font-semibold text-slate-700 mb-1">Posisi Jabatan</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Contoh: Digital Marketing Specialist" /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan</label><input required value={company} onChange={e => setCompany(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Contoh: PT Inovasi Teknologi Nusantara" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div><label className="block font-semibold text-slate-700 mb-1">Lokasi</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Medan / Remote" /></div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none">
                {publicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div><label className="block font-semibold text-slate-700 mb-1">Jenis Pekerjaan</label><select value={type} onChange={e => setType(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none"><option>Full Time</option><option>Kontrak</option><option>Remote</option><option>Mitra</option><option>Freelance</option></select></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Kisaran Gaji</label><input value={salary} onChange={e => setSalary(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Rp 5jt - 8jt" /></div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pekerjaan</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows="3" className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="Tuliskan gambaran pekerjaan dan tanggung jawab utama..."></textarea>
          </div>

          <RequirementsInput
            value={requirementsText}
            onChange={setRequirementsText}
            label="Persyaratan / Kualifikasi (Daftar Poin)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t border-slate-200 pt-3">
            <div><label className="block font-semibold text-slate-700 mb-1">Metode Pelamar Melamar</label><select value={applyType} onChange={e => setApplyType(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none"><option value="whatsapp">WhatsApp HR</option><option value="email">Email HR</option><option value="gform">Google Form / Web URL</option></select></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Tujuan (No WA / Email / Link)</label><input required value={applyTarget} onChange={e => setApplyTarget(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" placeholder="0812xxxx atau hr@mail.com" /></div>
          </div>

          <button type="submit" className="w-full bg-teal hover:bg-teal/90 active:bg-teal/95 text-navy font-bold py-3.5 rounded-xl shadow-xs mt-2 cursor-pointer active:scale-98 min-h-[46px]">
            {isAdminMode ? 'Simpan & Tayangkan Lowongan' : 'Kirim & Konfirmasi ke WhatsApp Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

const EditJobModal = ({ job, onClose, onSave }) => {
  const [title, setTitle] = useState(job.title || '');
  const [company, setCompany] = useState(job.company || '');
  const [location, setLocation] = useState(job.location || '');
  const [salary, setSalary] = useState(job.salary || '');
  const [desc, setDesc] = useState(job.desc || '');
  const [type, setType] = useState(job.type || 'Full Time');
  const [category, setCategory] = useState(job.category || 'IT & Software');
  const [applyType, setApplyType] = useState(job.applyType || 'whatsapp');
  const [applyTarget, setApplyTarget] = useState(job.applyTarget || '');
  const [requirementsText, setRequirementsText] = useState(() => formatRequirementsToText(job.requirements));

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedRequirements = parseRequirements(requirementsText);
    onSave({
      ...job,
      title,
      company,
      location,
      salary,
      desc,
      type,
      category,
      applyType,
      applyTarget,
      requirements: updatedRequirements,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition font-bold text-base z-20 cursor-pointer shadow-xs"
          title="Tutup"
        >
          ✕
        </button>
        <h2 className="text-lg sm:text-2xl font-bold text-navy mb-4 pr-8 leading-snug">Edit Lowongan Pekerjaan</h2>
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          <div><label className="block font-semibold text-slate-700 mb-1">Posisi Jabatan</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan</label><input required value={company} onChange={e => setCompany(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div><label className="block font-semibold text-slate-700 mb-1">Lokasi</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" /></div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none">
                {publicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div><label className="block font-semibold text-slate-700 mb-1">Jenis Pekerjaan</label><select value={type} onChange={e => setType(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none"><option>Full Time</option><option>Kontrak</option><option>Remote</option><option>Mitra</option><option>Freelance</option></select></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Gaji</label><input value={salary} onChange={e => setSalary(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" /></div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pekerjaan</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows="3" className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none"></textarea>
          </div>

          <RequirementsInput
            value={requirementsText}
            onChange={setRequirementsText}
            label="Persyaratan / Kualifikasi (Daftar Poin)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t border-slate-200 pt-3">
            <div><label className="block font-semibold text-slate-700 mb-1">Metode Lamaran</label><select value={applyType} onChange={e => setApplyType(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none"><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="gform">Google Form / URL</option></select></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Target Tujuan</label><input value={applyTarget} onChange={e => setApplyTarget(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl focus:ring-2 focus:ring-teal outline-none" /></div>
          </div>
          <button type="submit" className="w-full bg-teal hover:bg-teal/90 active:bg-teal/95 text-navy font-bold py-3.5 rounded-xl shadow-xs cursor-pointer active:scale-98 min-h-[46px]">Simpan Perubahan</button>
        </form>
      </div>
    </div>
  );
};

const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess, login }) => {
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!login) throw new Error('Login function not available');
      await login({ email: username, password: pwd });
      onLoginSuccess();
      onClose();
      setUsername('');
      setPwd('');
    } catch (err) {
      alert('Username atau Password salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-800 transition font-bold text-base z-20 cursor-pointer shadow-xs"
          title="Tutup"
        >
          ✕
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-navy mb-4 pr-8">Login Superadmin</h2>
        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
          <div><label className="block font-semibold text-slate-700 mb-1">Username</label><input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal" placeholder="admin" /></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Password</label><input type="password" required value={pwd} onChange={e => setPwd(e.target.value)} className="w-full border border-slate-300 p-2.5 sm:p-3 rounded-xl outline-none focus:ring-2 focus:ring-teal" placeholder="••••••••" /></div>
          <button type="submit" className="w-full bg-navy hover:bg-slate-800 active:bg-slate-900 text-white font-bold py-3 rounded-xl transition cursor-pointer min-h-[46px] active:scale-98">Masuk Panel</button>
        </form>
      </div>
    </div>
  );
};

const SuperAdminDashboard = ({
  jobs,
  setJobs,
  cvOrders,
  loadingCVOrders,
  fetchCVOrders,
  updateCVStatus,
  deleteCVOrder,
  totalViews,
  loadingStats,
  isStatsLive,
  fetchStats,
  onLogout,
  updateJobStatus,
  toggleFeatured,
  deleteJob,
  saveEditedJob,
  onAddJob,
}) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [editingJob, setEditingJob] = useState(null);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name, type: 'cv' | 'job' }
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      if (confirmDelete.type === 'cv') {
        await deleteCVOrder(confirmDelete.id);
      } else if (confirmDelete.type === 'job') {
        await deleteJob(confirmDelete.id);
      }
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  const activeJobsCount = jobs.filter(j => j.status === 'Aktif').length;
  const pendingJobsCount = jobs.filter(j => j.status === 'Menunggu Persetujuan').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);
  const premiumJobsCount = jobs.filter(j => (j.featured || j.is_featured) && j.status === 'Aktif').length;
  const totalCompanies = new Set(jobs.filter(Boolean).map(job => (job.company || '').trim()).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-navy text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow flex-wrap gap-2">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <span className="bg-teal text-navy font-extrabold px-2.5 py-1 rounded text-xs uppercase tracking-wider">Superadmin</span>
          <h1 className="text-sm sm:text-base lg:text-lg font-bold">Pintukarier.id Control Center</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onLogout} className="bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer">Keluar Admin</button>
        </div>
      </div>

      <div className="bg-white border-b px-4 sm:px-6 flex space-x-3 sm:space-x-6 text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab('stats')} className={`py-3 sm:py-3.5 border-b-2 transition cursor-pointer ${activeTab === 'stats' ? 'border-teal text-navy' : 'border-transparent text-slate-600 hover:text-navy'}`}>📊 Ringkasan Dashboard</button>
        <button onClick={() => setActiveTab('jobs')} className={`py-3 sm:py-3.5 border-b-2 transition cursor-pointer ${activeTab === 'jobs' ? 'border-teal text-navy' : 'border-transparent text-slate-600 hover:text-navy'}`}>💼 Manajemen Loker ({jobs.length})</button>
        <button onClick={() => setActiveTab('cv')} className={`py-3 sm:py-3.5 border-b-2 transition cursor-pointer ${activeTab === 'cv' ? 'border-teal text-navy' : 'border-transparent text-slate-600 hover:text-navy'}`}>📄 Pesanan CV Klien ({cvOrders.length})</button>
      </div>

      <div className="max-w-7xl mx-auto w-full p-3 sm:p-6 flex-1">
        {activeTab === 'stats' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-navy">Statistik Utama Platform</h2>
                <div className="text-xs text-slate-500 mt-0.5">Ringkasan performa kunjungan dan aktivitas rekrutmen terkini.</div>
              </div>
              <button
                type="button"
                onClick={() => fetchStats?.()}
                disabled={loadingStats}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                title="Segarkan data dari Supabase site_stats"
              >
                <span className={loadingStats ? 'inline-block animate-spin' : ''}>🔄</span>
                <span>{loadingStats ? 'Menyinkronkan...' : 'Segarkan Statistik'}</span>
              </button>
            </div>

            {/* Baris 1: Visitor Counter & Job Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {/* GLOBAL VISITOR COUNTER */}
              <div className="bg-gradient-to-br from-white to-teal/5 p-4 sm:p-6 rounded-2xl shadow-xs border border-teal/30 hover:border-teal/50 transition relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="text-slate-600 font-medium text-xs sm:text-sm">Total Kunjungan Web</div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isStatsLive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-teal/10 text-navy border-teal/30'
                    }`}
                    title="Terhubung ke Supabase tabel site_stats"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isStatsLive ? 'bg-emerald-500 animate-pulse' : 'bg-teal'}`} />
                    {isStatsLive ? 'Live' : 'Cloud Sync'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-2 flex items-baseline gap-1.5">
                  <span>{loadingStats ? '...' : (Number(totalViews) || 0).toLocaleString('id-ID')}</span>
                  <span className="text-xs font-semibold text-slate-400">views</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <span>🌐</span>
                  <span>Tersinkronisasi dengan Supabase site_stats</span>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs sm:text-sm">Lowongan Aktif</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-2">{activeJobsCount}</div>
                <div className="text-[11px] text-slate-400 mt-2">Ditayangkan ke pencari kerja</div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs sm:text-sm">Menunggu Review</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-2">{pendingJobsCount}</div>
                <div className="text-[11px] text-slate-400 mt-2">Menunggu persetujuan admin</div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs sm:text-sm">Lowongan Premium</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-violet-600 mt-2">{premiumJobsCount}</div>
                <div className="text-[11px] text-slate-400 mt-2">Disorot di posisi teratas</div>
              </div>
            </div>

            {/* Baris 2: Pelamar, Mitra & Layanan CV */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-3 sm:mt-4">
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs sm:text-sm">Perusahaan Mitra</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-teal mt-1">{totalCompanies}</div>
                <div className="text-[11px] text-slate-400 mt-1.5">Pemberi kerja terdaftar</div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs sm:text-sm">Total Pelamar Masuk</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{totalApplicants}</div>
                <div className="text-[11px] text-slate-400 mt-1.5">Klik lamar WhatsApp / Email</div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
                <div className="text-slate-500 text-xs sm:text-sm">Total Pesanan Layanan CV</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">{cvOrders.length}</div>
                <div className="text-[11px] text-slate-400 mt-1.5">Tersimpan di Supabase cv_orders</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-navy text-sm sm:text-base">Kelola Daftar Lowongan Kerja</div>
                <div className="text-xs text-slate-500 mt-0.5">Setujui, tolak, edit kualifikasi/persyaratan, atur status PREMIUM, atau hapus lowongan.</div>
              </div>
              <button
                onClick={() => setIsAddJobOpen(true)}
                className="bg-teal hover:bg-teal/90 active:bg-teal/95 text-navy font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto active:scale-98"
              >
                <span className="text-base leading-none font-extrabold">+</span>
                <span>Tambah Lowongan Baru</span>
              </button>
            </div>
            <div className="sm:hidden px-4 py-2 bg-amber-50/60 border-b border-amber-200/50 text-[11px] text-amber-800 flex items-center justify-between">
              <span>👉 Geser tabel ke samping untuk melihat seluruh kolom data</span>
            </div>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-left text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 border-b">
                    <tr>
                      <th className="p-3">Tanggal Masuk</th>
                      <th className="p-3">Posisi & Perusahaan</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Jumlah Pelamar</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">PREMIUM</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => {
                      const isFeatured = job.featured || job.is_featured || false;
                      return (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="p-3 align-middle">
                            <div className="inline-flex items-center gap-1.5 font-bold text-navy text-xs bg-slate-100 px-2.5 py-1 rounded-md">
                              <Calendar className="h-3.5 w-3.5 text-teal shrink-0" />
                              <span>{formatJobDate(job.created_at || job.date)}</span>
                            </div>
                            {formatJobTime(job.created_at) && (
                              <div className="text-[10px] text-slate-400 mt-0.5 pl-1 font-normal">
                                {formatJobTime(job.created_at)}
                              </div>
                            )}
                          </td>
                          <td className="p-3"><div className="font-bold text-navy whitespace-normal max-w-xs">{job.title}</div><div className="text-xs text-slate-500 whitespace-normal max-w-xs">{job.company} • {job.location}</div></td>
                          <td className="p-3"><span className="bg-slate-100 px-2.5 py-1 rounded text-xs">{job.category}</span></td>
                          <td className="p-3 font-extrabold text-teal">{job.applicantsCount || 0} pelamar</td>
                          <td className="p-3">
                            <select value={job.status} onChange={(e) => updateJobStatus(job.id, e.target.value)} className="border p-1.5 rounded text-xs bg-slate-50 font-semibold cursor-pointer">
                              <option value="Aktif">Aktif</option>
                              <option value="Tidak Aktif">Tidak Aktif</option>
                              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                              <option value="Ditolak">Ditolak</option>
                            </select>
                          </td>
                          <td className="p-3"><button onClick={() => toggleFeatured(job.id, isFeatured)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95 ${isFeatured ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'}`}><span>{isFeatured ? '★ PREMIUM' : '☆ Standar'}</span></button></td>
                          <td className="p-3 text-right">
                            <div className="flex flex-wrap justify-end gap-1.5 min-w-[200px]">
                              {job.status !== 'Aktif' && <button onClick={() => updateJobStatus(job.id, 'Aktif')} className="text-xs bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 px-2.5 py-1.5 rounded font-bold transition cursor-pointer">Setujui</button>}
                              {job.status !== 'Ditolak' && <button onClick={() => updateJobStatus(job.id, 'Ditolak')} className="text-xs bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 px-2.5 py-1.5 rounded font-bold transition cursor-pointer">Tolak</button>}
                              <button onClick={() => setEditingJob(job)} className="text-xs bg-slate-200 hover:bg-slate-300 active:bg-slate-400 px-2.5 py-1.5 rounded font-semibold transition cursor-pointer">Edit</button>
                              <button onClick={() => deleteJob(job.id)} className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300 px-2.5 py-1.5 rounded font-semibold transition cursor-pointer">Hapus</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cv' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-navy text-sm sm:text-base">Kelola Pesanan Layanan CV Klien & Status Pengerjaan</div>
                <div className="text-xs text-slate-500 mt-0.5">Tersinkronisasi otomatis dengan cloud Supabase (tabel cv_orders).</div>
              </div>
              <button
                type="button"
                onClick={() => fetchCVOrders?.()}
                disabled={loadingCVOrders}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                title="Sinkronisasi ulang data dari Supabase"
              >
                <span className={loadingCVOrders ? 'inline-block animate-spin' : ''}>🔄</span>
                <span>{loadingCVOrders ? 'Memuat...' : 'Segarkan Data'}</span>
              </button>
            </div>
            <div className="sm:hidden px-4 py-2 bg-amber-50/60 border-b border-amber-200/50 text-[11px] text-amber-800">
              👉 Geser tabel ke samping untuk melihat seluruh detail pesanan
            </div>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                {loadingCVOrders ? (
                  <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent mb-2" />
                    <div>Memuat pesanan CV dari Supabase...</div>
                  </div>
                ) : cvOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
                    Belum ada pesanan CV klien di database Supabase.
                  </div>
                ) : (
                  <table className="min-w-full text-left text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-100 text-slate-600 border-b">
                      <tr><th className="p-3">Nama Klien</th><th className="p-3">WhatsApp</th><th className="p-3">Paket</th><th className="p-3">Status Pengerjaan</th><th className="p-3 text-right">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cvOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-bold text-navy">{order.name}<div className="text-xs text-slate-400 font-normal">{order.date || (order.created_at ? order.created_at.split('T')[0] : 'Baru')}</div></td>
                          <td className="p-3"><a href={`https://wa.me/${order.whatsapp}`} target="_blank" rel="noreferrer" className="text-teal font-medium hover:underline">{order.whatsapp}</a></td>
                          <td className="p-3 whitespace-normal max-w-xs">{order.package}</td>
                          <td className="p-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateCVStatus(order.id, e.target.value)}
                              className="border border-slate-300 p-1.5 rounded-lg text-xs bg-white font-semibold cursor-pointer focus:ring-2 focus:ring-teal outline-none"
                            >
                              <option value="Menunggu Review">Menunggu Review</option>
                              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                              <option value="Selesai">Selesai</option>
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete({ id: order.id, name: order.name, type: 'cv' })}
                              className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-navy mb-2">Konfirmasi Hapus Permanen</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus {confirmDelete.type === 'cv' ? 'pesanan CV' : 'lowongan kerja'} <strong>&quot;{confirmDelete.name}&quot;</strong> secara permanen dari Supabase? Data tidak dapat dipulihkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeleting && <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={async (updated) => {
            setJobs(jobs.map(j => j.id === updated.id ? updated : j));
            await saveEditedJob(updated);
          }}
        />
      )}

      {isAddJobOpen && (
        <PostJobModal
          isOpen={isAddJobOpen}
          onClose={() => setIsAddJobOpen(false)}
          onAddJob={async (newJob) => {
            if (onAddJob) {
              await onAddJob(newJob);
            }
          }}
          isAdminMode={true}
        />
      )}
    </div>
  );
};

export default function JobBoard() {
  const { jobs, activeJobs, loading, setJobs } = useJobs();
  const { createJob, updateJobStatus, toggleFeatured, deleteJob, updateJob } = useJobActions({ jobs, setJobs });
  const { submitJobApplication } = useJobForm();
  const { isLoggedIn, login, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const {
    cvOrders,
    loading: loadingCVOrders,
    fetchCVOrders,
    createCVOrder,
    updateCVStatus,
    deleteCVOrder,
  } = useCVOrders();
  const {
    totalViews,
    loading: loadingStats,
    isLive: isStatsLive,
    fetchStats,
    recordPageView,
  } = useSiteStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isOrderCVOpen, setIsOrderCVOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Catat kunjungan ke Supabase site_stats saat halaman dimuat
  useEffect(() => {
    recordPageView();
  }, [recordPageView]);

  // Filter lowongan khusus halaman publik: hanya yang berstatus 'Aktif'
  const publicJobs = useMemo(() => {
    if (activeJobs && Array.isArray(activeJobs)) {
      return activeJobs;
    }
    return (jobs || []).filter((j) => j.status === 'Aktif');
  }, [activeJobs, jobs]);

  useEffect(() => {
    updateOpenGraphMeta(selectedJob);
  }, [selectedJob]);

  const handleApplyTrack = async (jobId) => {
    const targetJob = jobs.find(j => j.id === jobId);
    const newCount = (targetJob?.applicantsCount || 0) + 1;
    setJobs(jobs.map(j => j.id === jobId ? { ...j, applicantsCount: newCount } : j));
    try {
      await updateJob({ ...targetJob, applicantsCount: newCount });
    } catch (error) {
      console.error('Gagal update pelamar:', error.message);
    }
  };

  const handleAddJob = async (newJobData) => {
    await createJob(newJobData);
  };

  const saveEditedJob = async (updated) => {
    await updateJob(updated);
  };

  if (isLoggedIn) {
    return (
      <SuperAdminDashboard
        jobs={jobs}
        setJobs={setJobs}
        cvOrders={cvOrders}
        loadingCVOrders={loadingCVOrders}
        fetchCVOrders={fetchCVOrders}
        updateCVStatus={updateCVStatus}
        deleteCVOrder={deleteCVOrder}
        totalViews={totalViews}
        loadingStats={loadingStats}
        isStatsLive={isStatsLive}
        fetchStats={fetchStats}
        onLogout={async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Gagal logout:', error.message);
          }
        }}
        updateJobStatus={updateJobStatus}
        toggleFeatured={toggleFeatured}
        deleteJob={deleteJob}
        saveEditedJob={saveEditedJob}
        onAddJob={handleAddJob}
      />
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-slate-950 flex flex-col justify-between transition-colors duration-200">
      {/* Google Jobs Structured Data (Schema.org JobPosting) */}
      <JobPostingSchema job={selectedJob} jobs={publicJobs} />

      <div>
        <Navbar
          onOpenPostJob={() => setIsPostJobOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          isAdmin={false}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />
        <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
        <StatsBar
          totalJobs={publicJobs.length}
          totalCompanies={new Set(publicJobs.map(job => (job.company || '').trim()).filter(Boolean)).size}
          totalApplicants={publicJobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0)}
          premiumJobsCount={publicJobs.filter(j => (j.featured || j.is_featured)).length}
        />
        <JobFeed
          jobs={publicJobs}
          onSelectJob={setSelectedJob}
          searchTerm={searchTerm}
          selectedTag={selectedTag}
          loading={loading}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedTag('');
          }}
        />
        <CVServicePromo onOrderCV={() => setIsOrderCVOpen(true)} />
        <CommunitySection />
      </div>
      <Footer />

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onApplyTrack={handleApplyTrack} />
      <PostJobModal isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} onAddJob={handleAddJob} />
      <OrderCVModal isOpen={isOrderCVOpen} onClose={() => setIsOrderCVOpen(false)} onSubmitOrder={createCVOrder} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLoginSuccess={() => setIsAdminLoginOpen(false)} login={login} />
    </div>
  );
}
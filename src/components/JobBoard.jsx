import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import useJobs from '../hooks/useJobs';
import useJobActions from '../hooks/useJobActions';
import useJobForm from '../hooks/useJobForm';
import useCVOrder from '../hooks/useCVOrder';

const defaultJobs = [
  {
    id: 1,
    title: 'Sales Executive',
    company: 'PT. Nusanet',
    location: 'Medan',
    type: 'Full Time',
    salary: 'Rp 6jt - 9jt',
    category: 'Business',
    status: 'Aktif',
    featured: true,
    urgent: false,
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
    desc: 'Membangun antarmuka web platform karier menggunakan React, Tailwind CSS, dan integrasi modern.',
    requirements: ['Menguasai React.js & Tailwind CSS', 'Terbiasa dengan Git dan REST API', 'Portofolio web responsif'],
    applyType: 'gform',
    applyTarget: 'https://forms.gle/contoh',
    applicantsCount: 9,
  },
];

const defaultCVOrders = [
  { id: 1, name: 'Budi Santoso', whatsapp: '08123456789', package: 'Paket ATS Professional (Rp 99k)', status: 'Menunggu Review', date: '2026-06-06' },
  { id: 2, name: 'Siti Rahma', whatsapp: '08987654321', package: 'Paket Bundle CV + LinkedIn (Rp 149k)', status: 'Selesai', date: '2026-06-05' },
];

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

const Navbar = ({ onOpenPostJob, onOpenAdminLogin, isAdmin }) => (
  <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <img src="./IMG-20260728-WA0012 (1).png" alt="Logo Pintukarier" className="h-9 w-auto object-contain" />
        <div className="bg-navy px-4 py-2 rounded-xl shadow-md transition-transform group-hover:scale-[1.02]">
          <span className="text-xs sm:text-sm font-bold text-white tracking-[0.25em] uppercase whitespace-nowrap">PINTU KARIER.ID</span>
        </div>
      </div>
      <div className="hidden md:flex space-x-6 font-medium text-slate-600 items-center text-sm">
        <a href="#jobs" className="hover:text-teal transition">Cari Kerja</a>
        <a href="#cv-service" className="hover:text-teal transition">Buat CV ATS</a>
        <a href="#community" className="hover:text-teal transition">Komunitas</a>
        <button onClick={onOpenPostJob} className="bg-teal hover:bg-teal/90 text-navy font-bold px-4 py-2 rounded-lg shadow-sm transition text-sm">Pasang Lowongan</button>
        <button onClick={onOpenAdminLogin} className="border border-slate-300 hover:border-teal text-slate-700 hover:text-teal px-3 py-2 rounded-lg font-medium transition text-sm">{isAdmin ? 'Dashboard Admin' : '🔑 Admin'}</button>
      </div>
    </div>
  </nav>
);

const Hero = ({ searchTerm, setSearchTerm, selectedTag, setSelectedTag }) => {
  const tags = ['Semua', 'Business', 'Tech', 'Remote', 'HR', 'Fresh Graduate'];
  return (
    <div className="bg-navy text-white py-16 px-4 text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <span className="bg-teal/15 text-teal text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Portal Karier & B2B Talent Terpercaya</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">Wujudkan Karier Impianmu Bersama Perusahaan Terbaik</h1>
        <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-sm sm:text-base">Ribuan lowongan terverifikasi dan layanan optimasi CV profesional siap mengantar kesuksesan kariermu.</p>

        <div className="bg-white p-2 rounded-xl shadow-xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <div className="flex items-center flex-1 px-3 py-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari posisi, keahlian, atau perusahaan..."
              className="w-full text-slate-800 focus:outline-none text-sm bg-transparent"
            />
          </div>
          <button className="bg-teal hover:bg-teal/90 text-navy font-bold px-8 py-3 rounded-lg transition text-sm">Cari Loker</button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1">Kategori Populer:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === 'Semua' ? '' : tag)}
              className={`px-3 py-1.5 rounded-full transition border ${selectedTag === (tag === 'Semua' ? '' : tag) ? 'bg-teal border-teal text-navy font-bold' : 'bg-white/10 border-white/10 text-slate-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatsBar = ({ totalJobs }) => (
  <div className="bg-white border-b border-slate-100 py-6 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div><div className="text-2xl font-extrabold text-navy">{totalJobs}+</div><div className="text-slate-500 text-sm">Lowongan Aktif</div></div>
      <div><div className="text-2xl font-extrabold text-navy">350+</div><div className="text-slate-500 text-sm">Perusahaan Mitra</div></div>
      <div><div className="text-2xl font-extrabold text-navy">50.000+</div><div className="text-slate-500 text-sm">Pencari Kerja Aktif</div></div>
      <div><div className="text-2xl font-extrabold text-navy">95%</div><div className="text-slate-500 text-sm">Tingkat Kepuasan CV</div></div>
    </div>
  </div>
);

const JobFeed = ({ jobs, onSelectJob, searchTerm, selectedTag }) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredJobs = jobs.filter((job) => {
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch = (job.title && job.title.toLowerCase().includes(search)) || (job.company && job.company.toLowerCase().includes(search));
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
    <div id="jobs" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy">Lowongan Kerja Terbaru</h2>
          <p className="text-slate-500 text-sm mt-1">Peluang karier pilihan untuk profesional Indonesia</p>
        </div>
        <span className="text-sm font-semibold text-teal bg-teal/10 px-3 py-1 rounded-full">{filteredJobs.length} Lowongan Tersedia</span>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">🔎</div>
          <h3 className="text-xl font-bold text-navy">Lowongan tidak ditemukan</h3>
          <p className="mt-2 text-sm text-slate-500">Coba kata kunci lain atau pilih kategori yang tersedia.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleJobs.map((job) => {
              const isFeatured = job.featured || job.is_featured || false;
              return (
                <div key={job.id} onClick={() => onSelectJob(job)} className={`bg-white p-6 rounded-xl shadow-sm border transition cursor-pointer flex flex-col justify-between group relative ${isFeatured ? 'border-teal ring-1 ring-teal/50' : 'border-slate-200 hover:shadow-lg'}`}>
                  {isFeatured && (
                    <span className="absolute -top-3 right-4 bg-teal text-navy text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">🔥 Featured</span>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-teal bg-teal/10 px-2.5 py-1 rounded">{job.category}</span>
                    </div>
                    <h3 className="font-bold text-lg text-navy group-hover:text-teal transition mb-1">{job.title}</h3>
                    <p className="text-slate-600 font-semibold text-sm mb-3">{job.company}</p>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4">{job.desc}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-3 bg-slate-50 p-2 rounded flex justify-between">
                      <span>Gaji:</span> <span className="text-teal font-bold">{job.salary}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{job.location}</span>
                      <span className="text-teal font-bold">{job.type}</span>
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
                className="bg-navy hover:bg-navy/90 text-white font-bold px-6 py-3 rounded-xl shadow transition"
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
  <div id="cv-service" className="bg-gradient-to-r from-navy to-[#2A3D63] py-16 text-white my-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="max-w-xl">
        <span className="bg-teal/20 text-teal text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Layanan Karir Profesional</span>
        <h2 className="text-3xl font-extrabold mt-3 mb-4">Buat CV ATS-Friendly & Optimasi LinkedIn</h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6">Sering ditolak sistem ATS perusahaan? Tingkatkan peluang lolos seleksi HR hingga 3x lipat dengan format CV standar industri.</p>
        <button onClick={onOrderCV} className="bg-teal hover:bg-teal/95 text-navy font-bold px-6 py-3 rounded-lg shadow transition">Pesan Pembuatan CV Sekarang</button>
      </div>
      <div className="bg-white/15 backdrop-blur-md p-6 rounded-2xl border border-white/15 max-w-sm w-full">
        <h3 className="font-bold text-lg mb-3">Paket Unggulan</h3>
        <ul className="space-y-2 text-sm text-slate-200 mb-6">
          <li>✓ Format ATS Teruji & Lolos HR</li>
          <li>✓ Redaksi Bahasa Profesional & SEO</li>
          <li>✓ Konsultasi & Revisi Tanpa Batas</li>
        </ul>
        <div className="text-teal font-extrabold text-xl">Mulai Rp 99.000</div>
      </div>
    </div>
  </div>
);

const CommunitySection = () => (
  <div id="community" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div className="bg-teal/10 border border-teal/20 rounded-2xl p-8 sm:p-12 shadow-sm">
      <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">Gabung Komunitas Loker Pintukarier.id</h2>
      <p className="text-slate-600 max-w-xl mx-auto mb-6 text-sm">Dapatkan info lowongan kerja pilihan setiap hari langsung di handphone-mu tanpa ketinggalan.</p>
      <a href="https://chat.whatsapp.com/E00jf6uXmuF742oQjkvn39?s=cl&p=a&mlu=4" target="_blank" className="bg-teal hover:bg-teal/90 text-navy font-bold px-8 py-3 rounded-lg shadow transition inline-block">Gabung Grup Komunitas Loker</a>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-navy text-white pt-12 pb-6 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="inline-block bg-white/5 px-4 py-2 rounded-xl mb-2">
        <span className="text-lg font-bold tracking-[0.2em] uppercase text-white">PINTU KARIER.ID</span>
      </div>
      <p className="text-slate-400 text-sm mb-4 max-w-lg mx-auto">Pintu Menuju Karier Impianmu • Platform Informasi Lowongan Kerja & B2B Talent Terpercaya.</p>
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
    ? 'w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow text-center block'
    : 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow text-center block';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
        <span className="text-xs font-bold text-teal bg-teal/10 px-3 py-1 rounded-full">{job.category}</span>
        <h2 className="text-2xl font-bold text-navy mt-3 mb-1">{job.title}</h2>
        <p className="text-slate-600 font-semibold mb-4">{job.company} • {job.location}</p>
        <div className="bg-slate-50 p-4 rounded-xl mb-4 text-sm space-y-2">
          <div className="flex justify-between"><strong>Kisaran Gaji:</strong> <span className="text-teal font-bold">{job.salary}</span></div>
          <div className="flex justify-between"><strong>Tipe Pekerjaan:</strong> <span>{job.type}</span></div>
        </div>
        <h3 className="font-bold text-navy mb-2">Deskripsi Pekerjaan:</h3>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{job.desc}</p>

        {job.requirements && job.requirements.length > 0 && (
          <>
            <h3 className="font-bold text-navy mb-2">Persyaratan / Kualifikasi:</h3>
            <ul className="list-disc list-inside text-slate-600 text-sm mb-6 space-y-1">
              {job.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
            </ul>
          </>
        )}

        <button onClick={handleApply} className={buttonClass}>Kirim Lamaran Sekarang ({job.applyType ? job.applyType.toUpperCase() : 'WEB'})</button>
      </div>
    </div>
  );
};

const OrderCVModal = ({ isOpen, onClose, onSubmitOrder }) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [packageType, setPackageType] = useState('Paket ATS Professional (Rp 99k)');
  const { submitCVOrder } = useCVOrder();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = submitCVOrder({ name, whatsapp, packageType });
    if (!result.valid) {
      toast.error(result.message);
      return;
    }

    onSubmitOrder(result.order);
    toast.success(result.message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 font-bold text-xl">✕</button>
        <h2 className="text-xl font-bold text-navy mb-4">Pesan Layanan CV ATS Profesional</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div><label className="block font-semibold mb-1">Nama Lengkap</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="Masukkan nama..." /></div>
          <div><label className="block font-semibold mb-1">Nomor WhatsApp Aktif</label><input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal outline-none" placeholder="Contoh: 08123456789" /></div>
          <div><label className="block font-semibold mb-1">Pilih Paket Layanan</label><select value={packageType} onChange={e => setPackageType(e.target.value)} className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-teal outline-none"><option>Paket ATS Professional (Rp 99k)</option><option>Paket Bundle CV + LinkedIn (Rp 149k)</option></select></div>
          <button type="submit" className="w-full bg-teal text-navy font-bold py-3 rounded-xl shadow">Kirim Pesanan Sekarang</button>
        </form>
      </div>
    </div>
  );
};

const PostJobModal = ({ isOpen, onClose, onAddJob }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Business');
  const [type, setType] = useState('Full Time');
  const [applyType, setApplyType] = useState('whatsapp');
  const [applyTarget, setApplyTarget] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newJob = {
      title,
      company,
      location: location || 'Remote',
      type,
      salary: salary || 'Kompetitif',
      category,
      status: 'Menunggu Persetujuan',
      featured: false,
      urgent: false,
      desc,
      requirements: ['Pengalaman relevan di bidangnya', 'Mampu bekerja dalam tim', 'Inisiatif dan proaktif'],
      applyType,
      applyTarget,
      applicantsCount: 0,
    };
    await onAddJob(newJob);

    const adminWa = '085179905019';
    const waMessage = encodeURIComponent('Halo Admin, saya ingin memasang lowongan kerja di website Pintukarier.id');
    window.open(`https://wa.me/62${adminWa.replace(/^0/, '')}?text=${waMessage}`, '_blank');

    alert('Lowongan berhasil diajukan! Anda akan diarahkan ke WhatsApp Admin untuk konfirmasi persetujuan.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 font-bold text-xl">✕</button>
        <h2 className="text-2xl font-bold text-navy mb-2">Pasang Lowongan Pekerjaan Baru</h2>
        <p className="text-slate-500 text-xs mb-4">Lowongan akan ditinjau admin setelah Anda melakukan konfirmasi via WhatsApp.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div><label className="block font-semibold mb-1">Posisi Jabatan</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2.5 rounded-lg" placeholder="Sales" /></div>
          <div><label className="block font-semibold mb-1">Nama Perusahaan</label><input required value={company} onChange={e => setCompany(e.target.value)} className="w-full border p-2.5 rounded-lg" placeholder="PT. ____" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-semibold mb-1">Lokasi</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full border p-2.5 rounded-lg" placeholder="Medan / Remote" /></div>
            <div><label className="block font-semibold mb-1">Kategori</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2.5 rounded-lg"><option>Business</option><option>Tech</option><option>Remote</option><option>HR</option><option>Fresh Graduate</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-semibold mb-1">Jenis Pekerjaan</label><select value={type} onChange={e => setType(e.target.value)} className="w-full border p-2.5 rounded-lg"><option>Full Time</option><option>Kontrak</option><option>Remote</option><option>Mitra</option><option>Freelance</option></select></div>
            <div><label className="block font-semibold mb-1">Kisaran Gaji</label><input value={salary} onChange={e => setSalary(e.target.value)} className="w-full border p-2.5 rounded-lg" placeholder="Rp 5jt - 8jt" /></div>
          </div>
          <div><label className="block font-semibold mb-1">Deskripsi Pekerjaan</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows="3" className="w-full border p-2.5 rounded-lg" placeholder="Tuliskan deskripsi pekerjaan..."></textarea></div>

          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <div><label className="block font-semibold mb-1">Metode Pelamar Melamar</label><select value={applyType} onChange={e => setApplyType(e.target.value)} className="w-full border p-2.5 rounded-lg"><option value="whatsapp">WhatsApp HR</option><option value="email">Email HR</option><option value="gform">Google Form / Web URL</option></select></div>
            <div><label className="block font-semibold mb-1">Tujuan (No WA / Email / Link)</label><input required value={applyTarget} onChange={e => setApplyTarget(e.target.value)} className="w-full border p-2.5 rounded-lg" placeholder="0812xxxx atau hr@mail.com" /></div>
          </div>

          <button type="submit" className="w-full bg-teal text-navy font-bold py-3 rounded-xl shadow mt-2">Kirim & Konfirmasi ke WhatsApp Admin</button>
        </form>
      </div>
    </div>
  );
};

const EditJobModal = ({ job, onClose, onSave }) => {
  const [title, setTitle] = useState(job.title);
  const [company, setCompany] = useState(job.company);
  const [location, setLocation] = useState(job.location);
  const [salary, setSalary] = useState(job.salary);
  const [desc, setDesc] = useState(job.desc);
  const [type, setType] = useState(job.type || 'Full Time');
  const [category, setCategory] = useState(job.category || 'Business');
  const [applyType, setApplyType] = useState(job.applyType || 'whatsapp');
  const [applyTarget, setApplyTarget] = useState(job.applyTarget || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...job, title, company, location, salary, desc, type, category, applyType, applyTarget });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 font-bold text-xl">✕</button>
        <h2 className="text-2xl font-bold text-navy mb-4">Edit Lowongan Pekerjaan</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div><label className="block font-semibold mb-1">Posisi Jabatan</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2.5 rounded-lg" /></div>
          <div><label className="block font-semibold mb-1">Nama Perusahaan</label><input required value={company} onChange={e => setCompany(e.target.value)} className="w-full border p-2.5 rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-semibold mb-1">Lokasi</label><input value={location} onChange={e => setLocation(e.target.value)} className="w-full border p-2.5 rounded-lg" /></div>
            <div><label className="block font-semibold mb-1">Kategori</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2.5 rounded-lg"><option>Business</option><option>Tech</option><option>Remote</option><option>HR</option><option>Fresh Graduate</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-semibold mb-1">Jenis Pekerjaan</label><select value={type} onChange={e => setType(e.target.value)} className="w-full border p-2.5 rounded-lg"><option>Full Time</option><option>Kontrak</option><option>Remote</option><option>Mitra</option><option>Freelance</option></select></div>
            <div><label className="block font-semibold mb-1">Gaji</label><input value={salary} onChange={e => setSalary(e.target.value)} className="w-full border p-2.5 rounded-lg" /></div>
          </div>
          <div><label className="block font-semibold mb-1">Deskripsi</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows="3" className="w-full border p-2.5 rounded-lg"></textarea></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-semibold mb-1">Metode Lamaran</label><select value={applyType} onChange={e => setApplyType(e.target.value)} className="w-full border p-2.5 rounded-lg"><option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="gform">Google Form / URL</option></select></div>
            <div><label className="block font-semibold mb-1">Target Tujuan</label><input value={applyTarget} onChange={e => setApplyTarget(e.target.value)} className="w-full border p-2.5 rounded-lg" /></div>
          </div>
          <button type="submit" className="w-full bg-teal text-navy font-bold py-3 rounded-xl shadow">Simpan Perubahan</button>
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 font-bold text-xl">✕</button>
        <h2 className="text-xl font-bold text-navy mb-4">Login Superadmin</h2>
        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div><label className="block font-semibold mb-1">Username</label><input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-teal" /></div>
          <div><label className="block font-semibold mb-1">Password</label><input type="password" required value={pwd} onChange={e => setPwd(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-teal" /></div>
          <button type="submit" className="w-full bg-navy text-white font-bold py-2.5 rounded-xl">Masuk Panel</button>
        </form>
      </div>
    </div>
  );
};

const SuperAdminDashboard = ({ jobs, setJobs, cvOrders, setCvOrders, onLogout, updateJobStatus, toggleFeatured, deleteJob, saveEditedJob }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [editingJob, setEditingJob] = useState(null);

  const updateCVStatus = (id, newStatus) => {
    setCvOrders(cvOrders.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const deleteCVOrder = (id) => {
    if (confirm('Hapus pesanan CV ini?')) setCvOrders(cvOrders.filter(c => c.id !== id));
  };

  const activeJobsCount = jobs.filter(j => j.status === 'Aktif').length;
  const pendingJobsCount = jobs.filter(j => j.status === 'Menunggu Persetujuan').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantsCount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-navy text-white px-6 py-4 flex justify-between items-center shadow">
        <div className="flex items-center space-x-3">
          <span className="bg-teal text-navy font-extrabold px-3 py-1 rounded text-xs uppercase tracking-wider">Superadmin</span>
          <h1 className="text-lg font-bold">Pintukarier.id Control Center</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onLogout} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Keluar Admin</button>
        </div>
      </div>

      <div className="bg-white border-b px-6 flex space-x-6 text-sm font-semibold overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab('stats')} className={`py-3 border-b-2 transition ${activeTab === 'stats' ? 'border-teal text-navy' : 'border-transparent text-slate-600'}`}>📊 Ringkasan Dashboard</button>
        <button onClick={() => setActiveTab('jobs')} className={`py-3 border-b-2 transition ${activeTab === 'jobs' ? 'border-teal text-navy' : 'border-transparent text-slate-600'}`}>💼 Manajemen Loker ({jobs.length})</button>
        <button onClick={() => setActiveTab('cv')} className={`py-3 border-b-2 transition ${activeTab === 'cv' ? 'border-teal text-navy' : 'border-transparent text-slate-600'}`}>📄 Pesanan CV Klien ({cvOrders.length})</button>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1">
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy">Statistik Utama Platform</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><div className="text-slate-500 text-sm">Lowongan Aktif Tayang</div><div className="text-3xl font-extrabold text-navy mt-1">{activeJobsCount}</div></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><div className="text-slate-500 text-sm">Menunggu Persetujuan</div><div className="text-3xl font-extrabold text-amber-500 mt-1">{pendingJobsCount}</div></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><div className="text-slate-500 text-sm">Total Pelamar Masuk</div><div className="text-3xl font-extrabold text-teal mt-1">{totalApplicants}</div></div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><div className="text-slate-500 text-sm">Total Pesanan Layanan CV</div><div className="text-3xl font-extrabold text-navy mt-1">{cvOrders.length}</div></div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 font-bold text-navy">Kelola Daftar Lowongan Kerja (Setujui, Tolak, Edit, Hapus)</div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 border-b">
                    <tr>
                      <th className="p-3">Posisi & Perusahaan</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Jumlah Pelamar</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Premium (Featured)</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => {
                      const isFeatured = job.featured || job.is_featured || false;
                      return (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="p-3"><div className="font-bold text-navy whitespace-normal max-w-xs">{job.title}</div><div className="text-xs text-slate-500 whitespace-normal max-w-xs">{job.company} • {job.location}</div></td>
                          <td className="p-3"><span className="bg-slate-100 px-2.5 py-1 rounded text-xs">{job.category}</span></td>
                          <td className="p-3 font-extrabold text-teal">{job.applicantsCount || 0} pelamar</td>
                          <td className="p-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${job.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : job.status === 'Menunggu Persetujuan' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>{job.status}</span></td>
                          <td className="p-3"><button onClick={() => toggleFeatured(job.id, isFeatured)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${isFeatured ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'}`}><span>{isFeatured ? '★ Premium' : '☆ Standar'}</span></button></td>
                          <td className="p-3 text-right">
                            <div className="flex flex-wrap justify-end gap-1.5 min-w-[200px]">
                              {job.status !== 'Aktif' && <button onClick={() => updateJobStatus(job.id, 'Aktif')} className="text-xs bg-emerald-500 text-white hover:bg-emerald-600 px-2.5 py-1.5 rounded font-bold transition">Setujui</button>}
                              {job.status !== 'Ditolak' && <button onClick={() => updateJobStatus(job.id, 'Ditolak')} className="text-xs bg-amber-500 text-white hover:bg-amber-600 px-2.5 py-1.5 rounded font-bold transition">Tolak</button>}
                              <button onClick={() => setEditingJob(job)} className="text-xs bg-slate-200 hover:bg-slate-300 px-2.5 py-1.5 rounded font-semibold transition">Edit</button>
                              <button onClick={() => deleteJob(job.id)} className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 px-2.5 py-1.5 rounded font-semibold transition">Hapus</button>
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b bg-slate-50 font-bold text-navy">Kelola Pesanan Layanan CV Klien & Status Pengerjaan</div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 text-slate-600 border-b">
                    <tr><th className="p-3">Nama Klien</th><th className="p-3">WhatsApp</th><th className="p-3">Paket</th><th className="p-3">Status Pengerjaan</th><th className="p-3 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cvOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-navy">{order.name}<div className="text-xs text-slate-400">{order.date}</div></td>
                        <td className="p-3"><a href={`https://wa.me/${order.whatsapp}`} target="_blank" className="text-teal font-medium hover:underline">{order.whatsapp}</a></td>
                        <td className="p-3 whitespace-normal max-w-xs">{order.package}</td>
                        <td className="p-3"><select value={order.status} onChange={(e) => updateCVStatus(order.id, e.target.value)} className="border p-1.5 rounded text-xs bg-slate-50 font-semibold"><option>Menunggu Review</option><option>Sedang Dikerjakan</option><option>Selesai</option></select></td>
                        <td className="p-3 text-right"><button onClick={() => deleteCVOrder(order.id)} className="text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 px-2.5 py-1.5 rounded font-bold transition">Hapus</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
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
    </div>
  );
};

export default function JobBoard() {
  const { jobs, loading, setJobs } = useJobs();
  const { createJob, updateJobStatus, toggleFeatured, deleteJob, updateJob } = useJobActions({ jobs, setJobs });
  const { submitJobApplication } = useJobForm();
  const { isLoggedIn, login, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isOrderCVOpen, setIsOrderCVOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [cvOrders, setCvOrders] = useState(() => {
    const saved = localStorage.getItem('pintukarier_cv_v3');
    return saved ? JSON.parse(saved) : defaultCVOrders;
  });

  useEffect(() => {
    localStorage.setItem('pintukarier_cv_v3', JSON.stringify(cvOrders));
  }, [cvOrders]);

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
        setCvOrders={setCvOrders}
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
      />
    );
  }

  return (
    <div className="min-h-screen bg-light flex flex-col justify-between">
      <div>
        <Navbar onOpenPostJob={() => setIsPostJobOpen(true)} onOpenAdminLogin={() => setIsAdminLoginOpen(true)} isAdmin={false} />
        <Hero searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
        <StatsBar totalJobs={jobs.filter(j => j.status === 'Aktif').length} />
        <JobFeed jobs={jobs} onSelectJob={setSelectedJob} searchTerm={searchTerm} selectedTag={selectedTag} />
        <CVServicePromo onOrderCV={() => setIsOrderCVOpen(true)} />
        <CommunitySection />
      </div>
      <Footer />

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} onApplyTrack={handleApplyTrack} />
      <PostJobModal isOpen={isPostJobOpen} onClose={() => setIsPostJobOpen(false)} onAddJob={handleAddJob} />
      <OrderCVModal isOpen={isOrderCVOpen} onClose={() => setIsOrderCVOpen(false)} onSubmitOrder={(newOrder) => setCvOrders([newOrder, ...cvOrders])} />
      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLoginSuccess={() => setIsAdminLoginOpen(false)} login={login} />
    </div>
  );
}
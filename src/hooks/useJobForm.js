import { useCallback } from 'react';

export default function useJobForm() {
  const submitJobApplication = useCallback((job) => {
    const { applyType, applyTarget, title, company } = job;
    const normalizedType = (applyType || '').toLowerCase();

    if (!applyType || !applyTarget) {
      return {
        ok: false,
        message: `Informasi lamaran untuk posisi ${title} belum tersedia.`,
      };
    }

    if (normalizedType === 'whatsapp') {
      const message = encodeURIComponent(
        `Halo, saya ingin melamar untuk posisi *${title}* di *${company}* yang saya temukan di Pintukarier.id.`
      );

      window.open(`https://wa.me/${applyTarget}?text=${message}`, '_blank');
      return { ok: true, mode: 'whatsapp' };
    }

    if (normalizedType === 'email') {
      const subject = encodeURIComponent(`Lamaran Pekerjaan - ${title} - ${company}`);
      window.location.href = `mailto:${applyTarget}?subject=${subject}`;
      return { ok: true, mode: 'email' };
    }

    if (normalizedType === 'gform' || normalizedType === 'link') {
      window.open(applyTarget, '_blank');
      return { ok: true, mode: normalizedType };
    }

    return {
      ok: false,
      message: `Silakan hubungi kontak berikut: ${applyTarget}`,
    };
  }, []);

  return { submitJobApplication };
}

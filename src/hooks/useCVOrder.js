export default function useCVOrder() {
  const validateCVOrder = (values = {}) => {
    const { name, whatsapp, packageType } = values;

    if (!name || !name.trim()) {
      return {
        valid: false,
        message: 'Nama lengkap wajib diisi.',
      };
    }

    if (!whatsapp || !whatsapp.trim()) {
      return {
        valid: false,
        message: 'Nomor WhatsApp wajib diisi.',
      };
    }

    if (!packageType || !packageType.trim()) {
      return {
        valid: false,
        message: 'Pilih paket layanan terlebih dahulu.',
      };
    }

    return {
      valid: true,
      message: 'Pesanan CV berhasil dikirim! Tim kami akan segera menghubungi WhatsApp Anda.',
    };
  };

  const submitCVOrder = (payload = {}) => {
    const validation = validateCVOrder(payload);

    if (!validation.valid) {
      return validation;
    }

    const order = {
      id: Date.now(),
      name: payload.name,
      whatsapp: payload.whatsapp,
      package: payload.packageType,
      status: 'Menunggu Review',
      date: new Date().toISOString().split('T')[0],
    };

    return {
      valid: true,
      order,
      message: validation.message,
    };
  };

  return {
    validateCVOrder,
    submitCVOrder,
  };
}

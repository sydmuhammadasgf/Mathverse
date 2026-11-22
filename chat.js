// Fungsi server Vercel: menyimpan API key NVIDIA di server (env var), bukan di browser.
const BASE = 'ATURAN WAJIB: (1) Mulai selalu dengan cerita/perumpamaan sederhana ala anak-anak. (2) Lanjutkan dengan penurunan/pembuktian dari prinsip dasar, langkah demi langkah. (3) Tulis rumus dengan LaTeX di antara tanda $...$. (4) Jawab dalam Bahasa Indonesia, ringkas dan jelas. Hanya bahas matematika; tolak topik lain dengan sopan.';
const LEVEL = {
  tksd: 'guru matematika TK/PAUD dan SD Kelas 1–6 Kurikulum Merdeka',
  smp: 'guru matematika SMP Kelas 7–9 Kurikulum Merdeka',
  sma: 'guru matematika SMA Kelas 10–12 Kurikulum Merdeka (umum dan tingkat lanjut)',
  osn: 'pelatih OSN Matematika Indonesia (SD, SMP, atau SMA sesuai pertanyaan siswa)',
  imo: 'pelatih dan juri tingkat IMO/APMO',
  utbk: 'pakar UTBK-SNBT Penalaran Matematika serta pembina ONMIPA-PT dan Putnam'
};
const hits = new Map(); // pembatas laju per IP (terbaik-upaya; reset saat instance baru)

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server belum dikonfigurasi' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (arr.length >= 10) return res.status(429).json({ error: 'Terlalu banyak permintaan' });
  arr.push(now); hits.set(ip, arr);

  const { mentor, messages } = req.body || {};
  if (!LEVEL[mentor] || !Array.isArray(messages) || !messages.length || messages.length > 8)
    return res.status(400).json({ error: 'Permintaan tidak valid' });
  const clean = messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 1200) }));
  if (clean[clean.length - 1].role !== 'user') return res.status(400).json({ error: 'Permintaan tidak valid' });

  try {
    const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct',
        messages: [{ role: 'system', content: `Anda adalah ${LEVEL[mentor]}. ${BASE}` }, ...clean],
        max_tokens: 800, temperature: 0.4
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'Penyedia AI menolak permintaan', status: r.status });
    const d = await r.json();
    const text = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    if (!text) return res.status(502).json({ error: 'Jawaban kosong' });
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'Gagal menghubungi penyedia AI' });
  }
};

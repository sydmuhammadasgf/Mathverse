# MathVerse ID

Belajar matematika TK–IMO: cerita anak, pembuktian rumus, bank soal, Mentor AI (NVIDIA).

## Struktur
- `public/index.html` — seluruh aplikasi (frontend)
- `api/chat.js` — fungsi server; satu-satunya tempat API key dipakai
- `.env.example` — contoh variabel (JANGAN isi key asli di file ini)

## Pasang (tanpa terminal)
1. Buat API key gratis di https://build.nvidia.com (menu profil → API Keys). Bentuknya `nvapi-...`.
2. Buat repo GitHub baru, lalu upload semua isi folder ini (Add file → Upload files).
3. Buka https://vercel.com → Add New → Project → pilih repo tadi → Deploy.
4. Vercel → Settings → Environment Variables → tambah `NVIDIA_API_KEY` (isi key) dan, opsional, `NVIDIA_MODEL`. Lalu Deployments → Redeploy.
5. Buka alamat `.vercel.app` Anda, daftar akun, coba Mentor AI.

## Catatan
- Jika Mentor AI gagal: cek nama model di katalog build.nvidia.com dan samakan di `NVIDIA_MODEL`.
- Akun dan progres masih tersimpan di browser pengguna (belum database server).
- Pembatas laju di `api/chat.js` bersifat terbaik-upaya; jatah harian di UI bisa dilewati pengguna mahir.

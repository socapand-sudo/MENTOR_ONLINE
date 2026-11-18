# DeepMentor AI — versi Vercel (Node.js + PostgreSQL)

Backend PHP/MySQL sudah ditulis ulang menjadi Vercel Serverless Functions. Frontend (`index.html`) hampir tidak berubah.

```
index.html          tampilan (statis)
api/auth.js         daftar, login, logout, ganti & reset password
api/data.js         tugas, kelas, bergabung kelas, laporan nilai
api/gemini.js       proxy Gemini (hanya untuk pengguna yang sudah login)
lib/core.js         sesi, CSRF, rate limit, koneksi database
database/schema.sql skema PostgreSQL
```

## Langkah pasang

### 1. Amankan kunci lama (WAJIB)
API Key Gemini dan password database dari versi PHP sempat terlihat di chat/arsip. Buat **API Key Gemini baru** di https://aistudio.google.com/apikey, hapus yang lama, dan jangan pakai password database lama lagi.

### 2. Upload ke GitHub
```bash
git init && git add . && git commit -m "deepmentorai vercel"
git branch -M main
git remote add origin https://github.com/USERNAME/deepmentorai.git
git push -u origin main
```

### 3. Import di Vercel
vercel.com → **Add New → Project** → pilih repo. Framework Preset: **Other**. Jangan ubah Build/Output. Klik **Deploy** (deploy pertama boleh gagal berfungsi dulu karena database belum ada).

### 4. Buat database
Project → tab **Storage** → **Create Database** → **Neon (Postgres)** → hubungkan ke project. Vercel otomatis menambahkan `DATABASE_URL`.
Buka **SQL Editor** di dashboard Neon, tempel seluruh isi `database/schema.sql`, lalu **Run**.

### 5. Environment Variables
Project → **Settings → Environment Variables**:

| Nama | Isi |
|---|---|
| `DATABASE_URL` | otomatis dari Neon (jika belum ada, salin connection string) |
| `SESSION_SECRET` | string acak ≥ 32 karakter (mis. hasil `openssl rand -hex 32`) |
| `GEMINI_API_KEY` | API Key Gemini **baru** |
| `GEMINI_MODEL` | opsional, default `gemini-3.6-flash` |
| `RESEND_API_KEY`, `MAIL_FROM` | opsional, untuk email "Lupa password" (resend.com, domain harus diverifikasi) |

Lalu **Deployments → ⋯ → Redeploy**.

### 6. Domain sendiri (opsional)
Settings → **Domains** → tambahkan `prototypedeepmentor.my.id` dan ikuti petunjuk DNS.

### 7. Uji
Buka situs → daftar akun guru → buat kelas → daftar akun siswa di jendela lain → gabung dengan kode kelas.

## Catatan
- Data lama di MySQL cPanel **tidak otomatis pindah**. Kalau perlu, ekspor tabel lalu impor ke Postgres.
- Tanpa `RESEND_API_KEY`, fitur "Lupa password" tidak mengirim email (kode tidak bisa diterima).
- Uji lokal: `npm i -g vercel`, salin `.env.example` ke `.env`, isi, lalu `vercel dev`.

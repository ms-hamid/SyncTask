<div align="center">

# 🚀 SyncTask - AI-Powered Agile Project Manager

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)

_Transform ideas into actionable tasks instantly with the power of Agentic AI._

</div>

---

## 💡 Apa itu SyncTask?

**SyncTask** adalah aplikasi manajemen proyek (Kanban board) modern berkelas B2B SaaS yang dirancang untuk mempercepat alur kerja tim Agile. Aplikasi ini menggunakan **AI Agentic UI** canggih untuk menyulap deskripsi proyek (prompt natural) Anda menjadi struktur tugas yang terperinci dan siap dikerjakan.

Setiap tugas yang dihasilkan dilengkapi dengan estimasi tingkat kesulitan (_effort score_) dan secara cerdas dialokasikan ke peran spesifik anggota tim secara merata. Ini menghilangkan hambatan awal (zero-friction) dalam perencanaan _sprint_ atau inisiasi proyek baru.

## ✨ Key Features

- **🤖 AI Task Generation**: Ketik ide Anda, AI bertindak sebagai Scrum Master meracik _To Do list_ dengan skor efisiensi dan spesialisasi secara otomatis
- **👆 Seamless Drag & Drop**: Pengalaman mengatur prioritas kartu di papan Kanban layaknya Jira/Trello dengan respons seketika (_Optimistic UI state_)
- **📱 Mobile Responsive with Fallback UI**: Tampilan Kanban dan Modal Task Detail dioptimalkan luar biasa tajam dan fungsional di layar HP (termasuk fitur _Horizontal Scroll_ yang tidak pecah dan _Interactive Status Dropdown_)
- **🎉 Gamification Rewards**: Efek ledakan konfeti interaktif untuk merayakan setiap tugas yang digeser ke kolom _"DONE"_
- **💰 Simulated SaaS Paywall**: Implementasi Mock Paywall untuk mendemonstrasikan batasan paket Free vs akun Pro Workspace untuk _end-to-end user journey_

---

## 🛠️ Tech Stack

Berkolaborasi harmonis dalam membangun performa luar biasa:

- **Framework:** Next.js 14/15 Ap Router & Server Actions
- **Database ORM:** Prisma Client
- **Database Hosting:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + Shadcn UI
- **AI Engine:** Google Gemini SDK (`@ai-sdk/google`)
- **Drag & Drop:** `@hello-pangea/dnd`
- **UI Elements:** `canvas-confetti`, `sonner` (Toast), `lucide-react` (Icons)

---

## 🚀 Getting Started (Panduan Instalasi Lokal)

Siap mencoba SyncTask di mesin lokal Anda? Ikuti langkah-langkah mudah berikut:

### 1. Clone & Instalasi Dependensi

Jalankan _command_ berikut untuk mendownload dan menginstall paket yang dibutuhkan:

```bash
git clone https://github.com/ms-hamid/SyncTask.git
cd synctask
npm install
```

### 2. Konfigurasi Environment Variables (.env)

Salin contoh file `.env.example` menjadi `.env` (atau buat file `.env` baru di root), lalu sesuaikan nilainya:

```env
# Koneksi Prisma Supabase (Sesuaikan dengan data pooler & direct Postgres Anda)
DATABASE_URL="postgresql://postgres.[PROYEK_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROYEK_ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Key AI Model (Wajib untuk AI Task Generation)
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSy...ISI_KODE_GEMINI_ANDA..."

# Mocking (Opsional untuk testing error payment)
MAYAR_API_KEY="sk_live_mock_apikey"
```

### 3. Sinkronisasi Database

Kirim _schema_ dari lokal Anda ke Supabase agar tabel-tabel terbuat otomatis:

```bash
npx prisma db push
```

### 4. Jalankan Aplikasi

Nyalakan server _development_:

```bash
npm run dev
```

Buka URL **`http://localhost:3000`** di browser Anda, klik _"✨ Coba Prompt Contoh"_, dan nikmati pengalaman AI Project Management instan ini! 🎉

---

<div align="center">
  Dibuat dengan 💻 dan ☕
</div>

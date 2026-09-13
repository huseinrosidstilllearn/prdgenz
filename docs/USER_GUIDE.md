# PRD GenZ — User Guide

Panduan lengkap memakai PRD GenZ: versi cloud (SaaS, multi-user) dan self-host (lokal, single-user).

---

## Daftar Isi

1. [Konsep Dasar](#1-konsep-dasar)
2. [Cloud: Mulai Cepat](#2-cloud-mulai-cepat)
3. [Cloud: Menghasilkan PRD](#3-cloud-menghasilkan-prd)
4. [Cloud: Export, Share & Versioning](#4-cloud-export-share--versioning)
5. [Self-Host: Dev (Node)](#5-self-host-dev-node)
6. [Self-Host: Docker](#6-self-host-docker)
7. [Referensi Environment Variable](#7-referensi-environment-variable)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Konsep Dasar

| Istilah | Arti |
|---|---|
| **Project** | Wadah untuk mengelompokkan PRD (mis. satu per produk) |
| **PRD** | Product Requirements Document — hasil generate AI |
| **Mode** | Cara memberi input ke AI: **Create from Scratch** (bertahap), **Chat** (percakapan), **One-Shot** (satu ide → PRD penuh) |
| **BYOK** | *Bring Your Own Key* — Anda memakai API key AI milik sendiri |
| **Provider** | Layanan AI yang dipakai: OpenAI, Anthropic, Google, OmniRoute, TokenRouter, 9Router, atau endpoint custom OpenAI-compatible |
| **Version** | Setiap generate/menyimpan membuat versi baru — versi lama tidak pernah tertimpa |

Dua bahasa output PRD: **ID** (Bahasa Indonesia) dan **EN** (English).

---

## 2. Cloud: Mulai Cepat

1. Buka aplikasi, klik **Register**, buat akun (email + password).
   - Akun baru otomatis **Free**: 10 PRD / 30 hari, export Markdown, 1 project.
2. Login → masuk **Dashboard**.
3. Buat **Project** baru (mis. "Aplikasi Kasir").
4. Buka **Settings** → tambahkan API key provider AI Anda (lihat [BYOK](#byok-bring-your-own-key)).
   - Key disimpan **terenkripsi** (AES-256-GCM) dan hanya tampil sebagai `sk-f****7890`.
5. Klik **New PRD** → pilih mode → mulai generate.

### BYOK (Bring Your Own Key)

- Cloud: masukkan key per provider di halaman **Settings**. Satu key per provider; ganti kapan saja; connection test otomatis jalan saat menyimpan.
- Key tidak pernah dikirim ke pihak lain — hanya dipakai langsung ke endpoint provider saat generate.
- Plan **Pro** ($9/bulan): PRD unlimited, export PDF, share link, unlimited projects.

---

## 3. Cloud: Menghasilkan PRD

### One-Shot Mode
Tulis ide dalam 1–2 paragraf → AI langsung menghasilkan PRD lengkap (fitur, user story, kriteria, tech stack, timeline, risiko). Cocok saat ide sudah jelas di kepala.

### Create from Scratch
Dipandu 8 langkah terstruktur: ide → target user → fitur → user story → kriteria → tech stack → timeline → format output. Cocok saat mau memikirkan tiap bagian dengan teliti.

### Chat Mode
Bercakap-cakap dengan AI. AI akan bertanya klarifikasi singkat; ketik "generate" / "buat PRD" kapan pun untuk menghasilkan PRD penuh dari isi percakapan.

> Hasil generate muncul **streaming** (token demi token). PRD otomatis tersimpan sebagai versi baru saat selesai.

---

## 4. Cloud: Export, Share & Versioning

- **Export Markdown** — semua plan, dari halaman PRD.
- **Export PDF** — Pro only; membuka dokumen cetak rapi → gunakan *Save as PDF* browser.
- **Share link** — Pro only; menghasilkan URL publik *view-only* (`/s/...`) yang bisa dibuka tanpa login. Bisa di-revoke kapan saja.
- **Version history** — setiap PRD menyimpan semua versinya. Klik **Restore** pada versi lama untuk menjadikannya versi terbaru (versi lama tetap ada, tidak destruktif).

---

## 5. Self-Host: Dev (Node)

Untuk dipakai sendiri tanpa akun, tanpa server:

```bash
# 1. Install dependencies monorepo (dari root repo)
pnpm install

# 2. Setup database SQLite
pnpm --filter @prdgenz/self-host db:push

# 3. Isi minimal satu API key di apps/self-host/.env
#    (copy dari .env.example dulu)
#    OPENAI_API_KEY=... atau ANTHROPIC_API_KEY=... dll.

# 4. Jalanin
pnpm --filter @prdgenz/self-host dev
# buka http://localhost:3001
```

Self-host: **tidak ada login**, key diambil dari environment variable (bukan UI), database SQLite lokal.

---

## 6. Self-Host: Docker

```bash
cd apps/self-host/docker
cp ../.env.example .env      # isi minimal satu *_API_KEY
docker compose up -d         # app jalan di http://localhost:3000
```

- Data (SQLite) tersimpan di volume `prdgenz-data` — aman saat container di-rebuild/update.
- Update: `docker compose up -d --build` (data lama tetap).

Atau build manual dari root repo:

```bash
docker build -f apps/self-host/docker/Dockerfile -t prdgenz-self-host .
```

---

## 7. Referensi Environment Variable

### Cloud (`apps/cloud/.env`)

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL, mis. `postgresql://user:pass@localhost:5432/prdgenz` |
| `NEXTAUTH_URL` | ✅ | URL dasar aplikasi, mis. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ | Rahasia NextAuth — generate: `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | ✅ | Kunci AES-256 (64 karakter hex) untuk enkripsi API key user — generate: `openssl rand -hex 32` |

### Self-Host (`apps/self-host/.env` / docker `.env`)

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite, dev: `file:./prdgenz.db` — Docker: `file:/data/prdgenz.db` (sudah diset otomatis) |
| `OPENAI_API_KEY` | — | Key OpenAI |
| `ANTHROPIC_API_KEY` | — | Key Anthropic |
| `GOOGLE_API_KEY` | — | Key Google AI Studio |
| `OMNIROUTE_API_KEY` | — | Key OmniRoute |
| `TOKENROUTER_API_KEY` | — | Key TokenRouter |
| `9ROUTER_API_KEY` | — | Key 9Router |
| `CUSTOM_API_KEY` + `CUSTOM_BASE_URL` | — | Endpoint custom OpenAI-compatible (keduanya harus terisi) |
| `AI_DEFAULT_PROVIDER` | — | Default: `openai` — dipakai kalau user belum memilih |
| `AI_DEFAULT_MODEL` | — | Default model (kosong = model pertama provider) |
| `AI_DEFAULT_LANGUAGE` | — | `EN` (default) atau `ID` |

> Minimal **satu** provider harus punya key agar fitur generate aktif.

---

## 8. Troubleshooting

| Gejala | Penyebab & Solusi |
|---|---|
| "No API key configured for provider X" | Key belum diisi (cloud: Settings; self-host: env var) atau key provider lain yang terisi — pilih provider yang punya key |
| "Free plan limit reached" | Free: 10 PRD / 30 hari — hapus PRD lama atau upgrade Pro |
| "AI returned an invalid PRD structure" | Respons AI tidak valid — coba generate ulang, atau ganti model yang lebih kuat |
| "ENCRYPTION_KEY must be set to exactly 64 hex characters" | Key salah format — generate ulang dengan `openssl rand -hex 32` |
| Connection test gagal saat simpan key | Key salah/tidak aktif, atau baseUrl custom salah — key tetap tersimpan, perbaiki lalu simpan ulang |
| Self-host: generate 404/tidak muncul | Pastikan minimal satu `*_API_KEY` terisi dan container/service di-restart setelah mengubah `.env` |
| Docker: data hilang setelah update | Jangan hapus volume `prdgenz-data` (`docker volume rm` menghapus semua PRD) |
| Rate limit (429) | 100 request/menit per user — tunggu sebentar |

Untuk pengembangan lanjutan, lihat [README](../README.md) (struktur repo, script, build).

# PRD GenZ — Design Direction

> Source of truth untuk semua keputusan visual. Baca sebelum kerja UI apa pun.

## Identity

**"The product is the document."**

PRD GenZ menulis spesifikasi. Jadi UI-nya harus terasa seperti dokumen
spesifikasi yang bisa dibaca, bukan dashboard SaaS yang dipindai. Referensi
vernakulernya: lembar gambar teknik, dokumen Requirements, dan tipografi
buku teknis. Bukan gradien ungu, bukan grid kartu berbayang.

Eksekusi mengikuti standar galeri referensi (Godly, Dark Mode Design,
Minimal Gallery): display serif berskala besar di landing, section
berirama lewat latar berselang-seling, artefak produk sebagai hero visual,
dan auth split-screen — panel merek gelap berisi motif dokumen, form
sendirian di atas kertas.

## Typography

| Peran | Font | Alasan |
|---|---|---|
| Display / heading | **Space Grotesk** | Teknis dan geometris: terbaca seperti tipografi drafting, bukan kepala buku. Kepala landing tetap kuat tanpa kesan dated. |
| Body / UI | **Plus Jakarta Sans** | Modern SaaS, tenang, kuat di ukuran kecil. |
| Mono / label / nomor clause | **IBM Plex Mono** | Heritage dokumen teknik. Dipakai untuk `01.1`, stempel versi, dan kode. |

Definisi ada di `packages/ui/src/fonts.ts`, diimpor lewat `@prdgenz/ui/fonts`.
Jangan pernah `next/font` di dalam page atau layout.

## Palette (oklch)

| Token | Light | Dark | Alasan |
|---|---|---|---|
| `--background` | `oklch(98.6% 0.003 250)` | `oklch(17% 0.012 250)` | Kertas dingin di terang, slate dalam di gelap |
| `--foreground` | `oklch(23% 0.018 255)` | `oklch(93% 0.004 250)` | |
| `--card` | `oklch(100% 0 0)` | `oklch(21% 0.013 250)` | Elevasi satu step |
| `--border` | `oklch(89% 0.006 250)` | `oklch(30% 0.013 250)` | Garis rambut, bukan bayangan |
| `--primary` | `oklch(50% 0.11 168)` | `oklch(80% 0.14 162)` | Hijau mint dari `assets/logo.png` |

**Core 2 + accent 1.** Netral slate + mint sebagai satu-satunya accent.

Dosis accent, tepat tiga tempat:
1. CTA primary
2. Nomor clause yang aktif
3. Focus ring

Di luar itu, tidak ada. Status semantik (success / destructive) tetap boleh
hijau dan merah karena fungsional.

## Structure

Radius `0.5rem`. Border `1px`. Tanpa drop shadow di mana pun kecuali overlay
sungguhan yang butuh. Kartu bukan tile yang melayang: daftar PRD adalah
`<ul>` bergaris, mode adalah `<ol>` bernomor, pricing adalah `<table>`.

Layout aplikasi: **rail tipis 13rem + satu kolom baca `max-w-3xl`**. Tidak ada
sidebar berisi stat, tidak ada baris kartu statistik, tidak ada feed aktivitas
palsu. Landing dan auth memakai kontainer `max-w-6xl` / split-screen.

Aturan motif: `spec-rule` hanya dipakai di dalam konteks dokumen (SpecPanel,
daftar bernomor landing, reader PRD). Jangan dibunteli ke form telanjang —
garis tanpa dokumen di sekitarnya terlihat seperti bug.

Auth: split-screen `lg:grid-cols-[1.1fr_1fr]` — panel kiri `bg-foreground
text-background` (ter-inversi otomatis di dark mode), berisi wordmark,
display heading, dan daftar klausa bernomor. Form di kanan tanpa kartu.

Landing full (urutan section): hero band tint → strip provider (roster
nyata dari `AI_PROVIDERS`) → how-it-works 3 pass → three ways (margin
rule) → feature grid → diff card → stats band (angka dari constants) →
FAQ (`<details>` native) → self-host → CTA penutup. Tekstur: utility
`.bg-blueprint` / `.bg-blueprint-faint` (grid kertas drafting, satu-satunya
tekstur yang diizinkan; terdefinisi di `tailwind-plugins.ts`). Semua angka
di landing wajib berasal dari `@prdgenz/shared`, bukan hardcode.

## Signature: margin rule

Garis vertikal rambut di tepi kiri permukaan dokumen, dengan nomor clause
tergantung di margin. Kelas `.spec-rule` dan `.clause-number`.

Alasan: PRD itu dokumen bernomor, jadi produk menampilkan dokumen bernomor.
Ini berasal dari isi, bukan dekorasi. Muncul di hero, reader PRD, dan diff.

## Motion — MOTION 1

Hanya gerak yang melaporkan keadaan nyata:

- Caret streaming (`.animate-caret`): AI sedang menulis. Loop, karena memang
  kondisi berjalan.
- Fade 220ms saat satu clause selesai di-generate (`.animate-clause-in`).
  Sekali jalan.
- Transisi warna 120ms pada elemen interaktif.

Tidak ada shimmer, beam, marquee, atau pulse tak berakhir.
`prefers-reduced-motion: reduce` mematikan semuanya.

## Copy

Chrome UI dan landing: **English**. Bahasa Indonesia hanya berlaku di dalam
*generated PRD* sesuai pilihan user. Action.named konsisten dari tombol sampai
pesan sukses ("Save changes" → "Saved"). Tidak ada em dash di copy UI.

## Forbidden

- Rainbow icon chip. Semua icon satu keluarga warna netral atau primary tint.
- `border-2` di kartu. Kartu selalu 1px.
- Drop shadow sebagai alat highlight.
- `text-gradient` di heading. Heading = foreground solid.
- Loop animasi tanpa laporan keadaan.
- Angka di UI yang tidak berasal dari data nyata.
- Komponen dekoratif yang tidak punya fungsi: `DotPattern`, `Marquee`,
  `ShimmerButton`, `BorderBeam`, `LiveBadge`. Sudah dihapus; jangan dikembalikan.

## Accessibility (WCAG AA)

Diverifikasi dengan script, bukan mata: `node scripts/a11y-contrast-check.mjs`
(menghitung semua pairing token per tema, oklch → sRGB → rasio WCAG).

- **Teks 4.5:1** — semua pairing teks lulus di light dan dark (terendah
  `--rule-foreground` 4.66:1). Pairing baru wajib dihitung dulu.
- **Non-teks 3:1 (1.4.11)** — hanya untuk boundary yang mengidentifikasi
  komponen: input/textarea/select, tombol outline, focus ring. Karena itu
  `--border-strong` dan `--input` dijaga ≥ 3:1 (light 3.10:1, dark 3.48:1).
- **Pengecualian dekoratif**: `--border` (garis rambut kartu) dan `--rule`
  (margin rule) sengaja di bawah 3:1 — keduanya tidak membawa informasi, dan
  1.4.11 mengecualikan elemen dekoratif murni. Jangan pakai `--border` untuk
  input atau tombol.
- **Status dinamis** diumumkan: `role="status"` untuk progress/hasil
  (Generating, Saved), `role="alert"` untuk error.
- **Skip link** "Skip to content" adalah elemen focusable pertama di landing
  dan app shell, menuju `#main-content`.
- Status tidak pernah hanya warna: tiap sinyal sukses/error punya teks.

## Di mana authoritative file berada

| Hal | File |
|---|---|
| Token warna / font / radius | `packages/ui/src/styles/tokens.css` |
| Base layer, `.spec-rule`, utilities | `packages/ui/src/tailwind-plugins.ts` |
| Keyframes | `packages/ui/src/styles/base.css` |
| Pemetaan token ke Tailwind | `packages/ui/tailwind-preset.ts` |
| Font | `packages/ui/src/fonts.ts` |
| Shell, header, list, mode chooser | `packages/app/src` |

Kedua app hanya mengimpor. Tidak ada duplikasi token antara
`apps/cloud` dan `apps/self-host`.

# PRD GenZ — Design Direction

> Source of truth untuk semua keputusan visual. Baca sebelum kerja UI apa pun.

## Identity

**"The product is the document."**

PRD GenZ menulis spesifikasi. Jadi UI-nya harus terasa seperti dokumen
spesifikasi yang bisa dibaca, bukan dashboard SaaS yang dipindai. Referensi
vernakulernya: lembar gambar teknik, dokumen Requirements, dan tipografi
buku teknis. Bukan gradien ungu, bukan grid kartu berbayang.

## Typography

| Peran | Font | Alasan |
|---|---|---|
| Display / masthead | **Instrument Serif** | Produk ini menulis dokumen, dan dokumen punya kepala serif. Langsung tidak terbaca sebagai SaaS generik. |
| Body / UI | **Instrument Sans** | Satu superfamily, tenang, kuat di ukuran kecil. |
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
palsu.

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

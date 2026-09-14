# PRD GenZ — Design Direction

> Source of truth untuk semua keputusan visual. Diekstrak dari brand asset resmi
> (`assets/logo.png`, `assets/logo-text.png`) 2026-09-14. Read this before any UI work (AGENTS.md routes here).

## Identity

**"The product is the document."** PRD GenZ menggambar dokumen: meja kerja developer
saat menyusun spesifikasi. Estetika: meja gambar gelap teal-slate, garis blueprint
hijau mint yang menggambar dirinya sendiri, teks rapi bilingual.

Alasan: logo brand = dokumen gelap teal-slate + mark hijau mint; UI = ekstensi
logo itu sendiri (identity continuity), bukan dekorasi tempelan.

## Palette (dari logo, oklch)

| Token | Light | Dark | Alasan |
|---|---|---|---|
| primary | oklch(48% 0.1 168) | oklch(74% 0.16 160) | Mark hijau logo; dark = mint asli logo (#25c887), light = diperdalam untuk kontras AA di paper |
| background | oklch(98% 0.004 160) | oklch(22% 0.021 222) | Dark = teal-slate logo (#17252a); light = paper dengan hint hijau sangat tipis |
| card | oklch(100% 0 0) | oklch(26% 0.022 220) | Elevasi satu step dari background |
| foreground | oklch(25% 0.02 222) | oklch(93% 0.008 160) | Body text, tinted ke hue brand |

**Core 2 + accent 1** (R-29): teal-slate neutral + mint green primary; accent =
brand gradient (bawah). Tidak ada warna dekoratif lain; status semantic
(success/destructive) tetap boleh emerald/red karena fungsional.

## Brand gradient

Ramp hijau asli dari logo-text, diperdalam untuk kontras teks AA:
`oklch(50% 0.11 172) → oklch(55% 0.115 168)` (white text 5.6:1 / 4.6:1).
Digunakan HANYA di: CTA utama (ShimmerButton), BorderBeam fitur baru, stroke
BlueprintStage. Dosis 3 titik, tidak lebih (R-01: allowed, identitas brand asli).

## Typography

- Display: **Space Grotesk** (`--font-space`) — technical-display, cocok "blueprint"
- Body: **Plus Jakarta Sans** (`--font-jakarta`) — readable bilingual ID/EN
Alasan (R-06): dipilih 2026-09-14 untuk arah professional; tidak berubah.

## Motion (dials dikunci)

**ENERGY 2 / RHYTHM 2 / MOTION 2.**

- Motif identitas: **stroke-draw** — garis yang menggambar dirinya sendiri
  (stroke-dashoffset loop). Dipakai di: BlueprintStage hero, WizardStepper step
  aktif, divider version history. Alasan: dokumen = proses menggambar, bukan benda jadi.
- Animasi lain: shimmer sweep di CTA tunggal, border beam di 1 kartu fitur baru.
  Tidak ada fade-up massal, floating, atau marquee (dihapus v1.5.2).
- `prefers-reduced-motion: reduce` → semua stroke statis penuh.

## Contrast rules

- Primary light (48%) + white fg: AA large + normal aman
- Primary dark (74%) + fg teal-slate gelap: AA aman
- Muted-foreground dua mode: min L 48% light / 68% dark
- Brand gradient hanya untuk elemen besar (CTA/button height >= 40px) + teks white
  di light / gelap di dark, bukan untuk body text

## Forbidden

- Rainbow icon chips (dihapus v1.6.0): semua IconChip = primary tint satu keluarga
- text-gradient di h1 body besar; h1 = foreground solid
- DotPattern, Marquee, LiveBadge dekoratif (dihapus v1.5.2, tetap diharamkan)
- Em dash di UI copy (R-02)
- Border-2 di kartu; kartu pakai border 1px

# PRD GenZ — Product Requirements Document

> **Versi**: 1.0.0  
**Tanggal**: 8 September 2026  
**Status**: Draft — Menunggu Review  
**Author**: PRD GenZ Team  

---

## 1. Executive Summary

### 1.1 Visi
PRD GenZ adalah tool generator Product Requirements Document (PRD) yang dirancang untuk menghasilkan PRD berkualitas tinggi, siap pakai — khususnya untuk workflow AI coding (Cline, Cursor, Lovable, dll). Tool ini tersedia dalam dua bentuk:

- **Self-hosted** — dijalankan via Docker di infrastruktur sendiri
- **Cloud (SaaS)** — di-host sebagai layanan web dengan fitur tambahan

### 1.2 Misi
Membantu developer dan product manager mengubah ide mentah menjadi dokumen PRD yang terstruktur, jelas, dan actionable — dalam hitungan menit, bukan jam.

### 1.3 Target Pasar
| Segmen | Deskripsi |
|--------|-----------|
| Developer Indonesia | Menggunakan AI coding tools, butuh PRD berbahasa Indonesia/Inggris |
| PM/Startup Global | Butuh tool cepat untuk membuat PRD terstruktur |
| Freelancer | Butuh deliverable PRD profesional untuk klien |

---

## 2. Problem Statement

### 2.1 Masalah
1. Membuat PRD dari nol memakan waktu dan memerlukan keahlian khusus
2. Developer yang menggunakan AI coding tools sering tidak punya dokumen requirement yang terstruktur
3. Template PRD yang ada seringkali terlalu generik atau tidak sesuai workflow modern
4. Tool PRD yang ada tidak mendukung output yang siap langsung dipakai oleh AI coding assistant

### 2.2 Solusi
PRD GenZ mengubah ide/problem menjadi PRD lengkap dengan bantuan AI, melalui wizard terstruktur, chat interaktif, atau input satu kali. Outputnya langsung bisa dipakai untuk AI coding.

---

## 3. Goals & Success Metrics

### 3.1 Goals
| Goal | Metric | Target |
|------|--------|--------|
| Adopsi pengguna | Monthly Active Users (MAU) | 1.000 bulan pertama |
| Retensi | User kembali dalam 30 hari | > 40% |
| Kualitas output | Rating PRD generated (1-5) | > 4.0 |
| Konversi | Gratis → Pro | > 5% |

### 3.2 Non-Goals (v1)
- Kolaborasi real-time (multiplayer editing)
- Integrasi langsung dengan Jira/Linear
- AI yang menulis kode langsung
- Mobile app native

---

## 4. User Personas

### 4.1 Persona A:  Budi — Developer Indonesia
- **Umur**: 25-35 tahun
- **Kebutuhan**: Buat PRD untuk project side-hustle pakai Cline
- **Pain point**: Tidak punya waktu bikin dokumen formal, butuh cepat
- **Bahasa**: Indonesia

### 4.2 Persona B: Sarah — Product Manager Startup
- **Umur**: 28-40 tahun
- **Kebutuhan**: Buat PRD terstruktur untuk tim engineering
- **Pain point**: Template yang ada terlalu rigid
- **Bahasa**: Inggris

### 4.3 Persona C: Alex — Freelancer
- **Umur**: 22-35 tahun
- **Kebutuhan**: Deliverable PRD profesional untuk klien
- **Pain point**: Butuh output yang bisa di-export rapi (PDF)
- **Bahasa**: Bilingual

---

## 5. User Stories

| ID | Sebagai | Saya ingin bisa | Sehingga | Prioritas |
|----|---------|-----------------|----------|------------|
| US-01 | User | Memasukkan ide project | AI mengubah jadi PRD lengkap | P0 |
| US-02 | User | Memilih bahasa output (ID/EN) | PRD sesuai bahasa yang saya butuhkan | P0 |
| US-03 | User | Memilih mode wizard/chat/one-shot | Saya bisa menyesuaikan dengan preferensi kerja | P0 |
| US-04 | User | Menggunakan API key sendiri | Saya tidak bergantung pada layanan pihak ketiga | P0 |
| US-05 | User | Export PRD ke Markdown | Saya bisa pakai di mana saja | P0 |
| US-06 | User | Login & menyimpan PRD di cloud | PRD saya aman & bisa diakses di mana saja | P0 |
| US-07 | User | Export PRD ke PDF | Saya bisa share ke klien/tim | P1 |
| US-08 | User | Share PRD via link | Tim saya bisa lihat tanpa login | P1 |
| US-09 | User | Melihat versi lama PRD | Saya bisa revert jika perlu | P1 |
| US-10 | User | Menjalankan via Docker | Data saya tetap di server sendiri | P0 |

---

## 6. Functional Requirements

### 6.1 Mode Pembuatan PRD

#### 6.1.1 Wizard Mode (Default)
- **Input**: User mengisi form multi-step
- **Langkah**:
  1. Ide / Problem Statement
  2. Target User
  3. Fitur Utama
  4. User Story
  5. Acceptance Criteria
  6. Tech Stack
  7. Timeline
  8. Output Format
- **Fitur**:
  - Section bisa di-reorder & di-toggle (show/hide)
  - AI generate per section atau sekaligus
  - Preview real-time
  - Navigasi antar step (next/prev)

#### 6.1.2 Chat Mode
- **Input**: User chat dengan AI
- **Fitur**:
  - AI bertanya balik untuk klarifikasi
  - Context-aware (ingat percakapan sebelumnya)
  - User bisa koreksi & AI update PRD
  - Streaming response

#### 6.1.3 One-Shot Mode
- **Input**: User tulis ide/problem sekali jalan
- **Output**: PRD lengkap langsung di-generate
- **Fitur**:
  - Cepat (1 input → 1 output)
  - Bisa regenerate ulang

### 6.2 AI Integration

#### 6.2.1 Provider Support
| Provider | Tipe | Status |
|----------|------|--------|
| OpenAI (GPT-4/4o) | Direct | ✓ |
| Anthropic (Claude) | Direct | ✓ |
| Google (Gemini) | Direct | ✓ |
| OmniRoute | Aggregator | ✓ |
| TokenRouter | Aggregator | ✓ |
| 9Router | Aggregator | ✓ |
| Custom/OpenAI-compatible | Direct | ✓ |

#### 6.2.2 Konfigurasi API Key
- **Cloud**: Settings page → tersimpan di database (encrypted)
- **Self-host**: Environment variable (.env)
- **Validasi**: Test connection saat simpan

#### 6.2.3 Prompt Engineering
- **System prompt**: Dinamis, berubah tiap section wizard
- **Flow**: Outline → User Review → Detail per section
- **Context**: Bahasa output, tech stack, target user
- **Format**: Structured output (JSON) → render ke Markdown

#### 6.2.4 Streaming
- Output AI di-stream token per token
- UI menampilkan progress real-time
- Bisa di-stop user kapan saja

### 6.3 PRD Template & Output

#### 6.3.1 Section Wajib
1. **Judul Project**
2. **Ringkasan** (Executive Summary)
3. **Problem Statement**
4. **Target User**
5. **Fitur Utama** (daftar + deskripsi)
6. **User Story** (format: Sebagai... saya ingin... sehingga...)
7. **Acceptance Criteria** (checklist per fitur)
8. **Tech Stack** (rekomendasi + alasan)
9. **Timeline** (milestone)
10. **Output Format** (deliverable)

#### 6.3.2 Section Opsional
- Risk & Mitigation
- Success Metrics
- Open Questions
- Assumptions

#### 6.3.3 Format Export
| Format | Cloud | Self-host |
|--------|-------|-----------|
| Markdown (.md) | ✓ | ✓ |
| PDF | ✗ (Pro) | ✓ |
| DOCX | ✗ (v2) | ✗ (v2) |
| AI-ready prompt | ✓ | ✓ |

### 6.4 Auth & User Management (Cloud)

#### 6.4.1 Metode Login
- Email + Password
- OAuth Google
- OAuth GitHub

#### 6.4.2 User Roles
| Role | Akses |
|------|-------|
| Free | 10 PRD/bulan, Markdown export |
| Pro | Unlimited, PDF export, share link |

### 6.5 Data Model

#### 6.5.1 Entity Relationship
```
User
+-- id (UUID)
+-- email
+-- name
+-- avatar_url
+-- role (free/pro)
+-- created_at
+-- updated_at

Project
+-- id (UUID)
+-- user_id (FK)
+-- name
+-- description
+-- created_at
+-- updated_at

PRD
+-- id (UUID)
+-- project_id (FK)
+-- title
+-- language (id/en)
+-- mode (wizard/chat/oneshot)
+-- current_version
+-- created_at
+-- updated_at

PRDVersion
+-- id (UUID)
+-- prd_id (FK)
+-- version_number (int)
+-- content (JSON)
+-- content_md (text)
+-- created_at
+-- created_by (user_id)

ApiKey
+-- id (UUID)
+-- user_id (FK)
+-- provider
+-- key_encrypted
+-- created_at
+-- updated_at
```

### 6.6 Versioning
- Setiap regenerate = versi baru (auto-increment)
- User bisa lihat daftar versi
- User bisa restore versi lama ke current
- Diff view (bandingkan 2 versi)

### 6.7 Share Link (Cloud)
- Generate link view-only
- Optional: password protect
- Optional: expire date
- Tidak perlu login untuk view

---

## 7. Non-Functional Requirements

### 7.1 Performance
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| AI Response (first token) | < 2s |
| Full PRD Generation | < 30s |
| API Response (non-AI) | < 200ms |

### 7.2 Security
- API key tersimpan encrypted (AES-256)
- HTTPS wajib
- Rate limiting (100 req/min per user)
- Input sanitization (XSS prevention)
- CORS policy ketat
- SQL injection prevention (ORM)

### 7.3 Reliability
- Uptime SLA (cloud): 99.5%
- Graceful degradation jika AI provider down
- Retry mechanism untuk AI call
- Error boundary di UI

### 7.4 Scalability
- Horizontal scaling (stateless API)
- Database connection pooling
- CDN untuk static assets
- Queue untuk AI generation (jika perlu)

### 7.5 Accessibility
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- Color contrast ratio = 4.5:1

### 7.6 i18n
- UI: English + Indonesia (next-intl)
- Extensible: bisa tambah bahasa baru
- Output: user pilih per dokumen

---

## 8. Technical Architecture

### 8.1 High-Level Architecture
```
+-------------------------------------------------------------+
│                      Client (Browser)                       │
│  Next.js App Router + React Server Components + shadcn/ui   │
+-------------------------------------------------------------+
                              │
                              ↓
+-------------------------------------------------------------+
│                     API Layer (Next.js)                     │
│  +-------------+  +-------------+  +---------------------+  │
│  │ Auth API    │  │ PRD API     │  │ AI Proxy API        │  │
│  │ (NextAuth)  │  │ (CRUD)      │  │ (Provider Router)   │  │
│  +-------------+  +-------------+  +---------------------+  │
+-------------------------------------------------------------+
                              │
                              ↓
+-------------------------------------------------------------+
│                       Services Layer                        │
│  +-------------+  +-------------+  +---------------------+  │
│  │ AI Service  │  │ PRD Service │  │ Export Service      │  │
│  │ (Prompt +   │  │ (Template + │  │ (MD/PDF/DOCX)       │  │
│  │  Stream)    │  │  Version)   │  │                     │  │
│  +-------------+  +-------------+  +---------------------+  │
+-------------------------------------------------------------+
                              │
                              ↓
+-------------------------------------------------------------+
│                         Data Layer                          │
│  +-------------+  +-------------+  +---------------------+  │
│  │ PostgreSQL  │  │ Redis       │  │ Object Storage      │  │
│  │ (Primary)   │  │ (Cache)     │  │ (Exports/Assets)    │  │
│  +-------------+  +-------------+  +---------------------+  │
+-------------------------------------------------------------+
```

### 8.2 Monorepo Structure
```
prdgenz/
├── apps/
│   ├── cloud/                 # SaaS application
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── styles/
│   │   ├── prisma/            # Database schema
│   │   ├── public/
│   │   └── package.json
│   │   │
│   ├── self-host/            # Self-hosted application
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── docker/
│   │   └── package.json
│   │
├── packages/
│   ├── shared/               # Shared code
│   │   ├── src/
│   │   │   ├── templates/     # PRD templates
│   │   │   ├── ai/            # AI prompt logic
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── utils/         # Utilities
│   │   │   └── constants/
│   │   └── package.json
│   │   │
│   ├── ui/                   # Shared UI components
│   │   ├── src/
│   │   └── package.json
│   │   │
│   └── config/               # Shared configs
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── tailwind/
│   │
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml
├── .github/
│   └── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
├── LICENSE (MIT)
└── README.md
```

### 8.3 Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript 5+ |
| UI | React 18+, shadcn/ui, Radix UI |
| Styling | Tailwind CSS |
| Database | PostgreSQL (cloud), SQLite (self-host) |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| AI SDK | Vercel AI SDK |
| Validation | Zod |
| Testing | Vitest (unit), Playwright (integration) |
| Linting | ESLint, Prettier |
| Package Manager | pnpm |
| Monorepo | Turborepo |
| CI/CD | GitHub Actions |
| Container | Docker, Docker Compose |
| Analytics | Plausible (self-host) |
| i18n | next-intl |

### 8.4 AI Provider Routing
```
+------------------------------------------+
│              AI Proxy API                │
│  +------------------------------------+  │
│  │         Provider Router            │  │
│  │  +-------------+  +-------------+  │  │
│  │  │ OpenAI      │  │ Anthropic   │  │  │
│  │  +-------------+  +-------------+  │  │
│  │  +-------------+  +-------------+  │  │
│  │  │ Google      │  │ OmniRoute   │  │  │
│  │  +-------------+  +-------------+  │  │
│  │  +-------------+  +-------------+  │  │
│  │  │ TokenRouter │  │ 9Router     │  │  │
│  │  +-------------+  +-------------+  │  │
│  +------------------------------------+  │
+------------------------------------------+
```

### 8.5 Deployment

#### 8.5.1 Cloud
- **Platform**: Vercel (frontend) + Railway/Render (database)
- **Environment**: Production, Preview (PR), Development
- **Domain**: prdgenz.dev

#### 8.5.2 Self-Host
- **Method**: Docker Compose
- **Command**: docker compose up -d
- **Ports**: 3000 (app)
- **Storage**: Volume mount untuk SQLite + exports
- **Alternative**: Railway/Render one-click deploy

---

## 9. UI/UX Requirements

### 9.1 Design Principles
- **Minimalis** — fokus pada konten, bukan dekorasi
- **Fast** — setiap interaksi terasa instan
- **Accessible** — bisa digunakan semua orang
- **Responsive** — desktop-first, tapi mobile-friendly

### 9.2 Key Pages
| Page | Route | Deskripsi |
|------|-------|-----------|
| Landing | / | Hero, features, CTA, pricing |
| Login | /login | Email/password + OAuth |
| Register | /register | Email/password + OAuth |
| Dashboard | /dashboard | List project + PRD |
| New PRD | /prd/new | Pilih mode (wizard/chat/one-shot) |
| Wizard | /prd/new/wizard | Form multi-step |
| Chat | /prd/new/chat | Chat interface |
| One-Shot | /prd/new/oneshot | Single input |
| PRD View | /prd/[id] | Preview + export + version |
| PRD Edit | /prd/[id]/edit | Edit mode |
| Settings | /settings | API key, profile, preferences |
| Pricing | /pricing | Free vs Pro |

### 9.3 Component Library
- shadcn/ui sebagai base
- Custom components:
  - PRDPreview — render Markdown PRD
  - WizardStepper — step indicator
  - AIChatBubble — chat message
  - VersionHistory — version list
  - ExportMenu — export options
  - ProviderSelector — AI provider dropdown

---

## 10. API Endpoints

### 10.1 Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth/register | Register user baru |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/session | Get current session |

### 10.2 PRD
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/prd | List PRD (by user) |
| POST | /api/prd | Create PRD baru |
| GET | /api/prd/[id] | Get PRD detail |
| PUT | /api/prd/[id] | Update PRD |
| DELETE | /api/prd/[id] | Delete PRD |
| POST | /api/prd/[id]/generate | Generate/regenerate PRD |
| GET | /api/prd/[id]/versions | List versi |
| POST | /api/prd/[id]/versions/[vid]/restore | Restore versi |

### 10.3 AI
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/ai/generate | Generate PRD (streaming) |
| POST | /api/ai/chat | Chat dengan AI (streaming) |
| GET | /api/ai/providers | List available providers |

### 10.4 Export
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/export/md | Export Markdown |
| POST | /api/export/pdf | Export PDF |

### 10.5 Settings
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/settings/apikey | Get API key (masked) |
| PUT | /api/settings/apikey | Update API key |
| DELETE | /api/settings/apikey | Delete API key |

---

## 11. Database Schema (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = postgresql
  url      = env(DATABASE_URL)
}

generator client {
  provider = prisma-client-js
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatarUrl     String?
  role          Role      @default(FREE)
  projects      Project[]
  apiKeys       ApiKey[]
  createdAt     DateTime  @default(now()) @map(created_at)
  updatedAt     DateTime  @updatedAt @map(updated_at)

  @@map(users)
}

enum Role {
  FREE
  PRO
}

model Project {
  id          String   @id @default(cuid())
  userId      String   @map(user_id)
  name        String
  description String?
  user        User     @relation(fields: [userId], references: [id])
  prds        PRD[]
  createdAt   DateTime @default(now()) @map(created_at)
  updatedAt   DateTime @updatedAt @map(updated_at)

  @@map(projects)
}

model PRD {
  id              String        @id @default(cuid())
  projectId       String        @map(project_id)
  title           String
  language        Language      @default(EN)
  mode            PRDMode       @default(WIZARD)
  currentVersion  Int           @default(1) @map(current_version)
  project         Project       @relation(fields: [projectId], references: [id])
  versions        PRDVersion[]
  createdAt       DateTime      @default(now()) @map(created_at)
  updatedAt       DateTime      @updatedAt @map(updated_at)

  @@map(prds)
}

enum Language {
  ID
  EN
}

enum PRDMode {
  WIZARD
  CHAT
  ONESHOT
}

model PRDVersion {
  id            String   @id @default(cuid())
  prdId         String   @map(prd_id)
  versionNumber Int      @map(version_number)
  content       Json
  contentMd     String   @map(content_md)
  prd           PRD      @relation(fields: [prdId], references: [id])
  createdAt     DateTime @default(now()) @map(created_at)

  @@unique([prdId, versionNumber])
  @@map(prd_versions)
}

model ApiKey {
  id        String   @id @default(cuid())
  userId    String   @map(user_id)
  provider  String
  keyEncrypted String @map(key_encrypted)
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now()) @map(created_at)
  updatedAt DateTime @updatedAt @map(updated_at)

  @@map(api_keys)
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests (Vitest)
- AI prompt builder logic
- Template rendering
- Data validation (Zod schemas)
- Utility functions

### 12.2 Integration Tests (Playwright)
- API routes (auth, CRUD PRD, generate)
- Database operations
- AI provider routing

### 12.3 E2E Tests (Playwright) — v2
- Full flow: register → create project → generate PRD → export
- Login → settings → add API key → generate

### 12.4 Coverage Target
| Type | Target |
|------|--------|
| Unit | > 80% |
| Integration | > 70% |

---

## 13. Milestones & Timeline

### Phase 1: Foundation (Minggu 1-2)
- [ ] Setup monorepo (Turborepo + pnpm)
- [ ] Setup shared package (types, templates, AI logic)
- [ ] Setup database schema (Prisma)
- [ ] Setup UI package (shadcn/ui config)

### Phase 2: Core Features (Minggu 2-3)
- [ ] Wizard mode (frontend + API)
- [ ] One-shot mode
- [ ] — AI integration (provider routing + streaming)
- [ ] Markdown export
- [ ] PRD preview & versioning

### Phase 3: Auth & Cloud (Minggu 3-4)
- [ ] NextAuth setup (email + OAuth)
- [ ] Dashboard + Project management
- [ ] Cloud database (PostgreSQL)
- [ ] Settings page (API key management)

### Phase 4: Self-Host & Polish (Minggu 4)
- [ ] Docker Compose setup
- [ ] Self-host build (SQLite, no auth)
- [ ] Documentation (README + User Guide)
- [ ] Testing (unit + integration)
- [ ] Bug fixes & polish

### Phase 5: Launch (Minggu 4+)
- [ ] Deploy cloud version
- [ ] Publish Docker image
- [ ] Write launch announcement
- [ ] Community outreach

---

## 14. Pricing (Cloud)

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 10 PRD/bulan, Markdown export, 1 project |
| **Pro** | $9/bulan | Unlimited PRD, PDF export, share link, unlimited projects |

---

## 15. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI provider down | High | Medium | Multi-provider support, retry mechanism |
| API key leakage | High | Low | Encryption at rest, masked display |
| Low adoption | Medium | Medium | Freemium model, community building |
| Cost overruns | Medium | Medium | BYOK model, rate limiting |
| Scope creep | High | Medium | Strict MVP definition, phased approach |

---

## 16. Open Questions

1. Apakah perlu free trial Pro (7 hari)?
2. Apakah perlu team/organization plan untuk v2?
3. Bagaimana handling prompt injection dari user input?
4. Apakah perlu integrasi GitHub (save PRD ke repo)?
5. Bagaimana monetisasi self-host (donasi / license fee)?

> Status v1.1.0: pertanyaan #3 (prompt injection handling) — input user dibatasi Zod schema + max length; mitigasi penuh masih open.

---

## 17. Appendix

### 17.1 Glossary
| Term | Definition |
|------|------------|
| PRD | Product Requirements Document |
| BYOK | Bring Your Own Key |
| AI Coding | Using AI assistants to write code |
| Streaming | Real-time token-by-token response |

### 17.2 References
- [ngodingpakeai.com/plan](https://www.ngodingpakeai.com/plan) — Referensi produk sejenis
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — AI integration
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [NextAuth.js](https://next-auth.js.org/) — Authentication

### 17.3 Status Implementasi (Audit 2026-09-11)

| Fitur | Status | Catatan |
|---|---|---|
| Email+Password login | ✓ Implemented | NextAuth credentials, bcrypt cost 12 |
| OAuth Google/GitHub | ✓ Implemented | Aktif hanya jika GOOGLE_CLIENT_ID/SECRET & GITHUB_CLIENT_ID/SECRET diset (env-gated); user OAuth di-upsert by email |
| Rate limiting | ◐ Partial | In-memory sliding window 100 req/min — semua route mutasi cloud terlindungi; wajib ganti ke Redis sebelum scaling horizontal |
| Share link password + expiry | ✓ Implemented | bcrypt sharePasswordHash, shareExpiresAt, cookie gate /api/share/[shareId]/auth |
| Free plan 10 PRD/30 hari + 1 project | ✓ Implemented | assertCreateAllowed + assertProjectCreateAllowed |
| API key encryption (AES-256-GCM) | ✓ Implemented | ENCRYPTION_KEY 64-hex; guard placeholder key di production |
| SSRF guard customBaseUrl | ✓ Implemented | isSafeExternalUrl (literal IP privat/loopback diblok; DNS rebinding belum) |
| Export MD/PDF | ✓ Implemented | PDF via print-HTML, title di-escape (anti HTML-injection) |
| i18n UI (next-intl) | ✗ Backlog | Hanya output dokumen ID/EN yang ada |
| Version diff view | ✓ Implemented (1.3.0) | diffPRDVersions (shared) + VersionDiff (ui); halaman /prd/[id]/diff di cloud+self-host; entry dari tombol Diff di version history |
| Wizard section reorder/toggle + generate per-section | ✓ Implemented | Per-section generate (1.4.0) + reorder/toggle steps dengan exclude-input AI, wizard-config localStorage; UI WizardStepper ops mode configure |
| ESLint + Prettier | ✓ Implemented (1.1.1) | next/core-web-vitals (apps), @typescript-eslint (packages); `pnpm lint` di CI |
| Coverage thresholds | ✓ Implemented (1.1.1) | @vitest/coverage-v8 per package, threshold dikalibrasi dari baseline; `pnpm test:coverage` enforce di CI |
| Playwright smoke E2E (cloud) | ✓ Implemented (1.1.1) | 5 test: register/login/project/key/generate→export→share; mock AI 127.0.0.1:3999; job CI `e2e` + Postgres service; E2E user PRO |
| Dark mode + SEO + error pages | ✓ Cloud + Self-Host (1.2.1) | next-themes (system default + toggle), error/global-error/not-found/loading; cloud: metadataBase/OG/robots/sitemap; self-host: noindex robots (private instance), favicon, manifest |
| Aksesibilitas | ◐ Partial (1.2.0) | aria-label toggle, focus-ring shadcn; WCAG AA audit backlog |
| DOCX export | ✗ v2 | Sesuai rencana |

### 17.4 Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-09-13 | Per-section generate: dynamic section prompt + merge draft (shared), /api/ai/section SSE route cloud + self-host, SectionRegenerate UI di PRD page, full-PRD-answer unwrap |
| 1.3.0 | 2026-09-13 | Version diff view: per-section markdown diff, picker from/to, cloud + self-host |
| 1.2.1 | 2026-09-12 | Self-host parity: dark mode, status pages, favicon, noindex SEO |
| 1.2.0 | 2026-09-12 | UI foundation polish: dark mode (next-themes), error/loading/not-found pages, favicon, SEO metadata (cloud-first) |
| 1.1.1 | 2026-09-11 | Quality hardening: ESLint enforced, coverage thresholds enforced, Playwright smoke E2E (cloud) di CI |
| 1.1.0 | 2026-09-11 | Security audit fixes: rate-limit coverage, share password & expiry, free-plan project limit, OAuth (env-gated), SSRF guard, PDF escaping |
| 1.0.0 | 2026-09-08 | Initial draft |

---

**End of Document**

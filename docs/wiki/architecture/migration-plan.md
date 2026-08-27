# ISRIB → Next.js: план міграції та runbook

> Чернетка для `docs/wiki/` нового репозиторію. Синтезовано з розбору
> `lnnemml/ISRIB` (поточний live-сайт), `lnnemml/nootropics` (референс-архітектура)
> та Karpathy LLM-wiki pattern. Дата: 2026-08-27.

---

## 0. TL;DR + чесний scoping

**Головний висновок:** `nootropics` — це вже готовий, зрілий шаблон саме того,
чим ти хочеш зробити ISRIB. Той самий стек (Next.js 16 / TS / Tailwind v4 /
Neon+Drizzle / NextAuth v5 / Resend / NowPayments), той самий manual-payment
flow, той самий wiki-патерн, та сама аналітика (`trackEvent`/`trackServerEvent`
+ CAPI), той самий DNA (NORA, крипто-знижка, research-compound позиціонування).
**Тому міграція — це переважно перенесення (reuse), а не побудова з нуля.**

**Реаліті-чек по «кілька днів».** Сама платформа `nootropics` будувалась
~2 тижні (28.06 → 13.07 по `log.md`), одна задача за сесію. Ти будеш не з нуля —
але повний 1:1 клон **усіх** фіч (акаунти, реферали, admin, journal, `/go`, blog,
6 продуктів, перенесення контенту, перепідключення аналітики, QA) за 3-4 дні —
нереалістично, і спроба це зробити зашвидко на **live-сайті, що приймає
замовлення** — це прямий шлях зламати checkout.

**Рекомендація — розбити на два треки:**

- **Track A (Дні 0-4) — «безпечна заміна вітрини».** Мінімум, щоб новий сайт
  міг стати live без ризику для замовлень: home, 6 продуктових сторінок,
  **self-contained checkout** (Neon + Resend + NowPayments), аналітика, legal,
  wiki bootstrap. Cutover DNS робимо **тільки після** end-to-end перевірки
  checkout. Старий деплой лишається як миттєвий rollback.
- **Track B (тиждень 2, fast-follow) — «платформа».** Акаунти, реферали,
  admin-панель, journal/SEO-хаб (перенесення `isrib-research.com` з 301),
  `/go` DR-лендінг. Це вже на новому сайті, без тиску «не зламати live».

Такий поділ дає тобі «кілька днів» на те, що реально важить (краща архітектура
live без зламаних замовлень), і чесний графік на решту.

---

## 1. Що це за два репозиторії (gap analysis)

| Вимір | `lnnemml/ISRIB` (зараз, live) | `lnnemml/nootropics` (ціль) |
|---|---|---|
| Стек | Vanilla HTML/JS/CSS, 36 `.html`, статик на Vercel | Next.js 16 App Router, TS strict, Tailwind v4, 88 `.tsx` |
| Продукти | 6 сторінок як великі `.html` (`product_isrib_A15.html` — 59 КБ) | `(shop)/products/[slug]` generic + `src/lib/copy/products.ts` + окрема product landing |
| Домени | **ДВА**: `isrib-a15.com` (лендінг) + `isrib.shop` (checkout) | **ОДИН** застосунок, self-contained checkout |
| Замовлення | Redis (`savePendingOrder` в `api/checkout.js`) | Neon Postgres + Drizzle (`orders` table), server actions |
| Checkout | `checkout.html` + `js/main.js` (114 КБ) + `api/checkout.js` (⚠ inviolable) | `(shop)/checkout` + `actions/submitOrder.ts` |
| Оплата | NowPayments (crypto) + manual (PayPal/SEPA/SWIFT/WU) | NowPayments webhook + manual, payment-method selector, крипто-знижка 10% |
| Аналітика | GTM×3, GA4, Meta Pixel+CAPI, Clarity, Reddit, 2-event model — **вже побудовано, складне** | `src/lib/analytics/{client,server}.ts` — єдина абстракція `trackEvent()`/`trackServerEvent()` |
| Email | Vercel serverless `api/leads.js` + Neon + QStash + Resend (4-лист nurture) | Resend templates + server actions |
| Акаунти/реферали/admin | нема | NextAuth (customer+admin), реферали 10/10, admin orders/shipping |
| SEO-контент | окремий сайт `isrib-research.com` (MDX-хаб) | `content/journal/*.mdx` + `(blog)` в тому ж застосунку |
| Знання/wiki | розкидано по `.md`/`.docx`/PDF у проекті | `docs/{raw,wiki}` + `CLAUDE.md`, Karpathy-патерн, `log.md`, ADR |

**Ключовий інсайт:** три речі, які ти виніс як найбільші проблеми, міграція
вирішує «безкоштовно», просто тому що архітектура інша:

1. **Cross-domain checkout trust break** (твій зафіксований conversion-killer:
   бінарна поведінка на checkout через стрибок `isrib-a15.com → isrib.shop`).
   Один Next.js застосунок = один домен = checkout не покидає лендінг.
2. **`api/checkout.js` inviolable / крихкий** (ReferenceError на ~280 рядку).
   У новій архітектурі це server action з типізованим Drizzle — крихкість зникає.
3. **Аналітика — «спагеті» з ручних `fbq`/`dataLayer.push`** по файлах.
   `trackEvent()`/`trackServerEvent()` централізує це, failures стають
   non-blocking, схема подій консистентна.

---

## 2. Стратегічні рішення (зафіксувати як ADR перед стартом)

Створи ці ADR у `docs/wiki/decisions/` нового репо **до** будь-якого коду —
вони визначають цілий план:

- **ADR-0001 — Fork-not-rebuild.** Базуємось на архітектурі `nootropics`
  (route groups, `src/lib`, analytics layer, manual-payment flow, wiki-патерн).
  Переносимо структуру, замінюємо продуктові дані/копірайт/бренд на ISRIB.
- **ADR-0002 — Домени: колапс у один застосунок.** `isrib.shop` лишається
  канонічним storefront-доменом (5 років, 500+ покупців, органічний трафік,
  SEO-вага). `isrib-a15.com` → редіректить на `/go` (DR-лендінг) нового
  застосунку АБО стає canonical редіректом на `isrib.shop`. `isrib-research.com`
  тимчасово лишається окремо (не чіпати SEO зараз) → у Track B переїжджає в
  `/journal` з 301 по кожній статті.
- **ADR-0003 — Order storage: Redis → Neon.** Джерело істини для замовлень
  переходить у Postgres. Redis лишається лише як кеш (як у email-системі).
  Це найризикованіша частина cutover — тому окремий verification gate.
- **ADR-0004 — Blue-green cutover, live недоторканий.** Новий сайт будується
  на окремому Vercel-проекті / preview-домені. DNS на `isrib.shop`
  перемикається **тільки** після проходження checkout-gate. Старий проект
  лишається живим ≥7 днів як rollback.
- **ADR-0005 — Аналітику мігруємо, ID зберігаємо.** Ті самі GA4
  `G-LJEBV5NPCT`, Meta Pixel `1228338595957402`, Reddit `a2_hz77nm0joupm`,
  Clarity. `order_submitted` лишається primary conversion для Meta. НЕ
  ламаємо накопичену історію/оптимізацію кампаній.

---

## 3. Wiki bootstrap (Karpathy-патерн) — це роблять першим

Karpathy LLM-wiki — три шари: **raw** (immutable джерела) → **wiki**
(LLM пише й підтримує, interlinked markdown) → **schema** (`CLAUDE.md` —
конвенції + workflow). Операції: **Ingest / Query / Lint**. Два спец-файли:
`index.md` (каталог) і `log.md` (append-only, `## [YYYY-MM-DD] <type> | <title>`,
парситься через `grep "^## \["`).

`nootropics/CLAUDE.md` — це вже майже готовий еталон schema-файлу. **Скопіюй його
структуру дослівно**, заміни NORA/NeuroDrive-специфіку на ISRIB.

**Твої наявні документи — це вже готовий `raw/` шар.** Мапінг у `docs/wiki/`
робиться майже 1:1 з тим, що вже є в `nootropics`:

| Твій документ (→ `docs/raw/`) | Синтезується у `docs/wiki/` |
|---|---|
| `ISRIB_Avatar_Sheet_Filled_Final.pdf` | `product/avatar.md` |
| `Isrib_Necessary_Beliefs.pdf` | `product/beliefs-and-objections.md` |
| `ISRIB_Offer_Brief_Filled.pdf` | `product/overview.md` + `marketing/messaging-angles.md` |
| `ISRIB_A15_Master_Intelligence_Report.docx` | усі `product/*` + `marketing/*` (це вже синтез 5 джерел) |
| `Isrib_Research_Document.pdf`, `ISRIB_Report.pdf` | `product/mechanism-and-science.md` |
| `ISRIB_Analytics_Summary_v2..v4.md` | `architecture/analytics.md` + ADR-0005 |
| `ISRIB_Email_LeadGen_System.md` | `architecture/email-leadgen.md` |
| `ISRIB_Landing_Redesign_Summary.md` | `marketing/landing-copy-v1.md` + design tokens |

**Важливо (уроки з коментарів під gist-ом, вони релевантні тобі):**
- Ingest по одному джерелу за раз, ти читаєш summary й підтверджуєш — не
  batch-ом наосліп.
- `log.md` append-only, у справжньому хронопорядку; entry-формат фіксований.
- Human-правки у wiki треба захищати від перезапису наступним ingest —
  познач їх як «pin» (claim + section anchor), інакше регенерація їх зітре.
- Не квоть змінні значення (SHA, дати, лічильники) у wiki-сторінках — тільки
  форму контракту; рухоме читається live з коду/frontmatter.

---

## 4. Track A — «безпечна заміна вітрини» (Дні 0-4)

> Формат: одна задача = одна Claude Code сесія. Для будь-чого, що чіпає 3+ файли
> або «архітектурного» — спершу **Plan Mode** (`Shift+Tab`×2), рев'ю плану, потім
> імплементація. Кожна сесія закінчується `npx tsc --noEmit` + запис у `log.md`.

### День 0 — Scaffold + wiki + аналітика-каркас (фундамент)
1. `create-next-app` (App Router, `src/`, TS). **Прочитати
   `node_modules/next/dist/docs/` перед кодом** — Next 16 має breaking changes
   (це прямо написано в `AGENTS.md` nootropics).
2. Перенести структуру route groups + `src/lib/{db,auth,analytics,copy,email}`
   з nootropics (як каркас, без бізнес-логіки).
3. `docs/{raw,wiki}` + `CLAUDE.md` (schema) + `index.md` + `log.md`. Закинути
   твої PDF/docx у `docs/raw/`.
4. **Верифікація `.gitignore`** виключає `.next/`, `node_modules/`, `.vercel/`
   ДО першого коміту (урок Phase 1 nootropics — інакше тисячі згенерованих
   файлів у git).
5. Аналітичний шар `src/lib/analytics/{client,server,types}.ts` з nootropics,
   env-ключі = твої існуючі ID (ADR-0005).
   **Gate:** `next build` проходить, порожній сайт деплоїться на Vercel-preview.

### День 1 — Design system + продуктова модель (дані, не сторінки)
1. Перенести Tailwind theme/tokens з **locked** design system. Напрям — поточна
   storefront-айдентика `isrib.shop`: **світла, blue/cyan/white, lab-grade**,
   піднята до premium. Amber-on-dark гілка з лендінг-редизайну **diverged і НЕ
   прийнята** для уніфікованого сайту. Джерело істини для імплементації —
   `docs/wiki/design/handoff-spec.md` §1 (@theme токени) + §2 (next/font);
   рішення зафіксоване в `docs/wiki/design/design-system.md` (STATUS: LOCKED) та
   log 2026-08-27 `decision`.
2. `src/lib/copy/products.ts` — 6 продуктів як типізовані дані:
   ISRIB A15 (флагман), ISRIB Original, ZZL-7, MPEP Oxalate, Bromantane,
   N-Acetyl-Bromantane. SKU/ціни/формати — з `ISRIB_Analytics_Summary` таблиць.
3. `(shop)/products/[slug]` generic template (з nootropics) + окрема багата
   landing для ISRIB A15 (аналог `neurodrive/`).
   **Gate:** усі 6 продуктів рендеряться зі списку, ціни коректні.

### День 2 — Checkout (найкритичніша частина) ⚠
1. Neon + Drizzle: `orders` schema з nootropics + додати поля під твою
   специфіку (product_slug вже є; capsules/powder format; проміжні статуси
   під manual flow). `db:push` чисто.
2. `(shop)/checkout` self-contained + `actions/submitOrder.ts` → пише в Neon.
3. Payment-method selector (crypto default 10% / manual). НЕ додавати card-поля
   (hard constraint).
4. Resend: `order-received` (клієнту) + `new-order` (ops) на submit.
5. NowPayments invoice (з nootropics `src/lib/nowpayments.ts` + webhook route).
   **Gate (blue-green):** на preview-URL розмісти **реальне тестове замовлення**
   → воно з'явилось у Neon → обидва листи прийшли → NowPayments invoice
   генерується → статус оновлюється. Поки цей gate не зелений — **DNS не чіпати.**

### День 3 — Аналітика end-to-end + legal + контент-порт
1. Підключити `trackEvent`/`trackServerEvent` у ключових точках воронки
   (product_view, begin_checkout, `order_submitted`, `order_confirmed`).
   Дедуплікація через спільний `event_id` (як зараз).
2. Перевірити Meta Events Manager: `InitiateCheckout` (order_submitted) долітає
   і з браузера, і з CAPI, дедуплікується.
3. Legal pages (Terms/Privacy/Disclaimer/Research-use) — AI-чернетки, позначити
   «потребує юр-рев'ю» (hard constraint).
4. Порт контенту 6 продуктів з існуючих `.html` (NMR-секції, formula SVG,
   FID-даунлоади для A15). Це найбільш паралелізовна робота — можна віддати
   окремими вузькими сесіями.
   **Gate:** воронка в GA4/Meta стріляє коректно; аналітичний паритет зі старим.

### День 4 — QA + cutover
1. Повний прогін: home → продукт → checkout → лист → NowPayments, на десктопі
   й мобільному. Clarity-запис перегляну.
2. `sitemap.ts`/`robots.ts`, redirects (усі старі `/product_*.html` та
   vercel.json-редіректи → нові URL, 301).
3. **Cutover:** DNS `isrib.shop` → новий деплой. `isrib-a15.com` → `/go` або
   301 на `isrib.shop`. Старий проект лишити живим (rollback).
4. Моніторинг 48 год: замовлення падають у Neon, листи йдуть, аналітика ціла.

---

## 5. Track B — fast-follow (тиждень 2, вже без тиску на live)

Порядок = порядок ROI, не порядок nootropics-фаз:
1. **Admin-панель** (orders list + status + shipping) — щоб ти не редагував
   замовлення в Neon руками.
2. **Journal / SEO-хаб** — перенести статті `isrib-research.com` у
   `content/journal/*.mdx`, **по одній з 301-редіректом** (не втратити ранкінг).
   Дописати `eif2b-and-memory-formation`, `isrib-traumatic-brain-injury`.
   Створити `docs/wiki/journal/writing-rules.md` (еталон у nootropics).
3. **`/go` DR-лендінг** — 17-секційний standalone (структура з nootropics
   `src/app/go/`), наповнений твоїм Master Intelligence Report копірайтом.
   Сюди веде трафік з `isrib-a15.com`.
4. **Email lead-gen** — перенести 4-лист nurture (у тебе він уже добре
   працює: Primary inbox, `replyTo`). Або лишити наявну Vercel-serverless
   систему як є й просто вказувати форми на неї (вона доменно-незалежна).
5. **Акаунти + реферали** — найнижчий пріоритет, суто зростання.

---

## 6. Незмінні constraints (перенести в `CLAUDE.md` нового репо)

- **Live `isrib.shop` + старий `api/checkout.js` не чіпати до cutover.**
  Уся робота — у новому репо/деплої. Жодних правок у продакшн-checkout.
- **Blue-green: DNS перемикається лише після зеленого checkout-gate.**
  Старий деплой живий ≥7 днів як rollback.
- **Аналітичні ID зберігаються** (GA4/Pixel/Reddit/Clarity), `order_submitted`
  = primary conversion. Не ламати оптимізацію кампаній.
- **Single-variable discipline** (твоє правило): не міняти лендінг і креатив
  одночасно; cutover сам по собі — велика зміна, тому паузу на рекламу
  на час cutover + стабілізація 3-4 дні перед новими тестами.
- **No card fields / no "Pay Now"** — manual + crypto лише (як у nootropics).
- **No money-back guarantee** ніде (research chemicals, fraud risk).
- **Legal-сторінки — AI-чернетки, не launch-ready** без юр-рев'ю.
- **Аналітика лише через `trackEvent`/`trackServerEvent`** — жодних сирих
  `fbq()`/`dataLayer.push()` у компонентах.
- **TS strict, no `any` без коментаря; Drizzle only, no raw SQL поза `src/lib/db/`;
  JSX-копірайт — подвійні лапки** (апострофи в англ. копірайті ламають single-quote).
- **Токен-економія:** коли компонент існує — вказуй Claude Code на файл
  компонента, не на великий raw design HTML щоразу.

---

## 7. Готові Claude Code промпти (День 0-1)

> Твій стандарт: точні шляхи, конкретні функції, `npx tsc --noEmit`, явне
> «не чіпати інші файли». Ось перші, решту генеруєш за цим шаблоном.

**Prompt 0.1 — Scaffold + структура**
```
Read node_modules/next/dist/docs/ first (Next 16 has breaking changes).
Scaffold a Next.js 16 App Router + TypeScript (strict) + Tailwind v4 project in
this repo. Create the route-group skeleton mirroring the reference architecture:
src/app/(marketing), (shop)/products/[slug], (shop)/checkout, (blog),
src/lib/{db,auth,analytics,copy,email}, src/components/{ui,layout,shop,marketing}.
Empty placeholder pages only — no business logic yet.
Verify: `npx tsc --noEmit` passes and `next build` succeeds.
Before the first commit, confirm .gitignore excludes .next/, node_modules/, .vercel/
and `git status` shows no generated files. Do not add any payment/card fields.
```

**Prompt 0.2 — Wiki bootstrap**
```
Create docs/raw/ and docs/wiki/ following the Karpathy LLM-wiki pattern
(raw = immutable sources, wiki = LLM-maintained markdown, CLAUDE.md = schema).
Create CLAUDE.md as the schema entry point with: wiki-maintenance workflow
(ingest/query/lint), log.md entry format `## [YYYY-MM-DD] <type> | <title>`,
and the hard constraints list from section 6 of the migration plan.
Create docs/wiki/index.md (catalog) and docs/wiki/log.md (append-only) with an
initial `setup` entry. Do not ingest the raw PDFs yet — that's a separate session.
```

**Prompt 1.2 — Продуктова модель**
```
Create src/lib/copy/products.ts as typed product data for 6 ISRIB products:
isrib-a15 (flagship), isrib-original, zzl-7, mpep-oxalate, bromantane,
n-acetyl-bromantane. Fields per product: slug, name, formats[] (powder/capsules
with SKU, price in cents, size), shortDescription, mechanismSummary.
Use exact SKUs/prices from docs/raw/ analytics summaries — do NOT invent prices;
if a real price is missing, use an obvious placeholder and flag it.
Then build (shop)/products/[slug] to render from this data.
Verify `npx tsc --noEmit`. Do not modify analytics or checkout files.
```

---

## 8. Verification gates (не переходити далі, поки не зелено)

| Gate | Умова |
|---|---|
| G0 Scaffold | `next build` ok, порожній сайт на preview, git чистий |
| G1 Products | 6 продуктів рендеряться, ціни коректні з raw |
| **G2 Checkout** ⚠ | реальне тест-замовлення → Neon → 2 листи → NowPayments invoice → статус |
| G3 Analytics | воронка стріляє в GA4+Meta, дедуплікація ok, паритет зі старим |
| G4 Cutover-ready | QA десктоп+мобайл, 301-редіректи, sitemap/robots |
| **CUTOVER** | лише після G2+G3+G4; старий деплой лишається rollback |

---

## 9. Що НЕ робити в поспіху (типові пастки цього cutover)

- Не переносити `isrib-research.com` статті без 301 по кожному URL — втратиш
  накопичений SEO-ранкінг (це твій органічний канал).
- Не запускати рекламу під час cutover-вікна — конверсії за цей період
  «брудні», зламаєш чистоту single-variable тестів.
- Не тягнути акаунти/реферали в Track A — вони не блокують продажі, а ризик
  додають.
- Не переписувати аналітику «заодно» — переноси 1:1 (ті самі ID, той самий
  `order_submitted` primary), оптимізацію не чіпай.
- Не робити паралельні git worktrees / кілька Claude Code сесій одночасно на
  Track A — задачі залежні й послідовні (урок nootropics `CLAUDE.md`).

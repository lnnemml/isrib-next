// Typed, PORTED product data for the 6-product catalog. Copy is ported verbatim from
// the legacy isrib.shop pages (subtitle / lead description / trust bullets / specs) — do
// NOT regenerate. Prices are integer cents. See docs/wiki/architecture/data-model.md.
//
// Pricing is a discriminated union on `kind` (overview.md): "fixed" (discrete
// format/size SKUs) vs "per-gram-tiered" (ISRIB Original — trials + per-gram tiers, NOT
// flattened to fixed). Two products additionally carry the *other* shape's data as
// optional secondary fields, per Anton's in-session ruling (2026-08-31): A15 also
// publishes bulk per-gram tiers; Original also sells capsule SKUs. `format`
// (powder|capsules) is always explicit — no implicit mg→g conversion (the legacy bug).

export type FormatKind = "powder" | "capsules";

export interface FixedFormat {
  format: FormatKind;
  sku: string;
  sizeLabel: string;
  priceCents: number;
}

export interface Trial {
  sizeLabel: string;
  priceCents: number;
  mg?: number; // exact mg — set when a per-gram calculator is wired (A15)
  badge?: string; // tier badge shown in the order grid (e.g. "Trial")
}

export interface PerGramTier {
  rangeLabel: string;
  perGramCents: number;
  discountPct: number;
  minMg?: number; // inclusive range bounds — set when a calculator is wired (A15)
  maxMg?: number;
  tierName?: string; // grid/breakdown label (e.g. "Standard", "Serious Users")
  popular?: boolean; // highlighted (accent) tier — one per product
}

export interface PricingFixed {
  kind: "fixed";
  formats: FixedFormat[];
  tiers?: PerGramTier[]; // A15 bulk per-gram tiers (Anton 2026-08-31)
}

export interface PricingPerGramTiered {
  kind: "per-gram-tiered";
  trials: Trial[];
  tiers: PerGramTier[];
  formats?: FixedFormat[]; // Original capsule SKUs (Anton 2026-08-31)
}

export type Pricing = PricingFixed | PricingPerGramTiered;

export interface SpecRow {
  label: string;
  value: string;
}

export interface Spectrum {
  label: string;
  hint: string;
  src: string;
  alt: string;
  meta?: string; // e.g. "400 MHz · DMSO-d₆" (ported from live NMR card)
  batch?: string; // e.g. "Batch 2" (batch badge on the live NMR card)
  signals?: string; // key-signals footer text (ported verbatim)
}

export interface DownloadItem {
  href: string;
  filename: string;
  label: string;
}

export interface ProductAssets {
  formulaSvg?: string;
  spectra?: Spectrum[];
  downloads?: DownloadItem[];
}

// Rich long-form content ported verbatim from a live product page (A15 is the first).
export interface MechanismContent {
  kicker: string;
  title: string;
  body: string;
  steps: { title: string; body: string }[];
  quote?: string;
}

export interface EducationBlock {
  heading: string;
  body: string;
}

// --- "Understanding ISRIB A15" deep section (ported verbatim, A15-only) ---

export interface UnderstandingPropertyRow {
  property: string;
  detail: string;
  mono?: boolean; // render `detail` in mono (chemical name / formula rows)
  strong?: boolean; // success-tinted emphasis (research status row)
}

export interface UnderstandingCard {
  eyebrow?: string; // small uppercase label (block 4B cards)
  title?: string; // bold inline title (block 4C / 4E cards)
  body: string;
}

export interface UnderstandingContent {
  eyebrow: string;
  title: string;
  intro: string;
  // 4A — What is ISRIB A15?
  whatIs: {
    heading: string;
    paragraphs: string[];
    table: UnderstandingPropertyRow[];
  };
  // 4B — The ISR Window
  isrWindow: {
    heading: string;
    paragraphs: string[];
    cards: UnderstandingCard[];
    callout: string; // Walter-Lab green blockquote
  };
  // 4C — Translational restoration
  translational: {
    heading: string;
    paragraphs: string[];
    cards: UnderstandingCard[];
  };
  // 4E — Key research applications (4D is the dark MechanismSection, rendered separately)
  applications: {
    heading: string;
    intro: string;
    cards: UnderstandingCard[];
  };
}

export interface HeroStatItem {
  figure: string;
  label: string;
}

export interface HeroBadge {
  label: string;
  tone: "accent" | "success"; // maps onto locked palette (cyan / green)
}

export interface HeroCta {
  label: string;
  href: string;
}

// --- "ISRIB vs ISRIB A15" comparison table (Original-only; renders via ComparisonTable) ---
// `tone` maps each cell value onto the locked palette: favorable→success, unfavorable→
// danger, neutral→default. Ported verbatim from product_isrib.html (live green/amber/red;
// amber is dropped — the locked system has no amber).
export type ComparisonTone = "favorable" | "unfavorable" | "neutral";

export interface ComparisonCellData {
  value: string;
  tone?: ComparisonTone;
}

export interface ComparisonColumnData {
  label: string;
  highlight?: boolean;
}

export interface ComparisonRowData {
  label: string;
  cells: ComparisonCellData[];
}

export interface ComparisonContent {
  heading: string;
  columns: ComparisonColumnData[];
  rows: ComparisonRowData[];
  callout: string;
}

export interface Product {
  slug: string; // canonical (redirect target)
  name: string;
  categorySubtitle: string;
  description: string;
  trustBullets: string[];
  specs: SpecRow[];
  pricing: Pricing;
  assets?: ProductAssets;
  mechanism?: MechanismContent; // rendered via MechanismSection (A15)
  education?: EducationBlock[]; // research-application cards (A15)
  understanding?: UnderstandingContent; // deep "Understanding ISRIB A15" section (A15)
  heroStats?: HeroStatItem[]; // hero stat trio (A15); falls back to Purity/MW when absent
  heroBadges?: HeroBadge[]; // hero pills e.g. "Most Popular" / "In stock" (A15)
  heroHighlights?: string[]; // hero "key highlights" checklist filling the left column (A15)
  formulaCaption?: string; // mono caption under the hero SVG (A15)
  heroCtas?: HeroCta[]; // data-driven hero CTA anchors (A15: Order/Learn More; Original: Order/The Science)
  comparison?: ComparisonContent; // "ISRIB vs ISRIB A15" table (Original-only)
}

// Identical across all six legacy pages — ported verbatim. COA line framed per variant A
// (ADR 0008): available on request, not asserted as "included".
const TRUST_BULLETS: string[] = [
  "COA available per batch on request",
  "Worldwide shipping",
  "Secure packaging",
  "Support via Email/Telegram/Signal",
  "Payments arranged individually",
];

const PRODUCTS: Product[] = [
  {
    slug: "isrib-a15",
    name: "ISRIB A15",
    categorySubtitle: "Ultra Potent Analog",
    description:
      "Ultra‑potent ISRIB analogue with enhanced bioavailability. Targets eIF2B.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₂₂H₂₂Cl₄N₂O₄" },
      { label: "MW", value: "520.24 g/mol" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White/off‑white powder" },
      { label: "Solubility", value: "DMSO" },
      { label: "Storage", value: "2-8°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Light", value: "Store in dark" },
      { label: "Moisture", value: "Keep dry" },
      { label: "Container", value: "Amber glass vial" },
    ],
    // A15 is a per-gram calculator (live page), NOT fixed formats — corrected per
    // data-model.md ¹ / ADR 0008. Prices unchanged, verified to the cent. mg/minMg/maxMg
    // drive the calculator (src/lib/copy/pricing.ts); the discrete display ignores them.
    pricing: {
      kind: "per-gram-tiered",
      trials: [
        { sizeLabel: "100mg", priceCents: 6000, mg: 100, badge: "Trial" },
        { sizeLabel: "500mg", priceCents: 13000, mg: 500, badge: "Trial" },
      ],
      tiers: [
        { rangeLabel: "1g", perGramCents: 20000, discountPct: 0, minMg: 1000, maxMg: 1000, tierName: "Standard" },
        { rangeLabel: "2–4g", perGramCents: 18000, discountPct: 10, minMg: 2000, maxMg: 4000, tierName: "Popular", popular: true },
        { rangeLabel: "5–9g", perGramCents: 17000, discountPct: 15, minMg: 5000, maxMg: 9000, tierName: "Serious Users" },
        { rangeLabel: "10–30g", perGramCents: 16000, discountPct: 20, minMg: 10000, maxMg: 30000, tierName: "Bulk" },
      ],
      formats: [
        { format: "capsules", sku: "isrib-a15-caps-25", sizeLabel: "25 × 20mg", priceCents: 17000 },
        { format: "capsules", sku: "isrib-a15-caps-50", sizeLabel: "50 × 20mg", priceCents: 24000 },
      ],
    },
    assets: {
      formulaSvg: "/images/isrib-a15-formula.svg",
      spectra: [
        {
          label: "¹H NMR",
          hint: "Click to zoom",
          src: "/images/isrib-a15-nmr-h1.png",
          alt: "¹H NMR spectrum of ISRIB A15 — Batch 2",
          meta: "400 MHz · DMSO-d₆",
          batch: "Batch 2",
          signals:
            "Key signals: δ 7.54 (d, ArH, 2H), 7.24 (d, ArH, 2H), 6.99 (d, ArH, 2H), 4.51 (s, OCH₂, 4H), 3.60 (m, CH, 2H), 1.79 (m, CH₂, 4H), 1.35 (m, CH₂/CH₃, 4H)",
        },
        {
          label: "¹³C NMR",
          hint: "Click to zoom",
          src: "/images/isrib-a15-nmr-c13.png",
          alt: "¹³C NMR spectrum of ISRIB A15 — Batch 2",
          meta: "100 MHz · DMSO-d₆",
          batch: "Batch 2",
          signals:
            "Key signals: δ 166.08 (C=O amide), 157.25 (ArC-O), 131.41, 130.91, 122.91, 116.87, 115.62 (ArCH), 67.29 (OCH₂), 46.93 (CH), 30.82 (CH₂)",
        },
      ],
      downloads: [
        { href: "/files/isrib-a15-1h-fid.zip", filename: "¹H FID data (.zip)", label: "↓" },
        { href: "/files/isrib-a15-13c-fid.zip", filename: "¹³C FID data (.zip)", label: "↓" },
      ],
    },
    // Ported verbatim from product_isrib_A15.html (lines 424–631). Research-efficacy copy
    // included by Anton's explicit ruling (2026-08-31) — see log.md.
    mechanism: {
      kicker: "The mechanism · eIF2B",
      title: "A15 is a molecular staple for eIF2B.",
      body:
        "ISRIB A15 (also known as ISR-IN-2) is an analog of ISRIB, developed through structure-activity relationship (SAR) studies at UCSF. Unlike the parent molecule — which suffered from poor aqueous solubility limiting its oral utility — A15 incorporates dichlorophenoxy groups that dramatically improve both potency and pharmacokinetic profile. At its core, A15 is a molecular stabilizer of the eIF2B decamer complex: under cellular stress, phosphorylated eIF2α binds and inactivates eIF2B, shutting down protein synthesis globally. A15 binds at the β/δ subunit interface, acting as a \"molecular staple\" that locks the decameric complex in its active conformation regardless of eIF2α phosphorylation state.",
      steps: [
        {
          title: "eIF2B binding",
          body:
            "A15 crosses the blood-brain barrier rapidly (high CNS penetration, ~8h plasma half-life in rodents) and binds with sub-nanomolar affinity (EC₅₀ ≈ 0.8 nM) at the interface of the eIF2B β and δ subunits.",
        },
        {
          title: "Decamer stabilization",
          body:
            "Binding induces conformational stabilization of the eIF2B decameric complex, facilitating assembly of two eIF2B(βγδε) tetramers with one eIF2B(α)₂ dimer — the maximally active form of eIF2B.",
        },
        {
          title: "Translational restoration",
          body:
            "Active eIF2B catalyzes GDP→GTP exchange on eIF2α, regenerating the eIF2-GTP-Met-tRNAi ternary complex required for ribosomal scanning and AUG recognition — restoring protein synthesis even under stress.",
        },
      ],
      quote:
        "In aging brain and chronic stress conditions, eIF2α phosphorylation becomes tonically elevated — creating a persistent brake on the protein synthesis required for long-term potentiation, memory consolidation, and synaptic remodeling.",
    },
    education: [
      {
        heading: "Aging brain",
        body:
          "eLife 2020: ISRIB treatment in aged mice (equivalent to 65+ human years) restored spatial learning and memory to levels comparable to young mice. Improvements persisted weeks after dosing cessation — suggesting restoration of functional capacity rather than temporary masking.",
      },
      {
        heading: "Traumatic brain injury",
        body:
          "2017 landmark study (Rosi/Walter, UCSF): ISRIB reversed memory deficits in mice weeks after traumatic brain injury, restoring dendritic spine density and working-memory performance to levels indistinguishable from uninjured controls.",
      },
      {
        heading: "eIF2B-related disorders",
        body:
          "ISRIB A15 and analogs have shown activity in models of Vanishing White Matter Disease (VWMD), a leukodystrophy caused by loss-of-function mutations in eIF2B subunits.",
      },
      {
        heading: "The ISR window",
        body:
          "The Integrated Stress Response is triggered by four kinases (PERK, GCN2, HRI, PKR) responding to different stressors — unfolded proteins, nutrient deprivation, heme deficiency, viral infection. All converge on eIF2α-Ser51 phosphorylation, which halts global protein synthesis. In healthy tissue this is a brief protective pause; when tonically elevated it becomes a persistent brake on plasticity.",
      },
    ],
    // Hero enrichment (live product_isrib_A15.html hero) — A15-only.
    heroStats: [
      { figure: "≥98%", label: "Purity" },
      { figure: "COA", label: "Per batch" },
      { figure: "2013", label: "UCSF discovery" },
    ],
    heroBadges: [
      { label: "Most Popular", tone: "accent" },
      { label: "✓ In stock", tone: "success" },
    ],
    heroHighlights: [
      "6.25× more potent than ISRIB — EC₅₀ ≈ 0.8 nM",
      "High blood–brain-barrier permeability, ~8h plasma half-life",
      "¹H / ¹³C NMR verified every batch",
      "Free worldwide shipping on all orders",
    ],
    formulaCaption: "Molecular formula: C₂₂H₂₂Cl₄N₂O₄",
    heroCtas: [
      { label: "Order ISRIB A15", href: "#order" },
      { label: "Learn More", href: "#understanding" },
    ],
    // Deep "Understanding ISRIB A15" section — ported VERBATIM from
    // product_isrib_A15.html lines ~424–627 (blocks 4A/4B/4C/4E; 4D is the dark
    // MechanismSection rendered separately). Research-efficacy + disease-model copy
    // ratified for porting by Anton (2026-08-31).
    understanding: {
      eyebrow: "Scientific background",
      title: "Understanding ISRIB A15",
      intro:
        "A look at the pharmacology, research applications, and mechanism behind the highest-potency eIF2B activator in the ISRIB compound family.",
      whatIs: {
        heading: "What is ISRIB A15?",
        paragraphs: [
          "ISRIB A15 (also known as ISR-IN-2) is an analog of ISRIB, developed through structure-activity relationship (SAR) studies at UCSF. Unlike the parent molecule — which suffered from poor aqueous solubility limiting its oral utility — A15 incorporates dichlorophenoxy groups that dramatically improve both potency and pharmacokinetic profile.",
          "At its core, A15 is a molecular stabilizer of the eIF2B decamer complex. Under cellular stress, phosphorylated eIF2α binds and inactivates eIF2B — shutting down protein synthesis globally. A15 binds at the β/δ subunit interface of eIF2B, acting as a \"molecular staple\" that locks the decameric complex in its active conformation regardless of eIF2α phosphorylation state. This is a fundamentally different intervention point than nootropics that modulate neurotransmitter levels.",
        ],
        table: [
          {
            property: "Chemical name",
            detail:
              "N,N'-((1r,4r)-cyclohexane-1,4-diyl)bis(2-(3,4-dichlorophenoxy)acetamide)",
            mono: true,
          },
          { property: "Molecular formula", detail: "C₂₂H₂₂Cl₄N₂O₄", mono: true },
          { property: "Mechanism class", detail: "eIF2B activator / ISR inhibitor" },
          { property: "Primary target", detail: "eIF2B (eukaryotic initiation factor 2B)" },
          {
            property: "EC50",
            detail: "0.8 nM (vs 5 nM for original ISRIB — 6.25× more potent)",
          },
          {
            property: "BBB permeability",
            detail: "High — rapid CNS equilibration (~8h plasma half-life)",
          },
          { property: "Research status", detail: "Next-generation ISR tool compound", strong: true },
        ],
      },
      isrWindow: {
        heading: "The ISR Window — targeted suppression of chronic stress signaling",
        paragraphs: [
          "The Integrated Stress Response is a conserved cellular program triggered by four distinct kinases (PERK, GCN2, HRI, PKR), each responding to different stressors: unfolded proteins, nutrient deprivation, heme deficiency, and viral infection. All four converge on a single phosphorylation event: eIF2α-Ser51. Once phosphorylated, eIF2α acts as a competitive inhibitor of eIF2B, halting global protein synthesis.",
          "In healthy tissue, this is a brief protective pause. In aging brain and chronic stress conditions, eIF2α phosphorylation becomes tonically elevated — creating a persistent brake on the protein synthesis required for long-term potentiation, memory consolidation, and synaptic remodeling.",
        ],
        cards: [
          {
            eyebrow: "Aging Brain",
            body:
              "ISR becomes chronically activated in the aging brain. eLife 2020: ISRIB treatment in aged mice (equivalent to 65+ human years) restored spatial learning and memory to levels comparable to young mice. Improvements persisted weeks after dosing cessation — suggesting restoration of functional capacity rather than temporary masking.",
          },
          {
            eyebrow: "Traumatic Brain Injury",
            body:
              "2017 landmark study (Rosi/Walter, UCSF): ISRIB reversed memory deficits in mice weeks after traumatic brain injury. A short treatment course \"reset\" chronically activated ISR in neurons, restoring dendritic spine density and working memory performance to levels indistinguishable from uninjured controls.",
          },
          {
            eyebrow: "eIF2B-Related Disorders",
            body:
              "ISRIB A15 and analogs have shown efficacy in models of Vanishing White Matter Disease (VWMD) — a genetic leukodystrophy caused by destabilizing mutations in eIF2B subunits. A15 rescues eIF2B complex stability in VWMD-associated mutants, identifying it as a research tool for eIF2B structural biology and therapeutic development.",
          },
        ],
        callout:
          "\"Unlike PERK inhibitors — which completely abolish ISR signaling and cause dose-limiting pancreatic toxicity — A15 operates within a defined activation window. It suppresses low-to-moderate chronic ISR activity but does not block strong acute stress responses, which remain essential for cell survival. This selectivity profile, documented by the Walter Lab (UCSF), explains the absence of overt toxicity in animal studies.\"",
      },
      translational: {
        heading: "Translational restoration — how A15 reconnects cognition to protein synthesis",
        paragraphs: [
          "Memory formation is not merely electrical — it requires the physical synthesis of new proteins at synapses. Long-term potentiation (LTP), the cellular correlate of learning, depends on local dendritic protein synthesis within minutes to hours of synaptic activation. When the ISR is active, this synthesis is blocked upstream before it can begin.",
          "A15's intervention point — eIF2B stabilization — sits directly in this pathway. By maintaining eIF2B in its active decameric form, A15 allows translation to resume even in the presence of stress signals, restoring the protein supply chain for synaptic plasticity.",
        ],
        cards: [
          {
            title: "LTP & Synaptic Plasticity",
            body:
              "eIF2B is the rate-limiting factor for mRNA translation initiation at activated synapses. A15's eIF2B stabilization allows continued synthesis of plasticity-related proteins (Arc, CaMKII, BDNF) during periods of cellular stress — maintaining the molecular substrate for long-term memory formation when it would otherwise be suppressed.",
          },
          {
            title: "Integrated Stress Response & Neurodegeneration",
            body:
              "Multiple neurodegenerative conditions (Alzheimer's, Parkinson's, ALS, prion disease) involve chronic ISR activation as a shared pathological mechanism. A15 provides a pharmacological probe for isolating the contribution of eIF2B dysregulation to disease progression — distinct from approaches targeting specific protein aggregates.",
          },
          {
            title: "Decamer Stability & Structural Biology",
            body:
              "The eIF2B decamer (composed of two α₂βγδε tetramers) is the enzymatic core of translational control. A15's binding site at the β/δ interface provides a chemical handle for structural studies of decamer assembly, making it a valuable tool for cryo-EM and crystallography research into ISR biology.",
          },
        ],
      },
      applications: {
        heading: "Key research applications",
        intro:
          "The breadth of A15's utility spans from fundamental translational biology to disease-specific therapeutic probe development. Below are the primary research domains where A15 is deployed as the preferred high-potency ISR tool compound.",
        cards: [
          {
            title: "Neurodegeneration & ISR Biology",
            body:
              "A15 is the highest-potency available ISR inhibitor, making it the preferred tool compound for dissecting eIF2B function in neurodegeneration models. Active in ALS, Alzheimer's, Parkinson's, and prion disease research contexts where chronic ISR activation is a shared pathological feature.",
          },
          {
            title: "TBI & Neurological Recovery",
            body:
              "Based on the 2017 Rosi/Walter study demonstrating post-TBI memory restoration in rodent models. A15 enables investigation of the temporal window for ISR intervention after brain injury and the relationship between eIF2B activity and neurological recovery trajectories.",
          },
          {
            title: "Aging & Cognitive Decline",
            body:
              "The ISR becomes chronically elevated in aged brain tissue. A15 provides a pharmacological tool for studying whether ISR-dependent translational suppression is a driver — rather than correlate — of age-related cognitive decline, and for exploring intervention windows in aging models.",
          },
          {
            title: "eIF2B Structural Biology",
            body:
              "A15's defined binding site at the eIF2B β/δ interface makes it an ideal ligand for cryo-EM co-crystallization studies, hydrogen-deuterium exchange mass spectrometry (HDX-MS), and allosteric network mapping of the eIF2B decamer complex.",
          },
          {
            title: "Vanishing White Matter Disease",
            body:
              "VWMD is caused by heterozygous mutations across eIF2B subunits that destabilize decamer assembly. A15 rescues mutant eIF2B complex stability in cellular models of VWMD, positioning it as a probe for gain-of-function stabilization strategies in eIF2B-related leukodystrophies.",
          },
          {
            title: "ISR-Plasticity Coupling",
            body:
              "For researchers investigating the relationship between cellular stress responses and synaptic plasticity, A15 enables conditional restoration of eIF2B activity in specific contexts — allowing dissection of which aspects of LTP, fear memory, and spatial navigation are ISR-gated.",
          },
        ],
      },
    },
  },
  {
    slug: "isrib",
    name: "ISRIB",
    categorySubtitle: "Original Molecule",
    description:
      "The foundational ISRIB molecule discovered at UCSF. Selectively targets the ISR pathway via eIF2B modulation.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₂₂H₂₄Cl₂N₂O₄" },
      { label: "MW", value: "451.3 g/mol" },
      { label: "CAS", value: "1597403-47-8" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White to off-white powder" },
      { label: "Solubility", value: "DMSO" },
      { label: "Storage", value: "-20°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Light", value: "Store in dark" },
      { label: "Moisture", value: "Keep dry" },
      { label: "Container", value: "Amber glass vial" },
    ],
    // Per-gram calculator (live page). mg/minMg/maxMg gate + drive OrderBlock's calculator
    // (src/lib/copy/pricing.ts). Prices unchanged, verified to the cent vs product_isrib.html.
    pricing: {
      kind: "per-gram-tiered",
      trials: [
        { sizeLabel: "100mg", priceCents: 2700, mg: 100, badge: "Trial" },
        { sizeLabel: "500mg", priceCents: 6000, mg: 500, badge: "Trial" },
      ],
      tiers: [
        { rangeLabel: "1g", perGramCents: 10000, discountPct: 0, minMg: 1000, maxMg: 1000, tierName: "Standard" },
        { rangeLabel: "2–4g", perGramCents: 9000, discountPct: 10, minMg: 2000, maxMg: 4000, tierName: "Popular", popular: true },
        { rangeLabel: "5–9g", perGramCents: 8500, discountPct: 15, minMg: 5000, maxMg: 9000, tierName: "Serious Users" },
        { rangeLabel: "10–30g", perGramCents: 8000, discountPct: 20, minMg: 10000, maxMg: 30000, tierName: "Bulk" },
      ],
      formats: [
        { format: "capsules", sku: "isrib-original-caps-25", sizeLabel: "25 × 20mg", priceCents: 10000 },
        { format: "capsules", sku: "isrib-original-caps-50", sizeLabel: "50 × 20mg", priceCents: 14000 },
      ],
    },
    // NMR assets are an owner-added improvement (the live Original page has no NMR
    // section). FLAG: no source exists for Original's MHz / solvent / batch / peak δ
    // values, so meta/batch/signals are intentionally OMITTED (must not be fabricated).
    assets: {
      formulaSvg: "/images/isrib-original-formula.svg",
      spectra: [
        {
          label: "¹H NMR",
          hint: "Click to zoom",
          src: "/images/isrib-original-nmr-h1.png",
          alt: "¹H NMR spectrum of ISRIB",
        },
        {
          label: "¹³C NMR",
          hint: "Click to zoom",
          src: "/images/isrib-original-nmr-c13.png",
          alt: "¹³C NMR spectrum of ISRIB",
        },
      ],
      downloads: [
        { href: "/files/isrib-original-1h-fid.zip", filename: "¹H FID data (.zip)", label: "↓" },
        { href: "/files/isrib-original-13c-fid.zip", filename: "¹³C FID data (.zip)", label: "↓" },
      ],
    },
    // Hero enrichment (live product_isrib.html hero) — Original's real data.
    heroStats: [
      { figure: "98%+", label: "Purity" },
      { figure: "COA", label: "Per batch" },
      { figure: "2013", label: "UCSF discovery" },
    ],
    heroBadges: [
      { label: "Original Formula", tone: "accent" },
      { label: "✓ In stock", tone: "success" },
    ],
    heroHighlights: [
      "Discovered at UCSF (2013)",
      "≥98% HPLC purity, COA per batch",
      "¹H / ¹³C NMR verified every batch",
      "Free worldwide shipping on all orders",
    ],
    formulaCaption: "Molecular formula: C₂₂H₂₄Cl₂N₂O₄",
    heroCtas: [
      { label: "Order ISRIB", href: "#order" },
      { label: "The Science", href: "#science" },
    ],
    // "The Science behind ISRIB" — ported verbatim from product_isrib.html (Discovery at
    // UCSF + Published Research + the "How ISRIB Works" 3-step). Renders via the dark
    // MechanismSection. Efficacy copy ratified for organic product pages (Anton 2026-08-31).
    mechanism: {
      kicker: "The science · eIF2B",
      title: "ISRIB — the original ISR inhibitor.",
      body:
        "ISRIB was reported by Peter Walter's group at UCSF to restore learning & memory in brain-injured and elderly mice by modulating the Integrated Stress Response via eIF2B. Featured in peer-reviewed journals (Science, eLife, Nature).",
      steps: [
        {
          title: "ISR activation",
          body: "Stress triggers eIF2α phosphorylation and translation shut-down.",
        },
        {
          title: "eIF2B modulation",
          body: "ISRIB binds eIF2B to counteract the inhibition.",
        },
        {
          title: "Cognitive restoration",
          body: "Protein synthesis resumes to support plasticity & memory.",
        },
      ],
    },
    // "ISRIB vs ISRIB A15" — ported verbatim from product_isrib.html. Live green/amber/red
    // cell colors map to locked tokens (favorable→success, unfavorable→danger, neutral→
    // default); the live amber is dropped (no amber in the locked system).
    comparison: {
      heading: "ISRIB vs ISRIB A15",
      columns: [
        { label: "ISRIB", highlight: true },
        { label: "ISRIB A15" },
      ],
      rows: [
        {
          label: "Research history",
          cells: [
            { value: "Original discovery", tone: "favorable" },
            { value: "Optimized analog", tone: "neutral" },
          ],
        },
        {
          label: "Effective dose",
          cells: [
            { value: "50+ mg", tone: "neutral" },
            { value: "5–15 mg", tone: "favorable" },
          ],
        },
        {
          label: "Bioavailability",
          cells: [
            { value: "Moderate", tone: "neutral" },
            { value: "Enhanced", tone: "favorable" },
          ],
        },
        {
          label: "Research applications",
          cells: [
            { value: "Extensive", tone: "favorable" },
            { value: "Growing", tone: "favorable" },
          ],
        },
        {
          label: "Cost per study",
          cells: [
            { value: "Lower", tone: "favorable" },
            { value: "Higher", tone: "unfavorable" },
          ],
        },
      ],
      callout:
        "ISRIB remains the gold standard for research applications where established protocols and extensive literature support are essential.",
    },
  },
  {
    slug: "zzl-7",
    name: "ZZL-7",
    categorySubtitle: "Fast-Onset Research Compound",
    description:
      "Rapid-acting research compound that disrupts the SERT–nNOS interaction.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₁H₂₀N₂O₄" },
      { label: "MW", value: "244.29 g/mol" },
      { label: "CAS", value: "99141‑91‑0" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White crystalline powder" },
      { label: "Solubility", value: "DMSO, Water" },
      { label: "Storage", value: "-20°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "zzl-7-100mg", sizeLabel: "100mg", priceCents: 5000 },
      ],
    },
  },
  {
    slug: "mpep-oxalate",
    name: "MPEP Oxalate",
    categorySubtitle: "mGluR5 Negative Allosteric Modulator",
    description:
      "Selective negative allosteric modulator of mGluR5. High specificity and potency.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₁H₁₀N₂ · C₂H₂O₄" },
      { label: "MW", value: "283.25 g/mol" },
      { label: "CAS", value: "96206-92-7" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "Yellow-white powder" },
      { label: "Solubility", value: "DMSO, Ethanol" },
      { label: "Storage", value: "2-8°C" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "mpep-oxalate-100mg", sizeLabel: "100mg", priceCents: 6000 },
        { format: "powder", sku: "mpep-oxalate-500mg", sizeLabel: "500mg", priceCents: 13000 },
        { format: "powder", sku: "mpep-oxalate-1g", sizeLabel: "1g", priceCents: 20000 },
      ],
    },
  },
  {
    slug: "bromantane",
    name: "Bromantane",
    categorySubtitle: "Dopaminergic Actoprotector",
    description:
      "Dopaminergic-noradrenergic adaptogen with actoprotective and immunomodulatory properties.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₆H₂₀BrN" },
      { label: "MW", value: "308.24 g/mol" },
      { label: "CAS", value: "87913-26-6" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "Off-white crystalline powder" },
      { label: "Solubility", value: "DMSO, Ethanol" },
      { label: "Storage", value: "2-8°C (or -20°C long-term)" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "bromantane-1g", sizeLabel: "1g", priceCents: 4000 },
        { format: "powder", sku: "bromantane-2g", sizeLabel: "2g", priceCents: 7000 },
        { format: "powder", sku: "bromantane-5g", sizeLabel: "5g", priceCents: 16000 },
      ],
    },
  },
  {
    slug: "n-acetyl-bromantane",
    name: "N-Acetyl-Bromantane",
    categorySubtitle: "Acylated Dopaminergic Actoprotector",
    description:
      "Acylated bromantane analog with enhanced safety profile and preserved dopaminergic actoprotective activity.",
    trustBullets: TRUST_BULLETS,
    specs: [
      { label: "Formula", value: "C₁₈H₂₂BrNO" },
      { label: "MW", value: "364.28 g/mol" },
      { label: "CAS", value: "Not assigned (research compound)" },
      { label: "Purity", value: "≥98% (HPLC)" },
      { label: "Form", value: "White crystalline powder" },
      { label: "Solubility", value: "DMSO, Ethanol" },
      { label: "Storage", value: "2-8°C (or -20°C long-term)" },
      { label: "Stability", value: "2+ years" },
      { label: "Container", value: "Amber glass vial" },
    ],
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "n-acetyl-bromantane-500mg", sizeLabel: "500mg", priceCents: 4000 },
        { format: "powder", sku: "n-acetyl-bromantane-1g", sizeLabel: "1g", priceCents: 7000 },
        { format: "powder", sku: "n-acetyl-bromantane-2g", sizeLabel: "2g", priceCents: 13000 },
      ],
    },
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}

// Integer cents → display string. All catalog prices are whole dollars.
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toString() : dollars.toFixed(2)}`;
}

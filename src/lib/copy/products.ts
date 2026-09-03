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
    // Optional second paragraph group + second table, rendered (in order) after the
    // first table. Used by N-Acetyl-Bromantane, whose "What is" block has TWO tables
    // (properties + safety/toxicity). Backward-compatible: products that omit these
    // render exactly as before.
    paragraphs2?: string[];
    table2?: UnderstandingPropertyRow[];
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
  heroSubtitle?: string; // chemical-name subheading under the H1 (MPEP); falls back to Formula spec
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
      { label: "Light", value: "Store in dark" },
      { label: "Moisture", value: "Keep dry" },
      { label: "Container", value: "Amber glass vial" },
    ],
    // Fixed-size SKUs (live product_MPEP.html). Prices unchanged, verified to the cent:
    // 100mg=$60, 500mg=$130, 1g=$200. Renders via OrderBlock → FixedSizeSelector.
    pricing: {
      kind: "fixed",
      formats: [
        { format: "powder", sku: "mpep-oxalate-100mg", sizeLabel: "100mg", priceCents: 6000 },
        { format: "powder", sku: "mpep-oxalate-500mg", sizeLabel: "500mg", priceCents: 13000 },
        { format: "powder", sku: "mpep-oxalate-1g", sizeLabel: "1g", priceCents: 20000 },
      ],
    },
    // NMR assets ported from the live page (product_MPEP.html §NMR). Solvent CDCl₃ (not
    // DMSO-d₆ as A15/Original). Spectra images + FID zips copied into public/.
    assets: {
      formulaSvg: "/images/mpep-formula.svg",
      spectra: [
        {
          label: "¹H NMR",
          hint: "Click to zoom",
          src: "/images/mpep-nmr-h1.png",
          alt: "¹H NMR spectrum of MPEP Oxalate — Batch 2",
          meta: "400 MHz · CDCl₃",
          batch: "Batch 2",
          signals:
            "Key signals: δ 7.73 (t, ArH, 1H), 7.60 (m, ArH, 2H), 7.45 (m, ArH, 4H), 7.28 (d, ArH, 1H), 5.45 (br s, COOH × 2), 2.48 (s, CH₃, 3H)",
        },
        {
          label: "¹³C NMR",
          hint: "Click to zoom",
          src: "/images/mpep-nmr-c13.png",
          alt: "¹³C NMR spectrum of MPEP Oxalate — Batch 2",
          meta: "100 MHz · CDCl₃",
          batch: "Batch 2",
          signals:
            "Key signals: δ 161.00, 158.57 (C=O oxalate), 141.32, 137.10, 131.64, 129.36, 128.83, 123.10, 121.43 (ArC), 88.95, 88.05 (alkyne C≡C), 23.80 (CH₃)",
        },
      ],
      downloads: [
        { href: "/files/mpep-1h-fid.zip", filename: "¹H FID data (.zip)", label: "↓" },
        { href: "/files/mpep-13c-fid.zip", filename: "¹³C FID data (.zip)", label: "↓" },
      ],
    },
    // Hero enrichment (live product_MPEP.html hero) — MPEP's real data.
    heroSubtitle: "2‑Methyl‑6‑(phenylethynyl)pyridine · Oxalate",
    heroStats: [
      { figure: "98%+", label: "Purity" },
      { figure: "COA", label: "Per batch" },
      { figure: "mGluR5", label: "Selective NAM" },
    ],
    heroBadges: [{ label: "✓ In stock", tone: "success" }],
    heroHighlights: [
      "Selective mGluR5 NAM — non-competitive",
      "High blood–brain-barrier permeability",
      "¹H / ¹³C NMR verified every batch",
      "Free worldwide shipping on all orders",
    ],
    formulaCaption: "Molecular formula: C₁₁H₁₀N₂ · C₂H₂O₄",
    heroCtas: [
      { label: "Order MPEP Oxalate", href: "#order" },
      { label: "Learn More", href: "#understanding" },
    ],
    // Dark MechanismSection (live block 4 "Mechanism of action"). Body drawn faithfully
    // from the What-is copy; the 3 steps are ported verbatim. Quote omitted (the callout
    // lives in the isrWindow block).
    mechanism: {
      kicker: "The mechanism · mGluR5",
      title: "MPEP turns the mGluR5 volume down.",
      body:
        "MPEP is a non-competitive negative allosteric modulator of mGluR5. Rather than blocking the glutamate binding site directly, it binds a separate transmembrane pocket and reduces receptor sensitivity — turning the receptor's signalling down without occupying the orthosteric domain.",
      steps: [
        {
          title: "Selective binding",
          body:
            "MPEP rapidly crosses the blood-brain barrier and binds with high affinity to the allosteric transmembrane site of mGluR5 — a pocket entirely distinct from the orthosteric glutamate binding domain. No cross-reactivity with mGluR1 or ionotropic glutamate receptors at pharmacologically relevant concentrations.",
        },
        {
          title: "Negative modulation",
          body:
            "Binding induces a conformational shift in the receptor's seven-transmembrane domain, reducing the efficiency of G-protein coupling. The receptor remains intact but becomes markedly less sensitive to glutamate — analogous to turning down a volume knob rather than cutting the wire. Efficacy is maintained even under high glutamate conditions.",
        },
        {
          title: "Cascade inhibition",
          body:
            "Reduced mGluR5 signalling suppresses downstream IP₃-mediated calcium release and attenuates ERK / mTOR phosphorylation — dampening neuronal hyperexcitability, reducing pathological protein synthesis at the synapse, and protecting against excitotoxic calcium overload.",
        },
      ],
    },
    // Deep "Understanding MPEP Oxalate" section — ported VERBATIM from product_MPEP.html
    // blocks 1–5 (block 4 "Mechanism of action" is the dark MechanismSection above,
    // injected into the section's live position). Live amber/purple/red card accents map
    // onto the locked cyan/blue/success rotation.
    understanding: {
      eyebrow: "Scientific background",
      title: "Understanding MPEP Oxalate",
      intro:
        "A look at the pharmacology, research applications, and mechanism behind one of the most studied mGluR5 antagonists in neuroscience.",
      whatIs: {
        heading: "What is MPEP Oxalate?",
        paragraphs: [
          "MPEP Oxalate (2-Methyl-6-(phenylethynyl)pyridine oxalate) is a potent, highly selective negative allosteric modulator (NAM) of the metabotropic glutamate receptor subtype 5 (mGluR5). Synthesised as an oxalate salt for enhanced stability and ease of handling, it is widely regarded in the research community as a gold-standard pharmacological tool for dissecting glutamatergic neurotransmission.",
          "Unlike competitive antagonists that block the glutamate binding site directly, MPEP acts allosterically — binding to a separate transmembrane domain and reducing receptor sensitivity without occupying the orthosteric pocket. This non-competitive profile affords greater selectivity and predictable dose-response relationships, making it the preferred probe in hundreds of pre-clinical studies across addiction, cognition, and neurodegeneration.",
        ],
        table: [
          {
            property: "Chemical name",
            detail: "2-Methyl-6-(phenylethynyl)pyridine · C₂H₂O₄",
            mono: true,
          },
          { property: "Mechanism class", detail: "Negative allosteric modulator (NAM)" },
          {
            property: "Primary target",
            detail: "mGluR5 (Group I metabotropic glutamate receptor)",
          },
          {
            property: "BBB permeability",
            detail: "High — rapid CNS entry after systemic dosing",
          },
          { property: "Research status", detail: "Gold-standard mGluR5 tool compound", strong: true },
        ],
      },
      isrWindow: {
        heading: "The anti-addictive mechanism — mGluR5 and craving",
        paragraphs: [
          "mGluR5 receptors are densely expressed in the nucleus accumbens, prefrontal cortex, and ventral tegmental area — the circuit that governs reward, motivation, and compulsive behaviour. Under normal conditions, glutamate signalling through mGluR5 amplifies dopamine-driven reward signals. In addiction, this amplification becomes pathologically overactive: the receptor effectively locks the brain into a state of craving and drug-seeking.",
          "MPEP has been used in over 200 pre-clinical studies to probe this circuitry. By silencing mGluR5 activity, it selectively attenuates the reward salience of a substance — without broadly suppressing appetite, locomotion, or natural reward — making it an indispensable pharmacological scalpel.",
        ],
        cards: [
          {
            eyebrow: "Alcohol",
            body:
              "MPEP significantly reduces voluntary ethanol self-administration and prevents reinstatement of alcohol-seeking in rodent models. Critically, it targets the rewarding properties of alcohol without affecting caloric intake or general fluid consumption — demonstrating receptor-specific action on the reward pathway rather than non-specific suppression.",
          },
          {
            eyebrow: "Nicotine",
            body:
              "In nicotine self-administration paradigms, MPEP reduces breakpoint responding — the effort an animal will exert to obtain the drug — indicating a blunting of nicotine's motivational value. This makes it a valuable probe for studying the glutamatergic component of tobacco dependence and for evaluating candidate cessation therapies.",
          },
          {
            eyebrow: "Stimulants — cocaine & amphetamine",
            body:
              "MPEP blocks the development of conditioned place preference to cocaine, attenuates psychomotor sensitisation, and reduces cue-induced reinstatement. The mechanism involves suppression of AMPA receptor trafficking in the nucleus accumbens — a glutamatergic cascade that normally consolidates drug-associated memories.",
          },
        ],
        callout:
          "\"mGluR5 antagonism offers a mechanistically distinct approach to addiction research — one that targets the glutamatergic amplification of reward rather than the dopamine signal itself, potentially avoiding the tolerability issues of dopamine-based interventions.\"",
      },
      translational: {
        heading: "Cognitive research — mGluR5 in learning and mental health",
        paragraphs: [
          "Beyond addiction, mGluR5 sits at the intersection of synaptic plasticity, mood regulation, and neurodevelopmental disease. MPEP has become the standard pharmacological tool for selectively ablating mGluR5 function in cognitive research — enabling precise interrogation of the receptor's contribution to learning, memory, and emotional processing.",
        ],
        cards: [
          {
            title: "LTP / LTD — synaptic plasticity",
            body:
              "mGluR5 co-activates NMDA receptors and is required for mGluR-dependent long-term depression (mGluR-LTD) at hippocampal and cortical synapses. MPEP allows researchers to selectively eliminate this LTD component while preserving NMDA-dependent LTP — dissecting which arm of plasticity drives a given learning paradigm.",
          },
          {
            title: "Fragile X syndrome",
            body:
              "The \"mGluR theory of Fragile X\" proposes that loss of FMRP leads to unchecked mGluR5-driven protein synthesis, causing exaggerated mGluR-LTD. MPEP was the critical pharmacological proof-of-concept: in Fmr1 knockout mice, MPEP rescued audiogenic seizures, normalised dendritic spine morphology, and corrected prepulse inhibition.",
          },
          {
            title: "Anxiety & stress resilience",
            body:
              "MPEP produces robust anxiolytic effects in elevated plus-maze and fear-conditioning assays — comparable in magnitude to benzodiazepines, but without sedation or tolerance. mGluR5 activity in the basolateral amygdala gates fear consolidation, and MPEP administration disrupts this without erasing previously acquired memories.",
          },
        ],
      },
      applications: {
        heading: "Key research applications",
        intro:
          "The breadth of MPEP's utility spans from fundamental synapse biology to translational disease modelling. Below are the primary research domains where MPEP is currently deployed as a pharmacological standard.",
        cards: [
          {
            title: "Neuroprotection & ischaemia",
            body:
              "mGluR5 overactivation following stroke or TBI drives excitotoxic calcium influx. MPEP reduces infarct volume and improves neurological outcomes in rodent ischaemia models — serving as a benchmark for neuroprotective candidates.",
          },
          {
            title: "Autism spectrum & Fragile X",
            body:
              "MPEP remains the canonical pharmacological test of the mGluR theory of FXS. Beyond FXS, it is used to model and correct social behaviour deficits, repetitive behaviours, and sensory hypersensitivity across diverse ASD models.",
          },
          {
            title: "Addictive behaviour & relapse",
            body:
              "MPEP is the workhorse probe in glutamate-addiction research. It enables modelling of cue-induced reinstatement — the most clinically relevant stage of addiction — and evaluation of how mGluR5 blockade modifies extinction learning and stress-induced relapse.",
          },
          {
            title: "Chronic & neuropathic pain",
            body:
              "mGluR5 is upregulated in the spinal dorsal horn following nerve injury. MPEP reduces allodynia and thermal hyperalgesia in neuropathic pain models — revealing mGluR5 as a key driver of pain sensitisation and benchmarking novel analgesic candidates.",
          },
          {
            title: "Schizophrenia & psychosis models",
            body:
              "MPEP interrogates how mGluR5 modulates prepulse inhibition deficits and hyperlocomotion in PCP/ketamine models — providing a pharmacological bridge between NMDA hypofunction and mGluR5-targeted therapeutic strategies.",
          },
          {
            title: "Synaptic plasticity & memory encoding",
            body:
              "Used to isolate mGluR-LTD from NMDA-LTP in hippocampal preparations and in vivo learning paradigms. MPEP has established the temporal and spatial requirements for mGluR5 in fear extinction, spatial navigation, and working memory.",
          },
        ],
      },
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
      { label: "Light", value: "Store in dark" },
      { label: "Moisture", value: "Keep dry" },
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
    // NMR assets ported from the live page (product_bromantane.html §NMR). Solvent CDCl₃,
    // Batch 1. Spectra images + FID zips copied into public/.
    assets: {
      formulaSvg: "/images/bromantane-formula.svg",
      spectra: [
        {
          label: "¹H NMR",
          hint: "Click to zoom",
          src: "/images/bromantane-nmr-h1.png",
          alt: "¹H NMR spectrum of Bromantane — Batch 1",
          meta: "400 MHz · CDCl₃",
          batch: "Batch 1",
          signals:
            "Key signals: δ 7.14 (d, J=8.6 Hz, 2H, ArH), 6.57 (d, J=8.6 Hz, 2H, ArH), 5.74 (s, 1H, NH), 3.40–3.33 (m, 1H, CH), 2.50 (br s, 2H), 1.81 (br m, 15H)",
        },
        {
          label: "¹³C NMR",
          hint: "Click to zoom",
          src: "/images/bromantane-nmr-c13.png",
          alt: "¹³C NMR spectrum of Bromantane — Batch 1",
          meta: "100 MHz · CDCl₃",
          batch: "Batch 1",
          signals:
            "Key signals: δ 147.20, 131.24, 114.27, 105.58, 55.88, 39.53, 37.24, 36.74, 30.84, 26.95, 26.81",
        },
      ],
      downloads: [
        { href: "/files/bromantane-1h-fid.zip", filename: "¹H FID data (.zip)", label: "↓" },
        { href: "/files/bromantane-13c-fid.zip", filename: "¹³C FID data (.zip)", label: "↓" },
      ],
    },
    // Hero enrichment (live product_bromantane.html hero) — Bromantane's real data. The
    // "DA+NE" stat label was corrected to "Synthesis" to match the mechanism (bromantane
    // upregulates catecholamine synthesis; it does not block reuptake), per Anton's
    // 2026-09-03 decision. Figure kept as "DA+NE".
    heroSubtitle: "N-(4-Bromophenyl)adamantan-2-amine",
    heroStats: [
      { figure: "98%+", label: "Purity" },
      { figure: "COA", label: "Per batch" },
      { figure: "DA+NE", label: "Synthesis" },
    ],
    heroBadges: [{ label: "✓ In stock", tone: "success" }],
    heroHighlights: [
      "Dopaminergic-noradrenergic actoprotector",
      "High BBB permeability (adamantane scaffold)",
      "¹H / ¹³C NMR verified every batch",
      "Free worldwide shipping on all orders",
    ],
    formulaCaption: "Molecular formula: C₁₆H₂₀BrN",
    heroCtas: [
      { label: "Order Bromantane", href: "#order" },
      { label: "Learn More", href: "#understanding" },
    ],
    // Dark MechanismSection (live block 4 "Mechanism of action"). Body drawn faithfully
    // from the What-is copy; the 3 steps are ported verbatim. Quote omitted (the callout
    // lives in the isrWindow block).
    mechanism: {
      kicker: "The mechanism · catecholamines",
      title: "Bromantane raises catecholamine output, not synaptic flooding.",
      body:
        "Unlike classical stimulants that deplete monoamine stores or block reuptake acutely, bromantane operates through a fundamentally different mechanism: upregulation of the biosynthetic enzymes responsible for dopamine and norepinephrine synthesis. This results in a gradual, sustained increase in monoaminergic tone rather than a sharp pharmacokinetic spike — a profile associated with lower abuse liability and attenuated tolerance development.",
      steps: [
        {
          title: "Enzymatic upregulation",
          body:
            "Bromantane enters the CNS rapidly via passive diffusion across the blood-brain barrier, facilitated by its highly lipophilic adamantane core. Once in dopaminergic and noradrenergic neurons, it upregulates tyrosine hydroxylase (TH) and DOPA decarboxylase at the gene expression level — increasing the cell's synthetic capacity for catecholamines rather than depleting existing stores.",
        },
        {
          title: "Sustained monoaminergic tone",
          body:
            "Unlike reuptake inhibitors or releasers, bromantane does not produce acute synaptic flooding. Instead, enhanced enzyme expression gradually increases the resting catecholaminergic output over hours to days. This mechanism preserves autoreceptor feedback, reducing the likelihood of compensatory downregulation and tolerance development observed with classical stimulants.",
        },
        {
          title: "Multi-system resilience",
          body:
            "The combined dopaminergic, noradrenergic, and GABAergic actions converge to produce a multi-axis stress-resilience profile. Under experimental conditions of physical or cognitive load, bromantane-treated subjects demonstrate preserved performance parameters that decline in controls — a hallmark of true actoprotector action distinguishable from simple stimulation.",
        },
      ],
    },
    // Deep "Understanding Bromantane" section — ported VERBATIM from product_bromantane.html
    // blocks 1–5 (block 4 "Mechanism of action" is the dark MechanismSection above, injected
    // into the section's live position). Live amber/purple/red/indigo/rose card accents map
    // onto the locked cyan/blue/success rotation. The single "Ladasten" trade-name mention
    // is ported verbatim per the ratified 2026-08-31 organic-product-page policy.
    understanding: {
      eyebrow: "Scientific background",
      title: "Understanding Bromantane",
      intro:
        "A look at the pharmacology, research applications, and mechanism behind one of the most studied actoprotectors and dopaminergic-noradrenergic modulators in neuroscience.",
      whatIs: {
        heading: "What is Bromantane?",
        paragraphs: [
          "Bromantane is a unique hybrid compound that combines the adamantane scaffold — a rigid, highly lipophilic cage structure — with a 4-bromoaniline pharmacophore. First developed and studied in the Soviet Union as part of the actoprotector research program, it has been evaluated in multiple clinical trials as a performance-enhancing and stress-protective agent under the trade name Ladasten.",
          "Unlike classical stimulants that deplete monoamine stores or block reuptake acutely, bromantane operates through a fundamentally different mechanism: upregulation of the biosynthetic enzymes responsible for dopamine and norepinephrine synthesis. This results in a gradual, sustained increase in monoaminergic tone rather than a sharp pharmacokinetic spike — a profile associated with lower abuse liability and attenuated tolerance development.",
        ],
        table: [
          {
            property: "Chemical name",
            detail: "N-(4-Bromophenyl)adamantan-2-amine",
            mono: true,
          },
          { property: "Mechanism class", detail: "Dopaminergic/noradrenergic actoprotector" },
          { property: "Primary target", detail: "DAT, NET (synthesis upregulation)" },
          { property: "BBB permeability", detail: "High — lipophilic adamantane scaffold" },
          {
            property: "Research status",
            detail: "Clinically studied actoprotector (Russia/CIS)",
            strong: true,
          },
        ],
      },
      isrWindow: {
        heading: "Actoprotective and dopaminergic mechanism",
        paragraphs: [
          "The actoprotector concept, developed within Soviet pharmacology, describes compounds that increase physical and mental performance under extreme conditions — heat, hypoxia, high workload — without the depletion characteristic of classical stimulants. Bromantane is the prototypical member of this class.",
          "Its primary dopaminergic action involves upregulation of tyrosine hydroxylase (TH) and DOPA decarboxylase expression in the striatum and nucleus accumbens. Rather than flooding the synapse acutely, bromantane increases the cell's capacity to synthesise catecholamines over hours to days. In rodent studies, this translated to sustained increases in locomotor activity, improved resistance to fatigue under physical load, and enhanced performance in cognitive tasks requiring sustained attention. Parallel noradrenergic effects — via upregulation of dopamine-β-hydroxylase — contribute to the compound's anxiolytic and stress-resilience profile, distinct from its stimulatory component.",
        ],
        cards: [
          {
            eyebrow: "Physical performance",
            body:
              "In rodent forced-swim and rotarod models, bromantane extended performance duration and reduced error rates under thermal and hypoxic stress. The effect is dose-dependent and observed at doses that do not produce overt stimulation — consistent with a fatigue-resistance mechanism rather than simple CNS activation.",
          },
          {
            eyebrow: "Cognitive & anxiolytic effects",
            body:
              "Clinical studies in patients with asthenic syndrome showed improvements in attention, memory consolidation, and psychomotor speed alongside reduction in anxiety scores. The compound's noradrenergic component appears to mediate anxiolysis, while the dopaminergic action drives cognitive and motivational improvement.",
          },
          {
            eyebrow: "Immunomodulation",
            body:
              "Bromantane exhibits immunostimulatory properties in rodent models, including enhanced natural killer cell activity and increased antibody production under stress conditions. This immune-supportive profile distinguishes it from classical stimulants, which typically suppress immune function under chronic use.",
          },
        ],
        callout:
          "\"Bromantane's mechanism of enhancing catecholamine biosynthesis rather than blocking reuptake represents a pharmacologically distinct strategy for sustaining dopaminergic tone — one that preserves homeostatic feedback while increasing the system's output capacity.\"",
      },
      translational: {
        heading: "Neurochemical profile and receptor interactions",
        paragraphs: [
          "Beyond its primary action on catecholamine synthesis, bromantane has a multifaceted receptor interaction profile. It functions as a mild GABA-A positive allosteric modulator at certain subunit combinations — a property that may underlie the anxiolytic effects observed clinically without the sedation associated with benzodiazepines.",
          "Bromantane also interacts weakly with sigma-1 receptors, a site implicated in neuroprotection and stress-response modulation. The adamantane scaffold itself — shared with memantine and amantadine — confers mild NMDA receptor antagonism at higher concentrations, though this is not considered the primary mechanism at typical research doses. The compound accumulates in adipose tissue due to its high lipophilicity, resulting in a prolonged effective half-life despite a relatively short plasma half-life. This tissue reservoir effect produces sustained activity that outlasts plasma concentration — relevant for protocol design in research applications.",
        ],
        cards: [
          {
            title: "GABA-A modulation",
            body:
              "Electrophysiological studies suggest bromantane potentiates GABA-A receptor currents at select subunit compositions, contributing to its anxiolytic-without-sedation profile. This partial GABAergic action does not appear to produce tolerance or dependence at doses used in actoprotector research paradigms.",
          },
          {
            title: "Sigma-1 interaction",
            body:
              "Sigma-1 receptors are located at the endoplasmic reticulum-mitochondria interface and play roles in cellular stress resistance and neuroplasticity. Bromantane's affinity for this site may contribute to its neuroprotective properties observed in hypoxia models and provide synergistic support to its catecholaminergic effects.",
          },
          {
            title: "Adipose accumulation & kinetics",
            body:
              "Bromantane's logP and tissue distribution profile result in pronounced accumulation in lipid compartments. While plasma half-life is measured in hours, pharmacodynamic effects persist considerably longer. This kinetic behaviour must be accounted for in wash-out period design and dose-interval selection in research protocols.",
          },
        ],
      },
      applications: {
        heading: "Key research applications",
        intro:
          "The breadth of bromantane's utility spans from actoprotector benchmarking to dopamine biosynthesis studies and neuroprotection models. Below are the primary research domains where bromantane is currently deployed as a pharmacological standard.",
        cards: [
          {
            title: "Fatigue & physical performance research",
            body:
              "Bromantane is a standard pharmacological tool for actoprotector studies — research examining resistance to physical exhaustion, hypoxic performance, and recovery from exertion. It provides a benchmark for novel compounds targeting fatigue pathways and a positive control in catecholamine biosynthesis paradigms.",
          },
          {
            title: "Asthenic syndrome models",
            body:
              "Clinical and pre-clinical asthenia research employs bromantane to model and counteract low-energy, low-motivation states associated with chronic stress or illness. Its documented clinical efficacy in asthenic patients provides a validated translational bridge between rodent models and human endpoint data.",
          },
          {
            title: "Anxiolytic mechanism research",
            body:
              "Bromantane's combination of anxiolytic efficacy without sedation makes it a valuable comparator in studies investigating non-benzodiazepine anxiolytic mechanisms. Researchers use it to dissect the relative contributions of GABAergic versus monoaminergic pathways to anxiety reduction.",
          },
          {
            title: "Dopamine biosynthesis studies",
            body:
              "As a relatively clean upregulator of TH and DOPA decarboxylase, bromantane is used to examine the consequences of enhanced dopamine synthetic capacity on circuit function, reward sensitivity, and motor behaviour — without the confounds of reuptake blockade or vesicular release enhancement.",
          },
          {
            title: "Neuroprotection & hypoxia models",
            body:
              "Bromantane has demonstrated protective effects in rodent models of cerebral hypoxia and ischaemia. It serves as a comparator compound in neuroprotection studies and a tool for examining how enhanced catecholaminergic tone interacts with stress-induced neuronal vulnerability.",
          },
          {
            title: "Immunopharmacology",
            body:
              "Bromantane's immunostimulatory profile — documented in rodent stress-immunosuppression models — makes it a relevant tool compound for research examining the interface between catecholaminergic signalling and immune function, particularly NK cell activity and humoral immune response under physical stress.",
          },
        ],
      },
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
      { label: "Light", value: "Store in dark" },
      { label: "Moisture", value: "Keep dry" },
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
    // NMR assets ported from the live page (product_n_acetyl_bromantane.html §NMR).
    // Solvent CDCl₃, Batch 1. Spectra images + FID zips copied into public/.
    assets: {
      formulaSvg: "/images/n-acetyl-bromantane-formula.svg",
      spectra: [
        {
          label: "¹H NMR",
          hint: "Click to zoom",
          src: "/images/n-acetyl-bromantane-nmr-h1.png",
          alt: "¹H NMR spectrum of N-Acetyl-Bromantane — Batch 1",
          meta: "400 MHz · CDCl₃",
          batch: "Batch 1",
          signals:
            "Key signals: δ 7.61 (d, J=8.5 Hz, 2H, ArH), 7.37 (d, J=8.5 Hz, 2H, ArH), 4.37 (s, 1H, CH), 2.14 (s, 3H, COCH₃), 1.80–1.27 (br m, 15H, adamantane)",
        },
        {
          label: "¹³C NMR",
          hint: "Click to zoom",
          src: "/images/n-acetyl-bromantane-nmr-c13.png",
          alt: "¹³C NMR spectrum of N-Acetyl-Bromantane — Batch 1",
          meta: "100 MHz · CDCl₃",
          batch: "Batch 1",
          signals:
            "Key signals: δ 174.77 (C=O), 146.12, 138.33, 137.28, 126.34 (ArC), 65.36 (CH-N), 43.47, 42.56, 36.23, 36.09, 32.24, 31.62, 29.13",
        },
      ],
      downloads: [
        { href: "/files/n-acetyl-bromantane-1h-fid.zip", filename: "¹H FID data (.zip)", label: "↓" },
        { href: "/files/n-acetyl-bromantane-13c-fid.zip", filename: "¹³C FID data (.zip)", label: "↓" },
      ],
    },
    // Hero enrichment (live product_n_acetyl_bromantane.html hero).
    heroSubtitle: "N-Acetyl-N-(4-Bromophenyl)adamantan-2-amine",
    heroStats: [
      { figure: "98%+", label: "Purity" },
      { figure: "COA", label: "Per batch" },
      { figure: "Amide", label: "Tertiary N" },
    ],
    heroBadges: [{ label: "✓ In stock", tone: "success" }],
    heroHighlights: [
      "Acylated bromantane — tertiary amide",
      "High BBB permeability (adamantane-amide scaffold)",
      "¹H / ¹³C NMR verified every batch",
      "Free worldwide shipping on all orders",
    ],
    formulaCaption: "Molecular formula: C₁₈H₂₂BrNO",
    heroCtas: [
      { label: "Order N-Acetyl-Bromantane", href: "#order" },
      { label: "Learn More", href: "#understanding" },
    ],
    // Dark MechanismSection (live block 4 "Mechanism of action"). Body drawn faithfully
    // from the What-is copy; the 3 steps are ported verbatim. Quote omitted (the callout
    // lives in the isrWindow block).
    mechanism: {
      kicker: "The mechanism · amide",
      title: "An acetyl cap: same actoprotection, far wider safety margin.",
      body:
        "N-Acetyl-Bromantane is the N-acylated derivative of bromantane — the labile secondary amine is capped as a stable tertiary amide, markedly reducing susceptibility to N-oxidation while preserving the parent molecule's catecholamine biosynthesis-enhancing mechanism. The result is a compound with one of the highest therapeutic indices in the adamantane-amide series.",
      steps: [
        {
          title: "CNS entry and distribution",
          body:
            "The lipophilic adamantane cage combined with the N-acetyl group produces a calculated logP profile suitable for rapid blood-brain barrier penetration by passive diffusion. Tissue distribution follows the pattern of the bromantane class — accumulation in lipid compartments provides a depot effect that extends the pharmacodynamic duration beyond the plasma half-life. The amide modification alters the partitioning profile relative to the amine, potentially improving CNS/plasma ratio.",
        },
        {
          title: "Enzyme induction",
          body:
            "Once distributed in dopaminergic and noradrenergic neurons, N-acetyl-bromantane initiates upregulation of TH and DOPA decarboxylase at the gene expression level. This transcriptional mechanism unfolds over hours, producing a sustained increase in catecholaminergic tone that persists well beyond compound clearance. The absence of acute synaptic flooding means autoreceptor downregulation is attenuated — a key advantage over classical stimulant mechanisms.",
        },
        {
          title: "Sustained performance enhancement",
          body:
            "The combined dopaminergic and noradrenergic biosynthesis enhancement translates to sustained improvements in physical and cognitive performance under load conditions. In the Morozov paradigm, this manifested as a 3.4× increase in loaded swimming duration — a measure of true fatigue resistance, not mere stimulation. The multi-hour onset and extended duration mirror the compound's enzymatic rather than synaptic mechanism of action.",
        },
      ],
    },
    // Deep "Understanding N-Acetyl-Bromantane" section — ported VERBATIM from
    // product_n_acetyl_bromantane.html blocks 1–5 (block 4 "Mechanism of action" is the
    // dark MechanismSection above, injected into the section's live position). Live
    // amber/purple/red/indigo/pink card accents map onto the locked cyan/blue/success
    // rotation. Comparative reference-stimulant names (phenamin, sydnocarb) and structural
    // comparisons (bromantane) are ported verbatim per the ratified organic-product-page
    // policy — the "What is" block carries TWO tables (properties + safety/toxicity), via
    // the whatIs.table2/paragraphs2 slots.
    understanding: {
      eyebrow: "Scientific background",
      title: "Understanding N-Acetyl-Bromantane",
      intro:
        "A look at the pharmacology, safety profile, and mechanism behind the acylated derivative of bromantane — a compound that combines superior actoprotective efficacy with an exceptional therapeutic index.",
      whatIs: {
        heading: "What is N-Acetyl-Bromantane?",
        paragraphs: [
          "N-Acetyl-Bromantane is the N-acylated derivative of bromantane, produced by acetylation of the secondary amine nitrogen with acetic anhydride — a reaction first documented in the 1998 paper by Morozov et al. at the Institute of Pharmacology, Russian Academy of Medical Sciences. The result is a tertiary amide in which the N-H of bromantane is replaced by an N-acetyl group, fundamentally altering the compound's metabolic and pharmacological profile.",
          "The structural modification has important pharmacological consequences. The parent bromantane contains a secondary amine that is metabolically labile — subject to N-oxidation and rapid phase I metabolism. The N-acetyl group converts this to a tertiary amide with markedly lower susceptibility to N-oxidation, potentially extending the effective pharmacokinetic window and reducing formation of reactive metabolic intermediates. This is the same principle underlying the superior safety profiles of many clinically approved amide drugs compared to their amine precursors.",
        ],
        table: [
          {
            property: "Chemical name",
            detail: "N-Acetyl-N-(4-bromophenyl)adamantan-2-amine",
            mono: true,
          },
          { property: "Mechanism class", detail: "Acylated dopaminergic actoprotector" },
          {
            property: "Primary target",
            detail: "TH / DOPA decarboxylase (catecholamine biosynthesis)",
          },
          { property: "BBB permeability", detail: "High — lipophilic adamantane-amide scaffold" },
          {
            property: "Research status",
            detail: "Synthesized per Morozov et al. (Pharm. Chem. J., 1998)",
            strong: true,
          },
        ],
        paragraphs2: [
          "In the Morozov pharmacological comparison, N-acetyl-bromantane (compound II) showed a loaded swimming duration of 935 ± 42 seconds in the test group versus 275 ± 36 seconds in controls — a 3.4× enhancement that exceeded the reference stimulant phenamin (625 ± 26 seconds). Critically, this was achieved with an LD₅₀ of 5,640 mg/kg in mice, compared to bromantane's 1,020 mg/kg and phenamin's 300 mg/kg — giving N-acetyl-bromantane one of the highest therapeutic indices in the series.",
        ],
        table2: [
          {
            property: "Acute toxicity (LD₅₀, mice, IP)",
            detail: "5,640 mg/kg (Morozov et al., 1998)",
          },
          { property: "Comparison vs bromantane (Ib)", detail: "LD₅₀ 1,020 mg/kg" },
          {
            property: "Comparison vs phenamin",
            detail: "LD₅₀ 300 mg/kg — 18.8× lower toxicity",
          },
          {
            property: "Acylation source",
            detail: "Bromantane + Ac₂O / 6h reflux (80% yield)",
            mono: true,
          },
        ],
      },
      isrWindow: {
        heading: "Why the acetyl group changes everything",
        paragraphs: [
          "The N-acetyl modification represents a deliberate structural optimization rather than an incremental change. In bromantane, the secondary amine nitrogen is the site of highest metabolic vulnerability: cytochrome P450-mediated N-oxidation and oxidative deamination at this position generate electrophilic intermediates that contribute to the compound's dose-limiting toxicity profile. Acetylation caps this position, replacing the labile N-H with a stable amide bond that is orders of magnitude less reactive toward oxidative metabolism.",
          "The resulting tertiary amide exhibits markedly altered electronic properties at nitrogen. The lone pair on nitrogen participates in resonance with the carbonyl, reducing its availability for N-oxidation and shifting the compound's polarity and pKa. This translates directly to the exceptional safety data: an LD₅₀ of 5,640 mg/kg places N-acetyl-bromantane well above the parent compound's already-favourable toxicity profile, while preserving the parent molecule's actoprotective efficacy.",
        ],
        cards: [
          {
            eyebrow: "Metabolic stability",
            body:
              "The tertiary amide nitrogen of N-acetyl-bromantane is significantly more resistant to cytochrome P450-mediated N-oxidation than the secondary amine of the parent bromantane. This reduces the generation of reactive N-oxide metabolites, directly contributing to the compound's dramatically improved acute toxicity profile and expected reduction in off-target metabolic effects.",
          },
          {
            eyebrow: "Preserved actoprotective efficacy",
            body:
              "Despite the structural modification, N-acetyl-bromantane retains and even enhances the actoprotective activity of the parent compound. In loaded swimming tests, it produced a 240% increase over control — exceeding both bromantane (128% increase) and phenamin (167% increase) in the same paradigm. The core dopaminergic biosynthesis-enhancing mechanism remains intact through the acetylation.",
          },
          {
            eyebrow: "Exceptional safety margin",
            body:
              "An LD₅₀ of 5,640 mg/kg is among the highest recorded for any pharmacologically active compound in the adamantane series. For comparison, the reference stimulants phenamin (300 mg/kg) and sydnocarb (1,780 mg/kg) operate at 18.8× and 3.2× greater acute toxicity respectively. This wide safety margin makes N-acetyl-bromantane an ideal candidate for research protocols requiring high-dose or repeated-exposure experimental designs.",
          },
        ],
        callout:
          "\"The effect of the most active compound II [N-acetyl-bromantane] exceeded that of the reference drug phenamin in loaded swimming tests, while demonstrating substantially lower acute toxicity — a combination rarely achieved in CNS-active compounds.\" — Morozov et al., Pharmaceutical Chemistry Journal, 1998",
      },
      translational: {
        heading: "Dopaminergic and noradrenergic mechanism",
        paragraphs: [
          "N-Acetyl-bromantane shares the catecholamine biosynthesis-enhancing mechanism of the parent compound. The adamantane scaffold provides the structural backbone responsible for CNS penetration and receptor interactions, while the 4-bromophenyl group — retained intact through acetylation — maintains the pharmacophore's dopaminergic activity.",
          "The compound upregulates tyrosine hydroxylase (TH) and DOPA decarboxylase expression, increasing the synthetic capacity of dopaminergic and noradrenergic neurons over hours to days. Unlike reuptake inhibitors or releasers, this biosynthetic enhancement preserves autoreceptor feedback and homeostatic regulation — accounting for the low abuse liability and absence of typical stimulant tolerance observed with the bromantane class. The N-acetyl modification adds a pharmacokinetic dimension: the tertiary amide's altered lipophilicity and metabolic stability profile may extend the duration of central action relative to the parent amine, providing a more sustained and even pharmacodynamic response in actoprotector research paradigms.",
        ],
        cards: [
          {
            title: "Tyrosine hydroxylase upregulation",
            body:
              "The rate-limiting enzyme in catecholamine synthesis, TH converts tyrosine to L-DOPA. N-acetyl-bromantane's mechanism involves enhanced TH expression in striatal and accumbal dopaminergic neurons — increasing the cell's synthetic output capacity over a multi-hour time course rather than depleting stores acutely. This gradual ramp-up profile is associated with lower crash and rebound compared to acute releasers.",
          },
          {
            title: "Noradrenergic co-activation",
            body:
              "Parallel upregulation of dopamine-β-hydroxylase (DBH) in noradrenergic neurons contributes to the compound's stress-resilience and anxiolytic profile. The noradrenergic component, combined with dopaminergic enhancement, produces the characteristic actoprotector combination of fatigue resistance plus cognitive stability — without the anxiogenic effects of pure dopaminergic stimulants.",
          },
          {
            title: "Amide pharmacokinetics",
            body:
              "The tertiary amide bond undergoes enzymatic hydrolysis substantially more slowly than ester bonds and is resistant to spontaneous hydrolysis at physiological pH. Whether N-acetyl-bromantane acts directly or via partial in vivo hydrolysis to bromantane is an open research question — both pathways are pharmacologically relevant and contribute to the compound's extended action profile.",
          },
        ],
      },
      applications: {
        heading: "Key research applications",
        intro:
          "N-Acetyl-bromantane's combination of superior actoprotective efficacy and an exceptional safety margin positions it as a premium tool compound across multiple research domains. Below are the primary areas where it offers distinct advantages over the parent compound and classical stimulant controls.",
        cards: [
          {
            title: "Actoprotector benchmark (premium)",
            body:
              "N-acetyl-bromantane provides a superior benchmark compound for actoprotector research: equivalent or greater efficacy than bromantane with a substantially wider safety margin. For studies requiring repeated dosing, dose-escalation protocols, or long-duration exposure, its exceptional LD₅₀ allows researchers to explore dose ranges inaccessible with standard actoprotector controls.",
          },
          {
            title: "Metabolic stability studies",
            body:
              "The amide vs amine structural comparison between N-acetyl-bromantane and bromantane makes this compound pair ideal for studying how N-acylation affects CNS drug metabolism, N-oxidation pathways, and the relationship between metabolic stability and acute toxicity in the adamantane scaffold series.",
          },
          {
            title: "Catecholamine biosynthesis research",
            body:
              "As a potent TH/DOPA decarboxylase upregulator with documented superior efficacy data, N-acetyl-bromantane serves as a high-activity positive control in studies examining catecholamine biosynthetic capacity, dopaminergic circuit function, and the consequences of sustained (rather than acute) monoaminergic enhancement.",
          },
          {
            title: "High-safety-margin CNS research",
            body:
              "For experimental designs requiring high-confidence safety margins — chronic dosing, combination studies, or mechanistic work at suprapharmacological concentrations — N-acetyl-bromantane's LD₅₀ of 5.6 g/kg provides substantial experimental latitude without compromising on pharmacological activity.",
          },
          {
            title: "Fatigue and physical performance",
            body:
              "The Morozov loaded swimming data places N-acetyl-bromantane at the top of the N-adamantylaniline series for physical performance enhancement — above phenamin at equivalent doses. This makes it a valuable pharmacological tool for fatigue resistance research and a stringent positive control for novel actoprotector candidate evaluation.",
          },
          {
            title: "Amide prodrug mechanistic studies",
            body:
              "Whether N-acetyl-bromantane functions as a direct pharmacological agent or undergoes in vivo hydrolysis to bromantane is an open mechanistic question with broad implications for amide prodrug design. Its clear pharmacological activity and tractable analytical profile make it suitable for radiolabeling, metabolite tracking, and structure-activity studies in the CNS amide prodrug field.",
          },
        ],
      },
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

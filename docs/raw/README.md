# docs/raw/ — immutable source layer

Drop the ISRIB intelligence documents here, unedited. The wiki (`docs/wiki/`)
synthesizes from these; never edit raw sources in place.

## Expected sources (from the ISRIB project drive)

| File | Feeds wiki page |
|---|---|
| `ISRIB_Avatar_Sheet_Filled_Final.pdf` | `product/avatar.md` |
| `Isrib_Necessary_Beliefs.pdf` | `product/beliefs-and-objections.md` |
| `ISRIB_Offer_Brief_Filled.pdf` | `product/overview.md`, `marketing/messaging-angles.md` |
| `ISRIB_A15_Master_Intelligence_Report.docx` | all `product/*` + `marketing/*` (already a 5-source synthesis) |
| `Isrib_Research_Document.pdf`, `ISRIB_Report.pdf` | `product/mechanism-and-science.md` |
| `ISRIB_Analytics_Summary_v2..v4.md` | `architecture/analytics.md`, ADR 0005 |
| `ISRIB_Email_LeadGen_System.md` | `architecture/email-leadgen.md` (Track B) |
| `ISRIB_Landing_Redesign_Summary.md` | `design/design-system.md`, `marketing/landing-copy-v1.md` |

## legacy/

Copy read-only reference from the old vanilla site here when a build task needs it
(e.g. `product_isrib_A15.html` for the NMR section + FID downloads, product copy,
env value references). This is a donor for content porting — it is NOT the codebase
and nothing here should be imported at runtime.

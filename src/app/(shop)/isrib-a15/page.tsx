import { redirect } from "next/navigation";

// Legacy placeholder route. The canonical A15 page is the dynamic product route
// (/products/isrib-a15); this segment only redirects so no placeholder can ship.
// `redirect` (next/navigation) throws NEXT_REDIRECT and terminates rendering.
export default function IsribA15Page() {
  redirect("/products/isrib-a15");
}

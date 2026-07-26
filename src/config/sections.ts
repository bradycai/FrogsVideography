/**
 * ============================================================================
 *  SECTION TOGGLES
 * ----------------------------------------------------------------------------
 *  Flip any value to `false` to hide that section WITHOUT deleting its code.
 *  index.astro reads these flags and only renders sections that are `true`.
 *
 *  The keys the brief asked for are marked below. Some are grouped:
 *    • "testimonials" social proof lives in `trust`
 *    • "process"  → `process`   • "portfolio" → `portfolio`
 * ============================================================================
 */
export const SECTIONS = {
  loader: true, // intro loading animation
  nav: true, // top navigation (keep on)
  hero: true, // ← hero
  marquee: true, // scrolling services strip
  trust: true, // ← testimonials / social proof (stats + Google reviews)
  why: true, // "why storytelling matters"
  unique: true, // "what makes us unique"
  process: true, // ← process (timeline)
  services: true, // ← services
  portfolio: true, // ← portfolio (video grid)
  reels: true, // "our processes by craft" carousel
  about: true, // ← about (David & Mike)
  roi: true, // ROI calculator
  contact: true, // ← contact
  finalCta: true, // closing call-to-action band
  footer: true, // ← footer
  stickyCta: true, // sticky mobile "Book" bar
} as const;

export type SectionKey = keyof typeof SECTIONS;

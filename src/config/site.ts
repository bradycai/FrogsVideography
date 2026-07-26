/**
 * ============================================================================
 *  FROGS VIDEOGRAPHY — CENTRAL CONTENT & BUSINESS CONFIG
 * ----------------------------------------------------------------------------
 *  This is the ONE place to edit text, links, business info, portfolio items,
 *  and images. Components read from here — they contain layout, not content.
 *
 *  To toggle whole sections on/off, edit `src/config/sections.ts` instead.
 * ============================================================================
 */

/* ----------------------------- Business info ----------------------------- */
export const BUSINESS = {
  name: 'Frogs Videography',
  /** Short label used in copyright, schema, etc. */
  legalName: 'Frogs Videography',
  tagline: 'We help businesses and nonprofits achieve their goals, with video.',
  areaServed: ['Massachusetts', 'Rhode Island'],
  citiesServed: ['Providence', 'Boston', 'New Bedford', 'Newport'],
  founders: ['David', 'Mike'],

  /**
   * CONTACT DETAILS — fill these in with the real business email / phone.
   * Leave a field as an empty string ('') and the Contact section will hide it.
   * Do NOT invent values; the Contact section shows Calendly as the primary CTA
   * and only surfaces email/phone once real values are provided here.
   */
  email: '', // e.g. 'hello@frogsvideography.com'  ← ADD REAL EMAIL
  phone: '', // e.g. '+1 (401) 555-0100'           ← ADD REAL PHONE

  rating: { value: '5.0', count: '150' },
} as const;

/* --------------------------------- Links --------------------------------- */
export const LINKS = {
  /** Primary call-to-action used by every "Book" button. */
  calendly: 'https://calendly.com/frogsvideography/michael-from-frogs',
  googleReviews:
    'https://www.google.com/search?sca_esv=44785faec4b38403&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzfS0th2o6LdzWqHsE6bEnpGf_gbcQo_066Zu92RTzOVmqb1YhNLm7Q6lGhqWMhmiLWFHI7-QdXEVP4XjoQCqmazaqxqM-nlhn86wtOKEYOW9vkY5qQ%3D%3D&q=Frogs+Videography+Reviews',
  /** Social profiles — add URLs to show icons in the footer (empty = hidden). */
  social: {
    instagram: '',
    youtube: '',
    facebook: '',
    linkedin: '',
  },
} as const;

/* ---------------------------------- SEO ---------------------------------- */
export const SITE = {
  /** Production URL — powers canonical links + sitemap. */
  url: 'https://www.frogsvideography.com',
  title: 'Frogs Videography — Massachusetts & Rhode Island Video Production Company',
  description:
    'Frogs Videography is a Massachusetts & Rhode Island based production company helping businesses and nonprofits achieve their goals with video — mini documentaries, event recaps, commercials, fundraising and social media videos.',
  keywords: [
    'Business Videography Massachusetts',
    'Corporate Video Production Rhode Island',
    'Nonprofit Video Production',
    'Brand Storytelling Agency',
    'Business Documentary Videos',
    'Corporate Videographer Massachusetts',
    'Commercial Video Production',
    'Fundraising Video Production',
    'Event Videography',
    'Documentary Filmmaker Massachusetts',
  ],
  /** Social share image. Swap for a branded 1200×630 card in /public/images. */
  ogImage: 'https://img.youtube.com/vi/WffwKWtDlcw/maxresdefault.jpg',
  ogImageWidth: 1280,
  ogImageHeight: 720,
  themeColor: '#000000',
  locale: 'en_US',
} as const;

/* --------------------------------- Nav ----------------------------------- */
export const NAV_LINKS = [
  { label: 'Portfolio', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'About', href: '#about' },
  { label: 'ROI', href: '#calculator' },
] as const;

/* --------------------------------- Hero ---------------------------------- */
export const HERO = {
  eyebrow: 'Massachusetts & Rhode Island based Production Company',
  /** `accent` renders in green after the lead text. */
  headingLead: 'We help businesses and nonprofits',
  headingAccent: 'achieve their goals, with video.',
  sub: 'Every organization has a story to tell. Let’s work together to tell yours.',
  /** YouTube video ID used for the muted background film. */
  backgroundVideoId: 'WffwKWtDlcw',
  primaryCta: { label: 'Book Your Consultation', href: LINKS.calendly },
  secondaryCta: { label: 'Watch Our Work', href: '#work' },
  stats: [
    { to: 250, suffix: '+', label: 'Projects Delivered' },
    { to: 200, suffix: '+', label: 'Brands & Nonprofits' },
  ],
} as const;

/* -------------------------------- Marquee -------------------------------- */
export const MARQUEE_ITEMS = [
  'Event Recaps',
  'Mini Documentaries',
  'Commercials',
  'Social Media Videos',
  'Drone Storytelling',
  'Fundraising Videos',
  'Corporate Storytelling',
  'Live Performances',
] as const;

/* ---------------------- Trust / social proof ----------------------------- */
export const TRUST = {
  eyebrow: 'Trusted Storytelling For Your Brand',
  heading: 'Hear what our clients are saying about our work.',
  stats: [
    { to: 250, suffix: '+', label: 'Video Projects Completed', accent: false },
    { to: 200, suffix: '+', label: 'Businesses and Nonprofits Served', accent: true },
    { to: 150, suffix: '+', label: 'Google Reviews', accent: false },
    { to: 5, suffix: '.0★', label: 'Average Google Review Rating', accent: true },
  ],
  ratingBadge: '5.0 on Google Reviews',
  reviewsCtaLabel: 'Read our Google Reviews',
} as const;

/* ------------------------- Why storytelling ------------------------------ */
export const WHY = {
  eyebrow: 'Intentional storytelling matters',
  quoteLead: 'The most impactful stories',
  quoteAccent: 'inspire feelings.',
  body: 'We showcase what your organization does, in your most authentic light, to amplify your message and achieve your goals.',
  rows: [
    {
      k: '22×',
      title: 'More memorable',
      body: 'Visual stories are remembered up to 22 times more than facts alone. Your mission deserves to stick.',
    },
    {
      k: '80%',
      title: 'More trust',
      body: 'Audiences trust authentic, real-people storytelling far more than polished advertising.',
    },
    {
      k: '∞',
      title: 'Lasting value',
      body: 'One well-made video works for years across your online presence and in pitches.',
    },
  ],
} as const;

/* ------------------------- What makes us unique -------------------------- */
export const UNIQUE = {
  eyebrow: 'What makes us unique',
  heading: 'Real moments, no rehearsal needed.',
  body: 'No script needed. Through conversational interviews with real people from your organization we capture the authentic soundbites to tell emotional stories.',
  cards: [
    {
      icon: '◈',
      title: 'Real Strategy',
      body: 'We work with you throughout the process to align our videos to your brand and goals.',
    },
    {
      icon: '◎',
      title: 'Real People',
      body: 'We sit down with your key players and important stakeholders to learn how they feel about your organization.',
    },
    {
      icon: '◭',
      title: 'Real Craft',
      body: 'We invest in our equipment so that your stories look and sound as powerful as they are.',
    },
  ],
} as const;

/* -------------------------------- Process -------------------------------- */
export const PROCESS = {
  eyebrow: 'Our process',
  heading: 'Collaborating every step of the way.',
  body: 'From start to finish, we make it easy for you to bring your vision to life.',
  cta: { label: 'Start with a Consultation', href: LINKS.calendly },
  steps: [
    {
      n: '01',
      title: 'Consultation',
      body: 'We learn how your organization operates, and what your intentions for this project are.',
    },
    {
      n: '02',
      title: 'Pre-Production',
      body: 'We sync on shoot dates, locations, and all other logistics.',
    },
    {
      n: '03',
      title: 'Production',
      body: 'This is where we capture all the footage and interviews needed for the project.',
    },
    {
      n: '04',
      title: 'Post-Production',
      body: "The magic happens at this step. Give us some time and we’ll have your video ready for final feedback.",
    },
    {
      n: '05',
      title: 'Delivery',
      body: 'We send you the highest quality versions of your videos that are ready to download and post.',
    },
  ],
} as const;

/* -------------------------------- Services ------------------------------- */
export const SERVICES = {
  eyebrow: 'What we create',
  headingLead: 'We don’t sell videos. We deliver',
  headingAccent: 'outcomes.',
  body: 'Every engagement is built around what you actually need to happen — more giving, more trust, more customers, more attention.',
  cta: { label: 'Find the right video for your goal', href: LINKS.calendly },
  items: [
    {
      title: 'Mini Documentary Experience',
      body: 'Turn your mission into a story people feel. Perfect for the “About” film that finally makes visitors believe in what you do.',
    },
    {
      title: 'Fundraising Films',
      body: 'Donor-ready films engineered to move people to give — for galas, grant proposals, and year-end campaigns that need to raise more.',
    },
    {
      title: 'Corporate Storytelling',
      body: 'Show customers who you really are. Brand films and company stories that build authority and turn interest into trust.',
    },
    {
      title: 'Commercial Campaigns',
      body: 'Cinematic ads and product launches that stop the scroll and sell — without ever feeling like a hard sell.',
    },
    {
      title: 'Event Recap Films',
      body: 'Months of planning shouldn’t vanish in a day. Fast-turnaround recap & highlight films that keep your event working for you.',
    },
    {
      title: 'Drone Storytelling',
      body: 'Scale, scope, and awe from above. Aerial storytelling that gives your brand a cinematic sense of place.',
    },
    {
      title: 'Live Performance Films',
      body: 'Multi-cam music and live event films that capture the energy of the room and let it live forever online.',
    },
    {
      title: 'Social Media Content',
      body: 'Scroll-stopping short-form videos that keep your brand consistent, current, and in front of the people who matter.',
    },
  ],
} as const;

/* ------------------------------- Portfolio ------------------------------- */
/** Each item is a YouTube video. `id` is the YouTube video ID. */
export const PORTFOLIO = {
  eyebrow: 'Our portfolio',
  heading: 'Some of our favorite stories.',
  items: [
    { id: 'anmGUpyPsws', tag: 'Storytelling', title: 'Senesco Marine' },
    { id: 'WcSQNL7_dsQ', tag: 'Fundraising', title: 'Pace Fundraising' },
    { id: 'uxVcD9TUSq0', tag: 'Mini Documentary', title: 'Elevate Counseling' },
    { id: '6U8JEl_3UpA', tag: 'Fundraising', title: 'Co-op Fundraising' },
    { id: 'BL6s1ddtdjE', tag: 'Event Recap', title: 'Pell Bridge Run' },
    { id: 'Km-eDLctm34', tag: 'Event Recap', title: 'RIMA 250 Breakfast' },
    { id: 'fLNQ-nqZJEs', tag: 'Commercial', title: 'Rhody Rug' },
    { id: 'cXcmqF9cPSY', tag: 'Mini Documentary', title: 'Leadership SouthCoast' },
    { id: 'dGoCmecmxiM', tag: 'Commercial', title: 'Whaler’s Cove' },
    { id: 'zXmtsHj5FyQ', tag: 'Testimonial', title: 'Couto Testimonial' },
    { id: 'U27T5QPgeJE', tag: 'Concert', title: 'Mojofest 2026' },
    { id: 'tCTPzHxD_Ug', tag: 'Mini Documentary', title: 'Beat the Streets' },
    { id: 'tBdqETlkQTo', tag: 'Mini Documentary', title: 'Elves for Elders' },
    { id: 'kEXiCZielyw', tag: 'Commercial', title: 'Dynamic Performance & Rehab' },
  ],
} as const;

/* -------------------------- Reels (by craft) ----------------------------- */
export const REELS = {
  eyebrow: 'Our processes',
  heading: 'Video projects can take on many shapes.',
  hint: 'Drag / swipe →',
  items: [
    { id: 'dMAm1mILnuI', tag: 'Reel', title: 'Events' },
    { id: 'CYcDZoY3uzA', tag: 'Reel', title: 'Mini Documentaries' },
    { id: 'tHDFkFOulw4', tag: 'Reel', title: 'Commercials' },
    { id: 'BwdUSL_1x2w', tag: 'Reel', title: 'Live Performances' },
    { id: 'Y9AkxgHTuqo', tag: 'Reel', title: 'Drone Services' },
  ],
} as const;

/* --------------------------------- About --------------------------------- */
export const ABOUT = {
  eyebrow: 'About us',
  paragraphs: [
    'We are artists, filmmakers, best friends, and now, business partners. Together, we built Frogs to help businesses and nonprofits tell their stories. That might be how you started, the services you provide, documenting an event, or an entirely different story. Whatever it is you are looking for, we can help.',
    'Working with us is a creative experience focused on authenticity. We believe that we are not selling our clients a product, we believe we are working together with you to create art. Get in touch and let’s create.',
  ],
  signature: '— David & Mike',
  // Filenames describe the actual photo so the mapping is unambiguous:
  //   about-marina.jpg          = the shipyard / boats & cranes photo
  //   about-yellow-building.jpg = the peace-sign / yellow-building photo
  portraits: [
    { src: '/images/about-marina.jpg', name: 'David', role: 'Co-Founder', alt: 'David, co-founder of Frogs Videography' },
    { src: '/images/about-yellow-building.jpg', name: 'Mike', role: 'Co-Founder', alt: 'Mike, co-founder of Frogs Videography' },
  ],
} as const;

/* ---------------------------------- ROI ---------------------------------- */
export const ROI = {
  eyebrow: 'Estimate your ROI',
  heading: 'What could one great video do for you?',
  body: 'While we don’t guarantee results, this can give you an idea of what potential you may be opening up with a video project.',
  cta: { label: 'Turn this into a plan', href: LINKS.calendly },
} as const;

/* -------------------------------- Contact -------------------------------- */
export const CONTACT = {
  eyebrow: 'Get in touch',
  heading: 'Let’s tell your story.',
  body: 'Tell us a little about your organization and what you’re hoping to create. We’ll get back to you within a couple of business days — or book a consultation and skip the wait.',
  primaryCta: { label: 'Book Your Consultation', href: LINKS.calendly },
} as const;

/* ------------------------------- Final CTA ------------------------------- */
export const FINAL_CTA = {
  eyebrow: 'Ready to tell your story?',
  heading: 'Storytelling is one of the best ways to achieve goals.',
  body: 'Let’s collaborate to tell yours. Book a 30 minute consultation and let’s create.',
  cta: { label: 'Book Your Consultation', href: LINKS.calendly },
} as const;

/* --------------------------------- Footer -------------------------------- */
export const FOOTER = {
  blurb: 'Helping businesses and nonprofits achieve their goals with the help of video.',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'Our Portfolio', href: '#work' },
        { label: 'Services', href: '#services' },
        { label: 'Our Process', href: '#process' },
        { label: 'About Us', href: '#about' },
        { label: 'Estimate ROI', href: '#calculator' },
      ],
    },
    {
      title: 'What we create',
      links: [
        { label: 'Mini Documentaries', href: '#services' },
        { label: 'Event Recaps', href: '#services' },
        { label: 'Commercials', href: '#services' },
        { label: 'Fundraising Videos', href: '#services' },
        { label: 'Social Media Videos', href: '#services' },
      ],
    },
    {
      title: 'Production Company',
      links: [
        { label: 'Massachusetts & Rhode Island', href: '#top' },
        { label: 'Serving all of New England', href: '#top' },
        { label: 'Book a Consultation →', href: LINKS.calendly, accent: true },
      ],
    },
  ],
} as const;

/**
 * Central color constants. Use these instead of hardcoded hex/rgba across the app.
 * For theme-aware colors (light/dark), pass isDark and use the appropriate key.
 *
 * App palette: light = soft off-white BG + slate text; dark = deep slate BG + soft white text.
 */

// --- Semantic (theme-aware: use with isDark)
// Light: soft off-white background, muted slate text (fits BG, not black). Dark: deep slate background, soft white text.
export const semantic = {
  text: (isDark: boolean) => (isDark ? '#F1F5F9' : '#475569'),
  /** Between text and textSecondary – e.g. Target date / Open-ended in list items */
  textSubtitle: (isDark: boolean) => (isDark ? '#CBD5E1' : '#5a6574'),
  textSecondary: (isDark: boolean) => (isDark ? '#94A3B8' : '#64748B'),
  background: (isDark: boolean) => (isDark ? '#0F172A' : '#F8FAFC'),
  surface: (isDark: boolean) => (isDark ? '#1E293B' : '#FFFFFF'),
  surfaceSecondary: (isDark: boolean) => (isDark ? '#334155' : '#F1F5F9'),
  border: (isDark: boolean) => (isDark ? '#475569' : '#E2E8F0'),
  placeholder: (isDark: boolean) => '#94A3B8',
} as const;

// --- Status (badge/list)
export const status = {
  active: '#22C55E',
  done: '#3B82F6',
  expired: '#EF4444',
  neutral: '#64748B',
} as const;

// --- Urgency (active commitments: days until next reminder/target)
// ≤3 days: dark orange; 4–29 days: lighter orange; ≥30 days: green
export const urgency = {
  /** 3 days or less – most urgent */
  urgent: '#C2410C',
  /** 4 to 29 days – slightly lighter orange */
  soon: '#FB923C',
  /** 30 days and more (and open-ended) */
  ok: '#22C55E',
} as const;

// --- Brand & actions (fits slate palette)
export const brand = {
  primary: '#3B82F6',
  link: '#3B82F6',
} as const;

// --- Buttons / UI
export const button = {
  primary: '#3B82F6',
  secondaryBg: (isDark: boolean) => (isDark ? '#334155' : '#E2E8F0'),
  secondaryText: (isDark: boolean) => (isDark ? '#F1F5F9' : '#475569'),
  danger: '#EF4444',
  disabledBg: (isDark: boolean) => (isDark ? '#334155' : '#CBD5E1'),
  disabledText: (isDark: boolean) => (isDark ? '#64748B' : '#94A3B8'),
} as const;

// --- Overlays & sheets
export const overlay = {
  backdrop: 'rgba(15, 23, 42, 0.6)',
  handle: '#94A3B8',
} as const;

// --- Misc
export const misc = {
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  shadow: '#0F172A',
  dotInactive: '#94A3B8',
} as const;

// --- Shadow (cross-platform: use for ListItem, cards, etc.)
export const shadow = {
  /** iOS shadow color */
  color: '#0F172A',
  offset: { width: 0, height: 2 },
  opacity: 0.08,
  radius: 4,
  /** Android elevation (same visual intent) */
  elevation: 3,
} as const;

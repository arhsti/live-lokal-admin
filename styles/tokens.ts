export const spacing = {
  card: "p-5",
  section: "space-y-6",
  sectionLoose: "space-y-8",
  sectionXL: "space-y-10",
  sectionXXL: "space-y-12",
  sectionMega: "space-y-14",
  field: "space-y-2",
  inline: "gap-3",
  inlineTight: "gap-2",
  stack: "space-y-4",
  stackTight: "space-y-3",
  gap6: "gap-6",
};

export const radius = {
  card: "rounded-xl",
  button: "rounded-lg",
  input: "rounded-md",
};

export const typography = {
  pageTitle: "text-3xl font-extrabold tracking-tight",
  lead: "text-base text-gray-600",
  subtitle: "text-sm text-gray-600",
  cardTitle: "text-2xl font-bold",
  label: "text-[11px] font-semibold uppercase tracking-wider text-gray-500",
  body: "text-sm",
  bodyStrong: "text-sm text-gray-700",
  mono: "text-sm font-mono text-gray-700",
};

export const status = {
  error: "text-sm text-red-500",
  success: "text-sm text-green-600",
  muted: "text-sm text-gray-600",
};

export const sizes = {
  buttonHeight: "h-9",
  inputHeight: "h-9",
  inputNarrow: "w-20",
  textareaMinHeight: "min-h-[60px]",
};

export const layout = {
  row: "flex items-center",
  rowBetween: "flex items-center justify-between",
  rowWrap: "flex flex-wrap items-center",
  rowBetweenWrap: "flex flex-wrap items-center justify-between",
  col: "flex flex-col",
  center: "items-center justify-center",
  inline: "inline-flex items-center",
  flex1: "flex-1",
  hidden: "hidden",
  mtAuto: "mt-auto",
  overflowXAuto: "overflow-x-auto",
  maxWlg: "max-w-lg",
  wFull: "w-full",
};

export const container = {
  base: "mx-auto w-full max-w-[1100px] px-9",
  wide: "mx-auto w-full max-w-[1400px] px-9",
};

export const header = {
  wrapper: "w-full bg-white/80 border-b border-gray-200 backdrop-blur",
  inner: "flex items-center justify-between py-4",
  brand: "text-gray-900 font-semibold tracking-tight no-underline",
  title: "text-sm font-medium text-gray-700",
  menuButton: "text-xl text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-200/60 transition",
  menu: "absolute right-0 mt-3 w-48 rounded-xl border border-gray-200 bg-white shadow-soft p-2",
  menuItem: "block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg no-underline",
  menuItemButton: "block w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg",
};

export const brand = {
  badge: "mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white font-semibold",
};

export const auth = {
  wrapper: "relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gray-50 px-6 py-12",
  glowTop: "absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-gray-900/5 to-transparent",
  orbRight: "absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gray-300/40 blur-3xl",
  orbLeft: "absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-gray-200/40 blur-3xl",
  card: "w-full max-w-[400px] bg-white/90 backdrop-blur-sm",
  cardContent: "p-6",
};

export const tooltip = {
  wrapper: "relative group inline-flex items-center",
  bubble:
    "pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-[320px] -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-normal break-words",
};

export const grid = {
  image: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  dashboard: "grid gap-6 md:grid-cols-2",
  events: "grid gap-6 md:grid-cols-2 xl:grid-cols-3",
};

export const icon = {
  md: "h-5 w-5 text-gray-600",
  sm: "h-4 w-4",
  smMuted: "h-4 w-4 text-gray-400",
  lg: "h-6 w-6",
};

export const effects = {
  cardHover: "transition-transform hover:-translate-y-1 hover:border-gray-300",
};

export const modal = {
  closeButton:
    "absolute right-4 top-4 h-8 w-8 p-0 rounded-full bg-black/60 text-white/90 hover:text-white border-transparent",
  imageBase: "h-full w-full",
  gradient: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20",
  labelWrap: "absolute bottom-6 left-6 text-white",
  labelText: "text-xs font-semibold uppercase tracking-wide",
};

export const preview = {
  frame: "relative bg-gray-100 h-[520px]",
  image: "h-full w-full object-contain block",
  overlay: "absolute inset-0 h-full w-full object-contain pointer-events-none",
};

export const passwordField = {
  input: "w-full pr-16 box-border",
  toggle: "absolute right-3 top-1/2 -translate-y-1/2",
};

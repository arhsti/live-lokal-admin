export const spacing = {
  card: "p-5",
  cardLarge: "p-8",
  section: "space-y-8",
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
  pageTitle: "text-3xl font-heading font-bold tracking-tight",
  lead: "text-lg text-[hsl(220_10%_55%)]",
  subtitle: "text-sm text-[hsl(220_10%_55%)]",
  cardTitle: "text-2xl font-heading font-bold tracking-tight",
  label: "text-[10px] font-bold uppercase tracking-wider text-[hsl(220_10%_55%)]",
  formLabel: "text-xs font-semibold uppercase tracking-wider text-[hsl(220_10%_55%)]",
  body: "text-sm",
  bodyStrong: "text-sm text-[hsl(220_25%_15%)]",
  mono: "text-sm font-mono text-[hsl(220_25%_15%)]",
};

export const status = {
  error: "text-sm text-red-500",
  success: "text-sm text-green-600",
  muted: "text-sm text-[hsl(220_10%_55%)]",
};

export const color = {
  primaryText: "text-[hsl(220_25%_15%)]",
  mutedText: "text-[hsl(220_10%_55%)]",
  secondaryBg: "bg-[hsl(210_20%_94%)]",
  border: "border-[hsl(220_13%_91%)]",
  neutralDot: "bg-[hsl(220_10%_55%)]",
};

export const sizes = {
  buttonHeight: "h-9",
  buttonHeightSm: "h-8",
  buttonHeightLg: "h-11",
  buttonIcon: "h-10 w-10",
  inputHeight: "h-9",
  inputHeightSm: "h-8",
  inputHeightLg: "h-11",
  inputNarrow: "w-20",
  textareaMinHeight: "min-h-[60px]",
  iconButton: "h-8 w-8 p-0",
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
  textCenter: "text-center",
};

export const container = {
  base: "w-full px-6 md:px-10 lg:px-12 xl:px-16 py-8 md:py-12",
  wide: "w-full px-6 md:px-10 lg:px-12 xl:px-16 py-8 md:py-12",
  header: "w-full px-6 md:px-10 lg:px-12 xl:px-16",
};

export const header = {
  wrapper: "sticky top-0 z-50 bg-white/80 border-b border-[hsl(220_13%_91%)] backdrop-blur-md",
  inner: "flex h-16 items-center justify-between",
  brand: "text-xl font-heading font-bold tracking-tight no-underline",
  title: "text-sm font-medium text-[hsl(220_25%_15%)]",
  menuButton: "text-xl text-[hsl(220_10%_55%)] hover:text-[hsl(220_25%_15%)] p-2 rounded-lg hover:bg-[hsl(210_20%_94%)]/60 transition",
  menu: "absolute right-0 mt-3 w-48 rounded-xl border border-[hsl(220_13%_91%)] bg-white shadow-soft p-2",
  menuItem: "block px-4 py-2.5 text-sm text-[hsl(220_25%_15%)] hover:bg-[hsl(210_20%_94%)] rounded-lg no-underline",
  menuItemButton: "block w-full px-4 py-2.5 text-left text-sm text-[hsl(220_25%_15%)] hover:bg-[hsl(210_20%_94%)] rounded-lg",
};

export const brand = {
  badge:
    "mx-auto mb-4 h-12 w-12 rounded-xl bg-[hsl(220_25%_15%)] text-white flex items-center justify-center font-heading font-bold text-xl",
};

export const auth = {
  wrapper: "min-h-screen w-full flex items-center justify-center bg-[hsl(210_20%_98%)] p-4 relative overflow-hidden",
  glowTop: "absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[hsl(210_20%_94%/0.5)] to-transparent -z-10",
  orbRight: "absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[hsl(220_25%_15%/0.05)] blur-3xl",
  orbLeft: "absolute top-1/3 -left-24 w-72 h-72 rounded-full bg-[hsl(150_20%_96%/0.2)] blur-3xl",
  card: "w-full max-w-[400px] border-[hsl(220_13%_91%/0.6)] shadow-soft bg-white/90 backdrop-blur-sm",
  cardContent: "p-6",
};

export const tooltip = {
  wrapper: "relative group inline-flex items-center",
  bubble:
    "pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-[320px] -translate-x-1/2 rounded-md bg-[hsl(220_25%_15%)] px-3 py-2 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-normal break-words",
};

export const grid = {
  image: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  dashboard: "grid gap-6 md:grid-cols-2",
  events: "flex flex-col gap-6",
};

export const icon = {
  md: "h-5 w-5 text-[hsl(220_10%_55%)]",
  sm: "h-4 w-4 text-[hsl(220_10%_55%)]",
  smMuted: "h-4 w-4 text-[hsl(220_10%_55%)]",
  lg: "h-6 w-6",
};

export const effects = {
  cardHover: "transition-all duration-300 hover:shadow-lg hover:border-[hsl(220_25%_15%/0.2)]",
  imageCardHover: "transition-shadow hover:shadow-md",
};

export const filterBar = {
  wrap: "flex items-center gap-2 bg-[hsl(210_20%_94%/0.5)] px-3 py-1 rounded-lg border border-[hsl(220_13%_91%/0.5)]",
  label: "text-sm font-medium text-[hsl(220_10%_55%)] whitespace-nowrap",
};

export const imageCard = {
  label: "text-[10px] font-bold text-[hsl(220_10%_55%)] uppercase tracking-wider",
  textarea:
    "min-h-[50px] text-xs bg-[hsl(210_20%_94%/0.3)] border-transparent focus:bg-white focus:border-[hsl(220_25%_15%/0.1)] transition-all resize-none",
  input:
    "h-8 text-xs bg-[hsl(210_20%_94%/0.3)] border-transparent focus:bg-white focus:border-[hsl(220_25%_15%/0.1)] transition-all",
  select:
    "h-8 text-xs bg-[hsl(210_20%_94%/0.3)] border-transparent focus:bg-white focus:border-[hsl(220_25%_15%/0.1)] transition-all",
  button: "h-8 text-[11px] font-semibold uppercase tracking-tight",
  buttonOutline: "border-[hsl(220_25%_15%/0.2)] text-[hsl(220_25%_15%)] hover:bg-[hsl(220_25%_15%/0.05)]",
  imageWrap: "aspect-[4/3] relative group cursor-pointer bg-[hsl(210_20%_94%/0.2)] overflow-hidden",
};

export const modal = {
  closeButton:
    "absolute right-4 top-4 h-8 w-8 p-0 rounded-full bg-black/50 text-white/90 hover:text-white border-transparent",
  imageBase: "h-full w-full object-cover opacity-90",
  gradient: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30",
  labelWrap: "absolute inset-0 flex items-end p-8 text-white",
  labelText: "text-xs font-semibold uppercase tracking-wide",
};

export const preview = {
  frame: "relative bg-[hsl(210_20%_94%)] h-[520px]",
  image: "h-full w-full object-contain block",
  overlay: "absolute inset-0 h-full w-full object-contain pointer-events-none",
};

export const passwordField = {
  input: "w-full pr-16 box-border",
  toggle: "absolute right-3 top-1/2 -translate-y-1/2",
};

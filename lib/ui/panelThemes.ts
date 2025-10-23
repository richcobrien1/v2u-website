// lib/ui/panelThemes.ts
export const colorThemes: Record<
  string,
  { active: string; inactive: string; hover: string; ring: string }
> = {
  stats: {
    active: "bg-blue-600/80 ring-4 ring-blue-400/50",
    inactive: "bg-white/10 hover:bg-white/20 border border-white/20",
    hover: "from-blue-400/0 to-blue-400/20",
    ring: "ring-blue-400/50",
  },
  premium: {
    active: "bg-purple-600/80 ring-4 ring-purple-400/50",
    inactive: "bg-white/10 hover:bg-white/20 border border-white/20",
    hover: "from-purple-400/0 to-purple-400/20",
    ring: "ring-purple-400/50",
  },
  new: {
    active: "bg-green-600/80 ring-4 ring-green-400/50",
    inactive: "bg-white/10 hover:bg-white/20 border border-white/20",
    hover: "from-green-400/0 to-green-400/20",
    ring: "ring-green-400/50",
  },
  educate: {
    // Chartreuse is between green/yellow; Tailwind doesn’t have "chartreuse",
    // so we approximate with lime.
    active: "bg-lime-500/80 ring-4 ring-lime-300/50",
    inactive: "bg-white/10 hover:bg-white/20 border border-white/20",
    hover: "from-lime-300/0 to-lime-300/20",
    ring: "ring-lime-300/50",
  },
  reviews: {
    // Teal mapping
    active: "bg-teal-600/80 ring-4 ring-teal-400/50",
    inactive: "bg-white/10 hover:bg-white/20 border border-white/20",
    hover: "from-teal-400/0 to-teal-400/20",
    ring: "ring-teal-400/50",
  },
};

import Icon from "@/components/ui/icon";

export type TeardownMode = "halfcut" | "noskat" | "full" | "custom";

const MODE_STYLE: Record<TeardownMode, { icon: string; cls: string }> = {
  halfcut: {
    icon: "Package",
    cls: "bg-[hsl(var(--gold)/0.14)] border-[hsl(var(--gold)/0.45)] text-[hsl(var(--gold))]",
  },
  full: {
    icon: "ListChecks",
    cls: "bg-[hsl(200_70%_50%/0.14)] border-[hsl(200_70%_60%/0.45)] text-[hsl(200_75%_68%)]",
  },
  noskat: {
    icon: "CarFront",
    cls: "bg-[hsl(150_60%_45%/0.14)] border-[hsl(150_60%_55%/0.45)] text-[hsl(150_60%_62%)]",
  },
  custom: {
    icon: "Wrench",
    cls: "bg-[hsl(var(--navy)/0.1)] border-[hsl(var(--navy)/0.3)] text-[hsl(var(--navy)/0.75)]",
  },
};

interface Props {
  mode: TeardownMode;
  label: string;
  size?: "sm" | "xs";
  className?: string;
}

const TeardownModeBadge = ({ mode, label, size = "sm", className = "" }: Props) => {
  const st = MODE_STYLE[mode];
  const pad = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-['Montserrat'] font-bold uppercase tracking-wide whitespace-nowrap ${pad} ${st.cls} ${className}`}
    >
      <Icon name={st.icon} size={size === "xs" ? 11 : 12} />
      {label}
    </span>
  );
};

export default TeardownModeBadge;

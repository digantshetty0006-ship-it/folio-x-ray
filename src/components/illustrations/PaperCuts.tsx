type CutProps = { className?: string };

const common = {
  viewBox: "0 0 160 160",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
};

export function ReturnCut({ className = "" }: CutProps) {
  return (
    <svg {...common} className={className}>
      <rect x="8" y="8" width="144" height="144" stroke="currentColor" strokeWidth="1" />
      <path d="M28 116 56 88 76 101 112 50 136 64" stroke="currentColor" strokeWidth="2" />
      <path d="M112 50h24v24" stroke="currentColor" strokeWidth="2" />
      <circle cx="56" cy="88" r="4" fill="var(--accent)" />
      <circle cx="76" cy="101" r="4" fill="var(--accent)" />
      <path d="M28 134h108" stroke="currentColor" strokeOpacity=".25" />
      <path d="M28 28v106" stroke="currentColor" strokeOpacity=".25" />
    </svg>
  );
}

export function OverlapCut({ className = "" }: CutProps) {
  return (
    <svg {...common} className={className}>
      <rect x="8" y="8" width="144" height="144" stroke="currentColor" strokeWidth="1" />
      <circle cx="64" cy="78" r="39" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="97" cy="78" r="39" fill="var(--accent)" fillOpacity=".18" stroke="var(--accent)" strokeWidth="1.4" />
      <path d="M80.5 48a39 39 0 0 1 0 60 39 39 0 0 1 0-60Z" fill="var(--accent)" fillOpacity=".22" />
      <path d="M31 132h98" stroke="currentColor" strokeOpacity=".25" />
    </svg>
  );
}

export function CostCut({ className = "" }: CutProps) {
  return (
    <svg {...common} className={className}>
      <rect x="8" y="8" width="144" height="144" stroke="currentColor" strokeWidth="1" />
      <path d="M37 120V82h22v38M73 120V58h22v62M109 120V36h22v84" stroke="currentColor" strokeWidth="1.5" />
      <path d="M37 82h22M73 58h22M109 36h22" stroke="var(--accent)" strokeWidth="3" />
      <path d="M26 120h114" stroke="currentColor" strokeWidth="1.4" />
      <path d="M28 32h48" stroke="currentColor" strokeOpacity=".25" />
    </svg>
  );
}

export function FutureCut({ className = "" }: CutProps) {
  return (
    <svg {...common} className={className}>
      <rect x="8" y="8" width="144" height="144" stroke="currentColor" strokeWidth="1" />
      <path d="M23 128c19-8 23-29 33-32 11-3 14 10 23 4 10-7 8-30 19-35 13-6 18 9 30 3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M23 128c24-19 25-45 39-53 12-7 17 13 29 6 14-9 13-33 27-39" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M23 128c16 0 27-15 41-20 16-5 22 9 35 2 12-6 19-20 34-25" stroke="currentColor" strokeWidth="1.5" strokeOpacity=".4" />
      <circle cx="120" cy="42" r="4" fill="var(--accent)" />
      <path d="M24 134h114" stroke="currentColor" strokeOpacity=".25" />
    </svg>
  );
}

export function ShieldCut({ className = "" }: CutProps) {
  return (
    <svg {...common} className={className}>
      <path
        d="M80 18 127 35v42c0 32-20 53-47 65-27-12-47-33-47-65V35L80 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m58 81 15 15 30-34" stroke="var(--accent)" strokeWidth="2.4" />
      <path d="M80 18v124" stroke="currentColor" strokeOpacity=".12" strokeDasharray="3 5" />
    </svg>
  );
}

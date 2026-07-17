"use client";

import { buildSmoothPath, donutArc } from "@/lib/chart";

export function AreaSpark({
  values,
  color = "#14b8a6",
  height = 56,
  className = "",
}: {
  values: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const width = 160;
  const path = buildSmoothPath(values, height, width);
  const area = `${path} L${width},${height} L0,${height} Z`;
  const id = `spark-${color.replace("#", "")}-${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" />
      {values.map((value, index) => {
        const max = Math.max(...values, 1);
        const step = width / (values.length - 1 || 1);
        const x = index * step;
        const y = height - (value / max) * (height - 12) - 4;
        return <circle key={index} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

export function DonutChart({
  percent,
  label,
  color = "#14b8a6",
  size = 96,
}: {
  percent: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const arc = donutArc(percent, 34, 48, 48);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 96 96" className="h-full w-full">
        <circle
          cx="48"
          cy="48"
          r="34"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="10"
        />
        {arc ? (
          <path
            d={arc}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-lg font-bold text-foreground">{Math.round(percent)}%</p>
        <p className="text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

export function WaveBars({
  values,
  colors = ["#14b8a6", "#3b82f6", "#f59e0b", "#22c55e"],
  labels,
}: {
  values: number[];
  colors?: string[];
  labels?: string[];
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-28 items-end gap-2">
      {values.map((value, index) => {
        const h = Math.max(12, (value / max) * 100);
        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-xl transition-all"
              style={{
                height: `${h}%`,
                background: `linear-gradient(180deg, ${colors[index % colors.length]}, transparent)`,
                minHeight: 12,
              }}
            />
            <span className="text-[9px] text-muted">
              {labels?.[index] ?? `D${index + 1}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Concentric progress rings for multiple metrics */
export function OrbitRings({
  rings,
  size = 160,
}: {
  rings: { label: string; percent: number; color: string }[];
  size?: number;
}) {
  const cx = 80;
  const cy = 80;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        {rings.map((ring, i) => {
          const r = 68 - i * 16;
          const c = 2 * Math.PI * r;
          const pct = Math.max(0, Math.min(100, ring.percent)) / 100;
          return (
            <g key={ring.label}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="8"
              />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={ring.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${c * pct} ${c}`}
                className="transition-all duration-700"
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold text-foreground">
          {Math.round(rings[0]?.percent ?? 0)}%
        </p>
        <p className="text-[10px] text-muted">{rings[0]?.label ?? ""}</p>
      </div>
    </div>
  );
}

/** Arc gauge with needle */
export function ArcGauge({
  percent,
  label,
  color = "#8b5cf6",
}: {
  percent: number;
  label: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, percent));
  const angle = -90 + (pct / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const nx = 80 + 52 * Math.cos(rad);
  const ny = 80 + 52 * Math.sin(rad);

  return (
    <div className="relative mx-auto w-full max-w-[200px]">
      <svg viewBox="0 0 160 100" className="w-full">
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 80 A 60 60 0 0 1 140 80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 188} 188`}
        />
        <line
          x1="80"
          y1="80"
          x2={nx}
          y2={ny}
          stroke="var(--foreground)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="80" cy="80" r="5" fill={color} />
      </svg>
      <div className="-mt-2 text-center">
        <p className="text-2xl font-bold text-foreground">{Math.round(pct)}</p>
        <p className="text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

/** Activity heat strip */
export function HeatStrip({
  values,
  labels,
}: {
  values: number[];
  labels?: string[];
}) {
  const max = Math.max(...values, 1);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {values.map((value, i) => {
        const intensity = value / max;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className="aspect-square w-full rounded-xl transition"
              style={{
                background: `color-mix(in srgb, #8b5cf6 ${Math.round(18 + intensity * 82)}%, transparent)`,
                boxShadow:
                  intensity > 0.5
                    ? `0 0 16px color-mix(in srgb, #8b5cf6 ${Math.round(intensity * 50)}%, transparent)`
                    : undefined,
              }}
              title={`${value}`}
            />
            <span className="text-[9px] text-muted">
              {labels?.[i] ?? ["M", "T", "W", "T", "F", "S", "S"][i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Polar / radial bars around a circle */
export function PolarBars({
  values,
  colors = ["#8b5cf6", "#38bdf8", "#22c55e", "#f59e0b", "#f472b6", "#818cf8", "#14b8a6"],
}: {
  values: number[];
  colors?: string[];
}) {
  const max = Math.max(...values, 1);
  const n = values.length || 1;
  const cx = 80;
  const cy = 80;

  return (
    <svg viewBox="0 0 160 160" className="mx-auto h-40 w-40">
      <circle
        cx={cx}
        cy={cy}
        r="18"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.12)"
      />
      {values.map((value, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        const len = 22 + (value / max) * 42;
        const x2 = cx + len * Math.cos(angle);
        const y2 = cy + len * Math.sin(angle);
        const x1 = cx + 22 * Math.cos(angle);
        const y1 = cy + 22 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={colors[i % colors.length]}
            strokeWidth="8"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** Multi-segment pie for category breakdown */
export function CategoryPie({
  segments,
  size = 140,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  if (total <= 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-white/5 text-xs text-muted"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const cx = 50;
  const cy = 50;
  const r = 38;
  let angle = -Math.PI / 2;
  const slices = segments.map((seg) => {
    const sliceAngle = (seg.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sliceAngle;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sliceAngle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    const percent = Math.round((seg.value / total) * 100);
    return { ...seg, path, percent };
  });

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {slices.map((slice) => (
            <path
              key={slice.label}
              d={slice.path}
              fill={slice.color}
              stroke="var(--background)"
              strokeWidth="1.5"
            />
          ))}
          <circle cx={cx} cy={cy} r="22" fill="var(--background)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-foreground">
            {segments.length}
          </p>
          <p className="text-[9px] text-muted">categories</p>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted">
              {slice.label}
            </span>
            <span className="font-semibold text-foreground">
              {slice.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal stacked status bar */
export function StatusRail({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-white/10">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="h-full transition-all"
            style={{
              width: `${(seg.value / total) * 100}%`,
              background: seg.color,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: seg.color }}
            />
            <span className="text-muted">{seg.label}</span>
            <span className="font-semibold text-foreground">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Bubble cluster sized by value */
export function BubbleCluster({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="flex flex-wrap items-end justify-center gap-3 py-2">
      {items.map((item) => {
        const size = 36 + (item.value / max) * 48;
        return (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <div
              className="flex items-center justify-center rounded-full font-bold text-white shadow-lg"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 30%, #fff6, transparent 50%), ${item.color}`,
                fontSize: size > 60 ? 14 : 11,
              }}
            >
              {item.value}
            </div>
            <span className="text-[10px] text-muted">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

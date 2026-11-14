'use client';

import { useMemo } from 'react';

// ==============================================================
// Pseudo-3D occlusal dental arch ("open mouth" view).
// Upper arch is drawn ∩-shaped, lower arch ∪-shaped, incisors meet
// near the centre line. Viewer's left = patient's right (FDI 1x / 4x).
// ==============================================================

export interface ToothPaint {
  color: string; // base colour of the crown
  light: string; // highlight colour (gradient centre)
  dark: string; // side wall colour
  missing?: boolean;
}

interface ToothArchProps {
  paintFor: (fdi: number) => ToothPaint;
  selected: number | null;
  onSelect: (fdi: number) => void;
  tilted?: boolean;
}

// Mesio-distal width and bucco-lingual depth in mm (average anatomical values)
const UPPER_W: Record<number, number> = { 1: 8.6, 2: 6.6, 3: 7.6, 4: 7.0, 5: 6.6, 6: 10.2, 7: 9.2, 8: 8.6 };
const UPPER_D: Record<number, number> = { 1: 7.0, 2: 6.0, 3: 8.0, 4: 9.0, 5: 9.0, 6: 11.0, 7: 11.0, 8: 10.0 };
const LOWER_W: Record<number, number> = { 1: 5.3, 2: 5.9, 3: 6.9, 4: 7.0, 5: 7.1, 6: 11.0, 7: 10.3, 8: 9.8 };
const LOWER_D: Record<number, number> = { 1: 5.8, 2: 6.2, 3: 7.5, 4: 7.7, 5: 8.2, 6: 10.5, 7: 10.2, 8: 9.8 };

const SCALE = 4.4; // px per mm
const GAP = 1.6; // px between neighbouring teeth
const CX = 0;
const ARCH_SEPARATION = 44; // distance of each incisal line from the centre line
const LIFT = 4.5; // extrusion height (px) – gives the "3D" feeling

type Kind = 'incisor' | 'canine' | 'premolar' | 'molar';
function kindOf(fdi: number): Kind {
  const p = fdi % 10;
  if (p <= 2) return 'incisor';
  if (p === 3) return 'canine';
  if (p <= 5) return 'premolar';
  return 'molar';
}

const SHAPE: Record<Kind, { n: number; taper: number }> = {
  incisor: { n: 2.5, taper: 0.42 },
  canine: { n: 1.85, taper: 0.22 },
  premolar: { n: 2.3, taper: 0.08 },
  molar: { n: 3.2, taper: 0.1 },
};

/** Superellipse outline with lingual taper. Local coords: -y = buccal (outside). */
function crownPath(kind: Kind, w: number, d: number): string {
  const { n, taper } = SHAPE[kind];
  const a = w / 2;
  const b = d / 2;
  const pts: string[] = [];
  const steps = 56;
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const y = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    const f = 1 - taper * ((y / b + 1) / 2);
    const x = a * f * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

function fissurePath(kind: Kind, w: number, d: number): string {
  switch (kind) {
    case 'molar':
      return [
        `M${-w * 0.3},${-d * 0.02} L${-w * 0.1},${d * 0.04} L${w * 0.1},${-d * 0.02} L${w * 0.3},${d * 0.03}`,
        `M${-w * 0.1},${d * 0.04} L${-w * 0.14},${-d * 0.3}`,
        `M${-w * 0.1},${d * 0.04} L${-w * 0.06},${d * 0.3}`,
        `M${w * 0.1},${-d * 0.02} L${w * 0.14},${-d * 0.3}`,
        `M${w * 0.1},${-d * 0.02} L${w * 0.08},${d * 0.28}`,
      ].join(' ');
    case 'premolar':
      return `M${-w * 0.28},${d * 0.02} Q0,${d * 0.12} ${w * 0.28},${d * 0.02}`;
    case 'canine':
      return `M${-w * 0.22},${d * 0.05} L0,${-d * 0.12} L${w * 0.22},${d * 0.05}`;
    default:
      return `M${-w * 0.36},${-d * 0.12} Q0,${-d * 0.26} ${w * 0.36},${-d * 0.12}`;
  }
}

interface PlacedTooth {
  fdi: number;
  kind: Kind;
  x: number;
  y: number;
  angle: number; // deg
  w: number;
  d: number;
  nx: number; // outward normal
  ny: number;
}

/** Place 8 teeth of one quadrant along a parabolic arch using cumulative widths. */
function placeQuadrant(
  quadrant: 1 | 2 | 3 | 4,
  archHalfWidth: number,
  archDepth: number
): PlacedTooth[] {
  const upper = quadrant === 1 || quadrant === 2;
  const side = quadrant === 1 || quadrant === 4 ? -1 : 1; // viewer's left for patient's right
  const widths = upper ? UPPER_W : LOWER_W;
  const depths = upper ? UPPER_D : LOWER_D;
  const frontY = upper ? -ARCH_SEPARATION : ARCH_SEPARATION;
  const dir = upper ? -1 : 1; // going "back" in the mouth moves away from centre line

  // curve: depth(u) = archDepth * (u / archHalfWidth)^2, u >= 0
  const curve = (u: number) => ({
    x: CX + side * u,
    y: frontY + dir * archDepth * Math.pow(u / archHalfWidth, 2),
  });

  // sample arc length
  const samples: { u: number; s: number }[] = [{ u: 0, s: 0 }];
  const du = 0.25;
  let prev = curve(0);
  for (let u = du; u < archHalfWidth * 2; u += du) {
    const p = curve(u);
    samples.push({ u, s: samples[samples.length - 1].s + Math.hypot(p.x - prev.x, p.y - prev.y) });
    prev = p;
  }
  const uAt = (s: number) => {
    let lo = 0;
    let hi = samples.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (samples[mid].s < s) lo = mid + 1;
      else hi = mid;
    }
    return samples[lo].u;
  };

  const interior = { x: CX, y: frontY + dir * archDepth * 0.55 };
  const out: PlacedTooth[] = [];
  let s = GAP / 2;
  for (let pos = 1; pos <= 8; pos++) {
    const w = widths[pos] * SCALE;
    const d = depths[pos] * SCALE;
    const centreS = s + w / 2;
    s += w + GAP;
    const u = uAt(centreS);
    const p = curve(u);
    const p2 = curve(u + 0.5);
    let tx = p2.x - p.x;
    let ty = p2.y - p.y;
    const len = Math.hypot(tx, ty);
    tx /= len;
    ty /= len;
    let nx = -ty;
    let ny = tx;
    if (nx * (p.x - interior.x) + ny * (p.y - interior.y) < 0) {
      nx = -nx;
      ny = -ny;
    }
    // rotate so that local -y (buccal) maps onto the outward normal
    const angle = (Math.atan2(nx, -ny) * 180) / Math.PI;
    out.push({ fdi: quadrant * 10 + pos, kind: kindOf(pos), x: p.x, y: p.y, angle, w, d, nx, ny });
  }
  return out;
}

function gumPath(teeth: PlacedTooth[]): string {
  // teeth are ordered from midline backwards; build a smooth polyline through centres
  const pts = teeth.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`);
  return `M${pts.join('L')}`;
}

export function ToothArch({ paintFor, selected, onSelect, tilted = true }: ToothArchProps) {
  const layout = useMemo(() => {
    const q1 = placeQuadrant(1, 150, 150);
    const q2 = placeQuadrant(2, 150, 150);
    const q3 = placeQuadrant(3, 138, 140);
    const q4 = placeQuadrant(4, 138, 140);
    const all = [...q1, ...q2, ...q3, ...q4];
    const pad = 46;
    const xs = all.map((t) => t.x);
    const ys = all.map((t) => t.y);
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    const upperGum = `${gumPath([...q1].reverse())}L${gumPath(q2).slice(1)}`;
    const lowerGum = `${gumPath([...q4].reverse())}L${gumPath(q3).slice(1)}`;
    return { all, upperGum, lowerGum, viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`, minX, maxX };
  }, []);

  // sort so that teeth lower on screen are painted last (correct overlap with extrusion)
  const ordered = useMemo(() => [...layout.all].sort((a, b) => a.y - b.y), [layout.all]);

  const uniquePaints = new Map<string, ToothPaint>();
  layout.all.forEach((t) => {
    const p = paintFor(t.fdi);
    uniquePaints.set(p.color, p);
  });

  return (
    <div
      className="w-full transition-transform duration-500 ease-out"
      style={{
        transform: tilted ? 'perspective(1500px) rotateX(24deg) scale(0.97)' : 'none',
        transformOrigin: '50% 50%',
      }}
    >
      <svg viewBox={layout.viewBox} className="w-full h-auto select-none" role="group" aria-label="Diş haritası">
        <defs>
          <filter id="tooth-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" />
          </filter>
          <filter id="tooth-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#0f8a9d" floodOpacity="0.55" />
          </filter>
          <linearGradient id="gum-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6cfd0" />
            <stop offset="100%" stopColor="#efbcbe" />
          </linearGradient>
          {[...uniquePaints.values()].map((p) => (
            <radialGradient key={p.color} id={`crown-${p.color.slice(1)}`} cx="42%" cy="36%" r="70%">
              <stop offset="0%" stopColor={p.light} />
              <stop offset="100%" stopColor={p.color} />
            </radialGradient>
          ))}
        </defs>

        {/* Gingiva */}
        {[layout.upperGum, layout.lowerGum].map((d, i) => (
          <g key={i} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} stroke="url(#gum-grad)" strokeWidth={66} opacity={0.55} />
            <path d={d} stroke="#fbe3e3" strokeWidth={40} opacity={0.6} />
          </g>
        ))}

        {/* Side markers */}
        <text x={layout.minX + 12} y={4} className="fill-slate-400" fontSize={11} fontWeight={600} letterSpacing={1.2}>
          SAĞ
        </text>
        <text x={layout.maxX - 12} y={4} textAnchor="end" className="fill-slate-400" fontSize={11} fontWeight={600} letterSpacing={1.2}>
          SOL
        </text>

        {ordered.map((t) => {
          const paint = paintFor(t.fdi);
          const isSel = selected === t.fdi;
          const crown = crownPath(t.kind, t.w, t.d);
          const fissure = fissurePath(t.kind, t.w, t.d);
          const rot = `rotate(${t.angle.toFixed(2)})`;
          const labelDist = t.d / 2 + 15;
          const tinted = paint.color !== '#efe7d6';

          return (
            <g
              key={t.fdi}
              transform={`translate(${t.x.toFixed(2)},${t.y.toFixed(2)})`}
              className="group cursor-pointer outline-none"
              role="button"
              tabIndex={0}
              aria-label={`Diş ${t.fdi}`}
              aria-pressed={isSel}
              onClick={() => onSelect(t.fdi)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(t.fdi);
                }
              }}
            >
              {/* drop shadow */}
              {!paint.missing && (
                <g transform={`translate(0,${LIFT + 4})`}>
                  <path d={crown} transform={rot} fill="#3b2a2a" opacity={0.22} filter="url(#tooth-shadow)" />
                </g>
              )}

              <g
                style={{
                  transform: isSel ? 'translateY(-6px)' : undefined,
                  transition: 'transform 220ms cubic-bezier(.2,.8,.2,1), translate 220ms cubic-bezier(.2,.8,.2,1)',
                }}
                className={isSel ? '' : 'group-hover:-translate-y-[3px]'}
              >
                {paint.missing ? (
                  <path
                    d={crown}
                    transform={rot}
                    fill="#ffffff"
                    fillOpacity={0.35}
                    stroke={isSel ? '#0f8a9d' : '#b8a9a9'}
                    strokeWidth={isSel ? 2 : 1.3}
                    strokeDasharray="4 3"
                  />
                ) : (
                  <>
                    {/* side wall (extrusion) */}
                    <g transform={`translate(0,${LIFT})`}>
                      <path d={crown} transform={rot} fill={paint.dark} />
                    </g>
                    {/* occlusal surface */}
                    <g transform={rot}>
                      <path
                        d={crown}
                        fill={`url(#crown-${paint.color.slice(1)})`}
                        stroke={isSel ? '#0f8a9d' : tinted ? paint.dark : '#d3c5a8'}
                        strokeWidth={isSel ? 2.4 : 0.9}
                        filter={isSel ? 'url(#tooth-glow)' : undefined}
                      />
                      <path
                        d={fissure}
                        fill="none"
                        stroke={tinted ? 'rgba(0,0,0,0.22)' : 'rgba(120,96,60,0.32)'}
                        strokeWidth={0.9}
                        strokeLinecap="round"
                      />
                      {/* specular highlight */}
                      <ellipse
                        cx={-t.w * 0.14}
                        cy={-t.d * 0.16}
                        rx={t.w * 0.18}
                        ry={t.d * 0.1}
                        fill="#ffffff"
                        opacity={0.45}
                      />
                    </g>
                  </>
                )}
              </g>

              {/* FDI number outside the arch */}
              <text
                x={t.nx * labelDist}
                y={t.ny * labelDist + 4}
                textAnchor="middle"
                fontSize={isSel ? 12.5 : 11}
                fontWeight={isSel ? 700 : 500}
                className={isSel ? 'fill-[#0f8a9d]' : 'fill-slate-400 group-hover:fill-slate-600'}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {t.fdi}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

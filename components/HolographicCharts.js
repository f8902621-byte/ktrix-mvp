import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';

// === NEON THEME ===
const NEON = {
  blue: '#00d4ff',
  blueGlow: 'rgba(0, 212, 255, 0.4)',
  orange: '#ff8c00',
  orangeGlow: 'rgba(255, 140, 0, 0.5)',
  green: '#00ff88',
  red: '#ff3366',
  white: '#f0f8ff',
  bg: '#0a0e1a',
  card: '#0d1225',
  border: 'rgba(0, 212, 255, 0.15)',
};

// === GAUGE ===
export function NeedleGauge({ score, label }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const RADIAN = Math.PI / 180;
  const cx = 150, cy = 120;
  const segments = [
    { value: 25, color: '#ff0040' },
    { value: 25, color: '#ffaa00' },
    { value: 25, color: '#00e5ff' },
    { value: 25, color: '#00ff66' },
  ];

  const getScoreColor = (s) => {
    if (s >= 75) return NEON.green;
    if (s >= 50) return NEON.blue;
    if (s >= 25) return NEON.orange;
    return NEON.red;
  };
  const getScoreLabel = (s) => {
    if (s >= 75) return 'Excellent';
    if (s >= 50) return 'Good';
    if (s >= 25) return 'Medium';
    return 'Low';
  };

  const renderNeedle = () => {
    const ang = 180 - (animatedScore / 100) * 180;
    const length = 48;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const xp = cx + length * cos;
    const yp = cy + length * sin;
    return (
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 300 170">
        <line x1={cx} y1={cy} x2={xp} y2={yp} stroke={NEON.blue} strokeWidth={4} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${NEON.blueGlow})`, transition: 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        <circle cx={cx} cy={cy} r={8} fill={NEON.blue} style={{ filter: `drop-shadow(0 0 10px ${NEON.blueGlow})` }} />
        <circle cx={cx} cy={cy} r={4} fill={NEON.bg} />
      </svg>
    );
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${NEON.card} 0%, rgba(0,212,255,0.03) 100%)`, border: `1px solid ${NEON.border}`, borderRadius: 16, padding: '16px 8px 8px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`, backgroundSize: '20px 20px', pointerEvents: 'none' }} />
      <p style={{ color: NEON.white, fontSize: 14, fontWeight: 700, textAlign: 'center', margin: '0 0 4px', letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 10px ${NEON.blueGlow}` }}>{label}</p>
      <div style={{ position: 'relative', width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={segments} cx="50%" cy="75%" startAngle={180} endAngle={0} innerRadius="45%" outerRadius="82%" dataKey="value" stroke="none" paddingAngle={2}>
              {segments.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={1} style={{ filter: `drop-shadow(0 0 8px ${entry.color}80)` }} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {renderNeedle()}
      </div>
      <div style={{ textAlign: 'center', marginTop: -16 }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: getScoreColor(score), textShadow: `0 0 20px ${getScoreColor(score)}80`, fontFamily: 'Orbitron, monospace' }}>{score}%</span>
        <p style={{ color: getScoreColor(score), fontSize: 12, fontWeight: 600, margin: '2px 0 0', letterSpacing: 2, textTransform: 'uppercase', opacity: 0.9 }}>{getScoreLabel(score)}</p>
      </div>
    </div>
  );
}

// === PRICE DISTRIBUTION ===
export function PriceDistribution({ propertyPrice, min, median, max, count }) {
  const data = [];
  const range = max - min;
  const step = range / 20;
  for (let i = 0; i <= 20; i++) {
    const x = min + step * i;
    const d = (x - median) / (range / 4);
    const y = Math.exp(-0.5 * d * d) * 100;
    data.push({ price: Math.round(x), density: Math.round(y) });
  }
  const isBelow = propertyPrice < median;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(13,18,37,0.95)', border: `1px solid ${NEON.blue}`, borderRadius: 8, padding: '8px 12px', boxShadow: `0 0 15px ${NEON.blueGlow}` }}>
          <p style={{ color: NEON.white, margin: 0, fontSize: 12 }}>{payload[0].payload.price} tr/m²</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${NEON.card} 0%, rgba(0,212,255,0.03) 100%)`, border: `1px solid ${NEON.border}`, borderRadius: 16, padding: '16px 8px 8px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`, backgroundSize: '20px 20px', pointerEvents: 'none' }} />
      <p style={{ color: NEON.white, fontSize: 14, fontWeight: 700, textAlign: 'center', margin: '0 0 12px', letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 10px ${NEON.blueGlow}` }}>📊 Price vs Market</p>
      <div style={{ textAlign: 'center', margin: '0 0 8px' }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: isBelow ? NEON.green : NEON.red, textShadow: `0 0 20px ${isBelow ? NEON.green : NEON.red}60`, fontFamily: 'Orbitron, monospace' }}>
          {isBelow ? '-' : '+'}{Math.abs(Math.round(((propertyPrice - median) / median) * 100))}%
        </span>
        <span style={{ fontSize: 18, marginLeft: 4, color: isBelow ? NEON.green : NEON.red }}>{isBelow ? '↓' : '↑'}</span>
        <p style={{ color: 'rgba(240,248,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>{isBelow ? 'Below' : 'Above'} market ({count} listings)</p>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NEON.blue} stopOpacity={0.6} />
              <stop offset="100%" stopColor={NEON.blue} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis dataKey="price" tick={{ fill: 'rgba(240,248,255,0.4)', fontSize: 10 }} axisLine={{ stroke: 'rgba(0,212,255,0.1)' }} tickLine={false} tickCount={5} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="density" stroke={NEON.blue} strokeWidth={3} fill="url(#neonGradient)" style={{ filter: `drop-shadow(0 0 6px ${NEON.blueGlow})` }} />
          <ReferenceLine x={data.reduce((prev, curr) => Math.abs(curr.price - propertyPrice) < Math.abs(prev.price - propertyPrice) ? curr : prev).price} stroke={NEON.orange} strokeWidth={3} strokeDasharray="5 3" style={{ filter: `drop-shadow(0 0 8px ${NEON.orangeGlow})` }} />
          <ReferenceLine x={data.reduce((prev, curr) => Math.abs(curr.price - median) < Math.abs(prev.price - median) ? curr : prev).price} stroke="rgba(0,212,255,0.4)" strokeWidth={1} strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 4, fontSize: 11 }}>
        <span style={{ color: NEON.orange }}>● This property: {propertyPrice} tr/m²</span>
        <span style={{ color: 'rgba(0,212,255,0.6)' }}>● Median: {median} tr/m²</span>
      </div>
    </div>
  );
}

// === SCORE BARS ===
export function ScoreBars({ scores }) {
  const items = [
    { icon: '📍', label: 'Location', value: scores.location },
    { icon: '💰', label: 'Price', value: scores.price },
    { icon: '📏', label: 'Size', value: scores.size },
    { icon: '📜', label: 'Legal', value: scores.legal },
    { icon: '🔥', label: 'Urgency', value: scores.urgency },
    { icon: '⭐', label: 'Quality', value: scores.quality },
  ];
  const getBarColor = (v) => {
    if (v >= 75) return NEON.green;
    if (v >= 50) return NEON.blue;
    if (v >= 25) return NEON.orange;
    return NEON.red;
  };

  return (
    <div style={{ background: `linear-gradient(135deg, ${NEON.card} 0%, rgba(0,212,255,0.03) 100%)`, border: `1px solid ${NEON.border}`, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`, backgroundSize: '20px 20px', pointerEvents: 'none' }} />
      <p style={{ color: NEON.white, fontSize: 14, fontWeight: 700, textAlign: 'center', margin: '0 0 14px', letterSpacing: 1, textTransform: 'uppercase', textShadow: `0 0 10px ${NEON.blueGlow}` }}>🎯 Property Score</p>
      {items.map((item, i) => {
        const color = getBarColor(item.value);
        return (
          <div key={i} style={{ marginBottom: i < items.length - 1 ? 10 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ color: NEON.white, fontSize: 13, fontWeight: 500 }}>{item.icon} {item.label}</span>
              <span style={{ color: color, fontSize: 14, fontWeight: 800, fontFamily: 'Orbitron, monospace', textShadow: `0 0 8px ${color}60` }}>{item.value}%</span>
            </div>
            <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: `${item.value}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${color}90, ${color})`, boxShadow: `0 0 12px ${color}50, 0 0 4px ${color}30`, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// === ALERT BADGE ===
export function AlertBadge({ text, type = 'info' }) {
  const colors = {
    info: { bg: NEON.blue, glow: NEON.blueGlow },
    alert: { bg: NEON.orange, glow: NEON.orangeGlow },
    good: { bg: NEON.green, glow: 'rgba(0,255,136,0.4)' },
    risk: { bg: NEON.red, glow: 'rgba(255,51,102,0.4)' },
  };
  const c = colors[type];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, color: NEON.white, background: `${c.bg}20`, border: `1px solid ${c.bg}60`, boxShadow: `0 0 12px ${c.glow}, inset 0 0 12px ${c.glow}`, animation: type === 'alert' ? 'neonPulse 2s ease-in-out infinite' : 'none' }}>
      {text}
    </span>
  );
}

// === SIGNAL ITEM ===
export function SignalItem({ icon, label, value, isPositive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,212,255,0.04)', borderRadius: 10, borderLeft: `3px solid ${isPositive ? NEON.green : NEON.orange}`, marginBottom: 6 }}>
      <span style={{ color: NEON.white, fontSize: 13 }}><span style={{ marginRight: 8 }}>{icon}</span>{label}</span>
      <span style={{ color: isPositive ? NEON.green : NEON.orange, fontWeight: 800, fontSize: 14, fontFamily: 'Orbitron, monospace', textShadow: `0 0 8px ${isPositive ? 'rgba(0,255,136,0.4)' : NEON.orangeGlow}` }}>{value}</span>
    </div>
  );
}

// === NEON CSS (à injecter dans la page) ===
export const NEON_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
  @keyframes neonPulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(255,140,0,0.5), inset 0 0 12px rgba(255,140,0,0.5); }
    50% { opacity: 0.8; box-shadow: 0 0 24px rgba(255,140,0,0.5), inset 0 0 20px rgba(255,140,0,0.5); }
  }
`;

// === NEON COLORS EXPORT ===
export { NEON };

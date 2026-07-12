export function buildChartPath(values: number[], height = 80, width = 280) {
  if (values.length === 0 || values.every((v) => v === 0)) {
    return `M0,${height} L${width},${height}`;
  }

  const max = Math.max(...values, 1);
  const step = width / (values.length - 1 || 1);

  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - (value / max) * (height - 10);
    return `${x},${y}`;
  });

  return `M${points.join(" L")}`;
}

export function buildSmoothPath(values: number[], height = 80, width = 280) {
  if (values.length === 0) {
    return `M0,${height}`;
  }

  const max = Math.max(...values, 1);
  const step = width / (values.length - 1 || 1);
  const pts = values.map((value, index) => ({
    x: index * step,
    y: height - (value / max) * (height - 12) - 4,
  }));

  if (pts.length === 1) {
    return `M${pts[0].x},${pts[0].y}`;
  }

  let d = `M${pts[0].x},${pts[0].y}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
  }

  return d;
}

export function donutArc(percent: number, radius = 36, cx = 48, cy = 48) {
  const clamped = Math.max(0, Math.min(100, percent));
  const angle = (clamped / 100) * Math.PI * 2 - Math.PI / 2;
  const startX = cx;
  const startY = cy - radius;
  const endX = cx + radius * Math.cos(angle);
  const endY = cy + radius * Math.sin(angle);
  const large = clamped > 50 ? 1 : 0;

  if (clamped === 0) {
    return "";
  }

  if (clamped === 100) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`;
  }

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${large} 1 ${endX} ${endY}`;
}

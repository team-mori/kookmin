// 시안용 도면 SVG 생성기 — 실제 평면도 데이터(ENGINEERING_SPACES)와 실제 경로 계산 결과를 사용
// 실행: node --experimental-strip-types mockups/gen-floor-svg.mjs
import { writeFileSync } from "node:fs";
import { ENGINEERING_SPACES } from "../src/data/engineering-floors.ts";
import { findEngineeringRoute } from "../src/data/engineering-route.ts";

const FLOOR = 1;
const SELECTED = "1f-room-115";
const ROUTE = ["1f-room-115", "2f-room-246"];

const spaces = ENGINEERING_SPACES.filter((s) => s.floor === FLOOR);
const minX = Math.min(...spaces.map((s) => s.bounds[0]));
const maxX = Math.max(...spaces.map((s) => s.bounds[2]));
const minY = Math.min(...spaces.map((s) => s.bounds[1]));
const maxY = Math.max(...spaces.map((s) => s.bounds[3]));

const PAD = 14;
const W = 740;
const scale = (W - PAD * 2) / (maxX - minX);
const H = Math.round((maxY - minY) * scale + PAD * 2);
const px = (x) => PAD + (x - minX) * scale;
const py = (y) => PAD + (maxY - y) * scale;

const FILL = { room: "#FFFFFF", corridor: "#EDF0EA", stairs: "#E3E7E0", elevator: "#E3E7E0" };
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function rects() {
  const out = [];
  const order = ["corridor", "stairs", "elevator", "room"]; // 복도 아래, 방 위
  for (const kind of order) {
    for (const s of spaces.filter((sp) => sp.kind === kind)) {
      const [w, so, e, n] = s.bounds;
      const x = px(w), y = py(n), rw = (e - w) * scale, rh = (n - so) * scale;
      const sel = s.id === SELECTED;
      const fill = sel ? "#DDF3E6" : FILL[kind];
      const stroke = sel ? "#0CA35B" : kind === "room" ? "#DDE2E7" : "none";
      out.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${sel ? 2 : 1}"/>`);
      const text = s.kind === "room" ? s.roomNumber ?? "" : s.kind === "corridor" ? "" : s.label;
      if (!text || rw < 16 || rh < 12) continue;
      const fs = Math.max(7, Math.min(11, Math.min(rw, rh) * 0.34));
      const color = s.kind === "room" ? "#4E5968" : "#8B95A1";
      out.push(`<text x="${(x + rw / 2).toFixed(1)}" y="${(y + rh / 2 + fs * 0.36).toFixed(1)}" font-size="${fs.toFixed(1)}" fill="${color}" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="500">${esc(text)}</text>`);
    }
  }
  return out.join("\n");
}

function routeOverlay() {
  const route = findEngineeringRoute(...ROUTE);
  const seg = route.segments.find((s) => s.floor === FLOOR);
  if (!seg) return "";
  const pts = seg.points.map(([x, y]) => [px(x), py(y)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const parts = [`<path d="${d}" fill="none" stroke="#0CA35B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>`];
  // 진행 방향 셰브론: 40px 이상 구간마다 중점에 삼각형
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 34) continue;
    const n = Math.floor(len / 44) || 1;
    const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI + 90;
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const mx = ax + (bx - ax) * t, my = ay + (by - ay) * t;
      parts.push(`<polygon points="-4,3 4,3 0,-4" fill="#fff" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${ang.toFixed(1)})"/>`);
    }
  }
  const [sx, sy] = pts[0], [ex, ey] = pts[pts.length - 1];
  parts.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="6.5" fill="#fff" stroke="#0CA35B" stroke-width="3"/>`);
  parts.push(`<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="8" fill="#0CA35B"/>`);
  parts.push(`<text x="${ex.toFixed(1)}" y="${(ey + 3).toFixed(1)}" font-size="8" fill="#fff" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="700">EV</text>`);
  return parts.join("\n");
}

const svg = (extra) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#F4F6F2"/>
${rects()}
${extra}
</svg>\n`;

writeFileSync("mockups/floor1.svg", svg(""));
writeFileSync("mockups/floor1-route.svg", svg(routeOverlay()));
console.log(`floor ${FLOOR}: spaces=${spaces.length}, viewBox=0 0 ${W} ${H}`);

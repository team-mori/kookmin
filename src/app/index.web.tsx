import { useState } from "react";

import {
  ENGINEERING_FLOOR_BOUNDS,
  ENGINEERING_FLOORS,
  ENGINEERING_FLOOR_SHELL,
  type EngineeringFloor,
  type EngineeringSpaceKind
} from "../data/engineering-floors";

const FLOORS: EngineeringFloor[] = [2, 1];
const VIEWBOX_WIDTH = 960;
const VIEWBOX_HEIGHT = 640;
const [WEST, SOUTH, EAST, NORTH] = ENGINEERING_FLOOR_BOUNDS;

const APPEARANCE: Record<
  EngineeringSpaceKind,
  { fill: string; side: string; stroke: string; text: string }
> = {
  room: {
    fill: "#F7FAF8",
    side: "#BCC7C1",
    stroke: "#AAB6B0",
    text: "#29352F"
  },
  corridor: {
    fill: "#FFFFFF",
    side: "#D8E0DC",
    stroke: "#CDD7D2",
    text: "#65716B"
  },
  stairs: {
    fill: "#E6F0FF",
    side: "#9DB7DE",
    stroke: "#6F94C9",
    text: "#42699F"
  },
  elevator: {
    fill: "#DFF3E7",
    side: "#93BFA3",
    stroke: "#5B9A70",
    text: "#39724E"
  }
};

const project = ([longitude, latitude]: GeoJSON.Position): [number, number] => {
  const x = (longitude - WEST) / (EAST - WEST) - 0.5;
  const y = (latitude - SOUTH) / (NORTH - SOUTH) - 0.5;

  return [
    VIEWBOX_WIDTH / 2 + x * 780 + y * 72,
    VIEWBOX_HEIGHT / 2 + x * 22 - y * 420
  ];
};

const polygonPoints = (
  coordinates: GeoJSON.Position[],
  offsetY = 0
): string =>
  coordinates
    .map((coordinate) => {
      const [x, y] = project(coordinate);
      return `${x.toFixed(1)},${(y + offsetY).toFixed(1)}`;
    })
    .join(" ");

export default function IndoorMapWebPreview() {
  const [floor, setFloor] = useState<EngineeringFloor>(1);
  const floorData = ENGINEERING_FLOORS[floor];
  const shell = ENGINEERING_FLOOR_SHELL.features[0].geometry.coordinates[0];

  return (
    <main className="app-shell">
      <style>{styles}</style>

      <header className="map-header">
        <span className="brand-mark">MORI</span>
        <div>
          <strong>공학관</strong>
          <span>{floor}층 실내지도</span>
        </div>
      </header>

      <nav className="floor-selector" aria-label="층 선택">
        {FLOORS.map((item) => (
          <button
            key={item}
            aria-label={`공학관 ${item}층`}
            aria-pressed={item === floor}
            className={item === floor ? "selected" : undefined}
            onClick={() => setFloor(item)}
            type="button"
          >
            {item}F
          </button>
        ))}
      </nav>

      <svg
        aria-label={`공학관 ${floor}층 공간 배치도`}
        className="indoor-map"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#D7E0DB" strokeWidth="1" />
          </pattern>
          <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="12" floodColor="#53645B" floodOpacity="0.22" stdDeviation="12" />
          </filter>
        </defs>

        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#E8EEEB" />
        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#map-grid)" opacity="0.45" />

        <g key={floor} aria-hidden="true" className="floor-plan">
          <polygon
            fill="#8C9C94"
            opacity="0.68"
            points={polygonPoints(shell, 15)}
          />
          <polygon
            fill="#FCFEFD"
            filter="url(#map-shadow)"
            points={polygonPoints(shell)}
            stroke="#91A098"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          {floorData.spaces.features.map((feature) => {
            const { id, kind } = feature.properties;
            const appearance = APPEARANCE[kind];
            const offset = kind === "corridor" ? 1.5 : kind === "elevator" ? 8 : 5;

            return (
              <polygon
                key={`${id}-side`}
                fill={appearance.side}
                opacity={kind === "corridor" ? 0.45 : 0.9}
                points={polygonPoints(feature.geometry.coordinates[0], offset)}
              />
            );
          })}

          {floorData.spaces.features.map((feature) => {
            const { id, kind } = feature.properties;
            const appearance = APPEARANCE[kind];

            return (
              <polygon
                key={id}
                className="space"
                fill={appearance.fill}
                points={polygonPoints(feature.geometry.coordinates[0])}
                stroke={appearance.stroke}
                strokeLinejoin="round"
                strokeWidth={kind === "corridor" ? 1.2 : 1.5}
              />
            );
          })}

          {floorData.labels.features.map((feature) => {
            const { id, kind, label } = feature.properties;
            if (kind === "corridor") return null;

            const [x, y] = project(feature.geometry.coordinates);
            const fontSize = kind === "room" ? (label.length > 5 ? 8 : 10) : 9;

            return (
              <text
                key={`${id}-label`}
                className={label.length > 5 ? "space-label compact" : "space-label"}
                dominantBaseline="central"
                fill={APPEARANCE[kind].text}
                fontSize={fontSize}
                fontWeight="700"
                paintOrder="stroke"
                stroke="#FFFFFF"
                strokeWidth="2.6"
                textAnchor="middle"
                x={x}
                y={y}
              >
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      <aside className="map-legend" aria-label="지도 범례">
        <span><i className="room" />호실</span>
        <span><i className="stairs" />계단</span>
        <span><i className="elevator" />엘리베이터</span>
      </aside>
    </main>
  );
}

const styles = `
  :root {
    color-scheme: light;
    font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
  }

  * { box-sizing: border-box; }
  html, body, #root { width: 100%; height: 100%; margin: 0; }
  body { overflow: hidden; }
  button { font: inherit; }

  .app-shell {
    position: fixed;
    inset: 0;
    min-width: 320px;
    overflow: hidden;
    background: #E8EEEB;
    color: #1D2822;
  }

  .indoor-map {
    display: block;
    width: 100%;
    height: 100%;
  }

  .floor-plan {
    animation: floor-in 260ms cubic-bezier(.2,.8,.2,1);
  }

  .space {
    transition: filter 120ms ease, stroke-width 120ms ease;
  }

  .space:hover {
    filter: brightness(.97);
    stroke-width: 2.4;
  }

  .map-header {
    position: absolute;
    z-index: 2;
    top: max(18px, env(safe-area-inset-top));
    left: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 228px;
    min-height: 58px;
    padding: 9px 13px;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.95);
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
    backdrop-filter: blur(14px);
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 7px;
    background: #1767E8;
    color: white;
    font-size: 10px;
    font-weight: 800;
  }

  .map-header div {
    display: grid;
    gap: 2px;
  }

  .map-header strong {
    font-size: 16px;
    line-height: 20px;
  }

  .map-header div span {
    color: #68756E;
    font-size: 11px;
    line-height: 16px;
  }

  .floor-selector {
    position: absolute;
    z-index: 2;
    top: max(18px, env(safe-area-inset-top));
    right: 18px;
    display: grid;
    overflow: hidden;
    border: 1px solid #D0D9D4;
    border-radius: 8px;
    background: rgba(255,255,255,.96);
    box-shadow: 0 8px 24px rgba(41,58,49,.12);
  }

  .floor-selector button {
    width: 48px;
    height: 48px;
    border: 0;
    border-bottom: 1px solid #E1E7E4;
    background: transparent;
    color: #59665F;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
  }

  .floor-selector button:last-child { border-bottom: 0; }
  .floor-selector button:hover { background: #F2F5F3; }
  .floor-selector button.selected { background: #1767E8; color: white; }
  .floor-selector button:focus-visible { outline: 3px solid #8DB8FF; outline-offset: -3px; }

  .map-legend {
    position: absolute;
    z-index: 2;
    right: 18px;
    bottom: max(18px, env(safe-area-inset-bottom));
    display: flex;
    gap: 14px;
    padding: 9px 12px;
    border: 1px solid #D0D9D4;
    border-radius: 7px;
    background: rgba(255,255,255,.92);
    box-shadow: 0 6px 18px rgba(41,58,49,.1);
    color: #59665F;
    font-size: 11px;
    backdrop-filter: blur(12px);
  }

  .map-legend span { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
  .map-legend i { width: 10px; height: 10px; border: 1px solid; border-radius: 2px; }
  .map-legend i.room { background: #F7FAF8; border-color: #AAB6B0; }
  .map-legend i.stairs { background: #E6F0FF; border-color: #6F94C9; }
  .map-legend i.elevator { background: #DFF3E7; border-color: #5B9A70; }

  @keyframes floor-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 560px) {
    .map-header { top: max(12px, env(safe-area-inset-top)); left: 12px; width: 210px; }
    .floor-selector { top: max(12px, env(safe-area-inset-top)); right: 12px; }
    .space-label { font-size: 18px; stroke-width: 3.5px; }
    .space-label.compact { font-size: 13px; }
    .map-legend {
      right: 12px;
      bottom: max(12px, env(safe-area-inset-bottom));
      gap: 9px;
      padding: 8px 9px;
      font-size: 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .floor-plan { animation: none; }
    .space { transition: none; }
  }
`;

import type {
  ExpressionSpecification,
  LayerSpecification
} from "@maplibre/maplibre-gl-style-spec";

import { ENGINEERING_CENTER } from "../data/engineering-building.ts";
import type { EngineeringFloor } from "../data/engineering-floors.ts";

// One basemap for every zoom level; the interior is revealed by zooming, not
// by swapping styles.
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const INDOOR_MIN_ZOOM = 16.2;
export const REVEAL_START = 16.7;
export const REVEAL_END = 17.5;
export const INDOOR_UI_ZOOM = 17.05;

export const CAMPUS_CAMERA = {
  center: ENGINEERING_CENTER,
  zoom: 15.9,
  pitch: 0,
  bearing: 0
} as const;

export const BUILDING_CAMERA = {
  center: ENGINEERING_CENTER,
  zoom: 18.05,
  pitch: 42,
  bearing: 0
} as const;

export const ROOM_ZOOM = 19.25;
export const ROOM_PITCH = 46;
export const STEP_ZOOM = 19;
export const FLY_DURATION_MS = 1500;
export const EASE_DURATION_MS = 650;

export const SOURCE_IDS = {
  building: "engineering-building",
  buildingLabel: "engineering-building-label",
  floorShell: "engineering-floor-shell",
  floorSpaces: "engineering-floor-spaces",
  floorLabels: "engineering-floor-labels",
  routeLines: "engineering-route-lines",
  routeMarkers: "engineering-route-markers"
} as const;

export const BUILDING_LABEL_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { label: "공학관" },
      geometry: { type: "Point", coordinates: ENGINEERING_CENTER }
    }
  ]
} satisfies GeoJSON.FeatureCollection<GeoJSON.Point, { label: string }>;

export const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: []
} satisfies GeoJSON.FeatureCollection;

const revealIn = (visible: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  REVEAL_START,
  0,
  REVEAL_END,
  visible
];

const revealOut = (visible: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  REVEAL_START,
  visible,
  REVEAL_END,
  0
];

const NO_SELECTION = "__none__";

const selectedFilter = (
  selectedRoomId: string | null
): ExpressionSpecification => [
  "==",
  ["get", "id"],
  selectedRoomId ?? NO_SELECTION
];

// The building footprint owns the campus zoom range and fades away while the
// floor plan fades in underneath it.
export const buildingLayerSpecs = (): LayerSpecification[] => [
  {
    id: "building-fill",
    type: "fill",
    source: SOURCE_IDS.building,
    paint: {
      "fill-color": "#2F7EF7",
      "fill-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        15,
        0.3,
        REVEAL_START,
        0.38,
        REVEAL_END,
        0
      ]
    }
  },
  {
    id: "building-outline",
    type: "line",
    source: SOURCE_IDS.building,
    paint: {
      "line-color": "#165EC8",
      "line-width": 2,
      "line-opacity": revealOut(1)
    }
  }
];

export const buildingLabelLayerSpecs = (): LayerSpecification[] => [
  {
    id: "building-label",
    type: "symbol",
    source: SOURCE_IDS.buildingLabel,
    layout: {
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Bold"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 15, 13.5, 17, 15.5]
    },
    paint: {
      "text-color": "#1252B8",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 1.8,
      "text-opacity": revealOut(1)
    }
  }
];

export const floorShellLayerSpecs = (): LayerSpecification[] => [
  {
    id: "floor-shell-shadow",
    type: "line",
    source: SOURCE_IDS.floorShell,
    minzoom: INDOOR_MIN_ZOOM,
    paint: {
      "line-blur": 4,
      "line-color": "#65726C",
      "line-width": 7,
      "line-opacity": revealIn(0.2)
    }
  },
  {
    id: "floor-shell-fill",
    type: "fill",
    source: SOURCE_IDS.floorShell,
    minzoom: INDOOR_MIN_ZOOM,
    paint: {
      "fill-color": "#FBFCFC",
      "fill-opacity": revealIn(1)
    }
  },
  {
    id: "floor-shell-outline",
    type: "line",
    source: SOURCE_IDS.floorShell,
    minzoom: INDOOR_MIN_ZOOM,
    paint: {
      "line-color": "#9FAAA5",
      "line-width": 1.4,
      "line-opacity": revealIn(1)
    }
  }
];

export const floorSpaceLayerSpecs = (
  selectedRoomId: string | null
): LayerSpecification[] => [
  {
    id: "floor-spaces",
    type: "fill-extrusion",
    source: SOURCE_IDS.floorSpaces,
    minzoom: INDOOR_MIN_ZOOM,
    paint: {
      "fill-extrusion-base": 0,
      "fill-extrusion-color": [
        "match",
        ["get", "kind"],
        "corridor",
        "#FFFFFF",
        "stairs",
        "#E8F0FC",
        "elevator",
        "#E4F3EA",
        "#F3F6F5"
      ],
      "fill-extrusion-height": [
        "match",
        ["get", "kind"],
        "corridor",
        0.2,
        "stairs",
        1.8,
        "elevator",
        4.2,
        3.2
      ],
      "fill-extrusion-opacity": revealIn(0.98),
      "fill-extrusion-vertical-gradient": true
    }
  },
  {
    id: "floor-spaces-outline",
    type: "line",
    source: SOURCE_IDS.floorSpaces,
    minzoom: INDOOR_MIN_ZOOM,
    paint: {
      "line-color": [
        "match",
        ["get", "kind"],
        "corridor",
        "#D0D7D4",
        "stairs",
        "#7396C9",
        "elevator",
        "#67A17C",
        "#B4BFBA"
      ],
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        17,
        0.7,
        19,
        1.15
      ],
      "line-opacity": revealIn(1)
    }
  },
  {
    id: "floor-spaces-selected",
    type: "fill-extrusion",
    source: SOURCE_IDS.floorSpaces,
    minzoom: INDOOR_MIN_ZOOM,
    filter: selectedFilter(selectedRoomId),
    paint: {
      "fill-extrusion-base": 0,
      "fill-extrusion-color": "#2478F4",
      "fill-extrusion-height": 5.4,
      "fill-extrusion-opacity": revealIn(1)
    }
  },
  {
    id: "floor-spaces-selected-outline",
    type: "line",
    source: SOURCE_IDS.floorSpaces,
    minzoom: INDOOR_MIN_ZOOM,
    filter: selectedFilter(selectedRoomId),
    paint: {
      "line-color": "#0B4EB9",
      "line-width": 3,
      "line-opacity": revealIn(1)
    }
  }
];

export const floorLabelLayerSpecs = (
  selectedRoomId: string | null
): LayerSpecification[] => [
  {
    id: "floor-labels",
    type: "symbol",
    source: SOURCE_IDS.floorLabels,
    minzoom: INDOOR_MIN_ZOOM,
    layout: {
      "text-allow-overlap": false,
      "text-field": [
        "case",
        ["==", ["get", "kind"], "corridor"],
        "",
        ["get", "label"]
      ],
      "text-font": ["Noto Sans Regular"],
      "text-padding": 3,
      "text-pitch-alignment": "viewport",
      "text-rotation-alignment": "viewport",
      "text-size": ["interpolate", ["linear"], ["zoom"], 17, 8.5, 19, 12.5]
    },
    paint: {
      "text-color": [
        "match",
        ["get", "kind"],
        "stairs",
        "#496B9A",
        "elevator",
        "#3F7654",
        "#34413B"
      ],
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 0.8,
      "text-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        17,
        0,
        17.6,
        1
      ]
    }
  },
  {
    id: "floor-labels-selected",
    type: "symbol",
    source: SOURCE_IDS.floorLabels,
    minzoom: INDOOR_MIN_ZOOM,
    filter: selectedFilter(selectedRoomId),
    layout: {
      "text-allow-overlap": true,
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-pitch-alignment": "viewport",
      "text-rotation-alignment": "viewport",
      "text-size": 13
    },
    paint: {
      "text-color": "#FFFFFF",
      "text-halo-color": "#0B4EB9",
      "text-halo-width": 1,
      "text-opacity": revealIn(1)
    }
  }
];

const floorFilter = (
  floor: EngineeringFloor,
  equals: boolean
): ExpressionSpecification => [
  equals ? "==" : "!=",
  ["get", "floor"],
  floor
];

export const routeLineLayerSpecs = (
  floor: EngineeringFloor
): LayerSpecification[] => [
  {
    id: "route-other-floor",
    type: "line",
    source: SOURCE_IDS.routeLines,
    minzoom: INDOOR_MIN_ZOOM,
    filter: floorFilter(floor, false),
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#9AA8BA",
      "line-width": 3.5,
      "line-dasharray": [0.4, 1.8],
      "line-opacity": revealIn(0.55)
    }
  },
  {
    id: "route-casing",
    type: "line",
    source: SOURCE_IDS.routeLines,
    minzoom: INDOOR_MIN_ZOOM,
    filter: floorFilter(floor, true),
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#FFFFFF",
      "line-width": 10,
      "line-opacity": revealIn(0.96)
    }
  },
  {
    id: "route-line",
    type: "line",
    source: SOURCE_IDS.routeLines,
    minzoom: INDOOR_MIN_ZOOM,
    filter: floorFilter(floor, true),
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#1767E8",
      "line-width": 6,
      "line-opacity": revealIn(1)
    }
  },
  {
    id: "route-direction",
    type: "symbol",
    source: SOURCE_IDS.routeLines,
    minzoom: INDOOR_MIN_ZOOM,
    filter: floorFilter(floor, true),
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": 54,
      "text-field": "›",
      "text-font": ["Noto Sans Regular"],
      "text-keep-upright": false,
      "text-size": 15
    },
    paint: {
      "text-color": "#FFFFFF",
      "text-opacity": revealIn(1)
    }
  }
];

export const routeMarkerLayerSpecs = (
  floor: EngineeringFloor
): LayerSpecification[] => [
  {
    id: "route-marker-circles",
    type: "circle",
    source: SOURCE_IDS.routeMarkers,
    minzoom: INDOOR_MIN_ZOOM,
    filter: floorFilter(floor, true),
    paint: {
      "circle-color": [
        "match",
        ["get", "role"],
        "start",
        "#12A36D",
        "floor-change",
        "#F0980B",
        "#E64867"
      ],
      "circle-radius": [
        "match",
        ["get", "role"],
        "floor-change",
        7,
        8
      ],
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 3,
      "circle-opacity": revealIn(1),
      "circle-stroke-opacity": revealIn(1)
    }
  },
  {
    id: "route-marker-labels",
    type: "symbol",
    source: SOURCE_IDS.routeMarkers,
    minzoom: INDOOR_MIN_ZOOM,
    filter: floorFilter(floor, true),
    layout: {
      "text-anchor": "bottom",
      "text-field": ["get", "label"],
      "text-font": ["Noto Sans Regular"],
      "text-offset": [0, -1.1],
      "text-size": 11
    },
    paint: {
      "text-color": "#16211C",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 1.5,
      "text-opacity": revealIn(1)
    }
  }
];

import type { ImageSourceProps } from "@maplibre/maplibre-react-native";

type BuildingProperties = {
  id: "engineering-building";
  kind: "building";
  name: "공학관";
};

export type EngineeringFloor = 1 | 2;

// OpenStreetMap way 172918337 (ODbL), fetched 2026-07-13.
export const ENGINEERING_BUILDING = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "engineering-building",
        kind: "building",
        name: "공학관"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [126.9934119, 37.6115876],
            [126.9934871, 37.6116731],
            [126.9934593, 37.6116884],
            [126.9937349, 37.6120016],
            [126.9937661, 37.6119843],
            [126.9937799, 37.612],
            [126.9938445, 37.6119643],
            [126.9938942, 37.6120208],
            [126.9938045, 37.6120703],
            [126.9938382, 37.6121087],
            [126.9938206, 37.6121184],
            [126.9940343, 37.6123613],
            [126.9940509, 37.6123521],
            [126.9940799, 37.6123851],
            [126.9942671, 37.6122817],
            [126.9942305, 37.6122401],
            [126.9942397, 37.6122351],
            [126.9940326, 37.6119996],
            [126.9940108, 37.6120116],
            [126.9939605, 37.6119545],
            [126.9939953, 37.6119353],
            [126.9939524, 37.6118864],
            [126.9941897, 37.6117553],
            [126.9942024, 37.6117697],
            [126.9941565, 37.6117951],
            [126.9944767, 37.612159],
            [126.9946559, 37.61206],
            [126.9943335, 37.6116936],
            [126.9943252, 37.6116842],
            [126.9942627, 37.6116131],
            [126.9942247, 37.6116341],
            [126.9939299, 37.611299],
            [126.9937689, 37.6113879],
            [126.9940058, 37.6116572],
            [126.9938132, 37.6117636],
            [126.9935778, 37.611496],
            [126.9934119, 37.6115876]
          ]
        ]
      }
    }
  ]
} satisfies GeoJSON.FeatureCollection<GeoJSON.Polygon, BuildingProperties>;

export const ENGINEERING_CENTER: [number, number] = [126.99403, 37.61184];

export const ENGINEERING_FLOOR_BOUNDS: [number, number, number, number] = [
  126.992806, 37.610983, 126.995262, 37.612701
];

// ponytail: Four-corner approximation for the slice; replace with surveyed
// control points before room geometry or routing depends on this alignment.
export const ENGINEERING_FLOOR_COORDINATES = [
  [126.992806, 37.612016],
  [126.994654, 37.612701],
  [126.995262, 37.611668],
  [126.993414, 37.610983]
] satisfies ImageSourceProps["coordinates"];

export const ENGINEERING_FLOOR_IMAGES: Record<EngineeringFloor, number> = {
  1: require("../../assets/floors/engineering-1f.png"),
  2: require("../../assets/floors/engineering-2f.png")
};

import { Camera, Map } from "@maplibre/maplibre-react-native";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

const KOOKMIN_CENTER: [number, number] = [126.9975, 37.611];

export default function CampusMapScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Map
        style={styles.map}
        mapStyle="https://demotiles.maplibre.org/style.json"
      >
        <Camera
          initialViewState={{
            center: KOOKMIN_CENTER,
            zoom: 15.5
          }}
        />
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  }
});

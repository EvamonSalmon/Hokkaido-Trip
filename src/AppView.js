import placesData from "./places.json";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

/* ===== icon ===== */
function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

const dayOptions = [
  { value: "Day 1", label: "Day 1 (7 Mar)", color: "blue" },
  { value: "Day 2", label: "Day 2 (8 Mar)", color: "green" },
  { value: "Day 3", label: "Day 3 (9 Mar)", color: "orange" },
  { value: "Day 4", label: "Day 4 (10 Mar)", color: "red" },
  { value: "Day 5", label: "Day 5 (11 Mar)", color: "violet" },
  { value: "Day 6", label: "Day 6 (12 Mar)", color: "yellow" },
  { value: "Day 7", label: "Day 7 (13 Mar)", color: "black" },
  { value: "Day 8", label: "Day 8 (14 Mar)", color: "grey" },
];

function getColorByDay(day) {
  return dayOptions.find((d) => d.value === day)?.color || "grey";
}

export default function AppView() {
  return (
    <div className="layout">
      {/* ===== Sidebar ===== */}
      <div className="sidebar">
        <h3>👨‍👩‍👧‍👦 Family Hokkaido Trip Plan 2026</h3>

        {dayOptions.map((day) => (
          <div key={day.value} className="day-group">
            <div
              className="day-header"
              style={{ borderLeftColor: day.color }}
            >
              {day.label}
            </div>

            {placesData
              .filter((p) => p.day === day.value)
              .sort((a, b) =>
                (a.time || "").localeCompare(b.time || "")
              )
              .map((p) => (
                <div key={p.id} className="place-item">
                  {p.time && (
                    <span className="time">{p.time}</span>
                  )}
                  <span>{p.name}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* ===== Map ===== */}
      <MapContainer
        center={[43.0618, 141.3545]}
        zoom={7}
        style={{ height: "100vh", flex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {placesData.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createIcon(getColorByDay(p.day))}
          >
            <Popup>
              <strong>{p.name}</strong>
              <div>📅 {p.day}</div>
              <div>⏰ {p.time || "-"}</div>
              <div>💴 {p.price || "-"}</div>
              {p.note && <div>📝 {p.note}</div>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

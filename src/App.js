import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

import "./App.css";

/* ================= ICON ================= */
function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

/* ================= DAYS ================= */
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

/* ============ ADD MARKER ============ */
function AddMarkerOnClick({ onAdd }) {
  useMapEvents({
    click(e) {
      const name = prompt("ชื่อสถานที่");
      if (!name) return;

      onAdd({
        id: Date.now(),
        name,
        city: "",
        day: "Day 1",
        time: "",
        price: "",
        note: "",
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
}

/* ============ MAP SEARCH ============ */
function MapSearch() {
  const map = useMapEvents({});

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
    })
      .on("markgeocode", (e) => {
        map.setView(e.geocode.center, 13);
      })
      .addTo(map);

    return () => map.removeControl(geocoder);
  }, [map]);

  return null;
}

function App() {
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  /* ===== state ===== */
  const [places, setPlaces] = useState(() => {
    const saved = localStorage.getItem("hokkaido-places");
    return saved ? JSON.parse(saved) : [];
  });

  /* ===== autosave ===== */
  useEffect(() => {
    localStorage.setItem("hokkaido-places", JSON.stringify(places));
  }, [places]);

  /* ===== helpers ===== */
  function updatePlace(id, field, value) {
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  }

  function deletePlace(id) {
    if (window.confirm("ลบหมุดนี้ใช่ไหม")) {
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    }
  }

  function focusPlace(p) {
    mapRef.current?.flyTo([p.lat, p.lng], 12, { duration: 0.8 });
    setTimeout(() => {
      markerRefs.current[p.id]?.openPopup();
    }, 300);
  }

  function placesByDay(day) {
    return places
      .filter((p) => p.day === day)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }

  return (
    <div className="layout">
      {/* ========== SIDEBAR ========== */}
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

            {placesByDay(day.value).map((p) => (
              <div
                key={p.id}
                className="place-item"
                onClick={() => focusPlace(p)}
              >
                {p.time && <span className="time">{p.time}</span>}
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ========== MAP ========== */}
      <MapContainer
        center={[43.0618, 141.3545]}
        zoom={7}
        style={{ height: "100vh", flex: 1 }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {places.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createIcon(getColorByDay(p.day))}
            ref={(ref) => (markerRefs.current[p.id] = ref)}
          >
            <Popup>
              <div className="popup-form">
                <strong>{p.name}</strong>

                <label>
                  เมือง / พื้นที่
                  <input
                    value={p.city}
                    onChange={(e) =>
                      updatePlace(p.id, "city", e.target.value)
                    }
                  />
                </label>

                <label>
                  วัน
                  <select
                    value={p.day}
                    onChange={(e) =>
                      updatePlace(p.id, "day", e.target.value)
                    }
                  >
                    {dayOptions.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  เวลา
                  <input
                    value={p.time}
                    placeholder="เช่น 09:30"
                    onChange={(e) =>
                      updatePlace(p.id, "time", e.target.value)
                    }
                  />
                </label>

                <label>
                  ค่าเข้า
                  <input
                    value={p.price}
                    onChange={(e) =>
                      updatePlace(p.id, "price", e.target.value)
                    }
                  />
                </label>

                <label>
                  Note
                  <textarea
                    value={p.note}
                    onChange={(e) =>
                      updatePlace(p.id, "note", e.target.value)
                    }
                  />
                </label>

                <div className="popup-actions">
                  <button
                    className="delete-btn"
                    onClick={() => deletePlace(p.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <AddMarkerOnClick
          onAdd={(p) => setPlaces((prev) => [...prev, p])}
        />
        <MapSearch />
      </MapContainer>
    </div>
  );
}

export default App;

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// District centers in Almaty
const districtCenters: Record<string, [number, number]> = {
  "Весь город": [43.238, 76.945],
  "Алмалинский": [43.257, 76.935],
  "Ауэзовский": [43.234, 76.875],
  "Бостандыкский": [43.218, 76.927],
  "Жетысуский": [43.262, 76.983],
  "Медеуский": [43.235, 76.960],
  "Наурызбайский": [43.220, 76.820],
  "Турксибский": [43.290, 76.970],
  "Алатауский": [43.200, 76.840],
};

const districtZoom: Record<string, number> = {
  "Весь город": 12,
};

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  description?: string;
  color?: string;
}

interface CityMapProps {
  district: string;
  points?: MapPoint[];
  circles?: { lat: number; lng: number; radius: number; color: string; label: string }[];
  height?: string;
  className?: string;
}

export default function CityMap({ district, points = [], circles = [], height = "100%", className = "" }: CityMapProps) {
  const center = districtCenters[district] || districtCenters["Весь город"];
  const zoom = districtZoom[district] || 13;

  return (
    <div className={className} style={{ height, minHeight: 260 }}>
      <MapContainer
        key={`${center[0]}-${center[1]}-${zoom}`}
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-xl z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]}>
            <Popup>
              <strong>{p.label}</strong>
              {p.description && <p className="text-xs mt-1">{p.description}</p>}
            </Popup>
          </Marker>
        ))}
        {circles.map((c, i) => (
          <Circle key={i} center={[c.lat, c.lng]} radius={c.radius} pathOptions={{ color: c.color, fillOpacity: 0.2 }}>
            <Popup>{c.label}</Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}

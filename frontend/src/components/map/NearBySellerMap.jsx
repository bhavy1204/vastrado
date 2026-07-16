import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import useGeolocation from "@/lib/useGeoLocation.js";
import { sellerService } from "@/api/index.js";
import { NEARBY_DEFAULT_RADIUS_KM } from "@/lib/constant";
import Loader from "../common/Loader.jsx";
import EmptyState from "../common/EmptyState.jsx";
import { MapPin } from "@phosphor-icons/react";

// NOTE: react-leaflet + leaflet chosen since no map provider is pinned in the
// tech stack (no Google Maps API key mentioned). Install with:
//   npm install leaflet react-leaflet

// Leaflet's default marker icons don't resolve correctly under bundlers —
// point them at CDN assets once, globally.

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#C0622A;border:3px solid white;box-shadow:0 0 0 2px #C0622A55;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/**
 * NearbySellersMap
 *   <NearbySellersMap radiusKm={5} />
 *
 * Uses useGeolocation() for the customer's position, then fetches nearby
 * sellers via sellerService.getNearbySellers({ lat, lng, radiusKm }).
 */

export default function NearbySellersMap({ radiusKm = NEARBY_DEFAULT_RADIUS_KM }) {
  const { coords, error: geoError, isLoading: isLocating, requestLocation } = useGeolocation();
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!coords) return;

    let isCancelled = false;
    setIsLoading(true);
    setFetchError(null);

    sellerService
      .getNearbySellers({ lat: coords.lat, lng: coords.lng, radiusKm })
      .then((res) => {
        if (isCancelled) return;

        const payload = res.data;

        const sellers = payload?.data?.sellers ?? payload?.sellers ?? [];

        setSellers(sellers);
      })
      .catch((err) => {
        if (!isCancelled)
          setFetchError(
            err?.response?.data?.message || "Couldn't load nearby shops",
          );
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
      

    return () => {
      isCancelled = true;
    };
  }, [coords, radiusKm]);

  if (isLocating) {
    return <Loader className="py-16" label="Finding your location..." />;
  }

  if (geoError) {
    return (
      <EmptyState
        icon={<MapPin size={26} weight="duotone" />}
        title="Location access needed"
        description="Turn on location access to see shops near you."
        actionLabel="Try again"
        onAction={requestLocation}
      />
    );
  }

  if (!coords) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-border relative">
      {isLoading && (
        <div className="absolute inset-0 z-1000 flex items-center justify-center bg-bg/70">
          <Loader label="Loading nearby shops..." />
        </div>
      )}

      {fetchError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-1000 bg-error-bg border border-error-border text-error text-xs rounded-md px-3 py-1.5">
          {fetchError}
        </div>
      )}

      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "420px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnCoords coords={coords} />

        <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {sellers.map((seller) => {
          const [lng, lat] = seller.location?.coordinates || [];
          if (lat == null || lng == null) return null;

          return (
            <Marker key={seller._id} position={[lat, lng]}>
              <Popup>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-sm">{seller.shopName}</p>
                  <Link to={`/shop/${seller.slug}`} className="text-xs text-primary underline">
                    View shop
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function RecenterOnCoords({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);
  return null;
}


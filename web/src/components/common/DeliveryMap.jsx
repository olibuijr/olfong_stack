import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const DeliveryMap = ({
  deliveryLocation,
  deliveryAddress,
  pickupLocation,
  orderType = 'delivery' // 'delivery' or 'pickup'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { t } = useLanguage();

  // Default coordinates for Reykjavik, Iceland
  const defaultCenter = [64.1466, -21.9426];

  // Get pickup location (store location)
  const storeLocation = [64.1466, -21.9426]; // Laugavegur 123, Reykjavik

  useEffect(() => {
    if (!mapRef.current) return;

    // Only initialize map once
    if (mapInstanceRef.current) {
      return;
    }

    // Create map with proper sizing
    const mapInstance = L.map(mapRef.current, {
      attributionControl: false
    }).setView(
      deliveryLocation ? [deliveryLocation.lat, deliveryLocation.lng] : defaultCenter,
      13
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance);

    mapInstanceRef.current = mapInstance;

    // Add markers based on order type
    if (orderType === 'pickup') {
      // Pickup order - show store location
      L.marker(storeLocation, {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          shadowSize: [41, 41],
          shadowAnchor: [12, 41],
        })
      })
        .bindPopup('<div><div class="font-semibold">🏪 Ölföng Store</div><div class="text-sm">Laugavegur 123<br/>Reykjavík 101</div></div>')
        .addTo(mapInstance)
        .openPopup();

      mapInstance.setView(storeLocation, 14);
    } else if (orderType === 'delivery') {
      // Delivery order - show delivery person location and delivery address
      if (deliveryLocation) {
        L.marker([deliveryLocation.lat, deliveryLocation.lng], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41],
          })
        })
          .bindPopup(`<div class="font-semibold">📦 Delivery Person</div>`)
          .addTo(mapInstance);
      }

      if (deliveryAddress) {
        L.marker([deliveryAddress.latitude || defaultCenter[0], deliveryAddress.longitude || defaultCenter[1]], {
          icon: L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            shadowSize: [41, 41],
            shadowAnchor: [12, 41],
          })
        })
          .bindPopup(
            `<div><div class="font-semibold">📍 Delivery Address</div>
            <div class="text-sm">${deliveryAddress.street || ''}<br/>${deliveryAddress.city || ''} ${deliveryAddress.postalCode || ''}</div></div>`
          )
          .addTo(mapInstance);
      }

      // Fit bounds to show both markers
      if (deliveryLocation && deliveryAddress) {
        const group = new L.FeatureGroup([
          L.marker([deliveryLocation.lat, deliveryLocation.lng]),
          L.marker([deliveryAddress.latitude || defaultCenter[0], deliveryAddress.longitude || defaultCenter[1]])
        ]);
        mapInstance.fitBounds(group.getBounds(), { padding: [50, 50] });
      }
    }

    // Trigger map resize to ensure proper rendering
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 100);

    return () => {
      // Don't destroy map on unmount - it's persistent
    };
  }, [orderType]);

  return (
    <div className="space-y-4 h-full">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          {orderType === 'pickup'
            ? t('navigation.language') === 'is'
              ? 'Pickupstaðsetning er merkt á kortinu hér að neðan'
              : 'Pickup location is marked on the map below'
            : t('navigation.language') === 'is'
            ? 'Staðsetning sendara og afhendingarheimilisfang eru sýndar á kortinu'
            : 'Delivery person and delivery address locations are shown on the map'}
        </div>
      </div>

      <div
        ref={mapRef}
        className="relative w-full min-h-96 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        style={{ height: '400px' }}
      />

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {t('navigation.language') === 'is' ? 'Kort frá' : 'Map by'} OpenStreetMap contributors
      </div>
    </div>
  );
};

export default DeliveryMap;

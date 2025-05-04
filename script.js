// Leaflet haritasını başlat
var map = L.map('map').setView([39.7735, 30.5250], 13); // Eskişehir merkez

// OpenStreetMap katmanını ekle
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap Katkıda Bulunanlar'
}).addTo(map);

// Kullanıcı marker'ı
var userMarker = L.marker([39.7735, 30.5250]).addTo(map).bindPopup("Senin Konumun").openPopup();

// Eskişehir sınırları içinde 2x2 km karelere bölme
const startLat = 39.7500; // Güney
const endLat = 39.8000;   // Kuzey
const startLng = 30.4800; // Batı
const endLng = 30.5700;   // Doğu
const gridSizeKm = 2;
const gridSizeLat = gridSizeKm / 110.574;
const gridSizeLng = gridSizeKm / (111.320 * Math.cos(startLat * Math.PI / 180));

let gridPolygons = [];

for (let lat = startLat; lat < endLat; lat += gridSizeLat) {
    for (let lng = startLng; lng < endLng; lng += gridSizeLng) {
        let coords = [
            [lat, lng],
            [lat + gridSizeLat, lng],
            [lat + gridSizeLat, lng + gridSizeLng],
            [lat, lng + gridSizeLng]
        ];

        let polygon = L.polygon(coords, {
            color: "#666",
            fillColor: "#cccccc",
            fillOpacity: 0.2
        }).addTo(map);

        gridPolygons.push({
            polygon: polygon,
            bounds: L.latLngBounds(coords)
        });
    }
}

// Konum takibi
navigator.geolocation.watchPosition(
    function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        userMarker.setLatLng([lat, lng]).bindPopup("Güncellenen Konum").openPopup();
        highlightUserZone(lat, lng);
    },
    function(error) {
        console.log("Konum hatası:", error);
    },
    { enableHighAccuracy: true }
);

let activePolygon = null;

function highlightUserZone(lat, lng) {
    for (let zone of gridPolygons) {
        if (zone.bounds.contains([lat, lng])) {
            if (activePolygon !== zone.polygon) {
                if (activePolygon) {
                    activePolygon.setStyle({ fillColor: "#cccccc", color: "#666" });
                }
                zone.polygon.setStyle({ fillColor: "#00ccff", color: "#0066cc" });
                activePolygon = zone.polygon;
            }
            return;
        }
    }

    // Eğer hiçbir grid'e girilmiyorsa önceki renk sıfırlanır
    if (activePolygon) {
        activePolygon.setStyle({ fillColor: "#cccccc", color: "#666" });
        activePolygon = null;
    }
}

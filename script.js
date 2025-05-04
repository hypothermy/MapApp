// Leaflet haritasını başlat
var map = L.map('map').setView([39.749236, 30.500980], 13); // Başlangıç konumu

// OpenStreetMap katmanını ekle
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap Katkıda Bulunanlar'
}).addTo(map);

// Kullanıcının konumunu gösteren marker
var userMarker = L.marker([39.749236, 30.500980]).addTo(map).bindPopup("Senin Konumun (Başlangıç)").openPopup();

// Osmangazi Üniversitesi bölgesi
var osmangaziCoords = [
    [39.759269, 30.469955], // Kuzeybatı
    [39.759269, 30.501538], // Kuzeydoğu
    [39.726270, 30.501538], // Güneydoğu
    [39.726270, 30.469955]  // Güneybatı
];

var osmangaziPolygon = L.polygon(osmangaziCoords, {
    color: "red",
    fillColor: "#ff6666",
    fillOpacity: 0.4
}).addTo(map).bindPopup("Osmangazi Üniversitesi Alanı");

// Merkez bölgesi
var merkezCoords = [
    [39.785946, 30.512944], // Kuzeybatı
    [39.785946, 30.536315], // Kuzeydoğu
    [39.769881, 30.536315], // Güneydoğu
    [39.769881, 30.512944]  // Güneybatı
];

var merkezPolygon = L.polygon(merkezCoords, {
    color: "red",
    fillColor: "#ff3333",
    fillOpacity: 0.4
}).addTo(map).bindPopup("Merkez Alanı");

// Alan bilgileri ve müzik dosyası
var zones = [
    {
        name: "Osmangazi Üniversitesi",
        coords: osmangaziCoords,
        music: "muzikler/free.mp3"
    },
    {
        name: "Merkez",
        coords: merkezCoords,
        music: null
    }
];

// Ses çalar
var audio = new Audio();
audio.style.display = "none";
document.body.appendChild(audio);

var currentZone = null;

// Koordinatların bir alan içinde olup olmadığını kontrol et
function isInsideZone(lat, lon, zoneCoords) {
    let inside = false;
    for (let i = 0, j = zoneCoords.length - 1; i < zoneCoords.length; j = i++) {
        let xi = zoneCoords[i][0], yi = zoneCoords[i][1];
        let xj = zoneCoords[j][0], yj = zoneCoords[j][1];

        let intersect = ((yi > lon) !== (yj > lon)) &&
            (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// İlk konum kontrolü
checkLocation(39.749236, 30.500980);

// Gerçek zamanlı konum takibi
navigator.geolocation.watchPosition(
    function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        console.log(`Güncellenen Konum: ${lat}, ${lon}`);

        userMarker.setLatLng([lat, lon]).bindPopup("Güncellenen Konum").openPopup();

        checkLocation(lat, lon);
    },
    function(error) {
        console.log("Konum hatası:", error);
    },
    { enableHighAccuracy: true }
);

// Konuma göre müzik ve alan yönetimi
function checkLocation(lat, lon) {
    let insideZone = null;

    zones.forEach(zone => {
        if (isInsideZone(lat, lon, zone.coords)) {
            insideZone = zone;
        }
    });

    if (insideZone && insideZone.name === "Merkez") {
        if (currentZone) {
            audio.pause();
            audio.currentTime = 0;
            currentZone = null;
        }
        return;
    }

    if (insideZone && insideZone !== currentZone) {
        currentZone = insideZone;

        if (insideZone.music) {
            audio.src = currentZone.music;
            audio.load();
            audio.play().catch(err => console.log("Oynatma hatası:", err));
        }

        if (insideZone.name === "Osmangazi Üniversitesi") {
            osmangaziPolygon.setStyle({ color: "blue", fillColor: "#6666ff" });
        }

    } else if (!insideZone && currentZone) {
        audio.pause();
        audio.currentTime = 0;
        currentZone = null;

        osmangaziPolygon.setStyle({ color: "red", fillColor: "#ff6666" });
    }
}

// Otomatik oynatma engelini aşmak için kullanıcı etkileşimi
document.addEventListener("click", function() {
    audio.play().catch(error => console.log("Oynatma hatası:", error));
});

// 🔲 Eskişehir'i 5x5 km'lik karelere böl
const baseLat = 39.70;
const baseLng = 30.40;
const kmToDegrees = 0.045; // ~5km
const rows = 5;
const cols = 5;

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        let lat1 = baseLat + (i * kmToDegrees);
        let lng1 = baseLng + (j * kmToDegrees);
        let lat2 = lat1 + kmToDegrees;
        let lng2 = lng1 + kmToDegrees;

        let squareCoords = [
            [lat1, lng1],
            [lat1, lng2],
            [lat2, lng2],
            [lat2, lng1]
        ];

        L.polygon(squareCoords, {
            color: "#444",
            weight: 1,
            fillColor: "#ccc",
            fillOpacity: 0.1
        }).addTo(map).bindPopup(`Grid: ${i + 1},${j + 1}`);
    }
}

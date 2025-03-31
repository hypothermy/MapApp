// Leaflet haritasını başlat
var map = L.map('map').setView([39.749236, 30.500980], 16); // Başlangıç konumu

// OpenStreetMap katmanını ekle
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap Katkıda Bulunanlar'
}).addTo(map);

// Kullanıcının konumunu gösteren marker
var userMarker = L.marker([39.749236, 30.500980]).addTo(map).bindPopup("Senin Konumun (Başlangıç)").openPopup();

// Osmangazi Üniversitesi bölgesi (Mavi olacak)
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

// Yeni eklenen Merkez bölgesi (Kırmızı olacak)
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
        music: null // Merkez bölgesinde müzik çalmayacak
    }
];

// Arka planda çalışacak ses çalar
var audio = new Audio();
audio.style.display = "none";
document.body.appendChild(audio);

var currentZone = null; // Oynayan müziğin alanı

// Konumun belirli bir alan içinde olup olmadığını kontrol etme fonksiyonu
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

// BAŞLANGIÇTA MANUEL KONUM KONTROLÜ (Osmangazi Üniversitesi içinde başlat)
checkLocation(39.749236, 30.500980);

// Kullanıcının konumunu sürekli takip et
navigator.geolocation.watchPosition(
    function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        console.log(`Güncellenen Konum: ${lat}, ${lon}`);

        // Marker'ı güncelle
        userMarker.setLatLng([lat, lon]).bindPopup("Güncellenen Konum").openPopup();

        checkLocation(lat, lon);
    },
    function(error) {
        console.log("Konum hatası:", error);
    },
    { enableHighAccuracy: true }
);

// Konumu kontrol eden fonksiyon
function checkLocation(lat, lon) {
    let insideZone = null;

    // Alan içinde olup olmadığını kontrol et
    zones.forEach(zone => {
        if (isInsideZone(lat, lon, zone.coords)) {
            insideZone = zone;
        }
    });

    // Eğer merkez bölgesindeyse müziği durdur
    if (insideZone && insideZone.name === "Merkez") {
        if (currentZone) {
            audio.pause();
            audio.currentTime = 0;
            currentZone = null;
        }
        return;
    }

    // Eğer yeni bir bölgeye girildiyse müziği değiştir ve alan rengini değiştir
    if (insideZone && insideZone !== currentZone) {
        currentZone = insideZone;
        
        if (insideZone.music) {
            audio.src = currentZone.music;
            audio.load();
            audio.play().catch(err => console.log("Oynatma hatası:", err));
        }

        // Osmangazi alanını mavi yap
        if (insideZone.name === "Osmangazi Üniversitesi") {
            osmangaziPolygon.setStyle({ color: "blue", fillColor: "#6666ff" });
        }

    } 
    // Eğer bölgeden çıktıysa müziği durdur ve rengi kırmızıya döndür
    else if (!insideZone && currentZone) {
        audio.pause();
        audio.currentTime = 0;
        currentZone = null;

        // Osmangazi alanını tekrar kırmızı yap
        osmangaziPolygon.setStyle({ color: "red", fillColor: "#ff6666" });
    }
}

// Tarayıcı otomatik oynatmayı engellemesin diye sayfaya tıklama bekle
document.addEventListener("click", function() {
    audio.play().catch(error => console.log("Oynatma hatası:", error));
});

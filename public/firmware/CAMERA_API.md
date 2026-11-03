# Источники данных о камерах и ограничениях скорости

## 1. OpenStreetMap Overpass API (Бесплатно)

Получение ограничений скорости для дорог:

```
https://overpass-api.de/api/interpreter?data=[out:json];way(around:500,55.7558,37.6173)["maxspeed"];out tags;
```

Получение камер:
```
https://overpass-api.de/api/interpreter?data=[out:json];node(around:1000,55.7558,37.6173)["highway"="speed_camera"];out;
```

## 2. Speed Camera Database (scdb.info)

CSV файл со всеми камерами мира:
```
https://www.scdb.info/api/scdb.csv
```

Формат: `lat,lon,speed_limit,type,direction`

## 3. Локальный JSON (рекомендуется для ESP32)

Загрузить JSON на SD-карту или в SPIFFS:

```json
{
  "cameras": [
    {"lat": 55.7558, "lon": 37.6173, "limit": 60, "type": "speed"},
    {"lat": 55.7500, "lon": 37.6200, "limit": 80, "type": "redlight"}
  ],
  "zones": [
    {"lat": 55.7558, "lon": 37.6173, "radius": 200, "limit": 40}
  ]
}
```

## 4. HTTP API (если есть Wi-Fi в машине)

```cpp
void fetchCamerasFromAPI() {
  HTTPClient http;
  http.begin("http://your-server.com/api/cameras?lat=" + 
             String(gpsData.latitude, 6) + "&lon=" + 
             String(gpsData.longitude, 6) + "&radius=1000");
  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    // Парсить JSON
  }
  http.end();
}
```

## 5. GPS-трек с ограничениями

Можно записать трек с ограничениями скорости и воспроизводить:

```json
{
  "track": [
    {"lat": 55.7558, "lon": 37.6173, "limit": 60},
    {"lat": 55.7560, "lon": 37.6175, "limit": 60},
    {"lat": 55.7565, "lon": 37.6180, "limit": 80}
  ]
}
```

## Рекомендация для ESP32

Для автономной работы (без Wi-Fi) лучше всего:
1. Загрузить базу камер в SPIFFS (до 1MB данных)
2. При старте загрузить в RAM
3. Проверять расстояние при каждом обновлении GPS
4. Обновлять базу раз в неделю через Wi-Fi дома

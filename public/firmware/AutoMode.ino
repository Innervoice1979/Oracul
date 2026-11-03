/*
 * ============================================================================
 *  InnerVoice ESP Oracle — Режим AUTO (Автомобиль)
 * ============================================================================
 *  GPS + MPU6050 + TFT дисплей
 *  - Текущая скорость от GPS
 *  - Анимация дороги с перспективой
 *  - Детекция поворотов через акселерометр
 *  - Предупреждения о камерах и ограничениях скорости
 *  - База координат камер (локальная или через API)
 * ============================================================================
 */

// ============================================================================
// GPS КОНФИГУРАЦИЯ
// ============================================================================

#define GPS_RX_PIN 8
#define GPS_TX_PIN 9
#define GPS_BAUD 9600

// ============================================================================
// GPS ДАННЫЕ
// ============================================================================

struct GPSData {
  float latitude;
  float longitude;
  float speed_kmh;    // км/ч
  float course;       // курс в градусах (0-360)
  bool valid;
  unsigned long lastUpdate;
};

GPSData gpsData = {0, 0, 0, 0, false, 0};

// ============================================================================
// КАМЕРЫ И ОГРАНИЧЕНИЯ
// ============================================================================

struct SpeedCamera {
  float lat;
  float lon;
  int speedLimit;     // ограничение скорости
  const char* type;   // "speed", "redlight", "mobile"
};

// Локальная база камер (пример — Москва)
// В реальном проекте загрузить из файла или API
const SpeedCamera cameras[] = {
  {55.7558, 37.6173, 60, "speed"},    // Пример: камера на скорости 60
  {55.7500, 37.6200, 80, "redlight"},
  {55.7600, 37.6100, 60, "speed"},
  // ... можно добавить больше координат
};

const int CAMERA_COUNT = sizeof(cameras) / sizeof(cameras[0]);
const float CAMERA_ALERT_DISTANCE = 300; // метров до предупреждения

// ============================================================================
// РЕЖИМ AUTO — СОСТОЯНИЕ
// ============================================================================

struct AutoState {
  float roadOffset;        // смещение дороги (анимация)
  float turnAngle;         // угол поворота (от акселерометра)
  bool turnLeft;
  bool turnRight;
  unsigned long turnStartTime;
  int currentSpeedLimit;   // текущее ограничение
  bool speedWarning;       // превышение скорости
  unsigned long lastCameraCheck;
  int cameraAlertTimer;    // таймер предупреждения о камере
};

AutoState autoState = {0, 0, false, false, 0, 60, false, 0, 0};

// ============================================================================
// GPS ПАРСИНГ (NMEA)
// ============================================================================

#include <SoftwareSerial.h>

SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);

void setupGPS() {
  gpsSerial.begin(GPS_BAUD);
#if ENABLE_SERIAL
  Serial.println("GPS initialized");
#endif
}

// Парсинг NMEA $GPRMC
bool parseGPRMC(const char* sentence) {
  // $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A
  // fields: time, status, lat, N/S, lon, E/W, speed(knots), course, date, ...
  
  char* parts[13];
  int partCount = 0;
  char buffer[128];
  strncpy(buffer, sentence, sizeof(buffer) - 1);
  buffer[sizeof(buffer) - 1] = '\0';
  
  char* token = strtok(buffer, ",*");
  while (token && partCount < 13) {
    parts[partCount++] = token;
    token = strtok(NULL, ",*");
  }
  
  if (partCount < 10) return false;
  if (strcmp(parts[0], "$GPRMC") != 0) return false;
  if (strcmp(parts[2], "A") != 0) return false; // A = active, V = void
  
  // Широта
  float lat = atof(parts[3]);
  int latDeg = (int)(lat / 100);
  float latMin = lat - latDeg * 100;
  gpsData.latitude = latDeg + latMin / 60.0;
  if (strcmp(parts[4], "S") == 0) gpsData.latitude = -gpsData.latitude;
  
  // Долгота
  float lon = atof(parts[5]);
  int lonDeg = (int)(lon / 100);
  float lonMin = lon - lonDeg * 100;
  gpsData.longitude = lonDeg + lonMin / 60.0;
  if (strcmp(parts[6], "W") == 0) gpsData.longitude = -gpsData.longitude;
  
  // Скорость (узлы -> км/ч)
  float speedKnots = atof(parts[7]);
  gpsData.speed_kmh = speedKnots * 1.852;
  
  // Курс
  gpsData.course = atof(parts[8]);
  
  gpsData.valid = true;
  gpsData.lastUpdate = millis();
  
  return true;
}

void updateGPS() {
  static char buffer[128];
  static int bufPos = 0;
  
  while (gpsSerial.available()) {
    char c = gpsSerial.read();
    
    if (c == '$') {
      bufPos = 0;
    } else if (c == '\n' || c == '\r') {
      if (bufPos > 0) {
        buffer[bufPos] = '\0';
        if (strstr(buffer, "$GPRMC")) {
          parseGPRMC(buffer);
        }
        bufPos = 0;
      }
    } else {
      if (bufPos < sizeof(buffer) - 1) {
        buffer[bufPos++] = c;
      }
    }
  }
  
  // Если GPS не обновлялся 5 секунд — считаем невалидным
  if (millis() - gpsData.lastUpdate > 5000) {
    gpsData.valid = false;
  }
}

// ============================================================================
// ДЕТЕКЦИЯ ПОВОРОТОВ (акселерометр)
// ============================================================================

void detectTurn() {
  if (!mpuReady) return;
  
  AccelData a = readAccelBurst();
  
  // Боковое ускорение (ось X при горизонтальном положении)
  // Порог ~0.3g для детекции поворота
  const int TURN_THRESHOLD = 5000; // ~0.3g при ±2g
  
  float lateralAccel = a.x;
  
  if (abs(lateralAccel) > TURN_THRESHOLD) {
    if (lateralAccel > 0) {
      autoState.turnRight = true;
      autoState.turnLeft = false;
    } else {
      autoState.turnLeft = true;
      autoState.turnRight = false;
    }
    autoState.turnStartTime = millis();
  }
  
  // Сбрасываем поворот через 2 секунды
  if (millis() - autoState.turnStartTime > 2000) {
    autoState.turnLeft = false;
    autoState.turnRight = false;
  }
}

// ============================================================================
// ПРОВЕРКА КАМЕР
// ============================================================================

float distanceBetween(float lat1, float lon1, float lat2, float lon2) {
  // Упрощённая формула гаверсина (в метрах)
  const float R = 6371000; // радиус Земли в метрах
  float dLat = (lat2 - lat1) * PI / 180.0;
  float dLon = (lon2 - lon1) * PI / 180.0;
  float a = sin(dLat / 2) * sin(dLat / 2) +
            cos(lat1 * PI / 180.0) * cos(lat2 * PI / 180.0) *
            sin(dLon / 2) * sin(dLon / 2);
  float c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c;
}

void checkCameras() {
  if (!gpsData.valid) return;
  
  // Проверяем не чаще раза в секунду
  if (millis() - autoState.lastCameraCheck < 1000) return;
  autoState.lastCameraCheck = millis();
  
  autoState.currentSpeedLimit = 60; // по умолчанию
  autoState.speedWarning = false;
  
  // Ищем ближайшую камеру
  for (int i = 0; i < CAMERA_COUNT; i++) {
    float dist = distanceBetween(
      gpsData.latitude, gpsData.longitude,
      cameras[i].lat, cameras[i].lon
    );
    
    if (dist < CAMERA_ALERT_DISTANCE) {
      autoState.currentSpeedLimit = cameras[i].speedLimit;
      autoState.cameraAlertTimer = 3000; // показываем 3 секунды
      
#if ENABLE_SERIAL
      Serial.printf("Camera ahead: %dm, limit %d km/h\n", (int)dist, cameras[i].speedLimit);
#endif
      break;
    }
  }
  
  // Проверка превышения скорости
  if (gpsData.speed_kmh > autoState.currentSpeedLimit + 5) {
    autoState.speedWarning = true;
  }
  
  // Таймер предупреждения о камере
  if (autoState.cameraAlertTimer > 0) {
    autoState.cameraAlertTimer -= 15; // вычитаем delay loop
  }
}

// ============================================================================
// ОТРИСОВКА РЕЖИМА AUTO
// ============================================================================

void drawAutoMode() {
  tft.fillScreen(C_BG);
  
  int centerX = SCREEN_WIDTH / 2;
  int centerY = SCREEN_HEIGHT / 2;
  
  // === АНИМАЦИЯ ДОРОГИ ===
  autoState.roadOffset += gpsData.speed_kmh * 0.1; // скорость анимации
  if (autoState.roadOffset > 20) autoState.roadOffset = 0;
  
  // Горизонт
  int horizonY = centerY - 30;
  tft.drawLine(0, horizonY, SCREEN_WIDTH, horizonY, C_DIM);
  
  // Дорога (перспектива)
  int roadWidthTop = 40;
  int roadWidthBottom = SCREEN_WIDTH;
  
  for (int y = horizonY; y < SCREEN_HEIGHT; y += 2) {
    float progress = (float)(y - horizonY) / (SCREEN_HEIGHT - horizonY);
    int roadWidth = roadWidthTop + (roadWidthBottom - roadWidthTop) * progress;
    int roadLeft = centerX - roadWidth / 2;
    int roadRight = centerX + roadWidth / 2;
    
    // Дорога
    tft.drawLine(roadLeft, y, roadRight, y, tft.color565(40, 40, 40));
    
    // Разметка (пунктир)
    int dashY = (y + (int)autoState.roadOffset) % 20;
    if (dashY < 10) {
      int dashWidth = 2 + progress * 4;
      tft.drawLine(centerX - dashWidth, y, centerX + dashWidth, y, C_FG);
    }
  }
  
  // === ПОВОРОТЫ ===
  if (autoState.turnLeft) {
    // Стрелка влево
    tft.fillTriangle(20, centerY, 50, centerY - 20, 50, centerY + 20, C_ACC);
    printCentered(centerY + 40, "← ПОВОРОТ", C_ACC, FONT_RU);
  }
  if (autoState.turnRight) {
    // Стрелка вправо
    tft.fillTriangle(SCREEN_WIDTH - 20, centerY, 
                     SCREEN_WIDTH - 50, centerY - 20, 
                     SCREEN_WIDTH - 50, centerY + 20, C_ACC);
    printCentered(centerY + 40, "ПОВОРОТ →", C_ACC, FONT_RU);
  }
  
  // === МАШИНКА (жёлтая) ===
  int carY = SCREEN_HEIGHT - 60;
  uint16_t carColor = tft.color565(255, 220, 0); // жёлтый
  
  // Кузов
  tft.fillRect(centerX - 15, carY - 10, 30, 20, carColor);
  // Крыша
  tft.fillRect(centerX - 10, carY - 20, 20, 10, carColor);
  // Колёса
  tft.fillCircle(centerX - 12, carY + 10, 5, C_BG);
  tft.fillCircle(centerX + 12, carY + 10, 5, C_BG);
  
  // === СПИДОМЕТР ===
  int speedX = 60;
  int speedY = 40;
  
  // Фон спидометра
  tft.fillCircle(speedX, speedY, 35, tft.color565(20, 20, 20));
  tft.drawCircle(speedX, speedY, 35, C_DIM);
  
  // Скорость
  char speedStr[8];
  snprintf(speedStr, sizeof(speedStr), "%.0f", gpsData.speed_kmh);
  u8g2.setFont(FONT_TITLE);
  int16_t w = u8g2.getUTF8Width(speedStr);
  u8g2.setForegroundColor(autoState.speedWarning ? C_RED : C_FG);
  u8g2.drawUTF8(speedX - w / 2, speedY + 8, speedStr);
  
  // Единицы
  u8g2.setFont(FONT_SMALL);
  u8g2.setForegroundColor(C_DIM);
  u8g2.drawUTF8(speedX - 10, speedY + 20, "км/ч");
  
  // === ОГРАНИЧЕНИЕ СКОРОСТИ ===
  int limitX = SCREEN_WIDTH - 60;
  int limitY = 40;
  
  // Круг ограничения
  tft.fillCircle(limitX, limitY, 25, C_BG);
  tft.drawCircle(limitX, limitY, 25, C_RED);
  tft.drawCircle(limitX, limitY, 22, C_RED);
  
  // Число ограничения
  char limitStr[4];
  snprintf(limitStr, sizeof(limitStr), "%d", autoState.currentSpeedLimit);
  u8g2.setFont(FONT_RU);
  w = u8g2.getUTF8Width(limitStr);
  u8g2.setForegroundColor(C_FG);
  u8g2.drawUTF8(limitX - w / 2, limitY + 5, limitStr);
  
  // === ПРЕДУПРЕЖДЕНИЕ О КАМЕРЕ ===
  if (autoState.cameraAlertTimer > 0) {
    tft.fillRect(0, SCREEN_HEIGHT - 30, SCREEN_WIDTH, 30, tft.color565(200, 0, 0));
    printCentered(SCREEN_HEIGHT - 10, "📷 КАМЕРА ВПЕРЕДИ!", C_FG, FONT_RU);
  }
  
  // === ПРЕДУПРЕЖДЕНИЕ О ПРЕВЫШЕНИИ ===
  if (autoState.speedWarning) {
    // Мигающий текст
    if ((millis() / 500) % 2 == 0) {
      printCentered(SCREEN_HEIGHT - 50, "⚠ ПРЕВЫШЕНИЕ!", C_RED, FONT_RU);
    }
  }
  
  // === GPS СТАТУС ===
  if (!gpsData.valid) {
    printCentered(SCREEN_HEIGHT - 10, "GPS: поиск спутников...", C_DIM, FONT_SMALL);
  }
}

// ============================================================================
// ОБНОВЛЕНИЕ РЕЖИМА AUTO
// ============================================================================

void updateAutoMode(unsigned long now) {
  updateGPS();
  detectTurn();
  checkCameras();
  drawAutoMode();
}

// ============================================================================
// ИНТЕГРАЦИЯ В ОСНОВНОЙ КОД
// ============================================================================

/*
В setup() добавить:
  setupGPS();

В enum AppMode добавить:
  AUTO,
  
В drawMode() добавить:
  case AppMode::AUTO:
    drawAutoMode();
    break;

В loop() добавить:
  if (mode == AppMode::AUTO) {
    updateAutoMode(now);
  }
*/

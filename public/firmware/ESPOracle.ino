/*
 * ============================================================================
 *  InnerVoice ESP Oracle — ESPOracle.ino
 * ============================================================================
 *  Портативный умный оракул на ESP32-C3 SuperMini
 *  TFT ST7789 240x240 + MPU6050 + TTP223 кнопка
 *  6 режимов: Оракул, Часы, Игры, Сеть, Робот, Настройки
 * ============================================================================
 */

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>
#include <U8g2_for_Adafruit_GFX.h>
#include <WiFi.h>
#include <ESPmDNS.h>
#include <HTTPClient.h>
#include "esp_sleep.h"
#include "esp_random.h"

// ============================================================================
// КОНФИГУРАЦИЯ
// ============================================================================

#define ENABLE_SERIAL 1
#define ENABLE_JARVIS_HTTP 0

// --- TFT ST7789 ---
#define TFT_SCLK 5
#define TFT_MOSI 6
#define TFT_CS   10
#define TFT_DC   7
#define TFT_RST  3
#define TFT_BL   21
#define TFT_INVERT true

#define SCREEN_WIDTH  240
#define SCREEN_HEIGHT 240

// --- MPU6050 ---
#define MPU_SDA_PIN 1
#define MPU_SCL_PIN 0
#define MPU_INT_PIN 4
#define MPU_ADDR    0x68

// --- Кнопка ---
#define BTN_PIN         20
#define BTN_ACTIVE_HIGH true

// --- Вибромотор ---
#define VIBR_PIN        2    // GPIO2 — свободный пин
#define VIBR_ENABLED    1    // 1 = вибромотор подключён, 0 = нет

// --- Wi-Fi ---
const char* WIFI_SSID  = "";
const char* WIFI_PASS  = "";
const char* MDNS_NAME  = "inner-oracle";
const char* NTP_SERVER = "pool.ntp.org";
const long  GMT_OFFSET_SEC   = 3 * 3600;  // Москва UTC+3
const int   DST_OFFSET_SEC   = 0;

// --- Jarvis ---
const char* JARVIS_ORACLE_URL = "http://jarvis.local:5005/api/oracle";
const char* DEVICE_NAME       = "InnerVoice";

// --- Таймеры ---
#define SHAKE_THRESHOLD    12000
#define SHAKE_COOLDOWN_MS  2500
#define BOOT_GRACE_MS      2000
#define DIM_AFTER_MS       10000
#define SLEEP_AFTER_MS     25000
#define DEFAULT_BRIGHTNESS 220
#define DIM_BRIGHTNESS     45

// --- MPU ---
#define WOM_THRESHOLD          40
#define MPU_INT_PIN_CFG_VALUE  0x30

// --- Кнопка ---
#define DEBOUNCE_MS 40
#define LONG_MS     700
#define DOUBLE_MS   300

// --- AUTO режим (на акселерометре) ---
#define AUTO_SAMPLE_MS 50  // частота опроса акселерометра в AUTO

// ============================================================================
// ГЛОБАЛЬНЫЕ ОБЪЕКТЫ
// ============================================================================

Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);
U8G2_FOR_ADAFRUIT_GFX u8g2;

// ============================================================================
// ЦВЕТА
// ============================================================================

uint16_t C_BG, C_FG, C_ACC, C_DIM, C_WARN, C_GOOD, C_RED;

// ============================================================================
// СОСТОЯНИЕ
// ============================================================================

unsigned long lastActivity    = 0;
unsigned long lastShakeTime   = 0;
unsigned long lastWifiAttempt = 0;
bool mpuReady          = false;
bool brightnessDimmed  = false;
uint8_t brightness     = DEFAULT_BRIGHTNESS;
bool mdnsStarted       = false;
bool ntpConfigured     = false;
String lastConnStatus  = "";

// ============================================================================
// AUTO РЕЖИМ — АНАЛИЗАТОР ВОЖДЕНИЯ (на акселерометре)
// ============================================================================
//
// Что можно определить только по MPU6050:
//  • Разгон / торможение — продольное ускорение (ось X при горизонтальном)
//  • Повороты            — боковое ускорение (ось Y)
//  • Вибрация / неровности дороги — высокочастотный шум по Z
//  • Уклон               — проекция гравитации на ось Z
//  • Резкие манёвры      — пики ускорения (джёрк)
//  • Стиль вождения      — по статистике ускорений
//  • Относительная скорость — интеграл ускорения с коррекцией дрейфа
//
// НЕЛЬЗЯ определить:
//  • Абсолютную скорость (нужен GPS)
//  • Координаты (нужен GPS)
//  • Камеры скорости (нужна база координат)
// ============================================================================

struct AutoState {
  // Скорость (относительная, условные единицы 0-200)
  float relSpeed;          // относительная скорость
  float speedSmooth;       // сглаженная для отображения
  
  // Ускорения (сглаженные)
  float axSmooth, aySmooth, azSmooth;
  
  // События
  bool accelerating;       // разгон
  bool braking;            // торможение
  bool turnLeft;           // поворот влево
  bool turnRight;          // поворот вправо
  bool bumpyRoad;          // неровная дорога
  bool sharpManeuver;      // резкий манёвр
  unsigned long eventTime; // время последнего события
  
  // Статистика
  int turnCount;           // счётчик поворотов
  int brakeCount;          // счётчик торможений
  int accelCount;          // счётчик разгонов
  int sharpCount;          // счётчик резких манёвров
  unsigned long driveTime; // время в движении
  
  // Анимация
  float roadOffset;        // смещение разметки
  float carTilt;           // наклон машинки при повороте
  bool isMoving;           // устройство в движении
  
  // Стиль вождения (0-100, где 100 = очень агрессивный)
  int drivingStyle;
};

AutoState autoState = {0};

unsigned long autoLastSample = 0;
unsigned long autoDriveStart = 0;

// ============================================================================
// ОРАКУЛ — ФРАЗЫ
// ============================================================================

const char* quotes[] = {
  "Однозначно да",
  "Без сомнений",
  "Можешь быть уверен",
  "Скорее всего да",
  "Перспективы хорошие",
  "Знаки говорят — да",
  "Да",
  "Определённо да",
  "Спроси позже",
  "Лучше не говорить",
  "Сейчас не могу предсказать",
  "Сосредоточься и спроси снова",
  "Не рассчитывай на это",
  "Мой ответ — нет",
  "Источники говорят — нет",
  "Весьма сомнительно",
  "Нет",
  "Звёзды молчат",
  "Попробуй другой вопрос",
  "Ответ скрыт в тумане",
  "Вселенная не готова ответить"
};

const int QUOTE_COUNT = sizeof(quotes) / sizeof(quotes[0]);

// ============================================================================
// РЕЖИМЫ
// ============================================================================

enum class AppMode : uint8_t {
  ORACLE = 0,
  CLOCK,
  GAMES,
  NETWORK,
  ROBOT,
  AUTO,
  SETUP,
  COUNT
};

AppMode mode = AppMode::ORACLE;

// ============================================================================
// ИГРЫ
// ============================================================================

enum class GameId : uint8_t {
  SNAKE = 0,
  REACTION,
  COUNT
};

GameId selectedGame = GameId::SNAKE;
GameId currentGame  = GameId::SNAKE;
bool inGame = false;

// --- Змейка ---
#define COLS 12
#define ROWS 12

int snakeX[COLS * ROWS];
int snakeY[COLS * ROWS];
int snakeLen    = 3;
int snakeDirX   = 1;
int snakeDirY   = 0;
int snakePendX  = 1;
int snakePendY  = 0;
int snakeFoodX  = 5;
int snakeFoodY  = 5;
int snakeScore  = 0;
int snakeSpeed  = 150;
bool snakeAlive = true;
unsigned long snakeNextMove = 0;

// --- Реакция ---
enum class ReactionState : uint8_t {
  IDLE, READY, WAIT, GO, RESULT, EARLY
};

ReactionState reactState    = ReactionState::IDLE;
unsigned long reactGoTime   = 0;
unsigned long reactStartTime = 0;
unsigned long reactResultMs = 0;

// ============================================================================
// КНОПКА
// ============================================================================

enum class ButtonEvent : uint8_t {
  None, Short, Long, Double
};

class ButtonMonitor {
public:
  void begin(int pin, bool activeHigh) {
    _pin = pin;
    _activeHigh = activeHigh;
    if (_activeHigh) {
      pinMode(_pin, INPUT_PULLDOWN);
    } else {
      pinMode(_pin, INPUT_PULLUP);
    }
  }

  bool readRaw() {
    bool raw = digitalRead(_pin);
    return _activeHigh ? raw : !raw;
  }

  ButtonEvent update() {
    bool raw = readRaw();
    unsigned long now = millis();

    if (raw != _lastRaw) {
      _lastRaw = raw;
      _lastChange = now;
    }

    if (now - _lastChange > DEBOUNCE_MS) {
      if (raw != _state) {
        _state = raw;
        if (_state) {
          _pressStart = now;
          _longFired = false;
        } else {
          if (!_longFired) {
            _taps++;
            _releaseTime = now;
            _waitingDouble = true;
          }
        }
      }
    }

    if (_state && !_longFired && now - _pressStart > LONG_MS) {
      _longFired = true;
      _taps = 0;
      _waitingDouble = false;
      return ButtonEvent::Long;
    }

    if (_waitingDouble && now - _releaseTime > DOUBLE_MS) {
      _waitingDouble = false;
      if (_taps == 1) {
        _taps = 0;
        return ButtonEvent::Short;
      }
      if (_taps >= 2) {
        _taps = 0;
        return ButtonEvent::Double;
      }
    }

    return ButtonEvent::None;
  }

private:
  int _pin = 0;
  bool _activeHigh = true;
  bool _state = false;
  bool _lastRaw = false;
  bool _longFired = false;
  bool _waitingDouble = false;
  int _taps = 0;
  unsigned long _pressStart = 0;
  unsigned long _releaseTime = 0;
  unsigned long _lastChange = 0;
};

ButtonMonitor button;

// ============================================================================
// ПОДСВЕТКА
// ============================================================================

void backlightInit() {
  pinMode(TFT_BL, OUTPUT);
  ledcAttach(TFT_BL, 2000, 8);
}

void backlightSet(uint8_t val) {
  ledcWrite(TFT_BL, val);
}

// ============================================================================
// ВИБРОМОТОР
// ============================================================================

void vibrInit() {
#if VIBR_ENABLED
  pinMode(VIBR_PIN, OUTPUT);
  digitalWrite(VIBR_PIN, LOW);
#endif
}

void vibrOn() {
#if VIBR_ENABLED
  digitalWrite(VIBR_PIN, HIGH);
#endif
}

void vibrOff() {
#if VIBR_ENABLED
  digitalWrite(VIBR_PIN, LOW);
#endif
}

// Короткий "тик" — нажатие кнопки, переключение
void vibrTick() {
#if VIBR_ENABLED
  vibrOn();
  delay(30);
  vibrOff();
#endif
}

// Средняя вибрация — событие (ответ оракула, поедание в змейке)
void vibrPulse() {
#if VIBR_ENABLED
  vibrOn();
  delay(80);
  vibrOff();
  delay(50);
  vibrOn();
  delay(80);
  vibrOff();
#endif
}

// Длинная вибрация — важное событие (Game Over, пробуждение)
void vibrLong() {
#if VIBR_ENABLED
  vibrOn();
  delay(250);
  vibrOff();
#endif
}

// Пульсация — "шар думает" (во время анимации)
void vibrThinking(unsigned long durationMs) {
#if VIBR_ENABLED
  unsigned long start = millis();
  while (millis() - start < durationMs) {
    vibrOn();
    delay(40);
    vibrOff();
    delay(60);
  }
#endif
}

// Тряска — неровная дорога, резкий манёвр
void vibrRumble(unsigned long durationMs) {
#if VIBR_ENABLED
  unsigned long start = millis();
  while (millis() - start < durationMs) {
    vibrOn();
    delay(15 + random(20));
    vibrOff();
    delay(10 + random(15));
  }
#endif
}

// ============================================================================
// MPU6050
// ============================================================================

void writeMPU(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

uint8_t readMPU(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)1);
  if (Wire.available()) return Wire.read();
  return 0;
}

int16_t readMPU16(uint8_t reg) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)2);
  if (Wire.available() < 2) return 0;
  uint8_t high = Wire.read();
  uint8_t low  = Wire.read();
  uint16_t raw = ((uint16_t)high << 8) | low;
  return (int16_t)raw;
}

struct AccelData {
  int16_t x;
  int16_t y;
  int16_t z;
};

AccelData readAccelBurst() {
  AccelData d{0, 0, 0};
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)6);
  if (Wire.available() < 6) return d;
  uint8_t axh = Wire.read(), axl = Wire.read();
  uint8_t ayh = Wire.read(), ayl = Wire.read();
  uint8_t azh = Wire.read(), azl = Wire.read();
  d.x = (int16_t)(((uint16_t)axh << 8) | axl);
  d.y = (int16_t)(((uint16_t)ayh << 8) | ayl);
  d.z = (int16_t)(((uint16_t)azh << 8) | azl);
  return d;
}

void setupMPU() {
  Wire.begin(MPU_SDA_PIN, MPU_SCL_PIN);
  Wire.setClock(400000);
  delay(100);

  Wire.beginTransmission(MPU_ADDR);
  Wire.endTransmission();

  uint8_t who = readMPU(0x75);
#if ENABLE_SERIAL
  Serial.printf("MPU WHO_AM_I: 0x%02X\n", who);
#endif

  if (who != 0x68 && who != 0x72) {
#if ENABLE_SERIAL
    Serial.println("MPU6050 not found!");
#endif
    mpuReady = false;
    return;
  }

  writeMPU(0x6B, 0x00);  // Wake
  delay(100);
  writeMPU(0x1C, 0x00);  // Accel ±2g
  writeMPU(0x1D, 0x03);  // Accel filter
  writeMPU(0x37, MPU_INT_PIN_CFG_VALUE); // INT config
  writeMPU(0x1F, WOM_THRESHOLD);         // WOM threshold
  writeMPU(0x69, 0xC0);  // Enable motion detection
  writeMPU(0x38, 0x40);  // INT enable — WOM
  readMPU(0x3A);          // Clear INT status

  mpuReady = true;
#if ENABLE_SERIAL
  Serial.println("MPU6050 ready");
#endif
}

bool shakeDetected() {
  if (!mpuReady) return false;

  static bool initialized = false;
  static long lastTotal = 0;

  AccelData a = readAccelBurst();
  long total = abs(a.x) + abs(a.y) + abs(a.z);

  if (!initialized) {
    lastTotal = total;
    initialized = true;
    return false;
  }

  long diff = total - lastTotal;
  if (diff < 0) diff = -diff;
  lastTotal = total;

  return diff > SHAKE_THRESHOLD;
}

// ============================================================================
// ТЕКСТ И ОТРИСОВКА
// ============================================================================

const uint8_t* FONT_RU;
const uint8_t* FONT_TITLE;
const uint8_t* FONT_SMALL;

void initFonts() {
  FONT_RU    = u8g2_font_ncenB08_tr;
  FONT_TITLE = u8g2_font_ncenB14_tr;
  FONT_SMALL = u8g2_font_5x7_tr;
}

void printCentered(int y, const String& text, uint16_t color, const uint8_t* font) {
  u8g2.setFont(font);
  int16_t w = u8g2.getUTF8Width(text.c_str());
  int16_t x = (SCREEN_WIDTH - w) / 2;
  u8g2.setForegroundColor(color);
  u8g2.drawUTF8(x, y, text.c_str());
}

void drawFrame(const String& title) {
  tft.fillScreen(C_BG);
  u8g2.setFont(FONT_TITLE);
  printCentered(25, title, C_ACC, FONT_TITLE);
  tft.drawLine(10, 35, SCREEN_WIDTH - 10, 35, C_DIM);
}

// ============================================================================
// ОРАКУЛ
// ============================================================================

void drawOracleIdle() {
  drawFrame("ОРАКУЛ");
  printCentered(100, "🔮", C_FG, FONT_TITLE);
  printCentered(140, "Встряхни меня", C_DIM, FONT_RU);
  printCentered(165, "или удержи кнопку", C_DIM, FONT_RU);
}

void drawCubeAnimation(int frame) {
  tft.fillScreen(C_BG);
  int cx = SCREEN_WIDTH / 2;
  int cy = SCREEN_HEIGHT / 2 - 10;
  int size = 30 + frame * 2;

  float angle = frame * 0.15;
  float ca = cos(angle), sa = sin(angle);
  float cb = cos(angle * 0.7), sb = sin(angle * 0.7);

  float verts[8][3] = {
    {-1,-1,-1},{1,-1,-1},{1,1,-1},{-1,1,-1},
    {-1,-1,1},{1,-1,1},{1,1,1},{-1,1,1}
  };
  int edges[12][2] = {
    {0,1},{1,2},{2,3},{3,0},
    {4,5},{5,6},{6,7},{7,4},
    {0,4},{1,5},{2,6},{3,7}
  };

  float proj[8][2];
  for (int i = 0; i < 8; i++) {
    float x = verts[i][0], y = verts[i][1], z = verts[i][2];
    float x1 = x * ca - z * sa;
    float z1 = x * sa + z * ca;
    float y1 = y * cb - z1 * sb;
    float z2 = y * sb + z1 * cb;
    float fov = 3.0;
    float scale = size * fov / (fov + z2);
    proj[i][0] = cx + x1 * scale;
    proj[i][1] = cy + y1 * scale;
  }

  for (int i = 0; i < 12; i++) {
    int a = edges[i][0], b = edges[i][1];
    uint16_t c = tft.color565(0, 150 + frame * 5, 200 + frame * 3);
    tft.drawLine(proj[a][0], proj[a][1], proj[b][0], proj[b][1], c);
  }
}

void drawQuote(const String& text) {
  tft.fillScreen(C_BG);
  u8g2.setFont(FONT_RU);

  int16_t maxW = SCREEN_WIDTH - 40;
  int lineH = u8g2.getAscent() - u8g2.getDescent() + 4;

  // Перенос текста
  String lines[10];
  int lineCount = 0;
  String remaining = text;

  while (remaining.length() > 0 && lineCount < 10) {
    String line = "";
    int idx = 0;
    while (idx < (int)remaining.length()) {
      String test = line + remaining[idx];
      if (u8g2.getUTF8Width(test.c_str()) > maxW && line.length() > 0) {
        break;
      }
      line = test;
      idx++;
    }
    lines[lineCount++] = line;
    remaining = remaining.substring(idx);
  }

  int totalH = lineCount * lineH;
  int startY = (SCREEN_HEIGHT - totalH) / 2;

  for (int i = 0; i < lineCount; i++) {
    printCentered(startY + i * lineH + lineH, lines[i], C_FG, FONT_RU);
  }

  printCentered(SCREEN_HEIGHT - 20, "🔮 Оракул", C_DIM, FONT_SMALL);
}

void askOracle() {
  // "Шар думает" — пульсация во время анимации
  vibrThinking(1000);

  // Анимация куба
  for (int i = 0; i < 20; i++) {
    drawCubeAnimation(i);
    delay(50);
  }

  // Случайная фраза
  int idx = random(QUOTE_COUNT);
  String quote = String(quotes[idx]);

  vibrPulse(); // "Ответ готов!"
  drawQuote(quote);

#if ENABLE_SERIAL
  Serial.printf("Oracle: %s\n", quote.c_str());
#endif

  // Уведомление Jarvis
  notifyJarvis(quote);
}

// ============================================================================
// ЧАСЫ
// ============================================================================

void drawClock() {
  drawFrame("ВРЕМЯ");

  struct timeval tv;
  gettimeofday(&tv, NULL);
  struct tm timeinfo;
  localtime_r(&tv.tv_sec, &timeinfo);

  char timeStr[9];
  snprintf(timeStr, sizeof(timeStr), "%02d:%02d:%02d",
           timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);

  printCentered(100, String(timeStr), C_FG, FONT_TITLE);

  const char* days[] = {"Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"};
  const char* months[] = {"Янв", "Фев", "Мар", "Апр", "Май", "Июн",
                           "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"};

  char dateStr[32];
  snprintf(dateStr, sizeof(dateStr), "%s, %d %s %d",
           days[timeinfo.tm_wday], timeinfo.tm_mday,
           months[timeinfo.tm_mon], 1900 + timeinfo.tm_year);

  printCentered(135, String(dateStr), C_DIM, FONT_RU);

  // Uptime
  unsigned long sec = millis() / 1000;
  char uptimeStr[32];
  snprintf(uptimeStr, sizeof(uptimeStr), "Работает: %02lu:%02lu:%02lu",
           sec / 3600, (sec % 3600) / 60, sec % 60);
  printCentered(170, String(uptimeStr), C_DIM, FONT_SMALL);

  // Wi-Fi статус
  String status = getConnectionStatus();
  printCentered(200, status, C_DIM, FONT_SMALL);
}

void updateClock(unsigned long now) {
  static unsigned long lastDraw = 0;
  if (now - lastDraw >= 1000) {
    lastDraw = now;
    drawClock();
  }
}

// ============================================================================
// ИНТРО
// ============================================================================

void drawIntro() {
  tft.fillScreen(C_BG);

  for (int i = 0; i < 30; i++) {
    drawCubeAnimation(i);
    delay(40);
  }
}

void showStartup() {
  tft.fillScreen(C_BG);
  printCentered(80, "InnerVoice", C_ACC, FONT_TITLE);
  printCentered(110, "ESP Oracle", C_FG, FONT_RU);
  printCentered(150, "v2.0", C_DIM, FONT_SMALL);
  printCentered(180, "Загрузка...", C_DIM, FONT_SMALL);
  delay(1500);
  drawMode();
}

// ============================================================================
// ИГРА: ЗМЕЙКА
// ============================================================================

void startSnake() {
  snakeLen   = 3;
  snakeDirX  = 1;
  snakeDirY  = 0;
  snakePendX = 1;
  snakePendY = 0;
  snakeScore = 0;
  snakeSpeed = 150;
  snakeAlive = true;
  snakeNextMove = 0;

  for (int i = 0; i < snakeLen; i++) {
    snakeX[i] = 5 - i;
    snakeY[i] = 5;
  }
  snakeSpawnFood();
}

void snakeSpawnFood() {
  bool valid;
  do {
    valid = true;
    snakeFoodX = random(COLS);
    snakeFoodY = random(ROWS);
    for (int i = 0; i < snakeLen; i++) {
      if (snakeX[i] == snakeFoodX && snakeY[i] == snakeFoodY) {
        valid = false;
        break;
      }
    }
  } while (!valid);
}

void snakeTurnClockwise() {
  int nx = -snakeDirY;
  int ny = snakeDirX;
  snakePendX = nx;
  snakePendY = ny;
}

void snakeReadTilt() {
  if (!mpuReady) return;
  AccelData a = readAccelBurst();

  if (abs(a.x) > 8000 || abs(a.y) > 8000) {
    if (abs(a.x) > abs(a.y)) {
      if (a.x > 8000 && snakeDirY != 0) { snakePendX = 0; snakePendY = 1; }
      if (a.x < -8000 && snakeDirY != 0) { snakePendX = 0; snakePendY = -1; }
    } else {
      if (a.y > 8000 && snakeDirX != 0) { snakePendX = -1; snakePendY = 0; }
      if (a.y < -8000 && snakeDirX != 0) { snakePendX = 1; snakePendY = 0; }
    }
  }
}

void updateSnake(unsigned long now) {
  snakeReadTilt();
  if (!snakeAlive || now < snakeNextMove) return;

  snakeDirX = snakePendX;
  snakeDirY = snakePendY;

  int nx = snakeX[0] + snakeDirX;
  int ny = snakeY[0] + snakeDirY;

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
    snakeAlive = false;
    vibrLong(); // Game Over — длинная вибрация
    drawSnake();
    return;
  }

  for (int i = 1; i < snakeLen; i++) {
    if (snakeX[i] == nx && snakeY[i] == ny) {
      snakeAlive = false;
      vibrLong(); // Game Over — длинная вибрация
      drawSnake();
      return;
    }
  }

  for (int i = snakeLen - 1; i > 0; i--) {
    snakeX[i] = snakeX[i - 1];
    snakeY[i] = snakeY[i - 1];
  }
  snakeX[0] = nx;
  snakeY[0] = ny;

  if (nx == snakeFoodX && ny == snakeFoodY) {
    if (snakeLen < COLS * ROWS) snakeLen++;
    snakeScore++;
    if (snakeSpeed > 70) snakeSpeed -= 3;
    snakeSpawnFood();
    vibrPulse(); // Съели еду — двойная вибрация
  }

  snakeNextMove = now + snakeSpeed;
  drawSnake();
}

void drawSnake() {
  tft.fillScreen(C_BG);

  int cellW = SCREEN_WIDTH / COLS;
  int cellH = (SCREEN_HEIGHT - 30) / ROWS;
  int offX = (SCREEN_WIDTH - cellW * COLS) / 2;
  int offY = 30;

  // Сетка
  for (int x = 0; x <= COLS; x++) {
    tft.drawLine(offX + x * cellW, offY, offX + x * cellW, offY + ROWS * cellH, C_DIM);
  }
  for (int y = 0; y <= ROWS; y++) {
    tft.drawLine(offX, offY + y * cellH, offX + COLS * cellW, offY + y * cellH, C_DIM);
  }

  // Змейка
  for (int i = 0; i < snakeLen; i++) {
    uint16_t c = (i == 0) ? C_ACC : C_GOOD;
    tft.fillRect(offX + snakeX[i] * cellW + 1, offY + snakeY[i] * cellH + 1,
                 cellW - 2, cellH - 2, c);
  }

  // Еда
  tft.fillCircle(offX + snakeFoodX * cellW + cellW / 2,
                 offY + snakeFoodY * cellH + cellH / 2,
                 cellW / 2 - 2, C_RED);

  // Счёт
  String scoreStr = "Счёт: " + String(snakeScore);
  printCentered(18, scoreStr, C_FG, FONT_SMALL);

  if (!snakeAlive) {
    printCentered(SCREEN_HEIGHT / 2, "GAME OVER", C_WARN, FONT_TITLE);
    printCentered(SCREEN_HEIGHT / 2 + 30, "Счёт: " + String(snakeScore), C_FG, FONT_RU);
  }
}

// ============================================================================
// ИГРА: РЕАКЦИЯ
// ============================================================================

void startReaction() {
  reactState = ReactionState::READY;
  drawReaction();
}

void reactionBeginWait() {
  reactState = ReactionState::WAIT;
  reactGoTime = millis() + random(2000, 5000);
  drawReaction();
}

void drawReaction() {
  tft.fillScreen(C_BG);

  switch (reactState) {
    case ReactionState::READY:
      printCentered(90, "ТЕСТ РЕАКЦИИ", C_ACC, FONT_TITLE);
      printCentered(130, "Нажми кнопку", C_FG, FONT_RU);
      printCentered(155, "когда станет ЗЕЛЁНЫМ", C_DIM, FONT_RU);
      break;

    case ReactionState::WAIT:
      printCentered(110, "ЖДИ...", C_WARN, FONT_TITLE);
      break;

    case ReactionState::GO:
      tft.fillScreen(tft.color565(0, 200, 0));
      printCentered(110, "ЖМИ!", C_BG, FONT_TITLE);
      break;

    case ReactionState::RESULT:
      printCentered(80, "ТВОЙ РЕЗУЛЬТАТ", C_ACC, FONT_RU);
      printCentered(120, String(reactResultMs) + " мс", C_FG, FONT_TITLE);
      if (reactResultMs < 250)
        printCentered(155, "Отлично!", C_GOOD, FONT_RU);
      else if (reactResultMs < 400)
        printCentered(155, "Хорошо!", C_ACC, FONT_RU);
      else
        printCentered(155, "Можно лучше", C_WARN, FONT_RU);
      printCentered(190, "Короткое — ещё раз", C_DIM, FONT_SMALL);
      printCentered(210, "Долгое — выход", C_DIM, FONT_SMALL);
      break;

    case ReactionState::EARLY:
      printCentered(100, "Рано!", C_WARN, FONT_TITLE);
      printCentered(140, "Короткое — ещё раз", C_DIM, FONT_RU);
      printCentered(165, "Долгое — выход", C_DIM, FONT_RU);
      break;
  }
}

void reactionShort() {
  switch (reactState) {
    case ReactionState::READY:
      reactionBeginWait();
      break;
    case ReactionState::WAIT:
      reactState = ReactionState::EARLY;
      drawReaction();
      break;
    case ReactionState::GO:
      reactResultMs = millis() - reactStartTime;
      reactState = ReactionState::RESULT;
      drawReaction();
      break;
    case ReactionState::RESULT:
    case ReactionState::EARLY:
      reactionBeginWait();
      break;
  }
}

void updateReaction(unsigned long now) {
  if (reactState == ReactionState::WAIT && now >= reactGoTime) {
    reactState = ReactionState::GO;
    reactStartTime = now;
    vibrLong(); // Длинная вибрация — пора жать!
    drawReaction();
  }
}

// ============================================================================
// МЕНЕДЖЕР ИГР
// ============================================================================

const char* gameNames[] = {"Змейка", "Реакция"};

void drawGameSelector() {
  drawFrame("ИГРЫ");
  int y = 60;
  for (int i = 0; i < (int)GameId::COUNT; i++) {
    bool sel = ((int)selectedGame == i);
    String prefix = sel ? "> " : "  ";
    String line = prefix + String(gameNames[i]);
    printCentered(y, line, sel ? C_ACC : C_DIM, FONT_RU);
    y += 32;
  }
  printCentered(165, "Короткое: выбрать", C_DIM, FONT_RU);
  printCentered(187, "Долгое: играть", C_DIM, FONT_RU);
  printCentered(209, "Двойное: назад", C_DIM, FONT_RU);
}

void startGame(GameId g) {
  currentGame = g;
  inGame = true;
  markActivity();
  if (currentGame == GameId::SNAKE) startSnake();
  else if (currentGame == GameId::REACTION) startReaction();
}

void exitGame() {
  inGame = false;
  markActivity();
  drawMode();
}

void gameShortAction() {
  markActivity();
  if (currentGame == GameId::SNAKE) {
    if (snakeAlive) snakeTurnClockwise();
  } else if (currentGame == GameId::REACTION) {
    reactionShort();
  }
}

void gameLongAction() {
  exitGame();
}

void updateGame(unsigned long now) {
  markActivity();
  if (currentGame == GameId::SNAKE) updateSnake(now);
  else if (currentGame == GameId::REACTION) updateReaction(now);
}

// ============================================================================
// МЕНЕДЖЕР РЕЖИМОВ
// ============================================================================

void drawMode() {
  switch (mode) {
    case AppMode::ORACLE:  drawOracleIdle(); break;
    case AppMode::CLOCK:   drawClock(); break;
    case AppMode::GAMES:
      if (inGame) {
        if (currentGame == GameId::SNAKE) drawSnake();
        else drawReaction();
      } else {
        drawGameSelector();
      }
      break;
    case AppMode::NETWORK: drawNetworkMessage(getConnectionStatus()); break;
    case AppMode::ROBOT:   drawRobot(); break;
    case AppMode::AUTO:    drawAutoMode(); break;
    case AppMode::SETUP:   drawSetup(); break;
    default: drawOracleIdle(); break;
  }
}

void enterMode(AppMode m) {
  if (inGame) inGame = false;
  mode = m;
  markActivity();
  if (wifiModeActive()) startWiFi();
  else stopWiFi();
  drawMode();
}

void nextMode() {
  uint8_t n = (uint8_t)mode + 1;
  if (n >= (uint8_t)AppMode::COUNT) n = 0;
  enterMode((AppMode)n);
}

// ============================================================================
// WI-FI
// ============================================================================

bool wifiModeActive() {
  return mode == AppMode::NETWORK || mode == AppMode::ROBOT;
}

void startWiFi() {
  if (strlen(WIFI_SSID) == 0) return;
  if (WiFi.getMode() != WIFI_STA) {
    WiFi.persistent(false);
    WiFi.mode(WIFI_STA);
  }
  WiFi.setSleep(WIFI_MODEM_SLEEP);
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    lastWifiAttempt = millis();
  }
}

void stopWiFi() {
  if (WiFi.getMode() != WIFI_OFF) {
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);
  }
  mdnsStarted = false;
  ntpConfigured = false;
  lastConnStatus = "";
}

const char* statusNameRu(wl_status_t st) {
  switch (st) {
    case WL_IDLE_STATUS:     return "ожидание";
    case WL_NO_SSID_AVAIL:   return "сеть не найдена";
    case WL_CONNECTED:       return "подключено";
    case WL_CONNECT_FAILED:  return "ошибка";
    case WL_CONNECTION_LOST: return "потеряно";
    case WL_DISCONNECTED:    return "отключено";
    default: return "неизвестно";
  }
}

String getConnectionStatus() {
  if (strlen(WIFI_SSID) == 0) return "SSID не задан";
  wl_status_t st = WiFi.status();
  if (st == WL_CONNECTED) return "IP: " + WiFi.localIP().toString();
  return String("Wi-Fi: ") + statusNameRu(st);
}

void updateWiFi(unsigned long now) {
  if (strlen(WIFI_SSID) == 0) {
    String msg = "SSID не задан";
    if (msg != lastConnStatus) {
      lastConnStatus = msg;
      if (mode == AppMode::NETWORK) drawNetworkMessage(msg);
    }
    return;
  }

  if (WiFi.status() != WL_CONNECTED && now - lastWifiAttempt > 10000) {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    lastWifiAttempt = now;
  }

  if (WiFi.status() == WL_CONNECTED) {
    if (!mdnsStarted) {
      if (MDNS.begin(MDNS_NAME)) {
        mdnsStarted = true;
      }
    }
    if (!ntpConfigured) {
      configTime(GMT_OFFSET_SEC, DST_OFFSET_SEC, NTP_SERVER);
      ntpConfigured = true;
    }
  }

  String msg = getConnectionStatus();
  if (msg != lastConnStatus) {
    lastConnStatus = msg;
    if (mode == AppMode::NETWORK) drawNetworkMessage(msg);
    else drawMode();
  }
}

void toggleWiFi() {
  if (WiFi.status() == WL_CONNECTED) stopWiFi();
  else startWiFi();
  drawMode();
}

// ============================================================================
// СЕТЬ / РОБОТ / НАСТРОЙКИ — UI
// ============================================================================

void drawNetworkMessage(const String& msg) {
  drawFrame("СЕТЬ");
  printCentered(100, msg, C_FG, FONT_RU);
  printCentered(140, "Долгое: вкл/выкл", C_DIM, FONT_SMALL);
  printCentered(160, "Короткое: далее", C_DIM, FONT_SMALL);
}

void drawRobot() {
  drawFrame("РОБОТ");
  printCentered(100, "🤖", C_FG, FONT_TITLE);
  printCentered(140, "Jarvis Bridge", C_DIM, FONT_RU);
  if (WiFi.status() == WL_CONNECTED) {
    printCentered(170, "Подключено", C_GOOD, FONT_RU);
  } else {
    printCentered(170, "Нет связи", C_WARN, FONT_RU);
  }
}

void drawSetup() {
  drawFrame("НАСТРОЙКИ");
  int y = 60;

  String imuStatus = mpuReady ? "MPU6050: OK" : "MPU6050: НЕТ";
  printCentered(y, imuStatus, mpuReady ? C_GOOD : C_RED, FONT_RU);
  y += 28;

  String wifiStatus = getConnectionStatus();
  printCentered(y, wifiStatus, C_DIM, FONT_RU);
  y += 28;

  printCentered(y, "Порог тряски: " + String(SHAKE_THRESHOLD), C_DIM, FONT_SMALL);
  y += 22;
  printCentered(y, "Сон через: " + String(SLEEP_AFTER_MS / 1000) + " сек", C_DIM, FONT_SMALL);
  y += 22;
  printCentered(y, "Яркость: " + String(brightness), C_DIM, FONT_SMALL);
  y += 28;

  printCentered(y, "Долгое: сон", C_DIM, FONT_SMALL);
  y += 18;
  printCentered(y, "Двойное: яркость", C_DIM, FONT_SMALL);
}

// ============================================================================
// JARVIS HTTP
// ============================================================================

#if ENABLE_JARVIS_HTTP

String jsonEscape(const String& in) {
  String s = in;
  s.replace("\\", "\\\\");
  s.replace("\"", "\\\"");
  s.replace("\n", "\\n");
  s.replace("\r", "\\r");
  return s;
}

void notifyJarvis(const String& text) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  http.setTimeout(2500);
  http.begin(JARVIS_ORACLE_URL);
  http.addHeader("Content-Type", "application/json");
  String payload = String("{\"device\":\"") + jsonEscape(DEVICE_NAME) +
                   "\",\"mode\":\"oracle\",\"text\":\"" + jsonEscape(text) + "\"}";
  int code = http.POST(payload);
  http.end();
#if ENABLE_SERIAL
  Serial.printf("Jarvis HTTP: %d\n", code);
#endif
}

#else

void notifyJarvis(const String& text) { (void)text; }

#endif

// ============================================================================
// ПИТАНИЕ / СОН
// ============================================================================

bool allowDeepSleep() {
  if (inGame) return false;
  if (mode == AppMode::GAMES || mode == AppMode::NETWORK || 
      mode == AppMode::ROBOT || mode == AppMode::AUTO)
    return false;
  return true;
}

void markActivity() {
  lastActivity = millis();
  if (brightnessDimmed) {
    brightnessDimmed = false;
    brightness = DEFAULT_BRIGHTNESS;
    backlightSet(brightness);
  }
}

void toggleBacklight() {
  static const uint8_t levels[] = {220, 140, 70, 30};
  static uint8_t idx = 0;
  idx = (idx + 1) % (sizeof(levels) / sizeof(levels[0]));
  brightness = levels[idx];
  brightnessDimmed = false;
  backlightSet(brightness);
}

void managePower(unsigned long now) {
  if (!brightnessDimmed && brightness == DEFAULT_BRIGHTNESS &&
      now - lastActivity > DIM_AFTER_MS) {
    brightnessDimmed = true;
    brightness = DIM_BRIGHTNESS;
    backlightSet(brightness);
  }
  if (allowDeepSleep() && now - lastActivity >= SLEEP_AFTER_MS) {
    goToDeepSleep();
  }
}

void goToDeepSleep() {
  stopWiFi();
  backlightSet(0);
  delay(50);
  tft.fillScreen(C_BG);

  if (mpuReady) readMPU(0x3A);

  pinMode(MPU_INT_PIN, INPUT_PULLDOWN);
  esp_deep_sleep_enable_ext0_wakeup((gpio_num_t)MPU_INT_PIN, 1);

#if ENABLE_SERIAL
  Serial.println("Going to deep sleep...");
  delay(100);
#endif

  esp_deep_sleep_start();
}

// ============================================================================
// ОБРАБОТКА КНОПКИ
// ============================================================================

void handleButton(ButtonEvent ev) {
  markActivity();
  vibrTick(); // Тактильный отклик на нажатие

  if (inGame) {
    if (ev == ButtonEvent::Short) gameShortAction();
    else if (ev == ButtonEvent::Long || ev == ButtonEvent::Double) gameLongAction();
    return;
  }

  if (mode == AppMode::GAMES) {
    if (ev == ButtonEvent::Short) {
      uint8_t n = (uint8_t)selectedGame + 1;
      if (n >= (uint8_t)GameId::COUNT) n = 0;
      selectedGame = (GameId)n;
      drawGameSelector();
    } else if (ev == ButtonEvent::Long) {
      startGame(selectedGame);
    } else if (ev == ButtonEvent::Double) {
      enterMode(AppMode::ORACLE);
    }
    return;
  }

  if (ev == ButtonEvent::Short) {
    nextMode();
    return;
  }

  if (ev == ButtonEvent::Long) {
    switch (mode) {
      case AppMode::ORACLE:  askOracle(); break;
      case AppMode::CLOCK:   toggleWiFi(); break;
      case AppMode::NETWORK: toggleWiFi(); break;
      case AppMode::ROBOT:   notifyJarvis("ping"); drawRobot(); break;
      case AppMode::SETUP:   goToDeepSleep(); break;
      default: break;
    }
    return;
  }

  if (ev == ButtonEvent::Double) {
    toggleBacklight();
  }
}

// ============================================================================
// AUTO РЕЖИМ — АНАЛИЗАТОР ВОЖДЕНИЯ
// ============================================================================

void resetAutoState() {
  autoState.relSpeed = 0;
  autoState.speedSmooth = 0;
  autoState.axSmooth = 0;
  autoState.aySmooth = 0;
  autoState.azSmooth = 0;
  autoState.accelerating = false;
  autoState.braking = false;
  autoState.turnLeft = false;
  autoState.turnRight = false;
  autoState.bumpyRoad = false;
  autoState.sharpManeuver = false;
  autoState.turnCount = 0;
  autoState.brakeCount = 0;
  autoState.accelCount = 0;
  autoState.sharpCount = 0;
  autoState.driveTime = 0;
  autoState.roadOffset = 0;
  autoState.carTilt = 0;
  autoState.isMoving = false;
  autoState.drivingStyle = 0;
  autoDriveStart = millis();
}

// Обновление AUTO режима (опрос акселерометра)
void updateAutoMode(unsigned long now) {
  if (!mpuReady) {
    drawAutoMode();
    return;
  }
  
  // Опрос каждые AUTO_SAMPLE_MS
  if (now - autoLastSample < AUTO_SAMPLE_MS) {
    drawAutoMode();
    return;
  }
  autoLastSample = now;
  
  // Чтение акселерометра
  AccelData a = readAccelBurst();
  
  // Сглаживание (экспоненциальное)
  const float alpha = 0.15;
  autoState.axSmooth = autoState.axSmooth * (1 - alpha) + a.x * alpha;
  autoState.aySmooth = autoState.aySmooth * (1 - alpha) + a.y * alpha;
  autoState.azSmooth = autoState.azSmooth * (1 - alpha) + a.z * alpha;
  
  // === ДЕТЕКЦИЯ СОБЫТИЙ ===
  
  // Продольное ускорение (разгон/торможение)
  // При горизонтальном положении: ось X — вперёд/назад
  const float ACCEL_THRESHOLD = 3000;  // ~0.18g
  const float BRAKE_THRESHOLD = -4000; // ~0.24g торможение
  
  bool wasAccel = autoState.accelerating;
  bool wasBrake = autoState.braking;
  
  autoState.accelerating = (autoState.axSmooth > ACCEL_THRESHOLD);
  autoState.braking = (autoState.axSmooth < BRAKE_THRESHOLD);
  
  // Счётчики событий (фронт детектирования)
  if (autoState.accelerating && !wasAccel) {
    autoState.accelCount++;
    autoState.eventTime = now;
    vibrTick(); // Короткий тик при разгоне
  }
  if (autoState.braking && !wasBrake) {
    autoState.brakeCount++;
    autoState.eventTime = now;
    vibrPulse(); // Двойная вибрация при торможении
  }
  
  // Боковое ускорение (повороты)
  const float TURN_THRESHOLD = 5000; // ~0.3g
  
  bool wasLeft = autoState.turnLeft;
  bool wasRight = autoState.turnRight;
  
  autoState.turnLeft = (autoState.aySmooth < -TURN_THRESHOLD);
  autoState.turnRight = (autoState.aySmooth > TURN_THRESHOLD);
  
  if ((autoState.turnLeft && !wasLeft) || (autoState.turnRight && !wasRight)) {
    autoState.turnCount++;
    autoState.eventTime = now;
  }
  
  // Вибрация/неровности (высокочастотный шум по Z)
  float zDiff = abs(a.z - autoState.azSmooth);
  bool wasBumpy = autoState.bumpyRoad;
  autoState.bumpyRoad = (zDiff > 2000);
  
  // Вибромотор при неровной дороге
  if (autoState.bumpyRoad && !wasBumpy) {
    vibrRumble(200); // Короткая тряска при въезде на неровность
  }
  
  // Резкий манёвр (большое суммарное ускорение)
  float totalAccel = sqrt(autoState.axSmooth * autoState.axSmooth +
                          autoState.aySmooth * autoState.aySmooth +
                          autoState.azSmooth * autoState.azSmooth);
  autoState.sharpManeuver = (totalAccel > 20000); // ~1.2g
  if (autoState.sharpManeuver && now - autoState.eventTime > 500) {
    autoState.sharpCount++;
    autoState.eventTime = now;
    vibrLong(); // Длинная вибрация при резком манёвре
  }
  
  // === ОТНОСИТЕЛЬНАЯ СКОРОСТЬ ===
  // Интегрируем продольное ускорение (очень приблизительно)
  // 1g = 16384 LSB при ±2g
  // Ускорение в g: axSmooth / 16384
  // Скорость += ускорение * dt
  float accelG = autoState.axSmooth / 16384.0;
  float dt = AUTO_SAMPLE_MS / 1000.0;
  autoState.relSpeed += accelG * dt * 50; // масштабирование
  
  // Ограничение
  if (autoState.relSpeed < 0) autoState.relSpeed = 0;
  if (autoState.relSpeed > 200) autoState.relSpeed = 200;
  
  // Затухание (имитация трения)
  autoState.relSpeed *= 0.995;
  
  // Сглаженная для отображения
  autoState.speedSmooth = autoState.speedSmooth * 0.8 + autoState.relSpeed * 0.2;
  
  // === ДЕТЕКЦИЯ ДВИЖЕНИЯ ===
  // Если вибрация или ускорение выше порога — считаем что едем
  float vibration = abs(a.x) + abs(a.y) + abs(a.z - 16384); // отклонение от 1g по Z
  autoState.isMoving = (vibration > 3000 || abs(autoState.axSmooth) > 1500);
  
  if (autoState.isMoving) {
    autoState.driveTime = now - autoDriveStart;
  }
  
  // === АНИМАЦИЯ ===
  // Скорость анимации дороги зависит от relSpeed
  autoState.roadOffset += autoState.speedSmooth * 0.3;
  if (autoState.roadOffset > 30) autoState.roadOffset = 0;
  
  // Наклон машинки при повороте
  float targetTilt = autoState.aySmooth / 10000.0; // -1..1
  if (targetTilt > 1) targetTilt = 1;
  if (targetTilt < -1) targetTilt = -1;
  autoState.carTilt = autoState.carTilt * 0.7 + targetTilt * 0.3;
  
  // === СТИЛЬ ВОЖДЕНИЯ ===
  // Агрессивность = (резкие манёвры + разгоны + торможения) / время
  unsigned long elapsed = (now - autoDriveStart) / 1000;
  if (elapsed > 5) {
    int events = autoState.sharpCount * 3 + autoState.brakeCount + autoState.accelCount;
    autoState.drivingStyle = (events * 100) / elapsed;
    if (autoState.drivingStyle > 100) autoState.drivingStyle = 100;
  }
  
  drawAutoMode();
}

// ============================================================================
// ОТРИСОВКА AUTO РЕЖИМА
// ============================================================================

void drawAutoMode() {
  tft.fillScreen(C_BG);
  
  int centerX = SCREEN_WIDTH / 2;
  int centerY = SCREEN_HEIGHT / 2;
  
  // === ДОРОГА (перспектива) ===
  int horizonY = centerY - 20;
  
  // Небо/горизонт
  tft.drawLine(0, horizonY, SCREEN_WIDTH, horizonY, C_DIM);
  
  // Дорожное полотно
  int roadWidthTop = 30;
  int roadWidthBottom = SCREEN_WIDTH + 20;
  
  for (int y = horizonY; y < SCREEN_HEIGHT; y += 2) {
    float progress = (float)(y - horizonY) / (SCREEN_HEIGHT - horizonY);
    int roadWidth = roadWidthTop + (roadWidthBottom - roadWidthTop) * progress;
    int roadLeft = centerX - roadWidth / 2;
    int roadRight = centerX + roadWidth / 2;
    
    // Асфальт
    uint8_t shade = 25 + progress * 15;
    if (autoState.bumpyRoad && progress > 0.5) {
      shade += random(-5, 5); // дрожание при неровностях
    }
    tft.drawLine(roadLeft, y, roadRight, y, tft.color565(shade, shade, shade + 5));
    
    // Обочина
    tft.drawLine(roadLeft, y, roadLeft + 2 + progress * 3, y, tft.color565(80, 80, 40));
    tft.drawLine(roadRight - 2 - progress * 3, y, roadRight, y, tft.color565(80, 80, 40));
    
    // Разметка (пунктир)
    int dashY = ((int)(y + autoState.roadOffset)) % 30;
    if (dashY < 15 && progress > 0.1) {
      int dashWidth = 1 + progress * 4;
      tft.drawLine(centerX - dashWidth, y, centerX + dashWidth, y, C_FG);
    }
  }
  
  // === ПОВОРОТЫ — СТРЕЛКИ ===
  if (autoState.turnLeft) {
    uint16_t arrowColor = C_ACC;
    tft.fillTriangle(25, centerY - 10, 55, centerY - 30, 55, centerY + 10, arrowColor);
    u8g2.setFont(FONT_RU);
    u8g2.setForegroundColor(arrowColor);
    u8g2.drawUTF8(15, centerY + 30, "LEFT");
  }
  if (autoState.turnRight) {
    uint16_t arrowColor = C_ACC;
    tft.fillTriangle(SCREEN_WIDTH - 25, centerY - 10,
                     SCREEN_WIDTH - 55, centerY - 30,
                     SCREEN_WIDTH - 55, centerY + 10, arrowColor);
    u8g2.setFont(FONT_RU);
    u8g2.setForegroundColor(arrowColor);
    int16_t w = u8g2.getUTF8Width("RIGHT");
    u8g2.drawUTF8(SCREEN_WIDTH - 15 - w, centerY + 30, "RIGHT");
  }
  
  // === МАШИНКА (жёлтая, с наклоном) ===
  int carY = SCREEN_HEIGHT - 55;
  int carX = centerX + (int)(autoState.carTilt * 15);
  uint16_t carColor = tft.color565(255, 220, 0);
  uint16_t carDark = tft.color565(200, 170, 0);
  
  // Тень
  tft.fillEllipse(carX, carY + 14, 18, 4, tft.color565(10, 10, 10));
  
  // Кузов
  tft.fillRect(carX - 15, carY - 8, 30, 18, carColor);
  // Крыша
  tft.fillRect(carX - 10, carY - 18, 20, 10, carDark);
  // Стёкла
  tft.fillRect(carX - 8, carY - 16, 16, 6, tft.color565(80, 150, 200));
  // Колёса
  tft.fillCircle(carX - 12, carY + 10, 5, C_BG);
  tft.fillCircle(carX + 12, carY + 10, 5, C_BG);
  tft.fillCircle(carX - 12, carY + 10, 2, tft.color565(60, 60, 60));
  tft.fillCircle(carX + 12, carY + 10, 2, tft.color565(60, 60, 60));
  
  // Фары при торможении — красные
  if (autoState.braking) {
    tft.fillRect(carX - 14, carY + 5, 3, 3, C_RED);
    tft.fillRect(carX + 11, carY + 5, 3, 3, C_RED);
  }
  
  // === СПИДОМЕТР (относительный) ===
  int speedX = 55;
  int speedY = 40;
  tft.fillCircle(speedX, speedY, 32, tft.color565(15, 15, 15));
  tft.drawCircle(speedX, speedY, 32, C_DIM);
  
  // Дуга спидометра
  for (int i = 0; i < 10; i++) {
    float angle = PI + i * PI / 10;
    int x1 = speedX + cos(angle) * 28;
    int y1 = speedY + sin(angle) * 28;
    int x2 = speedX + cos(angle) * 32;
    int y2 = speedY + sin(angle) * 32;
    tft.drawLine(x1, y1, x2, y2, C_DIM);
  }
  
  char speedStr[8];
  snprintf(speedStr, sizeof(speedStr), "%.0f", autoState.speedSmooth);
  u8g2.setFont(FONT_TITLE);
  int16_t w = u8g2.getUTF8Width(speedStr);
  u8g2.setForegroundColor(C_FG);
  u8g2.drawUTF8(speedX - w / 2, speedY + 6, speedStr);
  
  u8g2.setFont(FONT_SMALL);
  u8g2.setForegroundColor(C_DIM);
  u8g2.drawUTF8(speedX - 12, speedY + 18, "rel km/h");
  
  // === ИНДИКАТОРЫ СОБЫТИЙ ===
  int indY = 90;
  
  // Разгон
  if (autoState.accelerating) {
    u8g2.setFont(FONT_SMALL);
    u8g2.setForegroundColor(C_GOOD);
    u8g2.drawUTF8(10, indY, ">>>");
  }
  
  // Торможение
  if (autoState.braking) {
    u8g2.setFont(FONT_SMALL);
    u8g2.setForegroundColor(C_RED);
    u8g2.drawUTF8(SCREEN_WIDTH - 35, indY, "!!!");
  }
  
  // Неровная дорога
  if (autoState.bumpyRoad) {
    u8g2.setFont(FONT_SMALL);
    u8g2.setForegroundColor(C_WARN);
    u8g2.drawUTF8(centerX - 15, indY, "BUMPY");
  }
  
  // === СТАТИСТИКА ===
  int statY = SCREEN_HEIGHT - 40;
  u8g2.setFont(FONT_SMALL);
  u8g2.setForegroundColor(C_DIM);
  
  char statStr[64];
  snprintf(statStr, sizeof(statStr), "T:%d B:%d A:%d S:%d",
           autoState.turnCount, autoState.brakeCount,
           autoState.accelCount, autoState.sharpCount);
  u8g2.drawUTF8(10, statY, statStr);
  
  // Время в движении
  unsigned long sec = autoState.driveTime / 1000;
  snprintf(statStr, sizeof(statStr), "%02lu:%02lu", sec / 60, sec % 60);
  w = u8g2.getUTF8Width(statStr);
  u8g2.drawUTF8(SCREEN_WIDTH - 10 - w, statY, statStr);
  
  // === СТИЛЬ ВОЖДЕНИЯ ===
  int barY = SCREEN_HEIGHT - 20;
  int barW = SCREEN_WIDTH - 20;
  int barH = 6;
  
  tft.fillRect(10, barY, barW, barH, tft.color565(30, 30, 30));
  
  uint16_t barColor;
  if (autoState.drivingStyle < 30) barColor = C_GOOD;
  else if (autoState.drivingStyle < 60) barColor = C_ACC;
  else if (autoState.drivingStyle < 80) barColor = C_WARN;
  else barColor = C_RED;
  
  int fillW = (barW * autoState.drivingStyle) / 100;
  tft.fillRect(10, barY, fillW, barH, barColor);
  
  u8g2.setFont(FONT_SMALL);
  u8g2.setForegroundColor(C_DIM);
  u8g2.drawUTF8(10, barY - 3, "STYLE:");
  
  const char* styleName;
  if (autoState.drivingStyle < 20) styleName = "CALM";
  else if (autoState.drivingStyle < 50) styleName = "NORMAL";
  else if (autoState.drivingStyle < 75) styleName = "ACTIVE";
  else styleName = "AGGRESSIVE";
  w = u8g2.getUTF8Width(styleName);
  u8g2.setForegroundColor(barColor);
  u8g2.drawUTF8(SCREEN_WIDTH - 10 - w, barY - 3, styleName);
  
  // === СТАТУС ===
  if (!autoState.isMoving) {
    u8g2.setFont(FONT_SMALL);
    u8g2.setForegroundColor(C_DIM);
    const char* msg = "STATIONARY";
    w = u8g2.getUTF8Width(msg);
    u8g2.drawUTF8(centerX - w / 2, SCREEN_HEIGHT / 2 + 50, msg);
  }
}

// ============================================================================
// SETUP & LOOP
// ============================================================================

void setup() {
#if ENABLE_SERIAL
  Serial.begin(115200);
  delay(300);
  Serial.println("\n=== InnerVoice ESP Oracle ===");
#endif

  randomSeed(esp_random());

  backlightInit();
  backlightSet(DEFAULT_BRIGHTNESS);
  vibrInit();

  tft.init(SCREEN_WIDTH, SCREEN_HEIGHT);
  tft.setRotation(1);
  tft.invertDisplay(TFT_INVERT);

  u8g2.begin(&tft);
  u8g2.setFontRefHeightExtendedText();
  initFonts();

  C_BG   = tft.color565(0, 0, 0);
  C_FG   = tft.color565(235, 235, 235);
  C_ACC  = tft.color565(0, 190, 255);
  C_DIM  = tft.color565(95, 95, 95);
  C_WARN = tft.color565(255, 90, 60);
  C_GOOD = tft.color565(60, 220, 120);
  C_RED  = tft.color565(255, 40, 40);

  button.begin(BTN_PIN, BTN_ACTIVE_HIGH);

  setupMPU();
  resetAutoState();

  WiFi.persistent(false);
  WiFi.mode(WIFI_OFF);

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();

  if (cause == ESP_SLEEP_WAKEUP_EXT0 || cause == ESP_SLEEP_WAKEUP_GPIO) {
    vibrLong(); // Вибрация при пробуждении
    mode = AppMode::ORACLE;
    drawMode();
    delay(250);
    if (mpuReady) readMPU(0x3A);
    lastShakeTime = millis();
    lastActivity = millis();
    askOracle();
  } else {
    vibrTick(); // Тик при включении
    drawIntro();
    showStartup();
  }

  lastActivity = millis();
}

void loop() {
  unsigned long now = millis();

  ButtonEvent ev = button.update();
  if (ev != ButtonEvent::None) {
    handleButton(ev);
  }

  if (!inGame) {
    if (mpuReady && mode == AppMode::ORACLE && shakeDetected()) {
      markActivity();
      if (now - lastShakeTime > SHAKE_COOLDOWN_MS && now > BOOT_GRACE_MS) {
        lastShakeTime = now;
        askOracle();
      }
    }

    if (wifiModeActive()) updateWiFi(now);
    if (mode == AppMode::CLOCK) updateClock(now);
    if (mode == AppMode::AUTO) updateAutoMode(now);

    managePower(now);
  } else {
    updateGame(now);
  }

  delay(15);
}

import { useState } from 'react'

const codeSnippets = [
  {
    id: 'config',
    title: 'Конфигурация пинов',
    language: 'cpp',
    code: `// TFT ST7789
#define TFT_SCLK 5
#define TFT_MOSI 6
#define TFT_CS   10
#define TFT_DC   7
#define TFT_RST  3
#define TFT_BL   21

// MPU6050
#define MPU_SDA_PIN 1
#define MPU_SCL_PIN 0
#define MPU_INT_PIN 4
#define MPU_ADDR    0x68

// Кнопка
#define BTN_PIN 20
#define BTN_ACTIVE_HIGH true`
  },
  {
    id: 'burst',
    title: 'Burst-чтение акселерометра',
    language: 'cpp',
    code: `AccelData readAccelBurst() {
  AccelData d{0, 0, 0};

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // ACCEL_XOUT_H
  Wire.endTransmission(false);

  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)6);
  if (Wire.available() < 6) return d;

  uint8_t axh = Wire.read();
  uint8_t axl = Wire.read();
  uint8_t ayh = Wire.read();
  uint8_t ayl = Wire.read();
  uint8_t azh = Wire.read();
  uint8_t azl = Wire.read();

  // Безопасное преобразование
  d.x = (int16_t)(((uint16_t)axh << 8) | axl);
  d.y = (int16_t)(((uint16_t)ayh << 8) | ayl);
  d.z = (int16_t)(((uint16_t)azh << 8) | azl);

  return d;
}`
  },
  {
    id: 'shake',
    title: 'Детекция тряски',
    language: 'cpp',
    code: `bool shakeDetected() {
  if (!mpuReady) return false;

  static bool initialized = false;
  static long lastTotal = 0;

  AccelData a = readAccelBurst();
  long total = abs(a.x) + abs(a.y) + abs(a.z);

  // Первый замер — инициализация
  if (!initialized) {
    lastTotal = total;
    initialized = true;
    return false;
  }

  long diff = total - lastTotal;
  if (diff < 0) diff = -diff;
  lastTotal = total;

  return diff > SHAKE_THRESHOLD; // 12000
}`
  },
  {
    id: 'button',
    title: 'Обработка кнопки',
    language: 'cpp',
    code: `ButtonEvent update() {
  bool raw = readRaw();

  // Debounce
  if (raw != _lastRaw) {
    _lastRaw = raw;
    _lastChange = millis();
  }

  if (millis() - _lastChange > DEBOUNCE_MS) {
    if (raw != _state) {
      _state = raw;
      if (_state) {
        _pressStart = millis();
      } else {
        if (!_longFired) {
          _taps++;
          _releaseTime = millis();
          _waitingDouble = true;
        }
      }
    }
  }

  // Long press detection
  if (_state && !_longFired &&
      millis() - _pressStart > LONG_MS) {
    _longFired = true;
    return ButtonEvent::Long;
  }

  // Double press detection
  if (_waitingDouble &&
      millis() - _releaseTime > DOUBLE_MS) {
    _waitingDouble = false;
    if (_taps == 1) return ButtonEvent::Short;
    if (_taps >= 2) return ButtonEvent::Double;
  }

  return ButtonEvent::None;
}`
  },
  {
    id: 'sleep',
    title: 'Deep Sleep и пробуждение',
    language: 'cpp',
    code: `void goToDeepSleep() {
  stopWiFi();
  backlightSet(0);
  delay(50);
  tft.fillScreen(C_BG);

  // Очистка INT статуса MPU
  if (mpuReady) {
    readMPU(0x3A);
  }

  pinMode(MPU_INT_PIN, INPUT_PULLDOWN);

  // Wake-up по высокому уровню на INT
  esp_err_t err = esp_deep_sleep_enable_ext0_wakeup(
    (gpio_num_t)MPU_INT_PIN, 1
  );

  esp_deep_sleep_start();
}

// В setup():
esp_sleep_wakeup_cause_t cause = 
  esp_sleep_get_wakeup_cause();

if (cause == ESP_SLEEP_WAKEUP_EXT0) {
  // Пробуждение от тряски → сразу ответ
  askOracle();
}`
  },
  {
    id: 'snake',
    title: 'Игра «Змейка»',
    language: 'cpp',
    code: `void updateSnake(unsigned long now) {
  snakeReadTilt(); // Управление наклоном

  if (!snakeAlive || now < snakeNextMove)
    return;

  snakeDirX = snakePendX;
  snakeDirY = snakePendY;

  int nx = snakeX[0] + snakeDirX;
  int ny = snakeY[0] + snakeDirY;

  // Проверка столкновений
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
    snakeAlive = false;
    drawSnake();
    return;
  }

  // Движение
  for (int i = snakeLen - 1; i > 0; i--) {
    snakeX[i] = snakeX[i - 1];
    snakeY[i] = snakeY[i - 1];
  }
  snakeX[0] = nx;
  snakeY[0] = ny;

  // Еда
  if (nx == snakeFoodX && ny == snakeFoodY) {
    if (snakeLen < 359) snakeLen++;
    snakeScore++;
    if (snakeSpeed > 70) snakeSpeed -= 3;
    snakeSpawnFood();
  }

  snakeNextMove = now + snakeSpeed;
  drawSnake();
}`
  }
]

export default function CodeSection() {
  const [activeSnippet, setActiveSnippet] = useState(0)

  return (
    <section id="code" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,190,255,0.04)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Исходный код</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Ключевые фрагменты
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Основные модули проекта ESPOracle.ino. 
            Полный код доступен для прошивки через Arduino IDE.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Snippet list */}
          <div className="lg:col-span-1 space-y-2">
            {codeSnippets.map((snippet, i) => (
              <button
                key={snippet.id}
                onClick={() => setActiveSnippet(i)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeSnippet === i
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                    : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {snippet.title}
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  ESPOracle.ino — {codeSnippets[activeSnippet].title}
                </span>
                <span className="text-xs text-cyan-400 font-mono">
                  {codeSnippets[activeSnippet].language}
                </span>
              </div>

              {/* Code */}
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <code className="text-gray-300">
                    {codeSnippets[activeSnippet].code.split('\n').map((line, i) => (
                      <div key={i} className="flex">
                        <span className="text-gray-600 select-none w-8 text-right mr-4 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1">
                          {highlightSyntax(line)}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Libraries */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Необходимые библиотеки</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Adafruit GFX Library', desc: 'Графический движок' },
              { name: 'Adafruit ST7789', desc: 'Драйвер дисплея' },
              { name: 'U8g2 for Adafruit GFX', desc: 'Кириллические шрифты' },
              { name: 'WiFi (ESP32)', desc: 'Встроенная Wi-Fi' },
              { name: 'ESPmDNS', desc: 'mDNS сервис' },
              { name: 'Wire / SPI', desc: 'I2C и SPI шины' },
            ].map((lib, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{lib.name}</div>
                  <div className="text-xs text-gray-400">{lib.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function highlightSyntax(line: string): JSX.Element {
  // Simple syntax highlighting
  const keywords = ['void', 'int', 'bool', 'uint8_t', 'int16_t', 'uint16_t', 'long', 'float', 'static', 'const', 'if', 'else', 'return', 'for', 'while', 'switch', 'case', 'break', 'true', 'false', 'class', 'public', 'private', 'enum']
  const types = ['AccelData', 'ButtonEvent', 'String', 'Wire', 'Serial']
  
  let parts: { text: string; className: string }[] = []
  
  // Check for comments
  if (line.trim().startsWith('//')) {
    return <span className="text-gray-500 italic">{line}</span>
  }
  
  // Check for preprocessor
  if (line.trim().startsWith('#')) {
    return <span className="text-purple-400">{line}</span>
  }

  // Simple word-by-word highlighting
  const words = line.split(/(\s+|[{}();,=+\-*/<>!&|]+)/)
  
  return (
    <>
      {words.map((word, i) => {
        if (keywords.includes(word)) {
          return <span key={i} className="text-blue-400">{word}</span>
        }
        if (types.includes(word)) {
          return <span key={i} className="text-cyan-400">{word}</span>
        }
        if (/^\d+$/.test(word)) {
          return <span key={i} className="text-amber-400">{word}</span>
        }
        if (word.startsWith('"') || word.startsWith("'")) {
          return <span key={i} className="text-green-400">{word}</span>
        }
        if (word.startsWith('0x')) {
          return <span key={i} className="text-amber-400">{word}</span>
        }
        return <span key={i} className="text-gray-300">{word}</span>
      })}
    </>
  )
}

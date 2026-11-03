import { useState } from 'react'

interface Fix {
  id: string
  error: string
  line: string
  cause: string
  before: string
  after: string
  explanation: string
}

const fixes: Fix[] = [
  {
    id: 'acceldata',
    error: "'AccelData' does not name a type",
    line: '487',
    cause: 'Структура AccelData не объявлена до места использования',
    before: `// ❌ ОШИБКА: AccelData не объявлена
AccelData readAccelBurst() {
  AccelData d{0, 0, 0};
  // ...
}`,
    after: `// ✅ ИСПРАВЛЕНО: Добавляем struct перед функцией
struct AccelData {
  int16_t x, y, z;
};

AccelData readAccelBurst() {
  AccelData d{0, 0, 0};
  // ...
}`,
    explanation: 'В C++ все типы должны быть объявлены до их использования. Добавьте struct AccelData в начало файла (после #include, до setup()).'
  },
  {
    id: 'ascent',
    error: "'getAscent' → 'getFontAscent', 'getDescent' → 'getFontDescent'",
    line: '644',
    cause: 'В новой версии U8g2_for_Adafruit_GFX методы переименованы',
    before: `// ❌ ОШИБКА: старые имена методов
int lineH = u8g2.getAscent() - u8g2.getDescent() + 4;`,
    after: `// ✅ ИСПРАВЛЕНО: новые имена методов
int lineH = u8g2.getFontAscent() - u8g2.getFontDescent() + 4;`,
    explanation: 'Библиотека U8g2_for_Adafruit_GFX обновила API. Методы getAscent/getDescent переименованы в getFontAscent/getFontDescent.'
  },
  {
    id: 'wifi_sleep',
    error: "'WIFI_MODEM_SLEEP' was not declared",
    line: '1119',
    cause: 'В ESP32 Arduino Core 3.x API сна Wi-Fi изменился',
    before: `// ❌ ОШИБКА: WIFI_MODEM_SLEEP не существует в 3.x
WiFi.setSleep(WIFI_MODEM_SLEEP);`,
    after: `// ✅ ИСПРАВЛЕНО: используем булево значение
WiFi.setSleep(true);  // или WiFi.setSleep(WIFI_PS_MODEM)`,
    explanation: 'В новых версиях ESP32 Core (3.x) константа WIFI_MODEM_SLEEP убрана. Используйте WiFi.setSleep(true) для включения modem sleep.'
  },
  {
    id: 'deep_sleep',
    error: "'esp_deep_sleep_enable_ext0_wakeup' not declared",
    line: '1328',
    cause: 'ESP32-C3 НЕ поддерживает ext0 wakeup! Только GPIO wakeup',
    before: `// ❌ ОШИБКА: ext0 не работает на ESP32-C3
esp_deep_sleep_enable_ext0_wakeup((gpio_num_t)MPU_INT_PIN, 1);`,
    after: `// ✅ ИСПРАВЛЕНО: используем GPIO wakeup для C3
esp_deep_sleep_enable_gpio_wakeup(1 << MPU_INT_PIN, ESP_GPIO_WAKEUP_GPIO_HIGH);`,
    explanation: 'ESP32-C3 — это RISC-V чип, у него НЕТ ext0/ext1 wakeup как у классического ESP32 (Xtensa). Используйте esp_deep_sleep_enable_gpio_wakeup() с маской GPIO.'
  },
  {
    id: 'u8g2_begin',
    error: "cannot convert 'Adafruit_ST7789*' to 'Adafruit_GFX&'",
    line: '1770',
    cause: 'u8g2.begin() принимает ссылку (&), а не указатель (*)',
    before: `// ❌ ОШИБКА: передаём указатель (&tft)
u8g2.begin(&tft);`,
    after: `// ✅ ИСПРАВЛЕНО: передаём ссылку (tft без &)
u8g2.begin(tft);`,
    explanation: 'Метод begin() принимает Adafruit_GFX& (ссылку), а не Adafruit_GFX* (указатель). Уберите амперсанд перед tft.'
  },
  {
    id: 'font_ref',
    error: "'setFontRefHeightExtendedText' no member",
    line: '1771',
    cause: 'Метод удалён в новых версиях U8g2_for_Adafruit_GFX',
    before: `// ❌ ОШИБКА: метод больше не существует
u8g2.begin(tft);
u8g2.setFontRefHeightExtendedText();`,
    after: `// ✅ ИСПРАВЛЕНО: просто удаляем эту строку
u8g2.begin(tft);
// setFontRefHeightExtendedText() больше не нужен`,
    explanation: 'Этот метод устарел и удалён из библиотеки. Просто удалите строку — поведение по умолчанию и так корректное.'
  }
]

export default function CompilationFixes() {
  const [openFix, setOpenFix] = useState<string | null>(fixes[0].id)

  return (
    <section id="fixes" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03)_0%,transparent_50%)]" />
      
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-semibold tracking-wider uppercase">Ошибки компиляции</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Исправление ошибок Arduino IDE
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            6 типичных ошибок при компиляции ESPOracle на ESP32-C3. Нажмите на ошибку для просмотра исправления.
          </p>
        </div>

        {/* Error count summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
            <div className="text-2xl font-bold text-red-400">6</div>
            <div className="text-xs text-gray-500">Ошибок</div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
            <div className="text-2xl font-bold text-green-400">6</div>
            <div className="text-xs text-gray-500">Исправлений</div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center col-span-2 sm:col-span-1">
            <div className="text-2xl font-bold text-cyan-400">~10</div>
            <div className="text-xs text-gray-500">Минут на фикс</div>
          </div>
        </div>

        {/* Fixes list */}
        <div className="space-y-3">
          {fixes.map((fix, index) => (
            <div
              key={fix.id}
              className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                openFix === fix.id
                  ? 'border-red-500/30 bg-red-500/[0.02]'
                  : 'border-white/10 bg-white/[0.01] hover:border-white/20'
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setOpenFix(openFix === fix.id ? null : fix.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  openFix === fix.id ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-500">строка {fix.line}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-mono">error</span>
                  </div>
                  <p className="text-sm text-white font-medium mt-0.5 truncate">
                    {fix.error}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openFix === fix.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Content */}
              {openFix === fix.id && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Cause */}
                  <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-xs text-yellow-400 font-bold mb-1">⚠️ Причина:</p>
                    <p className="text-sm text-gray-300">{fix.cause}</p>
                  </div>

                  {/* Before / After */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">❌ БЫЛО</span>
                      </div>
                      <pre className="text-xs font-mono text-red-300/80 bg-red-500/5 border border-red-500/10 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                        {fix.before}
                      </pre>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold">✅ СТАЛО</span>
                      </div>
                      <pre className="text-xs font-mono text-green-300/80 bg-green-500/5 border border-green-500/10 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                        {fix.after}
                      </pre>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-xs text-cyan-400 font-bold mb-1">💡 Объяснение:</p>
                    <p className="text-sm text-gray-300">{fix.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick fix summary */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🚀</span> Быстрый чеклист исправлений
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Добавить struct AccelData { int16_t x, y, z; };',
              'getAscent() → getFontAscent()',
              'getDescent() → getFontDescent()',
              'WIFI_MODEM_SLEEP → WiFi.setSleep(true)',
              'ext0_wakeup → gpio_wakeup (для C3)',
              'u8g2.begin(&tft) → u8g2.begin(tft)',
              'Удалить setFontRefHeightExtendedText()',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                <span className="text-green-400 text-sm">✓</span>
                <code className="text-xs text-gray-300 font-mono">{item}</code>
              </div>
            ))}
          </div>
        </div>

        {/* ESP32-C3 vs ESP32 note */}
        <div className="mt-6 p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
            <span>⚡</span> Важно: ESP32-C3 ≠ ESP32
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            ESP32-C3 использует архитектуру <strong className="text-white">RISC-V</strong>, а не Xtensa как классический ESP32. 
            Поэтому некоторые функции deep sleep (<code className="text-amber-400 bg-amber-400/10 px-1 rounded">ext0/ext1 wakeup</code>) недоступны. 
            Всегда используйте <code className="text-amber-400 bg-amber-400/10 px-1 rounded">esp_deep_sleep_enable_gpio_wakeup()</code> для C3.
          </p>
        </div>
      </div>
    </section>
  )
}

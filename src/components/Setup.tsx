export default function Setup() {
  const steps = [
    {
      num: 1,
      title: 'Установите Arduino IDE 2.x',
      description: 'Скачайте Arduino IDE 2.x с официального сайта arduino.cc и установите.',
      details: [
        'Скачайте: https://www.arduino.cc/en/software',
        'Запустите установщик, выберите все компоненты',
        'После установки откройте Arduino IDE'
      ]
    },
    {
      num: 2,
      title: 'Добавьте поддержку ESP32',
      description: 'Установите пакет плат ESP32 через Boards Manager.',
      details: [
        'File → Preferences (Ctrl+,)',
        'В поле "Additional Board Manager URLs" вставьте:',
        'https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
        'Tools → Board → Boards Manager → найдите "esp32" → Install (by Espressif Systems, версия 2.0.x или 3.x)'
      ]
    },
    {
      num: 3,
      title: 'Установите библиотеки',
      description: 'Через Library Manager установите все необходимые библиотеки.',
      details: [
        'Sketch → Include Library → Manage Libraries (Ctrl+Shift+I)',
        'Найдите и установите: "Adafruit GFX Library" (by Adafruit)',
        'Найдите и установите: "Adafruit ST7789 Library" (by Adafruit)',
        'Найдите и установите: "U8g2 for Adafruit GFX" (by olikraus)',
        'Нажмите "Install All" когда предложит установить зависимости'
      ]
    },
    {
      num: 4,
      title: 'Соберите схему',
      description: 'Подключите все компоненты согласно распиновке. Проверьте питание и подтяжки I2C.',
      details: [
        'TFT ST7789 → SPI пины (SCLK=GPIO5, MOSI=GPIO6, CS=GPIO10, DC=GPIO7, RST=GPIO3, BL=GPIO21)',
        'MPU6050 → I2C пины (SDA=GPIO1, SCL=GPIO0, INT=GPIO4) + подтяжки 4.7kΩ',
        'TTP223 → GPIO20 (Signal), VCC, GND',
        'Убедитесь что все на 3.3V'
      ]
    },
    {
      num: 5,
      title: 'Настройте плату в Arduino IDE',
      description: 'Выберите правильную плату и параметры для ESP32-C3 SuperMini.',
      details: [
        'Tools → Board → esp32 → ESP32C3 Dev Module',
        'USB CDC On Boot: Enabled (ВАЖНО для Serial!)',
        'CPU Frequency: 160MHz',
        'Flash Mode: QIO, Flash Size: 4MB, Partition Scheme: Default 4MB'
      ]
    },
    {
      num: 6,
      title: 'Откройте скетч и прошейте',
      description: 'Откройте ESPOracle.ino, выберите COM-порт и загрузите.',
      details: [
        'File → Open → выберите ESPOracle.ino',
        'Tools → Port → выберите ваш COM-порт',
        'Нажмите Upload (→) или Ctrl+U',
        'Дождитесь "Done uploading" в нижней панели'
      ]
    },
    {
      num: 7,
      title: 'Проверьте работу',
      description: 'Убедитесь что все компоненты работают корректно.',
      details: [
        'Tools → Serial Monitor (115200 baud) — смотрите логи',
        'Должна появиться интро-анимация на экране',
        'Тряхните — должен появиться ответ оракула',
        'Нажмите кнопку — переключение режимов'
      ]
    }
  ]

  const troubleshooting = [
    {
      problem: '❌ COM-порт не найден / не определяется',
      solutions: [
        'Установите драйвер USB-to-UART: CP210x или CH340 (зависит от платы)',
        'Tools → Port → если пусто, переустановите драйвер',
        'Для ESP32-C3 SuperMini: USB CDC On Boot → Enabled',
        'Попробуйте другой USB-кабель (не только зарядка!)'
      ]
    },
    {
      problem: '❌ Ошибка "Failed to connect to ESP32-C3"',
      solutions: [
        'Зажмите кнопку BOOT на плате, затем нажмите Upload',
        'Отпустите BOOT после появления "Connecting..."',
        'Снизьте Upload Speed до 115200',
        'Попробуйте USB 2.0 порт (не хаб!)'
      ]
    },
    {
      problem: '❌ Библиотека не найдена при компиляции',
      solutions: [
        'Sketch → Include Library → Manage Libraries',
        'Найдите точное название библиотеки и нажмите Install',
        'Убедитесь что установлены ВСЕ зависимости (Install All)',
        'Перезапустите Arduino IDE после установки'
      ]
    },
    {
      problem: 'Экран белый / не работает',
      solutions: [
        'Проверьте питание 3.3V',
        'Попробуйте TFT_INVERT false',
        'Поменяйте tft.setRotation(0/1/2/3)',
        'Проверьте пины SPI'
      ]
    },
    {
      problem: 'MPU6050 не найден',
      solutions: [
        'Проверьте WHO_AM_I в Serial',
        'SDA/SCL не перепутаны',
        'Адрес 0x68 (AD0=GND) или 0x69 (AD0=VCC)',
        'Подтягивающие резисторы на I2C'
      ]
    },
    {
      problem: 'Не просыпается от тряски',
      solutions: [
        'MPU6050 должен быть запитан постоянно',
        'INT настроен как active HIGH',
        'Снизьте WOM_THRESHOLD до 20',
        'Проверьте GPIO4 как wake pin'
      ]
    },
    {
      problem: 'Кнопка не реагирует',
      solutions: [
        'Проверьте BTN_ACTIVE_HIGH',
        'TTP223 обычно active HIGH',
        'Проверьте подключение GPIO20',
        'Попробуйте INPUT_PULLUP вместо PULLDOWN'
      ]
    }
  ]

  return (
    <section id="setup" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Начало работы</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Установка и настройка
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Пошаговое руководство по сборке и прошивке устройства InnerVoice ESP Oracle
          </p>
        </div>

        {/* Arduino IDE Quick Start Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-teal-400">Быстрый старт через Arduino IDE</h3>
                <p className="text-xs text-gray-400">Рекомендуемый способ прошивки для новичков</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="text-xs text-teal-400 font-bold mb-1">1. Скачать IDE</div>
                <a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline">
                  arduino.cc/en/software →
                </a>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="text-xs text-teal-400 font-bold mb-1">2. Установить ESP32</div>
                <p className="text-xs text-gray-400">Boards Manager → "esp32" → Install</p>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="text-xs text-teal-400 font-bold mb-1">3. Установить либы</div>
                <p className="text-xs text-gray-400">Manage Libraries → Adafruit GFX, ST7789, U8g2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arduino IDE Board Settings */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span> Настройки платы в Arduino IDE
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            После установки ESP32 пакета, выберите плату и настройки:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { param: 'Board', value: 'ESP32C3 Dev Module', critical: true },
              { param: 'USB CDC On Boot', value: 'Enabled', critical: true },
              { param: 'CPU Frequency', value: '160 MHz', critical: false },
              { param: 'Flash Mode', value: 'QIO', critical: false },
              { param: 'Flash Size', value: '4MB (32Mb)', critical: false },
              { param: 'Partition Scheme', value: 'Default 4MB with spiffs', critical: false },
              { param: 'Upload Speed', value: '921600', critical: false },
              { param: 'Erase All Flash', value: 'Only Once', critical: false },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-lg border ${item.critical ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-black/20 border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.param}</span>
                  {item.critical && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">ВАЖНО</span>}
                </div>
                <code className="text-sm text-white font-mono font-bold">{item.value}</code>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-red-400">
              <span className="font-bold">⚠️ Критично:</span> USB CDC On Boot → <code className="bg-red-500/10 px-1 rounded">Enabled</code> — без этого Serial Monitor не будет работать, и прошивка может не загрузиться!
            </p>
          </div>
        </div>

        {/* PlatformIO Alternative */}
        <details className="mb-12 group">
          <summary className="cursor-pointer p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-purple-500/20 transition-all flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <span className="text-purple-400">⚡</span>
              Альтернатива: если используете PlatformIO (VS Code)
            </span>
            <svg className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-3 p-5 rounded-xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-400">Ошибка: U8g2_for_Adafruit_GFX.h not found</h4>
                <p className="text-xs text-gray-400 font-mono">fatal error: U8g2_for_Adafruit_GFX.h: No such file or directory</p>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-lg p-3 border border-white/10 mb-3">
              <p className="text-xs text-gray-300 mb-2">
                <span className="text-yellow-400 font-bold">Решение:</span> Добавьте в <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">platformio.ini</code>:
              </p>
              <pre className="text-xs font-mono text-green-400 bg-black/50 rounded p-2 overflow-x-auto border border-green-500/20">
{`lib_deps = 
    adafruit/Adafruit GFX Library@^1.11.9
    adafruit/Adafruit ST7789 Library@^1.10.4
    adafruit/Adafruit BusIO@^1.16.1
    olikraus/U8g2_for_Adafruit_GFX@^1.8.0
    Wire
    SPI`}</pre>
            </div>
            <p className="text-xs text-gray-400">
              Затем: <code className="text-green-400">pio run -t clean</code> → <code className="text-green-400">pio run -t upload</code>
            </p>
          </div>
        </details>

        {/* Steps */}
        <div className="space-y-6 mb-16">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-purple-500/20 transition-all">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                <ul className="space-y-1">
                  {step.details.map((d, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">›</span>
                      <code className="font-mono">{d}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Troubleshooting */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Решение проблем</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {troubleshooting.map((item, i) => (
              <div key={i} className={`p-5 rounded-xl ${i === 0 ? 'bg-red-500/5 border border-red-500/30 md:col-span-2' : 'bg-amber-500/5 border border-amber-500/20'}`}>
                <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${i === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {item.problem}
                </h4>
                <ul className="space-y-1.5">
                  {item.solutions.map((s, j) => (
                    <li key={j} className={`text-xs flex items-start gap-2 ${i === 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                      <span className={`${i === 0 ? 'text-red-400/70' : 'text-amber-400/70'} mt-0.5`}>•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Quick reference */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20">
          <h3 className="text-xl font-bold text-white text-center mb-6">Быстрая справка по настройкам</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { param: 'SHAKE_THRESHOLD', value: '12000', desc: 'Порог детекции тряски' },
              { param: 'SHAKE_COOLDOWN_MS', value: '2500', desc: 'Кулдаун между трясками' },
              { param: 'DIM_AFTER_MS', value: '10000', desc: 'Приглушение экрана' },
              { param: 'SLEEP_AFTER_MS', value: '25000', desc: 'Уход в deep sleep' },
              { param: 'WOM_THRESHOLD', value: '40', desc: 'Порог wake-on-motion' },
              { param: 'DEFAULT_BRIGHTNESS', value: '220', desc: 'Яркость по умолчанию' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-black/20 border border-white/5">
                <code className="text-xs text-cyan-400 font-mono">{item.param}</code>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-white font-bold">{item.value}</span>
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

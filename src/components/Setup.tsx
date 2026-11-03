export default function Setup() {
  const steps = [
    {
      num: 1,
      title: 'Установите Arduino IDE / PlatformIO',
      description: 'Скачайте Arduino IDE 2.x или PlatformIO. Добавьте URL ESP32 в настройки Boards Manager.',
      details: [
        'File → Preferences → Additional Board Manager URLs',
        'Добавьте: https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json',
        'Boards Manager → установите "esp32 by Espressif Systems"'
      ]
    },
    {
      num: 2,
      title: 'Установите библиотеки',
      description: 'Через Library Manager или platformio.ini установите необходимые библиотеки.',
      details: [
        'Sketch → Include Library → Manage Libraries',
        'Установите: Adafruit GFX Library',
        'Установите: Adafruit ST7789 Library',
        'Установите: U8g2 for Adafruit GFX'
      ]
    },
    {
      num: 3,
      title: 'Соберите схему',
      description: 'Подключите все компоненты согласно распиновке. Проверьте питание и подтяжки I2C.',
      details: [
        'TFT ST7789 → SPI пины (SCLK, MOSI, CS, DC, RST, BL)',
        'MPU6050 → I2C пины (SDA, SCL, INT) + подтяжки 4.7kΩ',
        'TTP223 → GPIO20 (Signal), VCC, GND',
        'Убедитесь что все на 3.3V'
      ]
    },
    {
      num: 4,
      title: 'Настройте скетч',
      description: 'Откройте ESPOracle.ino и проверьте конфигурацию под вашу плату.',
      details: [
        'Выберите плату: ESP32C3 Dev Module',
        'USB CDC On Boot: Enabled (для Serial)',
        'Проверьте пины в секции PIN CONFIGURATION',
        'При необходимости измените TFT_INVERT'
      ]
    },
    {
      num: 5,
      title: 'Прошейте и проверьте',
      description: 'Загрузите прошивку и проверьте работу всех компонентов.',
      details: [
        'Upload → дождитесь завершения',
        'Проверьте интро-анимацию',
        'Тряхните — должен появиться ответ оракула',
        'Нажмите кнопку — переключение режимов'
      ]
    },
    {
      num: 6,
      title: 'Настройте Wi-Fi (опционально)',
      description: 'Для режима часов и интеграции с Jarvis.',
      details: [
        'В коде задайте WIFI_SSID и WIFI_PASS',
        'Устройство подключится автоматически в режиме СЕТЬ',
        'mDNS: inner-oracle.local',
        'NTP синхронизация для часов'
      ]
    }
  ]

  const troubleshooting = [
    {
      problem: '❌ fatal error: U8g2_for_Adafruit_GFX.h: No such file or directory',
      solutions: [
        'Добавьте в platformio.ini → lib_deps: olikraus/U8g2_for_Adafruit_GFX',
        'Также добавьте: adafruit/Adafruit GFX Library, adafruit/Adafruit ST7789 Library',
        'Или через CLI: platformio lib install "U8g2_for_Adafruit_GFX"',
        'После изменения platformio.ini выполните: pio run -t clean, затем pio run'
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

        {/* PlatformIO Fix Banner */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-400">Ошибка компиляции PlatformIO</h3>
                <p className="text-xs text-gray-400 font-mono">fatal error: U8g2_for_Adafruit_GFX.h: No such file or directory</p>
              </div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-4 border border-white/10 mb-4">
              <p className="text-sm text-gray-300 mb-3">
                <span className="text-yellow-400 font-bold">Решение:</span> Добавьте недостающие библиотеки в <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">platformio.ini</code>:
              </p>
              <pre className="text-xs font-mono text-green-400 bg-black/50 rounded-lg p-3 overflow-x-auto border border-green-500/20">
{`[env:esp32-c3]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino

lib_deps = 
    adafruit/Adafruit GFX Library@^1.11.9
    adafruit/Adafruit ST7789 Library@^1.10.4
    adafruit/Adafruit BusIO@^1.16.1
    olikraus/U8g2_for_Adafruit_GFX@^1.8.0
    Wire
    SPI`}</pre>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                ✓ После изменения запустите: <code className="font-mono">pio run -t clean</code>
              </span>
              <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                ✓ Или через VS Code: PlatformIO → Libraries → Install
              </span>
            </div>
          </div>
        </div>

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

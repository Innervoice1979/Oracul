export default function Architecture() {
  return (
    <section id="architecture" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(59,130,246,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Структура</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Архитектура ПО
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Модульная событийная архитектура с разделением на подсистемы: 
            ввод, датчики, UI, сеть и управление питанием.
          </p>
        </div>

        {/* Architecture diagram */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input layer */}
            <div className="space-y-4">
              <h3 className="text-center text-sm font-bold text-cyan-400 uppercase tracking-wider">Ввод</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center text-sm text-cyan-300">
                  ButtonMonitor
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center text-sm text-cyan-300">
                  shakeDetected()
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center text-sm text-cyan-300">
                  readAccelBurst()
                </div>
              </div>
            </div>

            {/* Processing layer */}
            <div className="space-y-4">
              <h3 className="text-center text-sm font-bold text-purple-400 uppercase tracking-wider">Обработка</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center text-sm text-purple-300">
                  handleButton()
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center text-sm text-purple-300">
                  Mode Manager
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center text-sm text-purple-300">
                  Game Manager
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center text-sm text-purple-300">
                  Power Manager
                </div>
              </div>
            </div>

            {/* Output layer */}
            <div className="space-y-4">
              <h3 className="text-center text-sm font-bold text-green-400 uppercase tracking-wider">Вывод</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center text-sm text-green-300">
                  TFT ST7789 UI
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center text-sm text-green-300">
                  Wi-Fi / mDNS
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center text-sm text-green-300">
                  HTTP / Jarvis
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center text-sm text-green-300">
                  Deep Sleep
                </div>
              </div>
            </div>
          </div>

          {/* Flow arrows */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <span>События</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Обработка</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Действие</span>
          </div>
        </div>

        {/* Key improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Исправлено из оригинала
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Безопасное чтение 16-битных значений из MPU (uint8_t → uint16_t → int16_t)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Burst-чтение акселерометра (6 байт за одну транзакцию I2C)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Нет переключения Wire.end()/Wire.begin() между устройствами</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Инициализация shakeDetected() без ложного срабатывания</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Корректная конфигурация INT_PIN_CFG для wake-on-motion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Безопасные пины для ESP32-C3 SuperMini</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20">
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Новые возможности
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>6 режимов работы с переключением кнопкой</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Игровой каркас (Змейка, Реакция)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Полный русский интерфейс с U8g2 шрифтами</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Красивая интро-анимация с 3D-кубом</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Управление яркостью PWM (4 уровня)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Каркас для MQTT / WebSocket / Jarvis</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Power management */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-xl font-bold text-center mb-8 text-white">Управление питанием</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center">
              <div className="text-3xl mb-2">☀️</div>
              <div className="text-sm font-bold text-white">Активный</div>
              <div className="text-xs text-gray-400 mt-1">Яркость 220/255</div>
              <div className="text-xs text-gray-500">0–10 сек</div>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center">
              <div className="text-3xl mb-2">🌙</div>
              <div className="text-sm font-bold text-white">Приглушённый</div>
              <div className="text-xs text-gray-400 mt-1">Яркость 45/255</div>
              <div className="text-xs text-gray-500">10–25 сек</div>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center">
              <div className="text-3xl mb-2">💤</div>
              <div className="text-sm font-bold text-white">Deep Sleep</div>
              <div className="text-xs text-gray-400 mt-1">Только MPU6050</div>
              <div className="text-xs text-gray-500">&gt;25 сек бездействия</div>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-bold text-white">Wake-up</div>
              <div className="text-xs text-gray-400 mt-1">EXT0 / GPIO INT</div>
              <div className="text-xs text-gray-500">Тряска → ответ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

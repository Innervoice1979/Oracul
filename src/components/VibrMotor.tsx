export default function VibrMotor() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(251,146,60,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">Тактильная связь</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              📳 Вибромотор
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Простой DC моторчик с эксцентриком для тактильной обратной связи. 
            6 паттернов вибрации для разных событий.
          </p>
        </div>

        {/* Схема подключения */}
        <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/20">
          <h3 className="text-xl font-bold text-white text-center mb-6">Схема подключения</h3>
          
          <div className="bg-black/40 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300">
{`
    ESP32-C3 SuperMini
    ┌─────────────────┐
    │                 │
    │  GPIO2 ─────────┼──── R 1kΩ ──────┐
    │                 │                  │
    │                 │            ┌─────┴─────┐
    │                 │            │  NPN      │
    │                 │            │  BC547    │
    │                 │            │  2N2222   │
    │                 │            │  S8050    │
    │                 │            ├───────────┤
    │                 │            │  B  C  E  │
    │                 │            └──┬──┬──┬──┘
    │                 │               │  │  │
    │                 │               │  │  │
    │                 │               │  │  └──── GND
    │                 │               │  │
    │                 │               │  └───────┐
    │                 │               │          │
    │  3.3V ──────────┼───────────────┼──── ┌────┴────┐
    │                 │               │     │ ВИБРО   │
    │                 │               │     │ МОТОР   │
    │                 │               │     │ (DC)    │
    │                 │               │     └─────────┘
    │                 │               │
    │  GND ───────────┼───────────────┘
    │                 │
    └─────────────────┘

    Или проще — готовый модуль MOSFET:
    
    GPIO2 ──┬── [MOSFET Module] ──┬── Мотор + VCC
            │                     │
           GND                   GND
`}
            </pre>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
              <h4 className="text-sm font-bold text-orange-400 mb-2">Компоненты</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Вибромотор DC 3-5V (с маховиком/эксцентриком)</li>
                <li>• NPN транзистор: BC547, 2N2222, S8050</li>
                <li>• Резистор 1kΩ (база транзистора)</li>
                <li>• Провода, припой</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-black/20 border border-white/5">
              <h4 className="text-sm font-bold text-orange-400 mb-2">Почему через транзистор?</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• GPIO отдаёт максимум ~12мА</li>
                <li>• Мотор потребляет 50-150мА</li>
                <li>• Прямое подключение сожжёт GPIO!</li>
                <li>• Транзистор = ключ: малый ток управляет большим</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Паттерны вибрации */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Паттерны вибрации</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Тик',
                duration: '30мс',
                pattern: '▓░░░░░░░░░',
                description: 'Нажатие кнопки, разгон в AUTO',
                color: 'cyan',
              },
              {
                name: 'Пульс',
                duration: '80+50+80мс',
                pattern: '▓▓▓░░▓▓▓░░',
                description: 'Ответ оракула, поедание в змейке, торможение',
                color: 'green',
              },
              {
                name: 'Длинный',
                duration: '250мс',
                pattern: '▓▓▓▓▓▓▓▓▓▓',
                description: 'Game Over, пробуждение, резкий манёвр, "ЖМИ!"',
                color: 'red',
              },
              {
                name: 'Тряска',
                duration: '200мс (случайная)',
                pattern: '▓░▓░▓▓░▓░▓',
                description: 'Неровная дорога в AUTO режиме',
                color: 'orange',
              },
              {
                name: 'Думает',
                duration: '1 сек (пульсация)',
                pattern: '▓▓░░▓▓░░▓▓',
                description: 'Оракул генерирует ответ',
                color: 'purple',
              },
              {
                name: 'Отключено',
                duration: '—',
                pattern: '░░░░░░░░░░',
                description: 'VIBR_ENABLED = 0 в коде',
                color: 'gray',
              },
            ].map((vibr, i) => {
              const colorClasses: Record<string, string> = {
                cyan: 'from-cyan-500/10 border-cyan-500/20 text-cyan-400',
                green: 'from-green-500/10 border-green-500/20 text-green-400',
                red: 'from-red-500/10 border-red-500/20 text-red-400',
                orange: 'from-orange-500/10 border-orange-500/20 text-orange-400',
                purple: 'from-purple-500/10 border-purple-500/20 text-purple-400',
                gray: 'from-gray-500/10 border-gray-500/20 text-gray-400',
              }
              
              return (
                <div
                  key={i}
                  className={`p-5 rounded-xl bg-gradient-to-br ${colorClasses[vibr.color]} border`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-white">{vibr.name}</h4>
                    <span className="text-xs text-gray-400">{vibr.duration}</span>
                  </div>
                  
                  <div className="font-mono text-lg mb-3 tracking-wider">
                    {vibr.pattern.split('').map((char, j) => (
                      <span key={j} className={char === '▓' ? 'text-white' : 'text-gray-600'}>
                        {char}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-400">{vibr.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Где используется */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-xl font-bold text-white text-center mb-6">Где используется вибрация</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-cyan-400 mb-3">🔮 Оракул</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Думает</b> — пульсация 1 сек (пока крутится куб)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Пульс</b> — "ответ готов!"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Длинный</b> — пробуждение от тряски</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-green-400 mb-3">🎮 Игры</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Тик</b> — нажатие кнопки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Пульс</b> — змейка съела еду</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Длинный</b> — Game Over в змейке</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Длинный</b> — "ЖМИ!" в реакции</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-yellow-400 mb-3">🚗 AUTO режим</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Тик</b> — разгон</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Пульс</b> — торможение</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Тряска</b> — неровная дорога</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Длинный</b> — резкий манёвр</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-purple-400 mb-3">⚙️ Общие</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Тик</b> — любое нажатие кнопки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Тик</b> — включение устройства</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">▸</span>
                  <span><b>Длинный</b> — пробуждение от сна</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Отключение */}
        <div className="mt-8 p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h4 className="text-sm font-bold text-amber-400 mb-2">💡 Как отключить</h4>
          <p className="text-sm text-gray-300 mb-3">
            Если вибромотор не подключен, установите в коде:
          </p>
          <code className="block p-3 rounded-lg bg-black/40 text-xs text-cyan-400 font-mono">
            #define VIBR_ENABLED 0
          </code>
          <p className="text-xs text-gray-400 mt-2">
            Все вызовы вибрации будут скомпилированы в пустые функции — нулевые накладные расходы.
          </p>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'

const modes = [
  {
    id: 'oracle',
    name: 'ОРАКУЛ',
    icon: '🔮',
    color: 'from-purple-500 to-blue-600',
    borderColor: 'border-purple-500/30',
    description: 'Магический шар. Тряси устройство или держи кнопку — получи ответ на свой вопрос.',
    features: [
      '21 русский ответ оракула',
      'Анимация вращающегося куба',
      'Детекция тряски через MPU6050',
      'Адаптивный перенос текста',
      'Отправка результата в Jarvis (HTTP)'
    ],
    controls: [
      { action: 'Тряска', result: 'Задать вопрос' },
      { action: 'Долгое нажатие', result: 'Задать вопрос' },
      { action: 'Короткое', result: 'Следующий режим' },
    ]
  },
  {
    id: 'clock',
    name: 'ВРЕМЯ',
    icon: '🕐',
    color: 'from-cyan-500 to-teal-600',
    borderColor: 'border-cyan-500/30',
    description: 'Часы с датой на русском языке. Синхронизация через NTP по Wi-Fi.',
    features: [
      'NTP синхронизация',
      'Дата на русском',
      'Uptime при отсутствии сети',
      'Статус Wi-Fi подключения',
      'Автообновление каждую секунду'
    ],
    controls: [
      { action: 'Долгое нажатие', result: 'Вкл/выкл Wi-Fi' },
      { action: 'Короткое', result: 'Следующий режим' },
    ]
  },
  {
    id: 'games',
    name: 'ИГРЫ',
    icon: '🎮',
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500/30',
    description: 'Мини-игры: Змейка с управлением наклоном и тест реакции.',
    features: [
      'Змейка (наклон + кнопка)',
      'Тест реакции (мс)',
      'Расширяемый каркас для новых игр',
      'Управление через MPU6050',
      'Подсчёт очков'
    ],
    controls: [
      { action: 'Короткое', result: 'Выбрать / Повернуть' },
      { action: 'Долгое', result: 'Начать игру / Выход' },
      { action: 'Наклон', result: 'Управление змейкой' },
    ]
  },
  {
    id: 'network',
    name: 'СЕТЬ',
    icon: '📡',
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/30',
    description: 'Wi-Fi статус, mDNS, IP адрес. Управление подключением.',
    features: [
      'Wi-Fi STA подключение',
      'mDNS (inner-oracle.local)',
      'Отображение IP адреса',
      'Автопереподключение',
      'Статусы на русском'
    ],
    controls: [
      { action: 'Долгое нажатие', result: 'Вкл/выкл Wi-Fi' },
      { action: 'Короткое', result: 'Следующий режим' },
    ]
  },
  {
    id: 'robot',
    name: 'РОБОТ',
    icon: '🤖',
    color: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-500/30',
    description: 'Мост Jarvis. Связь с голосовым ассистентом и роботами.',
    features: [
      'HTTP мост к Jarvis',
      'MQTT (планируется)',
      'WebSocket (планируется)',
      'Управление мини-роботами',
      'Голосовые команды'
    ],
    controls: [
      { action: 'Долгое нажатие', result: 'Отправить ping' },
      { action: 'Короткое', result: 'Следующий режим' },
    ]
  },
  {
    id: 'auto',
    name: 'АВТО',
    icon: '🚗',
    color: 'from-yellow-500 to-orange-600',
    borderColor: 'border-yellow-500/30',
    description: 'Анализатор вождения на MPU6050. Разгон, торможение, повороты, стиль вождения.',
    features: [
      'Относительный спидометр (интеграл ускорения)',
      'Анимация дороги с перспективой',
      'Жёлтая машинка (наклон при поворотах)',
      'Детекция разгона / торможения',
      'Детекция поворотов (боковое ускорение)',
      'Детекция неровностей дороги',
      'Стиль вождения: CALM / NORMAL / ACTIVE / AGGRESSIVE',
      'Счётчики событий и время в движении'
    ],
    controls: [
      { action: 'Короткое', result: 'Следующий режим' },
      { action: 'Долгое', result: 'Сброс статистики' },
      { action: 'Наклон', result: 'Анализ в реальном времени' },
    ]
  },
  {
    id: 'setup',
    name: 'НАСТРОЙКИ',
    icon: '⚙️',
    color: 'from-gray-500 to-slate-600',
    borderColor: 'border-gray-500/30',
    description: 'Диагностика и параметры устройства. Порог тряски, сон, яркость.',
    features: [
      'Статус IMU',
      'Статус Wi-Fi',
      'Порог тряски',
      'Таймер сна',
      'Управление яркостью'
    ],
    controls: [
      { action: 'Долгое нажатие', result: 'Сон сейчас' },
      { action: 'Двойное', result: 'Яркость' },
      { action: 'Короткое', result: 'Следующий режим' },
    ]
  }
]

export default function Modes() {
  const [activeMode, setActiveMode] = useState(0)

  return (
    <section id="modes" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(34,197,94,0.04)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-green-400 text-sm font-semibold tracking-wider uppercase">Функциональность</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Режимы работы
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            6 режимов переключаются коротким нажатием кнопки. 
            Каждый режим имеет уникальные действия на долгое и двойное нажатие.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {modes.map((mode, i) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(i)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeMode === i
                  ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              <span className="mr-2">{mode.icon}</span>
              {mode.name}
            </button>
          ))}
        </div>

        {/* Active mode detail */}
        <div className={`rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border ${modes[activeMode].borderColor} p-8 transition-all duration-500`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{modes[activeMode].icon}</span>
                <h3 className="text-2xl font-bold text-white">{modes[activeMode].name}</h3>
              </div>
              <p className="text-gray-400 mb-6">{modes[activeMode].description}</p>
              
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Возможности</h4>
              <ul className="space-y-2">
                {modes[activeMode].features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Управление</h4>
              <div className="space-y-3">
                {modes[activeMode].controls.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
                    <span className="text-sm text-gray-300">{c.action}</span>
                    <span className="text-sm text-cyan-400 font-medium">{c.result}</span>
                  </div>
                ))}
              </div>

              {/* Mock screen */}
              <div className="mt-6 p-4 rounded-xl bg-black border-2 border-gray-700 shadow-inner">
                <div className="aspect-square bg-[#0a0e17] rounded-lg flex flex-col items-center justify-center p-4">
                  <div className="text-xs text-cyan-400 font-mono mb-2">{modes[activeMode].name}</div>
                  <div className="text-3xl mb-2">{modes[activeMode].icon}</div>
                  <div className="text-xs text-gray-500 text-center">{modes[activeMode].description.slice(0, 40)}...</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Button guide */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-2xl mb-2">👆</div>
            <div className="text-sm font-bold text-white">Короткое</div>
            <div className="text-xs text-gray-400 mt-1">Следующий режим</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-2xl mb-2">👇</div>
            <div className="text-sm font-bold text-white">Долгое (700ms)</div>
            <div className="text-xs text-gray-400 mt-1">Действие режима</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-2xl mb-2">👆👆</div>
            <div className="text-sm font-bold text-white">Двойное (300ms)</div>
            <div className="text-xs text-gray-400 mt-1">Яркость подсветки</div>
          </div>
        </div>
      </div>
    </section>
  )
}

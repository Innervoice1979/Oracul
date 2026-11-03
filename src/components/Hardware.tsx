export default function Hardware() {
  const components = [
    {
      name: 'ESP32-C3 SuperMini',
      description: 'Компактная плата на базе RISC-V с Wi-Fi и Bluetooth LE. Идеальна для носимых устройств.',
      specs: ['RISC-V 32-bit, 160MHz', '400KB SRAM', 'Wi-Fi 802.11 b/g/n', 'Bluetooth 5 (LE)', 'USB-C'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      name: 'TFT ST7789 1.54"',
      description: 'Цветной IPS-дисплей 240×240 пикселей с SPI интерфейсом. Яркий, контрастный.',
      specs: ['240×240 px', 'IPS, 65K цветов', 'SPI 40MHz', 'Подсветка PWM', 'Угол обзора 170°'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'MPU6050',
      description: '6-осевой акселерометр + гироскоп. Детекция тряски, управление играми, wake-on-motion.',
      specs: ['3-осевой акселерометр', '3-осевой гироскоп', 'I2C до 400kHz', 'Wake-on-motion INT', '±2g / ±4g / ±8g / ±16g'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      name: 'Емкостная кнопка',
      description: 'Сенсорная кнопка TTP223 для переключения режимов. Короткое, долгое и двойное нажатие.',
      specs: ['TTP223 модуль', 'Активный HIGH', 'Debounce 40ms', 'Short / Long / Double', 'Без механического износа'],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    }
  ]

  return (
    <section id="hardware" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,190,255,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Компоненты</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Аппаратное обеспечение
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Компактное портативное устройство на базе ESP32-C3 с цветным дисплеем, 
            датчиком движения и Wi-Fi подключением
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {components.map((comp, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-cyan-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-cyan-500/5"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                  {comp.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{comp.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{comp.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {comp.specs.map((spec, j) => (
                      <span
                        key={j}
                        className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-gray-300 border border-white/5"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* System diagram */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-xl font-bold text-center mb-8 text-white">Системная схема</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="px-6 py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
              <div className="text-cyan-400 font-bold">ESP32-C3</div>
              <div className="text-xs text-gray-400">SuperMini</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500 text-center">SPI</div>
              <div className="w-12 h-px bg-gradient-to-r from-cyan-500/50 to-transparent" />
            </div>
            
            <div className="px-6 py-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
              <div className="text-blue-400 font-bold">ST7789</div>
              <div className="text-xs text-gray-400">TFT 240×240</div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-6">
            <div className="px-6 py-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
              <div className="text-purple-400 font-bold">MPU6050</div>
              <div className="text-xs text-gray-400">I2C Accelerometer</div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500 text-center">I2C</div>
              <div className="w-12 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
            </div>
            
            <div className="px-6 py-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <div className="text-green-400 font-bold">TTP223</div>
              <div className="text-xs text-gray-400">Capacitive Button</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

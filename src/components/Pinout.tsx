export default function Pinout() {
  const pinGroups = [
    {
      title: 'TFT ST7789 (SPI)',
      color: 'cyan',
      pins: [
        { gpio: 'GPIO5', signal: 'SCLK', desc: 'SCL на модуле (SPI Clock)' },
        { gpio: 'GPIO6', signal: 'MOSI', desc: 'SDA на модуле (SPI Data)' },
        { gpio: 'GPIO10', signal: 'CS', desc: 'CS' },
        { gpio: 'GPIO7', signal: 'DC', desc: 'DC (Data/Command)' },
        { gpio: 'GPIO3', signal: 'RST', desc: 'RST (Reset)' },
        { gpio: 'GPIO21', signal: 'BL', desc: 'BL (Backlight PWM)' },
      ]
    },
    {
      title: 'MPU6050 (I2C)',
      color: 'purple',
      pins: [
        { gpio: 'GPIO0', signal: 'SCL', desc: 'SCL (I2C Clock)' },
        { gpio: 'GPIO1', signal: 'SDA', desc: 'SDA (I2C Data)' },
        { gpio: 'GPIO4', signal: 'INT', desc: 'INT (Interrupt)' },
        { gpio: 'GND', signal: 'ADO', desc: 'ADO → GND (адрес 0x68)' },
        { gpio: '—', signal: 'XDA', desc: 'Не подключать' },
        { gpio: '—', signal: 'XCL', desc: 'Не подключать' },
      ]
    },
    {
      title: 'Кнопка TTP223',
      color: 'green',
      pins: [
        { gpio: 'GPIO20', signal: 'SIG', desc: 'SIG (Active HIGH)' },
        { gpio: '3.3V', signal: 'VCC', desc: 'VCC' },
        { gpio: 'GND', signal: 'GND', desc: 'GND' },
      ]
    },
    {
      title: 'Вибромотор',
      color: 'orange',
      pins: [
        { gpio: 'GPIO2', signal: 'BASE', desc: 'Через R 1kΩ к базе NPN' },
        { gpio: '3.3V', signal: 'MOTOR+', desc: 'Мотор → 3.3V' },
        { gpio: 'GND', signal: 'EMIT', desc: 'Эмиттер → GND' },
      ]
    }
  ]

  const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  }

  return (
    <section id="pinout" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase">Подключение</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Распиновка
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Подключение компонентов к ESP32-C3 SuperMini. 
            Проверьте распиновку вашей конкретной ревизии платы.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pinGroups.map((group, i) => {
            const colors = colorMap[group.color]
            return (
              <div key={i} className={`rounded-2xl ${colors.bg} border ${colors.border} p-6`}>
                <h3 className={`text-lg font-bold ${colors.text} mb-4 flex items-center gap-2`}>
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  {group.title}
                </h3>
                
                <div className="space-y-2">
                  {group.pins.map((pin, j) => (
                    <div key={j} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                      <div className="flex items-center gap-3">
                        <code className={`text-sm font-mono ${colors.text} font-bold`}>{pin.gpio}</code>
                        <span className="text-gray-500">→</span>
                        <span className="text-sm text-white font-medium">{pin.signal}</span>
                      </div>
                      <span className="text-xs text-gray-400">{pin.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Warning */}
        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-amber-400 font-semibold text-sm">⚠️ SCL/SDA — это разные интерфейсы!</p>
            <p className="text-amber-200/70 text-sm mt-1">
              <b>TFT дисплей:</b> SCL/SDA = SPI (Serial Peripheral Interface) — синхронная передача данных<br/>
              <b>MPU6050:</b> SCL/SDA = I2C (Inter-Integrated Circuit) — другая шина<br/>
              <b>НЕ ПЕРЕПУТАЙТЕ!</b> Эти пины несовместимы. TFT SCL → GPIO5, MPU SCL → GPIO0
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-400 font-semibold text-sm">MPU6050: XDA/XCL не используются</p>
            <p className="text-blue-200/70 text-sm mt-1">
              Пины XDA и XCL — auxiliary (вспомогательные), для подключения внешних сенсоров. 
              В нашем проекте они не нужны — оставьте их неподключёнными.<br/>
              <b>ADO</b> определяет I2C адрес: подключите к GND (адрес 0x68) или к VCC (адрес 0x69).
            </p>
          </div>
        </div>

        {/* Pin map visual */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-xl font-bold text-center mb-8 text-white">Карта GPIO ESP32-C3 SuperMini</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 max-w-3xl mx-auto">
            {[
              { pin: 0, used: 'I2C', color: 'purple' },
              { pin: 1, used: 'I2C', color: 'purple' },
              { pin: 2, used: 'VIBR', color: 'orange' },
              { pin: 3, used: 'TFT', color: 'cyan' },
              { pin: 4, used: 'IMU', color: 'purple' },
              { pin: 5, used: 'TFT', color: 'cyan' },
              { pin: 6, used: 'TFT', color: 'cyan' },
              { pin: 7, used: 'TFT', color: 'cyan' },
              { pin: 8, used: '—', color: 'gray' },
              { pin: 9, used: '—', color: 'gray' },
              { pin: 10, used: 'TFT', color: 'cyan' },
              { pin: 20, used: 'BTN', color: 'green' },
              { pin: 21, used: 'TFT', color: 'cyan' },
            ].map((p) => {
              const c = p.color === 'cyan' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' :
                        p.color === 'purple' ? 'border-purple-500/50 bg-purple-500/10 text-purple-400' :
                        p.color === 'green' ? 'border-green-500/50 bg-green-500/10 text-green-400' :
                        p.color === 'orange' ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' :
                        'border-white/10 bg-white/5 text-gray-500'
              return (
                <div key={p.pin} className={`p-3 rounded-lg border ${c} text-center`}>
                  <div className="text-xs font-mono font-bold">GPIO{p.pin}</div>
                  <div className="text-[10px] mt-1 opacity-70">{p.used}</div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/50" />
              <span className="text-xs text-gray-400">TFT SPI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/50" />
              <span className="text-xs text-gray-400">I2C / IMU</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
              <span className="text-xs text-gray-400">Кнопка</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50" />
              <span className="text-xs text-gray-400">Вибро</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-white/10 border border-white/10" />
              <span className="text-xs text-gray-400">Свободен</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

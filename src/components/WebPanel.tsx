import { useState } from 'react'

export default function WebPanel() {
  const [activeTab, setActiveTab] = useState<'wifi' | 'settings' | 'info'>('wifi')
  const [wifiSSID, setWifiSSID] = useState('')
  const [wifiPass, setWifiPass] = useState('')
  const [brightness, setBrightness] = useState(220)
  const [shakeThreshold, setShakeThreshold] = useState(12000)
  const [connected, setConnected] = useState(false)

  const handleConnect = () => {
    if (wifiSSID) {
      setConnected(true)
      setTimeout(() => setConnected(false), 3000)
    }
  }

  return (
    <section id="webpanel" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Управление</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Веб-панель управления
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Настройка Wi-Fi, параметров и режимов через встроенный веб-интерфейс.
            Откройте <code className="text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded font-mono text-sm">inner-oracle.local</code> в браузере
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Info */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">📡</span> Как подключиться
              </h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="text-sm text-white font-medium">Включите ESP Oracle</p>
                    <p className="text-xs text-gray-400">Устройство создаст Wi-Fi точку доступа <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">ESP-Oracle-Setup</code></p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="text-sm text-white font-medium">Подключитесь телефоном/ПК</p>
                    <p className="text-xs text-gray-400">Пароль: <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">oracle123</code> (или без пароля)</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="text-sm text-white font-medium">Откройте captive portal</p>
                    <p className="text-xs text-gray-400">Автоматически или вручную: <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">http://192.168.4.1</code></p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">4</span>
                  <div>
                    <p className="text-sm text-white font-medium">Настройте Wi-Fi</p>
                    <p className="text-xs text-gray-400">Введите SSID и пароль вашей домашней сети</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🌐</span> После подключения к Wi-Fi
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Доступ по адресу <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded font-mono text-xs">inner-oracle.local</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Или по IP: <code className="text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded font-mono text-xs">http://192.168.x.x</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>NTP синхронизация времени</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>HTTP API для интеграции с Jarvis</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-black/30 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-3">Технологии</h4>
              <div className="flex flex-wrap gap-2">
                {['ESP32 WebServer', 'Captive Portal', 'mDNS', 'NTP Client', 'ArduinoJson', 'Async WebServer'].map((tech, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Interactive Preview */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-cyan-500/5">
              {/* Browser Chrome */}
              <div className="bg-gray-800/80 px-4 py-2.5 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-900/80 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs text-gray-400 font-mono">inner-oracle.local</span>
                  </div>
                </div>
              </div>

              {/* Panel Content */}
              <div className="bg-[#0f1419] min-h-[500px]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔮</span>
                    <span className="text-sm font-bold text-white">ESP Oracle</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-mono">online</span>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">v1.0.0</div>
                </div>

                {/* Tabs */}
                <div className="px-5 pt-3 flex gap-1">
                  {[
                    { id: 'wifi' as const, label: 'Wi-Fi', icon: '📶' },
                    { id: 'settings' as const, label: 'Настройки', icon: '⚙️' },
                    { id: 'info' as const, label: 'Инфо', icon: 'ℹ️' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="mr-1">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-5">
                  {activeTab === 'wifi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">SSID сети</label>
                        <input
                          type="text"
                          value={wifiSSID}
                          onChange={(e) => setWifiSSID(e.target.value)}
                          placeholder="Введите название Wi-Fi сети"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1.5 block">Пароль</label>
                        <input
                          type="password"
                          value={wifiPass}
                          onChange={(e) => setWifiPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleConnect}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:from-cyan-400 hover:to-blue-500 transition-all active:scale-[0.98]"
                      >
                        {connected ? '✓ Подключено!' : 'Подключиться'}
                      </button>
                      
                      {connected && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <p className="text-xs text-green-400">
                            ✓ Подключено к <strong>{wifiSSID}</strong><br/>
                            <span className="text-gray-400">IP: 192.168.1.{Math.floor(Math.random() * 200 + 50)}</span>
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-gray-500 mb-2">Доступные сети:</p>
                        {['Home_WiFi', 'Office_Net', 'TP-Link_5G'].map((net, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                              </svg>
                              <span className="text-xs text-gray-300">{net}</span>
                            </div>
                            <span className="text-[10px] text-gray-500">{['-42 dBm', '-67 dBm', '-78 dBm'][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-400">Яркость экрана</label>
                          <span className="text-xs text-cyan-400 font-mono">{brightness}</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="255"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-gray-400">Порог тряски</label>
                          <span className="text-xs text-cyan-400 font-mono">{shakeThreshold}</span>
                        </div>
                        <input
                          type="range"
                          min="5000"
                          max="25000"
                          step="1000"
                          value={shakeThreshold}
                          onChange={(e) => setShakeThreshold(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                          <p className="text-[10px] text-gray-500 mb-1">Режим сна</p>
                          <p className="text-sm text-white font-bold">25 сек</p>
                        </div>
                        <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                          <p className="text-[10px] text-gray-500 mb-1">Приглушение</p>
                          <p className="text-sm text-white font-bold">10 сек</p>
                        </div>
                      </div>
                      <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold hover:from-purple-400 hover:to-pink-500 transition-all">
                        💾 Сохранить настройки
                      </button>
                    </div>
                  )}

                  {activeTab === 'info' && (
                    <div className="space-y-3">
                      {[
                        { label: 'Плата', value: 'ESP32-C3 SuperMini' },
                        { label: 'Прошивка', value: 'v1.0.0' },
                        { label: 'Uptime', value: '2ч 14м 33с' },
                        { label: 'Свободная память', value: '187 KB' },
                        { label: 'CPU', value: '160 MHz' },
                        { label: 'Температура CPU', value: '42°C' },
                        { label: 'Wi-Fi RSSI', value: '-42 dBm' },
                        { label: 'Режим', value: '🔮 Оракул' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20 border border-white/5">
                          <span className="text-xs text-gray-400">{item.label}</span>
                          <span className="text-xs text-white font-mono font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
          </div>
        </div>

        {/* API Section */}
        <div className="mt-16 p-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🔌</span> HTTP API для интеграции
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Веб-панель также предоставляет REST API для интеграции с умным домом, Jarvis и другими системами:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { method: 'GET', path: '/api/status', desc: 'Текущий статус устройства' },
              { method: 'GET', path: '/api/oracle/shake', desc: 'Получить ответ оракула' },
              { method: 'POST', path: '/api/settings', desc: 'Изменить настройки (JSON)' },
              { method: 'GET', path: '/api/wifi/scan', desc: 'Сканирование Wi-Fi сетей' },
              { method: 'POST', path: '/api/wifi/connect', desc: 'Подключиться к Wi-Fi' },
              { method: 'GET', path: '/api/info', desc: 'Информация о системе' },
            ].map((api, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  api.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {api.method}
                </span>
                <code className="text-xs text-cyan-400 font-mono flex-1">{api.path}</code>
                <span className="text-[10px] text-gray-500 hidden sm:block">{api.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

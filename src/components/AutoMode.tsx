import { useEffect, useRef } from 'react'

export default function AutoMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let roadOffset = 0
    let carX = 0
    let turnDir = 0
    let turnTimer = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4)
      skyGrad.addColorStop(0, '#0a1628')
      skyGrad.addColorStop(1, '#1a2a4a')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h * 0.4)

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(i * 123.456) * 0.5 + 0.5) * w
        const sy = (Math.cos(i * 789.012) * 0.5 + 0.5) * h * 0.35
        ctx.fillRect(sx, sy, 1.5, 1.5)
      }

      const horizonY = h * 0.4
      const centerX = w / 2 + carX

      // Road
      for (let y = horizonY; y < h; y += 2) {
        const progress = (y - horizonY) / (h - horizonY)
        const roadW = 30 + progress * (w * 0.8)
        const rl = centerX - roadW / 2
        const rr = centerX + roadW / 2

        ctx.fillStyle = `rgb(${30 + progress * 10}, ${30 + progress * 10}, ${35 + progress * 10})`
        ctx.fillRect(rl, y, rr - rl, 2)

        // Road edges
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.fillRect(rl, y, 2 + progress * 3, 2)
        ctx.fillRect(rr - 2 - progress * 3, y, 2 + progress * 3, 2)

        // Dashes
        const dashY = (y + roadOffset) % 30
        if (dashY < 15 && progress > 0.1) {
          const dw = 1 + progress * 4
          ctx.fillStyle = 'rgba(255,255,255,0.7)'
          ctx.fillRect(centerX - dw, y, dw * 2, 2)
        }
      }

      // Car (yellow)
      const carY = h - 50
      const carW = 30
      const carH = 20

      // Body
      ctx.fillStyle = '#ffdc00'
      ctx.fillRect(centerX - carW / 2, carY - carH, carW, carH)
      // Roof
      ctx.fillStyle = '#e6c800'
      ctx.fillRect(centerX - carW / 3, carY - carH - 12, carW * 0.66, 12)
      // Wheels
      ctx.fillStyle = '#222'
      ctx.beginPath()
      ctx.arc(centerX - carW / 3, carY, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(centerX + carW / 3, carY, 5, 0, Math.PI * 2)
      ctx.fill()

      // Speed display
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.beginPath()
      ctx.arc(50, 40, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,190,255,0.5)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('67', 50, 45)
      ctx.font = '8px monospace'
      ctx.fillStyle = '#888'
      ctx.fillText('km/h', 50, 58)

      // Speed limit sign
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.beginPath()
      ctx.arc(w - 50, 40, 22, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#ff3030'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(w - 50, 40, 22, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px monospace'
      ctx.fillText('60', w - 50, 45)

      // Turn indicator
      if (turnTimer > 0) {
        ctx.fillStyle = 'rgba(0,190,255,0.8)'
        if (turnDir > 0) {
          ctx.beginPath()
          ctx.moveTo(w - 30, h / 2)
          ctx.lineTo(w - 60, h / 2 - 15)
          ctx.lineTo(w - 60, h / 2 + 15)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(30, h / 2)
          ctx.lineTo(60, h / 2 - 15)
          ctx.lineTo(60, h / 2 + 15)
          ctx.closePath()
          ctx.fill()
        }
      }

      // Camera warning
      const flash = Math.sin(Date.now() * 0.01) > 0
      if (Date.now() % 5000 < 1500 && flash) {
        ctx.fillStyle = 'rgba(255,0,0,0.8)'
        ctx.fillRect(0, h - 25, w, 25)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('📷 CAMERA AHEAD — 200m', w / 2, h - 8)
      }

      // Animation
      roadOffset += 2
      carX = Math.sin(Date.now() * 0.001) * 20
      if (Date.now() % 4000 < 1500) {
        turnDir = 1
        turnTimer = 1
      } else if (Date.now() % 4000 > 2500) {
        turnDir = -1
        turnTimer = 1
      } else {
        turnTimer = 0
      }

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="automode" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,220,0,0.04)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-12">
          <span className="text-yellow-400 text-sm font-semibold tracking-wider uppercase">Новый режим</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              🚗 Режим AUTO
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Автомобильный режим с GPS-навигацией, спидометром, анимацией дороги, 
            детекцией поворотов и предупреждениями о камерах скорости
          </p>
        </div>

        {/* Live preview */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-white/10 bg-black max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-gray-400">ESP Oracle — AUTO Mode Preview</span>
          </div>
          <canvas ref={canvasRef} className="w-full aspect-square" />
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20">
            <div className="text-3xl mb-3">🏎️</div>
            <h3 className="text-lg font-bold text-white mb-2">Спидометр</h3>
            <p className="text-sm text-gray-400">
              GPS модуль NEO-6M получает скорость в реальном времени. 
              Точность ±1 км/ч при хорошем приёме спутников.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20">
            <div className="text-3xl mb-3">🛣️</div>
            <h3 className="text-lg font-bold text-white mb-2">Анимация дороги</h3>
            <p className="text-sm text-gray-400">
              Перспективная дорога с разметкой. Скорость анимации 
              зависит от текущей скорости автомобиля.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20">
            <div className="text-3xl mb-3">↩️</div>
            <h3 className="text-lg font-bold text-white mb-2">Повороты</h3>
            <p className="text-sm text-gray-400">
              MPU6050 детектит боковое ускорение при поворотах. 
              Стрелки показывают направление.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20">
            <div className="text-3xl mb-3">📷</div>
            <h3 className="text-lg font-bold text-white mb-2">Камеры скорости</h3>
            <p className="text-sm text-gray-400">
              Локальная база координат камер. Предупреждение за 300м 
              до камеры с указанием ограничения.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/20">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Превышение</h3>
            <p className="text-sm text-gray-400">
              Мигающее предупреждение при превышении скорости 
              более чем на 5 км/ч от лимита.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
            <div className="text-3xl mb-3">📡</div>
            <h3 className="text-lg font-bold text-white mb-2">GPS приём</h3>
            <p className="text-sm text-gray-400">
              NEO-6M модуль через SoftwareSerial. Парсинг NMEA $GPRMC. 
              Координаты, скорость, курс.
            </p>
          </div>
        </div>

        {/* Data sources */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 mb-12">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            📊 Источники данных о камерах
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">OpenStreetMap Overpass API</h4>
              <p className="text-xs text-gray-400 mb-2">
                Бесплатный API. Можно получить ограничения скорости и камеры для любой точки мира.
              </p>
              <code className="text-xs text-gray-500 font-mono break-all">
                overpass-api.de/api/interpreter
              </code>
            </div>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h4 className="text-sm font-bold text-purple-400 mb-2">Speed Camera Database</h4>
              <p className="text-xs text-gray-400 mb-2">
                CSV файл со всеми камерами мира. Можно загрузить в SPIFFS.
              </p>
              <code className="text-xs text-gray-500 font-mono break-all">
                scdb.info/api/scdb.csv
              </code>
            </div>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h4 className="text-sm font-bold text-green-400 mb-2">Локальная база (JSON)</h4>
              <p className="text-xs text-gray-400 mb-2">
                Загрузите свои координаты камер в JSON. Работает офлайн.
              </p>
              <code className="text-xs text-gray-500 font-mono">
                SPIFFS / SD карта
              </code>
            </div>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
              <h4 className="text-sm font-bold text-orange-400 mb-2">HTTP API (с Wi-Fi)</h4>
              <p className="text-xs text-gray-400 mb-2">
                Если в машине есть Wi-Fi хотспот — подтягивайте камеры онлайн.
              </p>
              <code className="text-xs text-gray-500 font-mono">
                your-server.com/api/cameras
              </code>
            </div>
          </div>
        </div>

        {/* GPS Pinout */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Подключение GPS модуля NEO-6M
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { pin: 'GPIO8', signal: 'RX', desc: 'GPS TX → ESP RX' },
              { pin: 'GPIO9', signal: 'TX', desc: 'GPS RX → ESP TX' },
              { pin: '3.3V', signal: 'VCC', desc: 'Питание (или 5V с LDO)' },
              { pin: 'GND', signal: 'GND', desc: 'Земля' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/20">
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono text-yellow-400 font-bold">{p.pin}</code>
                  <span className="text-gray-500">→</span>
                  <span className="text-sm text-white font-medium">{p.signal}</span>
                </div>
                <span className="text-xs text-gray-400">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

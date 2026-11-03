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
    let carTilt = 0
    let turnDir = 0
    let turnTimer = 0
    let speed = 0
    let accelerating = false
    let braking = false
    let bumpy = false
    let style = 30

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

      // Небо
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4)
      skyGrad.addColorStop(0, '#0a1628')
      skyGrad.addColorStop(1, '#1a2a4a')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h * 0.4)

      // Звёзды
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(i * 123.456) * 0.5 + 0.5) * w
        const sy = (Math.cos(i * 789.012) * 0.5 + 0.5) * h * 0.35
        ctx.fillRect(sx, sy, 1.5, 1.5)
      }

      const horizonY = h * 0.4
      const centerX = w / 2

      // Симуляция событий
      const t = Date.now() * 0.001
      const cycle = t % 12
      
      if (cycle < 2) {
        // Разгон
        accelerating = true
        braking = false
        speed = Math.min(120, speed + 2)
        bumpy = false
      } else if (cycle < 4) {
        // Ровная езда
        accelerating = false
        braking = false
        speed = 100 + Math.sin(t) * 5
        bumpy = false
      } else if (cycle < 5) {
        // Поворот влево
        turnDir = -1
        turnTimer = 1
        speed = 80
      } else if (cycle < 6) {
        turnDir = 0
        turnTimer = 0
      } else if (cycle < 7) {
        // Неровная дорога
        bumpy = true
        speed = 60
      } else if (cycle < 8.5) {
        bumpy = false
        // Торможение
        braking = true
        accelerating = false
        speed = Math.max(0, speed - 3)
      } else if (cycle < 10) {
        // Поворот вправо
        turnDir = 1
        turnTimer = 1
        speed = 40
      } else {
        turnDir = 0
        turnTimer = 0
        accelerating = true
        braking = false
        speed = Math.min(100, speed + 1.5)
      }

      // Сглаживание наклона
      carTilt = carTilt * 0.85 + turnDir * 0.15 * 15

      // Анимация дороги
      roadOffset += speed * 0.05
      if (roadOffset > 30) roadOffset = 0

      // Дорога
      for (let y = horizonY; y < h; y += 2) {
        const progress = (y - horizonY) / (h - horizonY)
        const roadW = 30 + progress * (w * 0.85)
        const rl = centerX - roadW / 2
        const rr = centerX + roadW / 2

        let shade = 30 + progress * 15
        if (bumpy && progress > 0.5) shade += (Math.random() - 0.5) * 10

        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 5})`
        ctx.fillRect(rl, y, rr - rl, 2)

        // Обочина
        ctx.fillStyle = 'rgba(80,80,40,0.6)'
        ctx.fillRect(rl, y, 2 + progress * 3, 2)
        ctx.fillRect(rr - 2 - progress * 3, y, 2 + progress * 3, 2)

        // Разметка
        const dashY = (y + roadOffset) % 30
        if (dashY < 15 && progress > 0.1) {
          const dw = 1 + progress * 4
          ctx.fillStyle = 'rgba(255,255,255,0.7)'
          ctx.fillRect(centerX - dw, y, dw * 2, 2)
        }
      }

      // Повороты — стрелки
      if (turnTimer > 0) {
        ctx.fillStyle = 'rgba(0,190,255,0.9)'
        if (turnDir < 0) {
          ctx.beginPath()
          ctx.moveTo(30, h / 2)
          ctx.lineTo(60, h / 2 - 20)
          ctx.lineTo(60, h / 2 + 20)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 12px monospace'
          ctx.textAlign = 'left'
          ctx.fillText('LEFT', 15, h / 2 + 35)
        } else {
          ctx.beginPath()
          ctx.moveTo(w - 30, h / 2)
          ctx.lineTo(w - 60, h / 2 - 20)
          ctx.lineTo(w - 60, h / 2 + 20)
          ctx.closePath()
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 12px monospace'
          ctx.textAlign = 'right'
          ctx.fillText('RIGHT', w - 15, h / 2 + 35)
        }
      }

      // Машинка (жёлтая, с наклоном)
      const carY = h - 55
      const carX = centerX + carTilt
      const carW = 30
      const carH = 18

      // Тень
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.beginPath()
      ctx.ellipse(carX, carY + 14, 18, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // Кузов
      ctx.fillStyle = '#ffdc00'
      ctx.fillRect(carX - carW / 2, carY - carH / 2, carW, carH)
      // Крыша
      ctx.fillStyle = '#e6c800'
      ctx.fillRect(carX - carW / 3, carY - carH / 2 - 12, carW * 0.66, 12)
      // Окно
      ctx.fillStyle = 'rgba(80,150,200,0.8)'
      ctx.fillRect(carX - carW / 3 + 2, carY - carH / 2 - 10, carW * 0.66 - 4, 6)
      // Колёса
      ctx.fillStyle = '#111'
      ctx.beginPath()
      ctx.arc(carX - carW / 3, carY + carH / 2, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(carX + carW / 3, carY + carH / 2, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#444'
      ctx.beginPath()
      ctx.arc(carX - carW / 3, carY + carH / 2, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(carX + carW / 3, carY + carH / 2, 2, 0, Math.PI * 2)
      ctx.fill()

      // Стоп-сигналы при торможении
      if (braking) {
        ctx.fillStyle = '#ff2020'
        ctx.fillRect(carX - carW / 2, carY + 2, 3, 3)
        ctx.fillRect(carX + carW / 2 - 3, carY + 2, 3, 3)
      }

      // Спидометр (относительный)
      ctx.fillStyle = 'rgba(15,15,15,0.9)'
      ctx.beginPath()
      ctx.arc(50, 40, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(100,100,100,0.5)'
      ctx.lineWidth = 2
      ctx.stroke()

      // Деления
      for (let i = 0; i < 10; i++) {
        const angle = Math.PI + i * Math.PI / 10
        ctx.strokeStyle = 'rgba(100,100,100,0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(50 + Math.cos(angle) * 24, 40 + Math.sin(angle) * 24)
        ctx.lineTo(50 + Math.cos(angle) * 28, 40 + Math.sin(angle) * 28)
        ctx.stroke()
      }

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(speed).toString(), 50, 45)
      ctx.font = '8px monospace'
      ctx.fillStyle = '#888'
      ctx.fillText('rel km/h', 50, 58)

      // Индикаторы событий
      if (accelerating) {
        ctx.fillStyle = '#3cdc78'
        ctx.font = 'bold 14px monospace'
        ctx.textAlign = 'left'
        ctx.fillText('>>>', 10, 90)
      }
      if (braking) {
        ctx.fillStyle = '#ff2020'
        ctx.font = 'bold 14px monospace'
        ctx.textAlign = 'right'
        ctx.fillText('!!!', w - 10, 90)
      }
      if (bumpy) {
        ctx.fillStyle = '#ff8040'
        ctx.font = 'bold 10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('BUMPY', w / 2, 90)
      }

      // Статистика
      ctx.fillStyle = '#666'
      ctx.font = '10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('T:3 B:2 A:5 S:1', 10, h - 25)
      ctx.textAlign = 'right'
      ctx.fillText('02:34', w - 10, h - 25)

      // Стиль вождения (полоска)
      const barY = h - 12
      const barW = w - 20
      ctx.fillStyle = 'rgba(30,30,30,0.8)'
      ctx.fillRect(10, barY, barW, 6)
      
      // Градиент полоски
      const grad = ctx.createLinearGradient(10, 0, 10 + barW, 0)
      grad.addColorStop(0, '#3cdc78')
      grad.addColorStop(0.5, '#00beff')
      grad.addColorStop(0.8, '#ff8040')
      grad.addColorStop(1, '#ff2020')
      ctx.fillStyle = grad
      ctx.fillRect(10, barY, (barW * style) / 100, 6)

      ctx.fillStyle = '#888'
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('STYLE:', 10, barY - 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = style < 50 ? '#3cdc78' : '#ff8040'
      ctx.fillText(style < 50 ? 'NORMAL' : 'ACTIVE', w - 10, barY - 2)

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
          <span className="text-yellow-400 text-sm font-semibold tracking-wider uppercase">Только MPU6050</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              🚗 Режим AUTO
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Анализатор вождения на основе акселерометра. Без GPS — только MPU6050. 
            Определяет разгон, торможение, повороты, неровности дороги и стиль вождения.
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
            <span className="text-xs text-gray-400">ESP Oracle — AUTO Mode (IMU only)</span>
          </div>
          <canvas ref={canvasRef} className="w-full aspect-square" />
        </div>

        {/* Что можно / нельзя */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Что определяем по MPU6050
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Разгон</b> — положительное продольное ускорение</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Торможение</b> — отрицательное продольное ускорение</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Повороты</b> — боковое ускорение (центростремительное)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Неровности дороги</b> — высокочастотная вибрация по Z</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Уклон</b> — проекция гравитации на ось Z</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Резкие манёвры</b> — пики суммарного ускорения</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Стиль вождения</b> — по статистике событий</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span><b>Относительная скорость</b> — интеграл ускорения</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Что НЕ можем (нужен GPS)
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span><b>Абсолютная скорость</b> — нужен GPS или OBD-II</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span><b>Координаты</b> — нужен GPS модуль</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span><b>Камеры скорости</b> — нужна база координат</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span><b>Ограничения скорости</b> — привязаны к дорогам</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span><b>Точное расстояние</b> — интеграл дрейфует</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span><b>Направление движения</b> — нужен компас/GPS</span>
              </li>
            </ul>
            
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-300">
                💡 <b>Решение:</b> если добавить GPS NEO-6M (~200₽), 
                можно получить абсолютную скорость, координаты и предупреждения о камерах.
              </p>
            </div>
          </div>
        </div>

        {/* Как работает */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 mb-12">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            Как это работает на акселерометре
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <span className="text-2xl">📐</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Оси координат</h4>
              <p className="text-xs text-gray-400">
                X — продольное ускорение (разгон/торможение)<br/>
                Y — боковое (повороты)<br/>
                Z — вертикальное (вибрация, уклон)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <span className="text-2xl">∫</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Интегрирование</h4>
              <p className="text-xs text-gray-400">
                Скорость = ∫ ускорение × dt<br/>
                С коррекцией дрейфа (затухание 0.995)<br/>
                Относительная, не абсолютная
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2">Пороги событий</h4>
              <p className="text-xs text-gray-400">
                Разгон: &gt;0.18g<br/>
                Торможение: &lt;-0.24g<br/>
                Поворот: &gt;0.3g боковое<br/>
                Неровности: &gt;2000 LSB по Z
              </p>
            </div>
          </div>
        </div>

        {/* Фичи */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-500/5 to-transparent border border-yellow-500/20">
            <div className="text-2xl mb-2">🏎️</div>
            <h3 className="text-sm font-bold text-white mb-1">Жёлтая машинка</h3>
            <p className="text-xs text-gray-400">
              Наклоняется при поворотах, стоп-сигналы при торможении
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20">
            <div className="text-2xl mb-2">🛣️</div>
            <h3 className="text-sm font-bold text-white mb-1">Анимация дороги</h3>
            <p className="text-xs text-gray-400">
              Скорость разметки зависит от относительной скорости
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent border border-red-500/20">
            <div className="text-2xl mb-2">⚠️</div>
            <h3 className="text-sm font-bold text-white mb-1">События</h3>
            <p className="text-xs text-gray-400">
              &gt;&gt;&gt; разгон, !!! торможение, BUMPY неровности
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/20">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-sm font-bold text-white mb-1">Стиль вождения</h3>
            <p className="text-xs text-gray-400">
              CALM / NORMAL / ACTIVE / AGGRESSIVE
            </p>
          </div>
        </div>

        {/* Статистика на экране */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-lg font-bold text-white text-center mb-4">
            Что показывает экран в AUTO режиме
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Спидометр', value: 'Относительный', icon: '⏱️' },
              { label: 'Повороты', value: 'T: счётчик', icon: '↩️' },
              { label: 'Торможения', value: 'B: счётчик', icon: '🛑' },
              { label: 'Разгоны', value: 'A: счётчик', icon: '🚀' },
              { label: 'Резкие манёвры', value: 'S: счётчик', icon: '⚡' },
              { label: 'Время', value: 'MM:SS', icon: '⏰' },
              { label: 'Стиль', value: 'Полоска 0-100', icon: '🎯' },
              { label: 'Статус', value: 'STATIONARY', icon: '🅿️' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-black/20 border border-white/5 text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-bold text-white">{item.label}</div>
                <div className="text-xs text-gray-400 mt-1">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

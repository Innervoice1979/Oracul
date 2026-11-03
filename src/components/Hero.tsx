import { useEffect, useRef } from 'react'

interface HeroProps {
  scrollY: number
}

export default function Hero({ scrollY }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let angle = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ]

    const edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7]
    ]

    const animate = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      
      ctx.clearRect(0, 0, w, h)
      
      // Scan line effect
      const scanY = (Date.now() * 0.05) % h
      ctx.strokeStyle = 'rgba(0, 190, 255, 0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(w, scanY)
      ctx.stroke()

      // Grid effect
      ctx.strokeStyle = 'rgba(0, 190, 255, 0.03)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, h)
        ctx.stroke()
      }
      for (let i = 0; i < h; i += 30) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(w, i)
        ctx.stroke()
      }

      // Draw 3D cube
      const cx = w / 2
      const cy = h / 2
      const size = Math.min(w, h) * 0.18

      const ca = Math.cos(angle)
      const sa = Math.sin(angle)
      const cb = Math.cos(angle * 0.7)
      const sb = Math.sin(angle * 0.7)

      const projected: [number, number, number][] = vertices.map(([x, y, z]) => {
        const x1 = x * ca - z * sa
        const z1 = x * sa + z * ca
        const y1 = y * cb - z1 * sb
        const z2 = y * sb + z1 * cb

        const fov = 3.0
        const scale = size * fov / (fov + z2)

        return [cx + x1 * scale, cy + y1 * scale, z2]
      })

      edges.forEach(([a, b]) => {
        const avgZ = (projected[a][2] + projected[b][2]) * 0.5
        const alpha = 0.4 + (avgZ + 1.5) * 0.2
        const r = Math.round(0)
        const g = Math.round(150 + avgZ * 40)
        const bl = Math.round(200 + avgZ * 30)

        ctx.strokeStyle = `rgba(${r}, ${Math.min(255, g)}, ${Math.min(255, bl)}, ${Math.min(1, alpha)})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(projected[a][0], projected[a][1])
        ctx.lineTo(projected[b][0], projected[b][1])
        ctx.stroke()
      })

      // Glow effect
      ctx.shadowColor = 'rgba(0, 190, 255, 0.5)'
      ctx.shadowBlur = 20
      edges.forEach(([a, b]) => {
        const avgZ = (projected[a][2] + projected[b][2]) * 0.5
        const alpha = 0.15 + (avgZ + 1.5) * 0.05
        ctx.strokeStyle = `rgba(0, 190, 255, ${Math.min(0.3, alpha)})`
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(projected[a][0], projected[a][1])
        ctx.lineTo(projected[b][0], projected[b][1])
        ctx.stroke()
      })
      ctx.shadowBlur = 0

      // Corner decorations
      const cornerSize = 20
      ctx.strokeStyle = 'rgba(0, 190, 255, 0.3)'
      ctx.lineWidth = 1

      // Top-left
      ctx.beginPath()
      ctx.moveTo(10, 10 + cornerSize)
      ctx.lineTo(10, 10)
      ctx.lineTo(10 + cornerSize, 10)
      ctx.stroke()

      // Top-right
      ctx.beginPath()
      ctx.moveTo(w - 10 - cornerSize, 10)
      ctx.lineTo(w - 10, 10)
      ctx.lineTo(w - 10, 10 + cornerSize)
      ctx.stroke()

      // Bottom-left
      ctx.beginPath()
      ctx.moveTo(10, h - 10 - cornerSize)
      ctx.lineTo(10, h - 10)
      ctx.lineTo(10 + cornerSize, h - 10)
      ctx.stroke()

      // Bottom-right
      ctx.beginPath()
      ctx.moveTo(w - 10 - cornerSize, h - 10)
      ctx.lineTo(w - 10, h - 10)
      ctx.lineTo(w - 10, h - 10 - cornerSize)
      ctx.stroke()

      angle += 0.012
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0e17]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,190,255,0.08)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-sm text-cyan-400 font-medium">ESP32-C3 SuperMini</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black mb-6">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            InnerVoice
          </span>
        </h1>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mb-4">
          ESP Oracle
        </h2>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Портативный умный оракул с TFT-дисплеем, акселерометром, 
          мини-играми и интеграцией с Wi-Fi. Магический шар нового поколения.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-300">ST7789 TFT 240×240</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm text-gray-300">MPU6050 IMU</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
            <span className="text-sm text-gray-300">Wi-Fi / mDNS</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-300">Мини-игры</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#hardware"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
          >
            Подробнее
          </a>
          <a
            href="#code"
            className="px-8 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Исходный код
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

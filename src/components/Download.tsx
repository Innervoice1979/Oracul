import { useState } from 'react'

export default function Download() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const files = [
    {
      id: 'ino',
      name: 'ESPOracle.ino',
      size: '45 KB',
      description: 'Основной файл прошивки с режимом AUTO',
      icon: '📄',
      color: 'cyan',
    },
    {
      id: 'auto',
      name: 'AutoMode.ino',
      size: '12 KB',
      description: 'Отдельный модуль AUTO режима (справочно)',
      icon: '🚗',
      color: 'yellow',
    },
    {
      id: 'camera',
      name: 'CAMERA_API.md',
      size: '3 KB',
      description: 'Источники данных о камерах скорости',
      icon: '📷',
      color: 'red',
    },
    {
      id: 'readme',
      name: 'README.md',
      size: '2 KB',
      description: 'Инструкция по сборке и настройке',
      icon: '📋',
      color: 'purple',
    },
  ]

  const handleDownload = (fileId: string) => {
    setDownloading(fileId)
    
    const fileMap: Record<string, { url: string; name: string }> = {
      'ino': { url: '/firmware/ESPOracle.ino', name: 'ESPOracle.ino' },
      'auto': { url: '/firmware/AutoMode.ino', name: 'AutoMode.ino' },
      'camera': { url: '/firmware/CAMERA_API.md', name: 'CAMERA_API.md' },
      'readme': { url: '/firmware/README.md', name: 'README.md' },
    }

    const file = fileMap[fileId]
    if (!file) return

    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setTimeout(() => setDownloading(null), 1000)
  }

  const handleDownloadAll = () => {
    setDownloading('all')
    // Скачиваем каждый файл с задержкой
    files.forEach((file, i) => {
      setTimeout(() => {
        const fileMap: Record<string, string> = {
          'ino': '/firmware/ESPOracle.ino',
          'auto': '/firmware/AutoMode.ino',
          'camera': '/firmware/CAMERA_API.md',
          'readme': '/firmware/README.md',
        }
        const a = document.createElement('a')
        a.href = fileMap[file.id] || '/firmware/README.md'
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, i * 500)
    })
    setTimeout(() => setDownloading(null), files.length * 500 + 500)
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      hover: 'hover:border-cyan-500/40 hover:bg-cyan-500/15',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      hover: 'hover:border-purple-500/40 hover:bg-purple-500/15',
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      text: 'text-yellow-400',
      hover: 'hover:border-yellow-500/40 hover:bg-yellow-500/15',
    },
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      hover: 'hover:border-red-500/40 hover:bg-red-500/15',
    },
  }

  return (
    <section id="download" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,190,255,0.06)_0%,transparent_50%)]" />
      
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-12">
          <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">Файлы</span>
          <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Скачать прошивку
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Готовые файлы для Arduino IDE. Скачайте, откройте в IDE, 
            проверьте пины и прошейте плату.
          </p>
        </div>

        {/* File list */}
        <div className="space-y-4 mb-8">
          {files.map((file) => {
            const colors = colorClasses[file.color]
            const isDownloading = downloading === file.id

            return (
              <div
                key={file.id}
                className={`flex items-center justify-between p-5 rounded-2xl ${colors.bg} border ${colors.border} ${colors.hover} transition-all duration-300`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{file.icon}</span>
                  <div>
                    <h4 className="text-lg font-bold text-white">{file.name}</h4>
                    <p className="text-sm text-gray-400">{file.description}</p>
                    <span className="text-xs text-gray-500 mt-1">{file.size}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(file.id)}
                  disabled={isDownloading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isDownloading
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : `${colors.text} bg-white/5 border border-white/10 hover:bg-white/10`
                  }`}
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Скачивание...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Скачать
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Download all button */}
        <div className="text-center">
          <button
            onClick={handleDownloadAll}
            disabled={downloading === 'all'}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-70"
          >
            {downloading === 'all' ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Скачивание...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Скачать все файлы
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Как прошить</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-black/20">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-sm text-gray-300">Скачайте <code className="text-cyan-400">ESPOracle.ino</code></p>
            </div>
            <div className="text-center p-4 rounded-xl bg-black/20">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-sm text-gray-300">Откройте в Arduino IDE, установите библиотеки</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-black/20">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-sm text-gray-300">Выберите плату ESP32C3 Dev Module и загрузите</p>
            </div>
          </div>
        </div>

        {/* Structure */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Структура проекта</h3>
          <div className="font-mono text-sm text-gray-400 space-y-1 max-w-md mx-auto">
            <div className="text-cyan-400">ESPOracle/</div>
            <div className="pl-4">├── <span className="text-white">ESPOracle.ino</span> <span className="text-gray-600">← основной файл</span></div>
            <div className="pl-4">├── <span className="text-white">README.md</span> <span className="text-gray-600">← инструкция</span></div>
            <div className="pl-4">└── <span className="text-gray-500">(библиотеки устанавливаются отдельно)</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import Hardware from './components/Hardware'
import Pinout from './components/Pinout'
import Modes from './components/Modes'
import Architecture from './components/Architecture'
import CodeSection from './components/CodeSection'
import AutoMode from './components/AutoMode'
import VibrMotor from './components/VibrMotor'
import Setup from './components/Setup'
import Download from './components/Download'
import Footer from './components/Footer'
import Navbar from './components/Navbar'

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      const sections = ['hero', 'hardware', 'pinout', 'modes', 'architecture', 'code', 'setup', 'download']
      for (const section of [...sections].reverse()) {
        const el = document.getElementById(section)
        if (el && el.offsetTop - 200 <= window.scrollY) {
          setActiveSection(section)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white font-sans overflow-x-hidden">
      <Navbar activeSection={activeSection} />
      <Hero scrollY={scrollY} />
      <Hardware />
      <Pinout />
      <Modes />
      <Architecture />
      <CodeSection />
      <AutoMode />
      <VibrMotor />
      <Setup />
      <Download />
      <Footer />
    </div>
  )
}

export default App

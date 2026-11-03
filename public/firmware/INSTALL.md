# Установка окружения для InnerVoice ESP Oracle

## Вариант 1: PlatformIO (рекомендуется)

### 1. Установка VS Code

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install code
```

**MacOS:**
```bash
brew install --cask visual-studio-code
```

**Windows:**
Скачай с https://code.visualstudio.com/

### 2. Установка PlatformIO

**Linux/Mac:**
```bash
curl -fsSL -o get-platformio.py https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py
python3 get-platformio.py
```

**Или через pip:**
```bash
pip install platformio
```

**Windows:**
Скачай установщик: https://platformio.org/install/ide?install=vscode

### 3. Установка PlatformIO в VS Code

Открой VS Code и выполни в терминале (Ctrl+`):
```bash
code --install-extension platformio.platformio-ide
```

Или через GUI:
1. Открой VS Code
2. Нажми Ctrl+Shift+X (Extensions)
3. Найди "PlatformIO IDE"
4. Нажми Install

### 4. Установка драйверов USB

**Для ESP32-C3 SuperMini (обычно CH340 или CP2102):**

**Linux:**
```bash
# CH340
sudo apt install ch340-dkms

# CP210x (обычно уже в ядре)
sudo apt install linux-modules-extra-$(uname -r)
```

**MacOS:**
```bash
# CH340
brew install --cask wch-ch34x-usb-serial-driver

# CP210x
brew install --cask silicon-labs-vcp-driver
```

**Windows:**
Скачай драйверы:
- CH340: http://www.wch-ic.com/downloads/CH341SER_EXE.html
- CP210x: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

### 5. Создание проекта

```bash
# Создай директорию проекта
mkdir ESPOracle
cd ESPOracle

# Создай структуру
mkdir -p src lib include

# Скопируй прошивку
cp /path/to/ESPOracle.ino src/

# Создай platformio.ini
cat > platformio.ini << 'EOF'
[env:esp32-c3]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino

# Библиотеки
lib_deps = 
    adafruit/Adafruit GFX Library@^1.11.9
    adafruit/Adafruit ST7789 Library@^1.10.3
    olikraus/U8g2_for_Adafruit_GFX@^1.8.0

# Настройки serial port
monitor_speed = 115200
upload_speed = 921600

# Оптимизация
build_flags = 
    -D CORE_DEBUG_LEVEL=0
    -D ARDUINO_USB_MODE=1
    -D ARDUINO_USB_CDC_ON_BOOT=1

board_build.partitions = default.csv
EOF
```

### 6. Установка библиотек и компиляция

```bash
# Установи зависимости
pio run -t clean
pio pkg install

# Компиляция
pio run

# Загрузка на плату (подключи USB и найди порт)
pio device list  # посмотреть доступные порты
pio run -t upload --upload-port /dev/ttyUSB0  # Linux
# pio run -t upload --upload-port /dev/cu.usbserial-1420  # MacOS
# pio run -t upload --upload-port COM3  # Windows
```

### 7. Мониторинг serial port

```bash
pio device monitor --port /dev/ttyUSB0 --baud 115200
```

---

## Вариант 2: Arduino CLI (альтернатива)

### 1. Установка Arduino CLI

**Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```

**MacOS:**
```bash
brew install arduino-cli
```

**Windows:**
```powershell
winget install Arduino.CLI
```

### 2. Настройка Arduino CLI

```bash
# Инициализация
arduino-cli config init

# Добавление URL для ESP32
arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# Обновление индекса
arduino-cli core update-index

# Установка ядра ESP32
arduino-cli core install esp32:esp32
```

### 3. Установка библиотек

```bash
# Adafruit GFX
arduino-cli lib install "Adafruit GFX Library"

# Adafruit ST7789
arduino-cli lib install "Adafruit ST7789 Library"

# U8g2 for Adafruit GFX
arduino-cli lib install "U8g2_for_Adafruit_GFX"
```

### 4. Компиляция и загрузка

```bash
# Найди FQBN (Fully Qualified Board Name)
arduino-cli board listall | grep esp32c3

# Компиляция
arduino-cli compile --fqbn esp32:esp32:esp32c3 ESPOracle.ino

# Загрузка (укажи свой порт)
arduino-cli upload -p /dev/ttyUSB0 --fqbn esp32:esp32:esp32c3 ESPOracle.ino

# Мониторинг
arduino-cli monitor -p /dev/ttyUSB0 --config baudrate=115200
```

---

## Быстрая установка (одной командой)

### Linux/Mac:

```bash
# PlatformIO
curl -fsSL https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py | python3

# Или Arduino CLI
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
```

### Windows (PowerShell):

```powershell
# PlatformIO
iwr -useb get-platformio.py | python

# Arduino CLI
winget install Arduino.CLI
```

---

## Проверка установки

### PlatformIO:
```bash
pio --version
pio platform list
pio board list | grep esp32
```

### Arduino CLI:
```bash
arduino-cli version
arduino-cli core list
arduino-cli lib list
```

---

## Решение проблем

### Не видит USB устройство:

**Linux:**
```bash
# Проверь dmesg
sudo dmesg | tail

# Добавь пользователя в dialout
sudo usermod -a -G dialout $USER
sudo usermod -a -G plugdev $USER
# Перелогинься!

# Проверь права
ls -l /dev/ttyUSB*
sudo chmod 666 /dev/ttyUSB0
```

**MacOS:**
```bash
# Проверь системные настройки
ls /dev/cu.*

# Если не видит - переустанови драйвер
```

### Ошибка компиляции "No such file or directory":

```bash
# PlatformIO
pio pkg install

# Arduino CLI
arduino-cli lib install "Adafruit GFX Library"
arduino-cli lib install "Adafruit ST7789 Library"
arduino-cli lib install "U8g2_for_Adafruit_GFX"
```

### Ошибка загрузки "Failed to connect to ESP32":

1. Зажми кнопку BOOT на плате
2. Нажми EN (reset)
3. Отпусти BOOT
4. Попробуй загрузить снова

---

## Полезные команды

### PlatformIO:

```bash
# Очистка
pio run -t clean

# Полная пересборка
pio run -t clean && pio run

# Мониторинг с фильтрацией
pio device monitor --filter esp32_exception_decoder

# Обновление библиотек
pio pkg update

# Экспорт бинарника
pio run -t buildfs
```

### Arduino CLI:

```bash
# Список плат
arduino-cli board list

# Список библиотек
arduino-cli lib list

# Удаление библиотеки
arduino-cli lib uninstall "Library Name"

# Поиск библиотеки
arduino-cli lib search "ST7789"
```

---

## Структура проекта после установки

```
ESPOracle/
├── platformio.ini          # Конфигурация PlatformIO
├── src/
│   └── ESPOracle.ino      # Основной код
├── lib/                    # Локальные библиотеки (если есть)
├── include/                # Заголовочные файлы
└── .pio/                   # Build artifacts (не коммитить)
```

---

## Git (опционально)

```bash
# Инициализация
git init

# .gitignore
cat > .gitignore << 'EOF'
.pio/
.vscode/
*.pyc
.DS_Store
EOF

# Первый коммит
git add .
git commit -m "Initial commit: InnerVoice ESP Oracle"

# Создание репозитория на GitHub
gh repo create ESPOracle --public --source=. --push
```

---

## Быстрый старт (TL;DR)

```bash
# 1. Установи PlatformIO
curl -fsSL https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py | python3

# 2. Открой VS Code и установи расширение PlatformIO

# 3. Создай проект
mkdir ESPOracle && cd ESPOracle
mkdir -p src lib include

# 4. Скопируй ESPOracle.ino в src/

# 5. Создай platformio.ini (см. выше)

# 6. Компилируй и загружай
pio run
pio run -t upload --upload-port /dev/ttyUSB0
pio device monitor --port /dev/ttyUSB0 --baud 115200
```

Готово! 🚀

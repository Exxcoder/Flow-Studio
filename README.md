<div align="center">

<img src="./app-icon.png" alt="Project Flow Studio Logo" width="128" height="128" />

# Project Flow Studio

**Интуитивный десктопный инструмент для декомпозиции архитектуры, проектирования пайплайнов и генерации структурированных LLM-промптов.**

[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Скачать релиз](#-установка-и-скачивание) • [Возможности](#-основные-возможности) • [Горячие клавиши](#-управление-и-горячие-клавиши) • [Сборка](#-локальная-разработка-и-сборка)

</div>

---

## 💡 О проекте

**Project Flow Studio** решает проблему фрагментированного планирования задач и архитектурных систем. Вместо громоздких диаграмм или линейных списков задач вы получаете гибкий бесконечный холст, где визуальная схема проекта преобразуется в готовые промпты для LLM (ChatGPT, Claude, DeepSeek, Gemini).

Приложение скомпилировано с помощью **Tauri v2**, что обеспечивает минимальное потребление RAM, мгновенный старт и независимость от тяжелого рантайма Electron.

---

## ✨ Основные возможности

- 🚀 **Бесконечный холст**: плавное панорамирование и масштабирование без потери производительности.
- 🧩 **Смарт-блоки этапов**: создание карточек задач, компонентов, этапов разработки и зависимостей.
- 🧲 **Bezier-связи**: умные магнитные порты для объединения сущностей в направленный граф.
- ✏️ **Свободное рисование и фигуры**: скетчинг от руки, аннотации и подсветка областей прямо на полотне.
- 🤖 **Экспорт в LLM-контекст**: мгновенная компиляция графа связей в структурированный Markdown/JSON-промпт для ИИ-ассистентов.
- 💾 **Автономный формат `.pflow`**: локальное хранение данных без привязки к облаку.
- 🖼 **Экспорт в изображения**: сохранение всей схемы или выбранных фрагментов в PNG с высоким разрешением.
- 🪟 **Нативный кастомный интерфейс**: бескаркасное окно (frameless window) с интеграцией системных диалогов Windows.

---

## 📥 Установка и скачивание

Готовые сборки под Windows доступны на вкладке **[Releases](https://github.com/Exxcoder/Flow-Studio/releases)**:

| Тип | Файл | Описание |
|---|---|---|
| **Installer (Рекомендуется)** | `flow-studio_x64-setup.exe` | Автоматическая установка через NSIS с ярлыками и деинсталлятором |
| **Portable** | `flow-studio.exe` | Автономный запуск без установки |
| **Корпоративный пакет** | `*.msi` | Пакет для системного развертывания |

> **Примечание:** Для работы требуется установленный в Windows компонент **Microsoft Edge WebView2** (по умолчанию присутствует в Windows 10/11).

---

## ⌨️ Управление и горячие клавиши

| Действие | Горячая клавиша / Мышь |
|---|---|
| **Панорама холста** | Зажать `Колесо мыши` или `Пробел + ЛКМ` |
| **Масштабирование (Zoom)** | `Ctrl + Колесо мыши` (от 20% до 300%) |
| **Создание связи** | Потянуть за точку-порт на границе карточки |
| **Удаление элемента** | Выбрать блок / связь / фигуру и нажать `Delete` |
| **Сохранить проект** | `Ctrl + S` (сохранение в `.pflow`) |
| **Открыть проект** | `Ctrl + O` |

---

## 🛠 Технологический стек

- **Ядро десктопа**: [Tauri v2](https://tauri.app/) (Rust)
- **Фронтенд-фреймворк**: [React 19](https://react.dev/)
- **Сборщик**: [Vite](https://vitejs.dev/)
- **Стилизация**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Стейт-менеджмент**: [Zustand](https://github.com/pmndrs/zustand)
- **Иконки**: [Lucide React](https://lucide.dev/)
- **Экспорт графики**: [html-to-image](https://github.com/bubkoo/html-to-image)

---

## 📁 Структура проекта

```text
Flow-Studio/
├── src/                          # React UI & Canvas Logic
│   ├── components/               # TitleBar, Board, Node, Connections, Export
│   ├── lib/                      # Геометрия связей, построение графа, prompt builder
│   ├── store/                    # Zustand-хранилище состояния холста
│   ├── App.tsx                   # Корневой компонент
│   └── main.tsx                  # Точка входа Vite
├── src-tauri/                    # Rust-часть приложения Tauri
│   ├── capabilities/             # Безопасность и доступы к API ОС
│   ├── icons/                    # Набор иконок приложения (.ico, .png)
│   ├── src/                      # Системные хэндлеры и вызовы WinAPI
│   └── tauri.conf.json           # Конфигурация окна и сборщика
├── app-icon.png                  # Исходник логотипа (1024×1024)
├── package.json
└── vite.config.ts
```

---

## 🚀 Локальная разработка и сборка

### Предварительные требования

1. **Node.js** v20+
2. **Rust** (`rustup`)
3. **C++ Build Tools** (Visual Studio Build Tools с компонентом *Desktop development with C++*)

### Запуск в режиме разработки

```powershell
# 1. Клонирование репозитория
git clone git@github.com:Exxcoder/Flow-Studio.git
cd Flow-Studio

# 2. Установка зависимостей
npm install

# 3. Запуск десктопного приложения с Hot-Reload
npm run tauri dev
```

> Для быстрой отладки UI только в браузере (без бэкенда Tauri) запустите `npm run dev`.

### Релизная сборка бинарников

Сборка оптимизированного `.exe` и установщиков:

```powershell
npm run tauri:build
```

Результаты сборки будут доступны в каталоге:
```text
src-tauri/target/release/
├── flow-studio.exe                       # Standalone исполняемый файл
└── bundle/
    ├── nsis/flow-studio_x64-setup.exe    # NSIS-инсталлятор
    └── msi/flow-studio_x64.msi           # MSI-инсталлятор
```

---

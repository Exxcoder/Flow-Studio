# Project Flow Studio

Десктопный дашборд для декомпозиции проектов: бесконечный холст, смарт-блоки этапов, Bezier-связи, свободное рисование и выгрузка графа в LLM-промпт. Стек: **Tauri v2 + React + TypeScript + Vite + Tailwind CSS**.

## Дерево проекта

```
Flow-Studio/
├── src/                          # React UI
│   ├── App.tsx
│   ├── index.css
│   ├── types.ts
│   ├── components/               # TitleBar, Board, Node, Connections, Export
│   ├── lib/                      # geometry, graph, prompt, io
│   └── store/projectStore.ts
├── src-tauri/                    # Rust / окно / сборка .exe
│   ├── capabilities/default.json
│   ├── icons/                    # icon.ico, png (после `tauri icon`)
│   ├── src/{lib,main}.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── scripts/generate-icon.ps1
├── app-icon.png                  # исходник иконки 1024×1024
├── package.json
└── vite.config.ts
```

## Требования

- Node.js 20+
- Rust (rustup) + Visual Studio Build Tools (MSVC, Windows 10 SDK)
- WebView2 Runtime (обычно уже есть в Windows 10/11)

## Разработка

```powershell
cd G:\AIProject\Flow-Studio
npm install
npm run tauri dev
```

Только фронтенд (без окна Tauri): `npm run dev`.

## Иконка приложения

1. Положите квадратный PNG **1024×1024** как `app-icon.png` в корень репозитория  
   либо сгенерируйте демо-иконку:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\generate-icon.ps1
   ```

2. Нарежьте полный набор (`icon.ico`, `.icns`, `32x32.png`, `128x128.png`, `128x128@2x.png`) встроенной утилитой Tauri:

   ```powershell
   npx tauri icon .\app-icon.png
   ```

   Файлы появятся в `src-tauri/icons/`. Пути уже прописаны в `tauri.conf.json` → `bundle.icon`.

3. Свой `icon.ico` можно скопировать напрямую в `src-tauri/icons/icon.ico` — инсталлятор и exe подхватят его при следующей сборке.

## Конфигурация окна и бандла (`src-tauri/tauri.conf.json`)

- `app.windows[0].decorations: false` — бескаркасное окно, кастомный TitleBar.
- `bundle.targets: ["nsis", "msi"]` — инсталляторы Windows.
- `bundle.icon` — набор иконок после `npx tauri icon`.
- Capabilities (`src-tauri/capabilities/default.json`): управление окном, диалоги, чтение/запись выбранных файлов `.pflow` / `.png`.

## Релизная сборка .exe

Из корня проекта:

```powershell
npm run tauri build
```

Эквивалент: `npx tauri build` / `cargo tauri build`.

Артефакты:

| Файл | Назначение |
|------|------------|
| `src-tauri\target\release\flow-studio.exe` | standalone exe (ресурсы фронтенда вшиты в бинарь) |
| `src-tauri\target\release\bundle\nsis\*.exe` | NSIS-инсталлятор (single-file setup) |
| `src-tauri\target\release\bundle\msi\*.msi` | MSI |

Портативный запуск: копируйте `flow-studio.exe`. WebView2 должен быть установлен в системе.

Только NSIS:

```powershell
npx tauri build --bundles nsis
```

## Управление холстом

- Панорама: средняя кнопка мыши или Space + ЛКМ
- Масштаб: Ctrl + колесо (20%–300%)
- Связи: потянуть магнитный порт карточки на порт другой карточки
- Delete — удалить выбранный этап / связь / фигуру
- Ctrl+S / Ctrl+O — сохранить / открыть `.pflow`

## Формат `.pflow`

JSON (`version: 1`) с полями `name`, `camera`, `nodes`, `connections`, `strokes`, `shapes` — координаты мира, порты связей и полилинии кисти.

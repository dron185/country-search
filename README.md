# Country Search

Живой поиск стран через [countries.dev](https://countries.dev/) с реальной отменой устаревших запросов (AbortController) и TDD.

## Скрипты
- `npm test` — Vitest
- `npm run lint`
- `npm run format`
- `npm run build` — tsc → dist/ + копирование статики

## Деплой
GitHub Pages собирается из `dist/` (см. `.github/workflows/deploy.yml`).
# 🛡️ JMS WebShield Store

> Plataforma de comercio electrónico para productos de seguridad web JMS WebShield

[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php)](https://php.net)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Tested with Pest](https://img.shields.io/badge/Tested%20with-Pest-4285F4?logo=pest)

## 🚀 Requisitos

- **PHP** 8.3+
- **Node.js** 22+
- **Composer**
- **npm** o **pnpm**

## ⚙️ Instalación

```bash
git clone <repo-url> jmswebshield-store
cd jmswebshield-store
composer setup
npm run build
```

## 🧪 Desarrollo

```bash
composer dev    # Servidor PHP + queue listener + logs + Vite (todo a la vez)
```

```bash
npm run dev     # Solo Vite con hot reload
```

## 🧰 Stack

| Capa      | Tecnología           |
|-----------|----------------------|
| Backend   | Laravel 13 + Fortify |
| Frontend  | React 19 + Inertia.js |
| Estilos   | Tailwind CSS v4      |
| Tipado    | TypeScript (strict)  |
| Testing   | Pest                 |

## ✅ Testing

```bash
./vendor/bin/pest                           # Todos los tests
./vendor/bin/pest --filter="TestName"      # Un solo test
./vendor/bin/pest --testsuite=Feature       # Solo tests Feature
./vendor/bin/pest --testsuite=Unit          # Solo tests Unit
```

## 📁 Estructura

```
app/              → Backend (Controllers, Models, Actions)
routes/           → web.php, settings.php
resources/js/     → React + TypeScript (pages, components, layouts)
resources/css/    → Tailwind CSS
tests/            → Pest (Feature + Unit)
```

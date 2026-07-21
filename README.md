# JMS WebShield Store

> Plataforma de comercio electrónico para productos de seguridad web JMS WebShield

[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php)](https://php.net)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Tested with Pest](https://img.shields.io/badge/Tested%20with-Pest-4285F4?logo=pest)](https://pestphp.com)

## Requisitos

- **PHP** 8.3+ con extensiones: `pdo_mysql`, `json`, `mbstring`, `ctype`, `bcmath`
- **Node.js** 22+
- **Composer**
- **MySQL** 8.0+
- **npm** o **pnpm**

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Laravel 13 + Fortify |
| Frontend | React 19 + Inertia.js 3 + TypeScript (strict) |
| UI | Tailwind CSS v4 + shadcn/ui |
| BD | MySQL 8.0 |
| Cache/Queue/Session | Database (MySQL) |
| Auth | Laravel Fortify (login, email verification, password reset) |
| Testing | Pest + Vitest |

## Desarrollo local

### Con Docker

```bash
git clone <repo-url> jmswebshield-store
cd jmswebshield-store
cp .env.example .env    # editar .env con tus valores
docker compose up -d    # MySQL en localhost:33060
composer install
npm install
php artisan migrate
php artisan db:seed     # crea el usuario admin
npm run dev             # Vite con hot reload
```

O todo junto:

```bash
composer setup          # install + key:generate + migrate + npm install + build
docker compose up -d
composer dev            # servidor + queue + logs + Vite
```

### Sin Docker

Configura MySQL local y ajusta las variables `DB_*` en `.env`.

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `APP_NAME` | Nombre de la aplicación | `JMS WebShield` |
| `APP_ENV` | Entorno (`local` / `production`) | `local` |
| `APP_DEBUG` | Modo debug | `true` (dev) / `false` (prod) |
| `APP_URL` | URL base de la app | `http://localhost` |
| `DB_CONNECTION` | Driver de base de datos | `mysql` |
| `DB_HOST` | Host de MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_DATABASE` | Nombre de la BD | — |
| `DB_USERNAME` | Usuario de MySQL | — |
| `DB_PASSWORD` | Contraseña de MySQL | — |
| `QUEUE_CONNECTION` | Driver de colas | `database` |
| `CACHE_STORE` | Driver de caché | `database` |
| `SESSION_DRIVER` | Driver de sesiones | `database` |
| `ADMIN_EMAIL` | Email del usuario administrador | — **(requerido)** |
| `ADMIN_INITIAL_PASSWORD` | Contraseña inicial del admin | `password` |
| `WHATSAPP_NUMBER` | Número de WhatsApp para consultas | — |
| `SYSCOM_BASE_URL` | URL base de la API SYSCOM | `https://developers.syscom.mx` |
| `SYSCOM_CLIENT_ID` | Client ID de SYSCOM OAuth | — |
| `SYSCOM_CLIENT_SECRET` | Client Secret de SYSCOM OAuth | — |
| `MAIL_MAILER` | Driver de correo | `log` (dev) |

## Despliegue en producción

### 1. Requisitos del servidor

- PHP 8.3+ con extensiones: `pdo_mysql`, `json`, `mbstring`, `ctype`, `bcmath`, `fileinfo`, `tokenizer`
- MySQL 8.0+
(Se requiere MySQL 8.0+ por el uso de columnas JSON y JSON_EXTRACT en los queries de metadatos).
- Node.js 22+ (para compilar assets)
- Composer
- Servidor web: **nginx** o **Apache** con DocumentRoot apuntando a `public/`

### 2. Instalar dependencias

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
```

### 3. Configurar .env

Crear el archivo `.env` desde `.env.example` con valores de producción:

```env
APP_NAME="JMS WebShield"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jmswebshield
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
QUEUE_CONNECTION=database
CACHE_STORE=database
SESSION_DRIVER=database
MAIL_MAILER=smtp
# MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD...
ADMIN_EMAIL=admin@tudominio.com
ADMIN_INITIAL_PASSWORD=una-contraseña-segura
WHATSAPP_NUMBER=521234567890
SYSCOM_CLIENT_ID=...
SYSCOM_CLIENT_SECRET=...
```

### 4. Inicializar la aplicación

```bash
php artisan key:generate
php artisan storage:link
php artisan migrate --force
php artisan db:seed        # crea el usuario admin desde ADMIN_EMAIL + ADMIN_INITIAL_PASSWORD
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 5. Permisos

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 6. Tarea programada (cron)

Agregar al crontab del servidor:

```
* * * * * cd /ruta/al/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

La tarea `CleanupOrphanEditorImages` se ejecuta cada hora (Puedes elegir el tiempo que mejor se ajuste a tus necesidades).

### 7. Queue worker

El driver de colas es `database`. Configurar el worker con **supervisor** (recomendado) o systemd:

```ini
# Ejemplo supervisor: /etc/supervisor/conf.d/jmswebshield-worker.conf
[program:jmswebshield-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/al/proyecto/artisan queue:work --sleep=3 --tries=3 --timeout=60
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
numprocs=2
user=www-data
redirect_stderr=true
stdout_logfile=/ruta/al/proyecto/storage/logs/worker.log
```

### 8. nginx (configuración de ejemplo)

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /ruta/al/proyecto/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

> **HTTPS**: se recomienda usar Certbot + Let's Encrypt. La aplicación usa cookies de sesión y es importante que la conexión esté cifrada.

## Modelo de usuarios

- **Registro público deshabilitado**. Solo el administrador crea cuentas.
- El seeder `AdminUserSeeder` crea el usuario admin usando `ADMIN_EMAIL` y `ADMIN_INITIAL_PASSWORD` del `.env`.
- El middleware `EnsureEmailIsAdmin` verifica que `auth()->user()->email === ADMIN_EMAIL` para acceder a rutas `/admin/*`.
- Login en `/login`. Si necesitas crear usuarios adicionales, usa `php artisan tinker` o extiende el seeder.

## Integración SYSCOM

La app importa productos, marcas y categorías desde la API de SYSCOM (OAuth 2.0 client credentials).

- Rate limit: 60 req/min
- Los IDs de SYSCOM se guardan en `metadata->syscom_id` de cada modelo
- El admin gestiona la importación desde `/admin/syscom/products`, `/admin/syscom/brands`, `/admin/syscom/categories`

## Testing

```bash
./vendor/bin/pest                           # todos los tests
./vendor/bin/pest --filter="TestName"       # un test
./vendor/bin/pest --testsuite=Feature       # solo Feature
./vendor/bin/pest --testsuite=Unit          # solo Unit
npm run test:js:run                         # tests Vitest (frontend)
```

Los tests usan SQLite en memoria (`DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`). No requieren Docker ni servicios externos.

## CI

GitHub Actions ejecuta lint + tests en cada push/PR a `develop` y `main`.

## Estructura del proyecto

```
app/                    → Backend (Controllers, Models, Middleware, Services)
  Services/Syscom/      → Cliente SYSCOM, Mapper, Importers
database/
  migrations/           → Esquema de base de datos
  seeders/              → AdminUserSeeder
routes/                 → web.php, console.php
resources/js/           → React + TypeScript (pages, components, layouts)
resources/css/          → Tailwind CSS
tests/                  → Pest (Feature + Unit) + Vitest
```

## Comandos útiles

| Comando | Descripción |
|---|---|
| `composer setup` | Instala dependencias, genera key, migra, build frontend |
| `composer dev` | Servidor + queue + logs + Vite (todo a la vez) |
| `composer lint` / `composer lint:check` | Pint (formateo PHP) |
| `composer test` | config:clear → lint:check → pest |
| `npm run dev` | Solo Vite con hot reload |
| `npm run build` | Build de producción (frontend) |
| `npm run types:check` | Verificación de tipos TypeScript |
| `npm run lint` / `npm run lint:check` | ESLint |
| `npm run format` / `npm run format:check` | Prettier |
| `npx shadcn@latest add [componente]` | Agregar componente shadcn/ui |
| `docker compose up -d` / `down` | MySQL en `localhost:33060` |
| `php artisan migrate:fresh --seed` | Recrear BD desde cero + seed |

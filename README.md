# Colmado Back - Sistema Contable Backend

Backend API para el Sistema Contable de Colmado, construido con NestJS, Prisma y PostgreSQL/MySQL.

## 🚀 Características

- **Autenticación JWT** - Sistema de autenticación seguro con tokens JWT
- **Control de Roles** - Sistema de permisos (OWNER, MANAGER, CASHIER)
- **Gestión de Productos** - CRUD completo de productos e inventario
- **Punto de Venta** - Procesamiento de ventas con múltiples monedas
- **Control de Stock** - Movimientos de inventario entre almacenes y puntos de venta
- **Gestión de Clientes** - Administración de clientes y deudas
- **Finanzas** - Reportes diarios, gastos y tasas de cambio
- **API REST** - Documentación automática con Swagger
- **CORS Configurado** - Habilitado para el frontend Angular

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- PostgreSQL o MySQL
- Git

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone <URL_DEL_REPOSITORIO>
cd Colmado-Back
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
# Crear archivo .env
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/colmado_db"
JWT_SECRET="tu_secreto_jwt_seguro"
PORT=3000
```

4. Configurar la base de datos con Prisma:
```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Sembrar datos iniciales
npx prisma db seed
```

## 🏃‍♂️ Ejecutar la Aplicación

```bash
# Modo desarrollo con hot-reload
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La API estará disponible en `http://localhost:3000`

## 📚 Documentación API

Una vez la aplicación esté corriendo, visita la documentación interactiva de Swagger:

```
http://localhost:3000/api
```

## 🔐 Endpoints Principales

### Autenticación
- `POST /auth/login` - Iniciar sesión y obtener token JWT
- `GET /auth/profile` - Obtener perfil del usuario autenticado

### Productos
- `GET /products` - Listar todos los productos
- `POST /products` - Crear nuevo producto
- `GET /products/:id` - Obtener producto por ID
- `PATCH /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto (soft delete)

### Ventas
- `POST /sales/bulk` - Procesar venta con múltiples items
- `GET /sales` - Historial de ventas
- `GET /sales/:id` - Detalle de venta

### Clientes
- `GET /customers` - Listar clientes
- `POST /customers` - Crear cliente
- `PATCH /customers/:id` - Actualizar cliente
- `DELETE /customers/:id` - Eliminar cliente

### Stock
- `POST /stock/entry` - Entrada de inventario
- `POST /stock/transfer` - Transferencia entre ubicaciones
- `GET /stock/available` - Stock disponible por producto
- `GET /stock/movements` - Historial de movimientos

### Finanzas
- `POST /finance/expense` - Registrar gasto
- `POST /finance/rate` - Establecer tasa de cambio
- `GET /finance/daily-summary` - Resumen financiero diario

Ver documentación completa en Swagger: `/api`

## 🗄️ Estructura del Proyecto

```
src/
├── auth/              # Módulo de autenticación
├── customers/         # Gestión de clientes
├── debts/            # Control de deudas
├── finance/          # Módulo financiero
├── point-of-sale/    # Puntos de venta
├── prisma/           # Configuración de Prisma
├── products/         # Gestión de productos
├── sales/            # Procesamiento de ventas
├── stock/            # Control de inventario
├── users/            # Gestión de usuarios
├── warehouses/       # Gestión de almacenes
├── app.module.ts     # Módulo principal
└── main.ts           # Punto de entrada
```

## 🧪 Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura de código
npm run test:cov
```

## 🛠️ Tecnologías Utilizadas

- **NestJS** - Framework de Node.js
- **Prisma** - ORM moderno para TypeScript
- **PostgreSQL/MySQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **Swagger** - Documentación automática de API
- **TypeScript** - Tipado estático

## 🔒 Seguridad

- Autenticación JWT obligatoria en todos los endpoints (excepto login)
- Encriptación de contraseñas con bcrypt
- Control de acceso basado en roles
- CORS configurado para dominios permitidos
- Validación de datos con class-validator
- Soft delete para prevenir pérdida de datos

## 📝 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/colmado_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Application
PORT=3000
NODE_ENV=development
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👥 Autor

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter)

## 🙏 Agradecimientos

- NestJS por el excelente framework
- Prisma por el ORM intuitivo
- La comunidad de TypeScript

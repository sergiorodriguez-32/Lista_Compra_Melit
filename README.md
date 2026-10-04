# ListaCompra Melit

Aplicación web para **organizar la despensa y la lista de la compra** del hogar. Cada usuario mantiene su propio catálogo de productos, controla lo que tiene en casa y prepara la lista antes de ir a comprar, moviendo cantidades de una lista a otra con un clic.

> Nombre técnico del proyecto: `melit-market` · Paquete Java: `com.melit.listacompra` · Idioma de la interfaz: español e inglés.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Cómo fluyen los productos](#cómo-fluyen-los-productos)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Usuarios de ejemplo](#usuarios-de-ejemplo)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [API REST](#api-rest)
- [Tests](#tests)
- [Compilar para producción y Docker](#compilar-para-producción-y-docker)
- [Más información](#más-información)

---

## Funcionalidades

| Sección | Ruta | Qué permite |
|---|---|---|
| **Inicio** | `/` | Página de bienvenida con acceso a inicio de sesión y registro. |
| **Panel** | `/panel` | Menú principal tras iniciar sesión: accesos a Productos, Despensa y Compra, cambio de idioma (ES/EN) y cierre de sesión. |
| **Productos** | `/productos` | Catálogo personal: crear, editar y eliminar productos; filtrar por categoría; añadir un producto a la despensa o a la compra con la cantidad indicada. |
| **Despensa** | `/despensa` | Lo que hay en casa: sumar o restar cantidad, quitar un producto y **pasarlo a la lista de compra** (cantidad parcial o total). |
| **Compra** | `/compra` | Lista de la compra: sumar o restar cantidad, quitar productos, marcar como comprado (**pasa a la despensa**) y ver el **total estimado** en euros. |
| **Administrar** | `/administrar` | Solo `ROLE_ADMIN`: gestión de usuarios (datos, idioma, activar/desactivar cuenta, roles y eliminación). |
| **Cuenta** | `/account/*` | Registro, ajustes de perfil, cambio y recuperación de contraseña. |
| **Administración JHipster** | `/admin/*` | Solo `ROLE_ADMIN`: métricas, salud, configuración y logs de la aplicación. |

Cada producto guarda: nombre, descripción, precio, ubicación, letra saludable, fecha de caducidad, categoría (`ALIMENTACION` o `DROGUERIA`), unidad de medida (`UNIDAD`, `KG`, `G`, `L`, `ML`) y cantidad por defecto.

Las listas son **privadas por usuario**: cada persona solo ve sus propios productos y elementos.

## Cómo fluyen los productos

Un producto del catálogo se añade a la **despensa** (lo que ya tienes) o a la **compra** (lo que necesitas), y las cantidades se mueven entre ambas listas según se gastan o se compran:

| Acción | Desde | Hacia |
|---|---|---|
| Añadir a despensa | Productos | Despensa |
| Añadir a compra | Productos | Compra |
| Pasar a compra | Despensa | Compra |
| Marcar como comprado / pasar a despensa | Compra | Despensa |

- Si un producto **ya está** en una lista y se vuelve a añadir, no se duplica: se **suma la cantidad** al elemento existente.
- Al pasar una cantidad de una lista a otra, si se mueve todo el elemento desaparece de la lista de origen; si se mueve solo una parte, queda el resto.
- Al restar cantidad hasta llegar a 0 (o menos), el elemento se elimina de la lista.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 4.0.3, Spring Security (JWT), Spring Data JPA / Hibernate |
| Base de datos | MySQL (desarrollo y producción), Liquibase para el esquema de usuarios |
| Caché | Ehcache |
| Frontend | Angular 21, TypeScript 5.9, Bootstrap 5 (tema Flatly), ngx-translate (es/en) |
| Compilación | Maven Wrapper (`mvnw`), npm wrapper (`npmw`), Angular CLI con esbuild |
| Tests | JUnit / Spring Boot Test + Testcontainers (backend), Vitest (frontend), Cypress (E2E) |
| Calidad | ESLint, Prettier, Checkstyle, Husky + lint-staged, SonarQube (opcional) |
| Generado con | [JHipster](https://www.jhipster.tech/) 9.0.0 (aplicación monolítica) |

## Requisitos previos

- **JDK 21**
- **MySQL 8 o superior** en `localhost:3306` (o Docker, ver más abajo)
- **Node.js y npm**: no hace falta instalarlos; Maven descarga la versión adecuada (Node v24.14.0) en la primera compilación. Si prefieres usar los tuyos, ejecuta `./npmw` en lugar de `npm`.
- Docker (opcional): solo para levantar MySQL o la aplicación en contenedores.

> **Windows:** en PowerShell o `cmd` usa `mvnw.cmd` y `npmw.cmd` (o `.\mvnw`). En Git Bash funcionan los comandos `./mvnw` y `./npmw` tal cual.

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/sergiorodriguez-32/Lista_Compra_Melit.git
cd Lista_Compra_Melit
```

### 2. Preparar la base de datos

El perfil de desarrollo (`src/main/resources/config/application-dev.yml`) espera esta conexión:

| Parámetro | Valor |
|---|---|
| URL | `jdbc:mysql://localhost:3306/melit_market` |
| Usuario | `melit-market` |
| Contraseña | `1234` |

Crea la base de datos y el usuario en tu MySQL:

```sql
CREATE DATABASE melit_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'melit-market'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON melit_market.* TO 'melit-market'@'localhost';
FLUSH PRIVILEGES;
```

Al arrancar el backend, **Liquibase crea automáticamente todas las tablas** (usuarios y roles, `producto` e `item_lista`) y carga los usuarios de ejemplo. No hace falta ejecutar ningún script. Si ya habías creado `producto` o `item_lista` a mano en una base de datos anterior, Liquibase las detecta y no las modifica.

> **Docker para MySQL:** `docker compose -f src/main/docker/services.yml up -d` levanta un MySQL, pero crea la base `melit-market` (con guion) con el usuario `root` sin contraseña. Si lo usas, ajusta la URL, el usuario y la contraseña de `application-dev.yml` o crea ahí `melit_market` y el usuario anterior.

### 3. Arrancar el backend

```bash
./mvnw
```

El backend queda disponible en <http://localhost:8080> (perfil `dev` por defecto). También puedes usar el script npm:

```bash
./npmw run backend:start
```

### 4. Arrancar el frontend (modo desarrollo con recarga automática)

En otra terminal:

```bash
./npmw install      # solo la primera vez o si cambian las dependencias
./npmw start
```

Abre <http://localhost:4200>. El servidor de desarrollo redirige las llamadas a `/api` y `/management` al backend en el puerto 8080.

> Si solo quieres usar la aplicación (sin recarga en caliente), basta con `./mvnw` y abrir <http://localhost:8080>: el backend ya sirve el frontend compilado.

### 5. Iniciar sesión

Usa uno de los [usuarios de ejemplo](#usuarios-de-ejemplo) o crea una cuenta desde **Crear cuenta**.

> En desarrollo el envío de correos está desactivado (`jhipster.mail.enabled: false`), así que las cuentas nuevas no reciben el correo de activación. Un administrador puede activarlas desde **Administrar → Estado de la cuenta**.

## Usuarios de ejemplo

Se cargan con Liquibase (`src/main/resources/config/liquibase/data/`). Son los usuarios por defecto de JHipster, **solo para desarrollo**:

| Usuario | Contraseña | Roles |
|---|---|---|
| `admin` | `admin` | `ROLE_ADMIN`, `ROLE_USER` |
| `user` | `user` | `ROLE_USER` |

> Cambia estas credenciales (y la clave JWT, la contraseña de la base de datos y el resto de secretos) antes de desplegar en cualquier entorno real.

## Estructura del proyecto

```
listacompra-melit/
├── pom.xml                         # Build del backend (Maven) y perfiles dev/prod
├── package.json · angular.json     # Build del frontend (npm / Angular CLI)
├── src/
│   ├── main/
│   │   ├── java/com/melit/listacompra/
│   │   │   ├── domain/             # Entidades: Producto, ItemLista, User, Authority y enums
│   │   │   ├── repository/         # Repositorios Spring Data JPA
│   │   │   ├── service/            # Lógica de negocio (ProductoService, ItemListaService...)
│   │   │   ├── web/rest/           # Controladores REST
│   │   │   ├── security/           # Autenticación JWT y roles
│   │   │   └── config/             # Configuración de Spring
│   │   ├── resources/
│   │   │   ├── config/             # application*.yml y Liquibase
│   │   │   └── swagger/api.yml     # Definición OpenAPI
│   │   ├── webapp/app/
│   │   │   ├── productos/          # Pantalla de catálogo de productos
│   │   │   ├── despensa/           # Pantalla de despensa
│   │   │   ├── compra/             # Pantalla de lista de compra
│   │   │   ├── panel/              # Menú principal
│   │   │   ├── administrar/        # Gestión de usuarios (admin)
│   │   │   ├── home/ · login/ · account/ · admin/ · layouts/ · shared/
│   │   │   └── ...
│   │   ├── webapp/i18n/{es,en}/    # Traducciones de la interfaz
│   │   └── docker/                 # Docker Compose (MySQL, app, monitorización, Sonar...)
│   └── test/
│       ├── java/                   # Tests del backend
│       └── javascript/cypress/     # Tests E2E
└── README.md
```

## Modelo de datos

```
jhi_user (1) ───< producto (1) ───< item_lista >─── (1) jhi_user
```

**`Producto`**: `id`, `nombre`*, `descripcion`, `precio`*, `ubicacion`, `letra_saludable`, `fecha_caducidad`, `categoria`* (`ALIMENTACION` · `DROGUERIA`), `unidad_medida`* (`UNIDAD` · `KG` · `G` · `L` · `ML`), `cantidad_por_defecto`*, `user_id`*.

**`ItemLista`**: `id`, `cantidad`*, `tipo_lista`* (`DESPENSA` · `COMPRA`), `unidad_medida`*, `producto_id`*, `user_id`*.

*Campos obligatorios.*

El esquema está definido en `src/main/resources/config/liquibase/changelog/` (`20261004000001_added_entity_Producto.xml` y `20261004000002_added_entity_ItemLista.xml`).

## API REST

Todas las rutas (salvo autenticación y registro) requieren el token JWT en la cabecera `Authorization: Bearer <token>`. El token se obtiene con `POST /api/authenticate`.

### Productos · `/api/productos`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/productos` | Lista los productos del usuario autenticado |
| `GET` | `/api/productos/{id}` | Obtiene un producto |
| `POST` | `/api/productos` | Crea un producto |
| `PUT` | `/api/productos/{id}` | Actualiza un producto |
| `DELETE` | `/api/productos/{id}` | Elimina un producto |

### Elementos de lista · `/api/item-listas`

Un `ItemLista` pertenece a la lista `DESPENSA` o `COMPRA` según su campo `tipoLista`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/item-listas` | Lista los elementos del usuario (despensa y compra) |
| `GET` | `/api/item-listas/{id}` | Obtiene un elemento |
| `POST` | `/api/item-listas` | Añade un elemento; si el producto ya está en esa lista, suma la cantidad |
| `PUT` | `/api/item-listas/{id}` | Actualiza un elemento |
| `DELETE` | `/api/item-listas/{id}` | Elimina un elemento |
| `PUT` | `/api/item-listas/{id}/sumar` | Suma `cantidad` (cuerpo: `{ "cantidad": 2 }`) |
| `PUT` | `/api/item-listas/{id}/restar` | Resta `cantidad`; si llega a 0 elimina el elemento (responde `204`) |
| `PUT` | `/api/item-listas/{id}/pasar-a-compra` | Mueve cantidad de despensa a compra (sin cuerpo: mueve todo) |
| `PUT` | `/api/item-listas/{id}/comprar` | Mueve cantidad de compra a despensa (sin cuerpo: mueve todo) |

### Cuenta y administración

| Ruta | Descripción |
|---|---|
| `POST /api/authenticate` | Inicio de sesión, devuelve el token JWT |
| `POST /api/register` | Registro de usuario |
| `GET/POST /api/account` | Consultar y actualizar la cuenta propia |
| `/api/admin/users` | Gestión de usuarios (solo `ROLE_ADMIN`) |
| `/management/health` | Estado de la aplicación |

La documentación interactiva OpenAPI está disponible con el perfil `api-docs` (por ejemplo, el de la imagen Docker) en `/swagger-ui/`.

## Tests

```bash
./mvnw verify          # tests del backend
./npmw test            # tests unitarios del frontend (Vitest) + lint
./npmw run lint        # solo ESLint
```

**Tests E2E con Cypress:** arranca el backend (`./npmw run app:start`) y, en otra terminal:

```bash
./npmw run e2e
```

Se pueden indicar las credenciales con las variables de entorno `CYPRESS_E2E_USERNAME` y `CYPRESS_E2E_PASSWORD`.

## Compilar para producción y Docker

**Jar ejecutable:**

```bash
./mvnw -Pprod clean verify
java -jar target/*.jar
```

La aplicación queda en <http://localhost:8080>. El perfil `prod` usa MySQL en `localhost:3306` con la base `melit-market`; las credenciales se pueden sobrescribir con variables de entorno de Spring (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).

**Imagen Docker** (con Jib) y despliegue con Docker Compose:

```bash
./npmw run java:docker
docker compose -f src/main/docker/app.yml up -d
```

**Calidad de código con SonarQube** (opcional):

```bash
docker compose -f src/main/docker/sonar.yml up -d
./mvnw -Pprod clean verify sonar:sonar
```

## Más información

- Documentación de [JHipster 9.0.0](https://www.jhipster.tech/documentation-archive/v9.0.0)
- [Angular CLI](https://angular.dev/tools/cli) · [Spring Boot](https://spring.io/projects/spring-boot) · [Cypress](https://www.cypress.io/)
- Repositorio: <https://github.com/sergiorodriguez-32/Lista_Compra_Melit>

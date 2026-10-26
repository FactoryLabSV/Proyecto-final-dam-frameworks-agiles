# TAMACHIHUA-ERP · Módulo de Inventario

Proyecto final integrado del ciclo 02-2026 – ITCA-FEPADE, sede central Santa Tecla
Técnico en Ingeniería de Desarrollo de Software – Grupo TDSV221

Integra tres materias:

| Materia | Aporte al proyecto |
|---|---|
| Utilización de Frameworks para el Desarrollo de Software (UFDS) | Panel administrativo en Vue + Vuetify |
| Desarrollo de Aplicaciones Móviles (DAM) | App móvil de consulta en Ionic + Angular |
| Aplicación de Metodologías Ágiles y Control de Calidad | Scrum (4 sprints de 1 semana), Jira, pruebas |

El sistema permite administrar productos, presentaciones, precios, proveedores y lotes de un pequeño negocio, con alertas de bajo stock y vencimiento. Los vendedores consultan existencias y precios desde una app móvil.

---

## Equipo

| Integrante | Rol | Área principal |
|---|---|---|
| Carlos Alexis Hernández Pérez | Product Owner | Requisitos, backlog e integración |
| René Alexander Quintanilla Henríquez | Scrum Master | Tablero, ceremonias, pruebas · Panel |
| Marvin Isaí Gómez Samayoa | Developer | API (Java + Spring Boot) |
| Ali Emmanuel Velásquez Gómez | Developer | Base de datos · API |
| Melvin Omar Velásquez Fuentes | Developer | Panel administrativo (Vue) |
| Henry Francisco Guerra Salinas | Developer | App móvil (Ionic + Angular) |

---

## Estructura del repositorio

```
01-Documentacion/          Documentos del proyecto (propuesta, entrevistas, historias, backlog, sprints)
  Entrevistas/             Entrevistas individuales (anexos)
  Historias aportadas/     Historias identificadas por cada integrante
02-Base_de_Datos/          Diseño de la BD: MER, diccionario y scripts SQL           → Ali
03-API/                    API REST en Java + Spring Boot                            → Marvin
04-Panel_Administrativo/   Panel web en Vue CLI + Vuetify                            → Melvin, René
05-App_Movil/              App móvil en Ionic + Angular                              → Henry
```

Cada carpeta tiene su propio `README.md` con las instrucciones para crear y ejecutar esa parte.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Base de datos | PostgreSQL |
| API | Java + Spring Boot (Spring Web, Spring Data JPA, Validation, Spring Security con JWT), Maven |
| Panel administrativo | Vue CLI, Vue Router, Vuex, Vuetify 3, Axios (Options API) |
| App móvil | Ionic + Angular (plantilla tabs), Axios o fetch |
| Gestión | Jira (backlog y sprints), GitHub (código) |

---

## Forma de trabajo con Git

### Ramas

| Rama | Uso |
|---|---|
| `main` | Versión estable. Solo se actualiza al cierre de cada sprint (lo hace el PO). |
| `develop` | Integración del trabajo de todos durante el sprint. |
| `feature/<area>-<HU>-<descripcion>` | Una rama por tarea. Ejemplo: `feature/api-HU-06-productos`, `feature/panel-HU-03-categorias`, `feature/app-HU-13-busqueda`. |

Áreas para el nombre de rama: `bd`, `api`, `panel`, `app`, `docs`.

### Pasos para cada tarea

1. Actualiza tu copia de `develop` (en GitHub Desktop: *Fetch origin* y luego *Pull*).
2. Crea tu rama `feature/...` a partir de `develop`.
3. Trabaja **solo dentro de la carpeta de tu área**.
4. Haz commits pequeños con un mensaje claro que incluya la clave de Jira y la HU, por ejemplo:
   `TAM-12 HU-06: listado de productos con búsqueda`
5. Sube tu rama (*Push origin*) y abre un **Pull Request hacia `develop`**.
6. Otro integrante revisa el Pull Request; cuando se aprueba, se une a `develop`.
7. Mueve la tarjeta en Jira y adjunta la captura de evidencia (ver Definition of Done).

> Nunca hagas commit directo a `main` ni a `develop`.
>
> **¿Primera vez con Git o con ramas?** Sigue la guía paso a paso: [GUIA-GIT.md](GUIA-GIT.md)

### Qué NO se sube al repositorio

- Dependencias y compilados: `node_modules/`, `target/`, `dist/`, `www/`, `.angular/`.
- Archivos con contraseñas o configuración local: `.env`, `.env.local`, `application-local.properties`.
- Archivos temporales de Office (`~$...docx`).

Estas reglas ya están en el archivo `.gitignore`. Si necesitas un archivo de configuración, sube una copia de ejemplo sin contraseñas (por ejemplo `.env.example` o `application-example.properties`).

---

## Cómo empezar

1. Acepta la invitación al repositorio que llega a tu correo de GitHub.
2. Clónalo siguiendo la [guía de Git](GUIA-GIT.md) o con:
   ```
   git clone <URL-del-repositorio>
   ```
3. Cámbiate a la rama `develop`.
4. Lee el `README.md` de la carpeta de tu área y sigue sus pasos.

## Documentación

| Documento | Contenido |
|---|---|
| 01 – Propuesta de proyecto | Propuesta aprobada en Metodologías Ágiles |
| 02 – Formulario de asignación (DAM) | Inscripción del proyecto en DAM |
| 03 – Formato del documento a entregar | Plantilla del documento final |
| 04 – Contexto, alcance y roles | Problema, visión, alcance, tecnologías y equipo |
| 05 – Entrevistas de levantamiento de requisitos | Guion y entrevistas a los tipos de usuario |
| 06 – Consolidado de historias aportadas | Historias identificadas por el equipo y trazabilidad |
| 07 – Product Backlog | *(pendiente)* |
| 08 – Sprint Planning – Sprint 1 | *(pendiente)* |

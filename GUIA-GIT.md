# Guía de Git paso a paso

Esta guía es para trabajar en el repositorio sin romper el trabajo de los demás.
**Pega un comando a la vez** en Git Bash (o en la terminal de VS Code) y presiona Enter después de cada uno.

Antes de empezar:

- Ten instalado **Git para Windows**.
- Acepta la invitación al repositorio que llegó a tu correo de GitHub.
- Lee el `README.md` principal y el de la carpeta de tu área.

---

## 1. Primera vez (solo una vez por computadora)

Abre Git Bash en la carpeta donde quieras guardar el proyecto (clic derecho → *Open Git Bash here*).

**1.1 Descargar el repositorio**

```
git clone https://github.com/FactoryLabSV/Proyecto-final-dam-frameworks-agiles.git
```

**1.2 Entrar a la carpeta del proyecto**

```
cd Proyecto-final-dam-frameworks-agiles
```

**1.3 Decirle a Git quién eres** (solo para este proyecto; usa el correo de tu cuenta de GitHub)

```
git config user.name "Tu Nombre Completo"
```
```
git config user.email "tu-correo-de-github@ejemplo.com"
```

**1.4 Cambiarte a la rama de trabajo del equipo**

```
git checkout develop
```

> La primera vez que hagas `push`, se abrirá el navegador para iniciar sesión en GitHub. Es normal.

---

## 2. Cada vez que empiezas una tarea nueva

**2.1 Ir a develop y traer lo último que subieron los demás**

```
git checkout develop
```
```
git pull
```

**2.2 Crear tu rama para la tarea**

El nombre sigue este formato: `feature/<area>-<HU>-<descripcion-corta>`
Áreas: `bd`, `api`, `panel`, `app`, `docs`. Sin espacios ni tildes.

```
git checkout -b feature/panel-HU-03-categorias
```

Ahora ya puedes trabajar. **Modifica solo archivos de la carpeta de tu área.**

---

## 3. Guardar y subir tu avance

**3.1 Ver qué archivos cambiaste**

```
git status
```

Revisa la lista. Si aparecen archivos de otras carpetas que no tocaste a propósito, **no sigas** y avisa al PO.

**3.2 Preparar los cambios de tu carpeta** (cambia la carpeta por la de tu área)

```
git add 04-Panel_Administrativo/
```

**3.3 Guardar los cambios con un mensaje**

El mensaje lleva la clave de Jira, la HU y qué hiciste:

```
git commit -m "TAM-12 HU-03: listado de categorías"
```

**3.4 Subir tu rama a GitHub**

La primera vez que subes esa rama:

```
git push -u origin feature/panel-HU-03-categorias
```

Las siguientes veces, en la misma rama, basta con:

```
git push
```

Puedes repetir los pasos 3.1 a 3.4 todas las veces que quieras mientras trabajas en la tarea.

---

## 4. Pedir que integren tu trabajo (Pull Request)

Cuando la tarea esté terminada:

1. Entra al repositorio en GitHub.
2. Aparecerá un aviso amarillo con el botón **Compare & pull request**. Haz clic. Si no aparece, ve a *Pull requests → New pull request*.
3. Verifica arriba: **base: `develop`** ← **compare: tu rama**. *Nunca* elijas `main` como base.
4. Escribe un título como el del commit (por ejemplo `TAM-12 HU-03: listado de categorías`) y una descripción corta de lo que hiciste.
5. En **Reviewers** elige a un compañero.
6. Clic en **Create pull request**.
7. Mueve tu tarjeta en Jira y adjunta la captura de evidencia.

El compañero revisa y, si está bien, hace **Merge**. Si pide cambios, corrígelos en tu misma rama y repite el paso 3; el Pull Request se actualiza solo.

---

## 5. Después de que aprueban tu Pull Request

```
git checkout develop
```
```
git pull
```

Y para la siguiente tarea, vuelve al paso 2.

---

## 6. Si develop cambió mientras trabajabas en tu rama

Para traer a tu rama lo que ya integraron los demás:

```
git checkout develop
```
```
git pull
```
```
git checkout feature/panel-HU-03-categorias
```
```
git merge develop
```

Si aparece un **conflicto** (Git te avisa que no pudo unir un archivo), no borres nada: avisa al PO o al compañero de tu área.

---

## 7. Reglas de oro

- Nunca hagas commit ni push directo a `main` ni a `develop`; siempre trabaja en tu rama `feature/...`.
- Pega **un comando a la vez**.
- Antes de cada commit revisa `git status`.
- No subas contraseñas, `node_modules`, `target` ni archivos `.env`.
- Si algo sale raro, **detente y pregunta** antes de intentar arreglarlo con comandos que no conoces.

## 8. Errores comunes

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| `Author identity unknown` | Git no sabe tu nombre y correo | Repite el paso 1.3 |
| `command not found` con símbolos raros como `^[[200~` | Pegaste varias líneas a la vez | Pega un solo comando |
| `rejected ... fetch first` o `non-fast-forward` | Alguien subió cambios antes que tú a esa rama | Ejecuta `git pull` y luego `git push` |
| `src refspec ... does not match any` | La rama no existe o no has hecho commit | Revisa el nombre con `git branch` y haz commit antes del push |
| `Your local changes would be overwritten` al cambiar de rama | Tienes cambios sin guardar | Haz `git add` y `git commit` antes de cambiar de rama |
| `403` o `Permission denied` | Tu cuenta no tiene acceso | Avisa al PO para revisar la invitación |

## Ver en qué rama estás

```
git branch
```

La rama actual aparece marcada con `*`. En Git Bash también se ve entre paréntesis al final de la ruta, por ejemplo `(develop)`.

# MiTrello 🟣

Clon de Trello construido con Django. Permite gestionar tableros, listas y tarjetas con drag & drop, perfiles de usuario y autenticación completa.

## 🚀 Características

- Autenticación — registro, login y logout
- Tableros — crear y eliminar tableros personales
- Listas (columnas) — crear y eliminar columnas dentro de un tablero
- Tarjetas — crear, editar, eliminar y mover tarjetas con drag & drop
- Detalle de tarjeta — modal con título y descripción editables
- Perfil de usuario — foto de perfil, estadísticas y cambio de contraseña

## 🛠️ Tecnologías

- Python 3.12
- Django 4.x
- SQLite (base de datos por defecto)
- Bootstrap 5
- JavaScript vanilla (drag & drop, fetch API)

## ⚙️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/mitrello.git
cd mitrello
```

### 2. Crear entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Aplicar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Crear superusuario (opcional)

```bash
python manage.py createsuperuser
```

### 6. Correr el servidor

```bash
python manage.py runserver
```

Abre http://127.0.0.1:8000 en tu navegador.

## 📁 Estructura del proyecto

```
mitrello/
├── app_trello/
│   ├── static/
│   │   ├── css/
│   │   │   ├── base.css
│   │   │   ├── login.css
│   │   │   ├── dashboard.css
│   │   │   ├── tablero.css
│   │   │   └── perfil.css
│   │   └── js/
│   │       ├── dashboard.js
│   │       └── tablero.js
│   ├── models.py
│   ├── views.py
│   └── urls.py (incluido en el principal)
├── templates/
│   ├── registration/
│   │   └── login.html
│   ├── base.html
│   ├── dashboard.html
│   ├── tablero.html
│   └── perfil.html
├── media/
│   └── avatars/
├── requirements.txt
├── manage.py
└── README.md
```

## 📦 Dependencias principales

| Paquete | Uso |
|--------|-----|
| Django | Framework principal |
| Pillow | Manejo de imágenes (avatares) |

Para generar el `requirements.txt`:

```bash
pip freeze > requirements.txt
```

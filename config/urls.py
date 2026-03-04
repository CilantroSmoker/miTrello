from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from app_trello.views import (
    CustomLoginView, register,
    dashboard, crear_tablero, eliminar_tablero,
    tablero, crear_lista, eliminar_lista,
    crear_tarjeta, eliminar_tarjeta, detalle_tarjeta, editar_tarjeta,
    mover_tarjeta, perfil,
)
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return redirect('login')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),

    # Auth
    path('register/', register, name='register'),
    path('accounts/login/', CustomLoginView.as_view(), name='login'),
    path('accounts/', include('django.contrib.auth.urls')),

    # Dashboard
    path('dashboard/', dashboard, name='dashboard'),
    path('tablero/crear/', crear_tablero, name='crear_tablero'),
    path('tablero/<int:pk>/', tablero, name='tablero'),
    path('tablero/<int:pk>/eliminar/', eliminar_tablero, name='eliminar_tablero'),

    # Listas
    path('tablero/<int:tablero_pk>/lista/crear/', crear_lista, name='crear_lista'),
    path('lista/<int:pk>/eliminar/', eliminar_lista, name='eliminar_lista'),

    # Tarjetas
    path('lista/<int:lista_pk>/tarjeta/crear/', crear_tarjeta, name='crear_tarjeta'),
    path('tarjeta/<int:pk>/eliminar/', eliminar_tarjeta, name='eliminar_tarjeta'),
    path('tarjeta/<int:pk>/detalle/', detalle_tarjeta, name='detalle_tarjeta'),
    path('tarjeta/<int:pk>/editar/', editar_tarjeta, name='editar_tarjeta'),
    path('tarjeta/mover/', mover_tarjeta, name='mover_tarjeta'),

    # Perfil
    path('perfil/', perfil, name='perfil'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
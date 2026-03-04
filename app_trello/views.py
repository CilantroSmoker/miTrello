from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, update_session_auth_hash
from django.contrib.auth.forms import UserCreationForm, PasswordChangeForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib import messages
import json

from .models import Tablero, Lista, Tarjeta, Perfil


# ── AUTH ──────────────────────────────────

class CustomLoginView(LoginView):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['register_form'] = UserCreationForm()
        return context


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
        else:
            from django.contrib.auth.forms import AuthenticationForm
            return render(request, 'registration/login.html', {
                'form': AuthenticationForm(),
                'register_form': form,
            })
    return redirect('login')


# ── DASHBOARD ─────────────────────────────

@login_required
def dashboard(request):
    tableros = Tablero.objects.filter(propietario=request.user)
    return render(request, 'dashboard.html', {'tableros': tableros})


@login_required
def crear_tablero(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre', '').strip()
        if nombre:
            t = Tablero.objects.create(nombre=nombre, propietario=request.user)
            return redirect('tablero', pk=t.pk)
    return redirect('dashboard')


@login_required
def eliminar_tablero(request, pk):
    t = get_object_or_404(Tablero, pk=pk, propietario=request.user)
    t.delete()
    return redirect('dashboard')


# ── TABLERO ───────────────────────────────

@login_required
def tablero(request, pk):
    t = get_object_or_404(Tablero, pk=pk, propietario=request.user)
    listas = t.listas.prefetch_related('tarjetas')
    return render(request, 'tablero.html', {'tablero': t, 'listas': listas})


# ── LISTAS ────────────────────────────────

@login_required
@require_POST
def crear_lista(request, tablero_pk):
    t = get_object_or_404(Tablero, pk=tablero_pk, propietario=request.user)
    nombre = request.POST.get('nombre', '').strip()
    if nombre:
        Lista.objects.create(nombre=nombre, tablero=t, orden=t.listas.count())
    return redirect('tablero', pk=tablero_pk)


@login_required
@require_POST
def eliminar_lista(request, pk):
    lista = get_object_or_404(Lista, pk=pk, tablero__propietario=request.user)
    tablero_pk = lista.tablero.pk
    lista.delete()
    return redirect('tablero', pk=tablero_pk)


# ── TARJETAS ──────────────────────────────

@login_required
@require_POST
def crear_tarjeta(request, lista_pk):
    lista = get_object_or_404(Lista, pk=lista_pk, tablero__propietario=request.user)
    titulo = request.POST.get('titulo', '').strip()
    if titulo:
        Tarjeta.objects.create(titulo=titulo, lista=lista, orden=lista.tarjetas.count())
    return redirect('tablero', pk=lista.tablero.pk)


@login_required
@require_POST
def eliminar_tarjeta(request, pk):
    tarjeta = get_object_or_404(Tarjeta, pk=pk, lista__tablero__propietario=request.user)
    tablero_pk = tarjeta.lista.tablero.pk
    tarjeta.delete()
    return redirect('tablero', pk=tablero_pk)


@login_required
def detalle_tarjeta(request, pk):
    tarjeta = get_object_or_404(Tarjeta, pk=pk, lista__tablero__propietario=request.user)
    return JsonResponse({
        'id': tarjeta.pk,
        'titulo': tarjeta.titulo,
        'descripcion': tarjeta.descripcion,
        'lista': tarjeta.lista.nombre,
        'creado_en': tarjeta.creado_en.strftime('%d/%m/%Y'),
    })


@login_required
@require_POST
def editar_tarjeta(request, pk):
    tarjeta = get_object_or_404(Tarjeta, pk=pk, lista__tablero__propietario=request.user)
    try:
        data = json.loads(request.body)
        tarjeta.titulo = data.get('titulo', tarjeta.titulo).strip()
        tarjeta.descripcion = data.get('descripcion', tarjeta.descripcion).strip()
        tarjeta.save()
        return JsonResponse({'ok': True, 'titulo': tarjeta.titulo, 'descripcion': tarjeta.descripcion})
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)


# ── MOVER TARJETA ─────────────────────────

@login_required
@require_POST
def mover_tarjeta(request):
    try:
        data = json.loads(request.body)
        tarjeta = get_object_or_404(Tarjeta, pk=data['tarjeta_id'],
                                    lista__tablero__propietario=request.user)
        lista_destino = get_object_or_404(Lista, pk=data['lista_destino_id'],
                                          tablero__propietario=request.user)
        tarjeta.lista = lista_destino
        tarjeta.orden = data.get('orden', 0)
        tarjeta.save()
        return JsonResponse({'ok': True})
    except Exception as e:
        return JsonResponse({'ok': False, 'error': str(e)}, status=400)


# ── PERFIL ────────────────────────────────

@login_required
def perfil(request):
    perfil_obj, _ = Perfil.objects.get_or_create(usuario=request.user)
    seccion = request.GET.get('seccion', 'perfil')

    total_tableros = Tablero.objects.filter(propietario=request.user).count()
    total_listas   = Lista.objects.filter(tablero__propietario=request.user).count()
    total_tarjetas = Tarjeta.objects.filter(lista__tablero__propietario=request.user).count()

    password_form = PasswordChangeForm(request.user)

    if request.method == 'POST':
        accion = request.POST.get('accion')

        if accion == 'avatar':
            if 'avatar' in request.FILES:
                perfil_obj.avatar = request.FILES['avatar']
                perfil_obj.save()
                messages.success(request, 'Foto de perfil actualizada.')
            return redirect(f'/perfil/?seccion=perfil')

        if accion == 'eliminar_avatar':
            if perfil_obj.avatar:
                perfil_obj.avatar.delete(save=True)
                messages.success(request, 'Foto de perfil eliminada.')
            return redirect('/perfil/?seccion=perfil')

        if accion == 'password':
            password_form = PasswordChangeForm(request.user, request.POST)
            if password_form.is_valid():
                user = password_form.save()
                update_session_auth_hash(request, user)
                messages.success(request, 'Contraseña actualizada correctamente.')
                return redirect('/perfil/?seccion=password')

    return render(request, 'perfil.html', {
        'perfil': perfil_obj,
        'seccion': seccion,
        'password_form': password_form,
        'total_tableros': total_tableros,
        'total_listas': total_listas,
        'total_tarjetas': total_tarjetas,
    })
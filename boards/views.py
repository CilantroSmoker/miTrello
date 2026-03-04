from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def perfil(request):
    return render(request, 'perfil.html')

@login_required
def perfil(request):
    return render(request, 'perfil.html')
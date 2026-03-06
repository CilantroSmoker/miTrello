from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Tablero(models.Model):
    nombre = models.CharField(max_length=120)
    propietario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tableros")
    portada = models.ImageField(upload_to="tableros/portadas/", blank=True, null=True)
    portada_preset = models.CharField(max_length=60, blank=True, default="")
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class TableroPortadaHistorial(models.Model):
    tablero = models.ForeignKey(
        Tablero,
        on_delete=models.CASCADE,
        related_name="portadas_historial"
    )
    imagen = models.ImageField(upload_to="tableros/portadas/historial/")
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]

    def __str__(self):
        return f"Portada de {self.tablero.nombre}"

class Lista(models.Model):
    nombre = models.CharField(max_length=100)
    tablero = models.ForeignKey(Tablero, on_delete=models.CASCADE, related_name='listas')
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return f'{self.tablero.nombre} - {self.nombre}'


class Tarjeta(models.Model):
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    lista = models.ForeignKey(Lista, on_delete=models.CASCADE, related_name='tarjetas')
    orden = models.PositiveIntegerField(default=0)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['orden']

    def __str__(self):
        return self.titulo


class Perfil(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    portada = models.ImageField(upload_to='portadas/', blank=True, null=True)
    portada_preset = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f'Perfil de {self.usuario.username}'

# Crear perfil automáticamente al crear un usuario
@receiver(post_save, sender=User)
def crear_perfil(sender, instance, created, **kwargs):
    if created:
        Perfil.objects.create(usuario=instance)

@receiver(post_save, sender=User)
def guardar_perfil(sender, instance, **kwargs):
    instance.perfil.save()
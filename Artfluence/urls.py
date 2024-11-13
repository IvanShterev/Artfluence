
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('Artfluence.NoUser.urls')),
    path('', include('Artfluence.accounts.urls')),
]

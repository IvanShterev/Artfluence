from django.urls import path
from .views import *

urlpatterns = [
    path('gallery/', Gallery.as_view(), name='gallery'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
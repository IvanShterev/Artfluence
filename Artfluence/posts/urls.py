from django.urls import path
from .views import *

urlpatterns = [
    path('profile/<str:username>/create-post/', PostCreateView.as_view(), name='create-post'),
]
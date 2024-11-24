from django.urls import path
from .views import *

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', logout_view, name='logout'),
    path('profile/<str:username>/edit', EditProfileView.as_view(), name='edit-profile'),
    path('api/delete-account/', DeleteAccount.as_view(), name='delete-account'),
]
from django.urls import path
from .views import *

urlpatterns = [
    path('gallery/', Gallery.as_view(), name='gallery'),
    path('profile/<str:username>/', ProfileView.as_view(), name='profile'),
    path('profile/<str:username>/add-debit-card/', DebitCardManagementView.as_view(), name='add-debit-card'),
    path('top-liked-posts/', top_liked_posts, name='top-liked-posts'),
]
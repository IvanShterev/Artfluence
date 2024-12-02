from django.urls import path, include
from rest_framework import routers
from rest_framework.routers import DefaultRouter

from .views import *
from ..posts.views import PostViewSet

router = routers.DefaultRouter()
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('gallery/', Gallery.as_view(), name='gallery'),
    path('profile/<str:username>/', ProfileView.as_view(), name='profile'),
    path('api/users/<str:username>/posts/', UserPostsAPIView.as_view(), name='user-posts-api'),
    path('profile/<str:username>/add-debit-card/', UserDebitCardListView.as_view(), name='add-debit-card'),
    path('api/add-debit-card/', AddDebitCardAPIView.as_view(), name='add-debit-card-api'),
    path('profile/<str:username>/debit-cards/<int:pk>/', DeleteDebitCard.as_view(), name='delete_debit_card'),
    path('profile/<str:username>/debit-cards/<int:pk>/set-default/', SetDefaultDebitCard.as_view(), name='set_default_card'),
    path('profile/<str:username>/buy-ap/', BuyArtfluencePointsTemplateView.as_view(), name='buy-ap'),
    path('api/buy-ap/', BuyArtfluencePointsView.as_view(), name='buy-ap-api'),
    path('buy-art/<int:post_id>/', BuyArtView.as_view(), name='buy-art'),
    path('profile/<str:username>/transfer/', TransferTemplateView.as_view(), name='transfer'),
    path('api/transfer/', Transfer.as_view(), name='transfer-api'),
]
from .views import *

from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'posts', PostViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('profile/<str:username>/create-post/', PostCreateView.as_view(), name='create-post'),
    path('profile/<str:username>/post/<int:pk>/edit/', EditPostView.as_view(), name='edit_post'),
    # path('like/<int:pk>/', LikePostView.as_view(), name='like-post'),
    # path('comment/<int:pk>/', CommentPostView.as_view(), name='comment-post'),
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
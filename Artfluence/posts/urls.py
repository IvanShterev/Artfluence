from django.urls import path
from .views import *

urlpatterns = [
    path('profile/<str:username>/create-post/', PostCreateView.as_view(), name='create-post'),
    path('profile/<str:username>/post/<int:pk>/edit/', EditPostView.as_view(), name='edit_post'),
    # path('like/<int:pk>/', LikePostView.as_view(), name='like-post'),
    # path('comment/<int:pk>/', CommentPostView.as_view(), name='comment-post'),
]
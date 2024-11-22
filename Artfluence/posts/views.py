from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from django.http import HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.views import View
from django.views.generic.edit import CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, get_object_or_404
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, Comment
from .forms import PostForm
from .serializers import CommentSerializer, PostSerializer
from rest_framework import permissions, viewsets

from ..accounts.models import ArtfluenceUser
from ..accounts.serializers import UserSerializer


class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm
    template_name = 'posts/create_post.html'

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('gallery')


class EditPostView(LoginRequiredMixin, UpdateView):
    model = Post
    form_class = PostForm
    template_name = 'posts/edit_post.html'
    context_object_name = 'post'

    def get_queryset(self):
        return Post.objects.filter(owner=self.request.user)

    def get_object(self, queryset=None):
        pk = self.kwargs.get('pk')
        return get_object_or_404(Post, pk=pk, owner=self.request.user)

    def get_success_url(self):
        return reverse_lazy('profile', kwargs={'username': self.kwargs.get('username')})

class PostViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows posts to be viewed or edited.
    """
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['GET']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = ArtfluenceUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['GET']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

# class LikePostView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request, pk):
#         try:
#             post = Post.objects.get(pk=pk)
#             if post.is_liked_by(request.user):
#                 post.unlike_post(request.user)
#             else:
#                 post.like_post(request.user)
#             return Response({'likes_count': post.likes.count()})
#         except Post.DoesNotExist:
#             return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
#
#
# class CommentPostView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def post(self, request, pk):
#         try:
#             post = Post.objects.get(pk=pk)
#             serializer = CommentSerializer(data=request.data)
#             if serializer.is_valid():
#                 serializer.save(creator=request.user, post=post)
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         except Post.DoesNotExist:
#             return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
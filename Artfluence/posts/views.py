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
from .serializers import CommentSerializer


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
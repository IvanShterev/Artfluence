from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly, BasePermission
from django.urls import reverse, reverse_lazy
from django.views.generic.edit import CreateView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Post, Comment
from .forms import PostForm
from .serializers import CommentSerializer, PostSerializer
from rest_framework import permissions, viewsets
from ..accounts.models import ArtfluenceUser
from ..accounts.serializers import UserSerializer


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            owner_id = request.data.get('owner')
            return str(owner_id) == str(request.user.id) if owner_id else True
        return True


class PostCreateView(LoginRequiredMixin, CreateView):
    model = Post
    form_class = PostForm
    template_name = 'posts/create_post.html'

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)

    def form_invalid(self, form):
        return self.render_to_response(self.get_context_data(form=form))

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


class DeletePostView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def delete(self, request, pk, *args, **kwargs):
        post = get_object_or_404(Post, pk=pk, owner=request.user)
        post.delete()
        return Response({"message": "Post deleted successfully."}, status=204)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['GET']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('search')

        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(owner__username__icontains=search_query)
            )

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True

        return Response({
            "liked": liked,
            "likes_count": post.likes.count(),
        })

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def comments(self, request, pk=None):
        post = self.get_object()
        comments = post.comments.all().order_by('-id')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_comment(self, request, pk=None):
        post = self.get_object()
        content = request.data.get('content').strip()
        if not content:
            return Response({'error': 'Content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
        comment = Comment.objects.create(post=post, creator=request.user, content=content)
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    queryset = ArtfluenceUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ['GET']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]


class UpdateCommentAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def patch(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id, creator=request.user)
        data = request.data
        new_content = data.get('content')

        if not new_content:
            return Response({'error': 'Content is required'}, status=400)

        comment.content = new_content
        comment.save()
        return Response({'message': 'Comment updated successfully', 'content': comment.content}, status=200)


class DeleteCommentAPIView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id, creator=request.user)
        comment.delete()
        return Response(status=204)

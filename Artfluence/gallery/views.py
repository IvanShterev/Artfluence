
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from Artfluence.accounts.forms import DebitCardForm
from Artfluence.accounts.models import ArtfluenceUser, DebitCard
from Artfluence.posts.models import Post, Comment
from Artfluence.posts.serializers import PostSerializer, CommentSerializer


class Gallery(ListView):
    model = Post
    template_name = 'gallery/gallery.html'
    context_object_name = 'posts'
    queryset = Post.objects.prefetch_related('likes', 'comments__creator').select_related('owner')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['search_query'] = self.request.GET.get('search', '')

        for post in context['posts']:
            post.likes_count = post.likes.count()
            post.comments_count = post.comments.count()
            post.is_liked_by_user = post.is_liked_by(self.request.user)

        return context

    def post(self, request, *args, **kwargs):
        post_id = request.POST.get("post_id")
        post = get_object_or_404(Post, id=post_id)

        if "comment" in request.POST:
            content = request.POST.get("comment_content")
            if content:
                Comment.objects.create(post=post, creator=request.user, content=content)

        return redirect("gallery")


# class ProfileView(LoginRequiredMixin, DetailView):
#     model = ArtfluenceUser
#     template_name = "gallery/profile.html"
#     context_object_name = "user"
#
#     def get_object(self, **kwargs):
#         username = self.kwargs.get('username')
#         return get_object_or_404(self.model, username=username)
#
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         user = self.get_object()
#
#         user_posts = Post.objects.filter(owner=user)
#
#         context['collection'] = user_posts.filter(for_sale=False)
#         context['for_sale'] = user_posts.filter(for_sale=True)
#         context['liked_posts'] = Post.objects.filter(likes=self.request.user)
#         context['user_comments'] = Comment.objects.filter(creator=self.request.user)
#         context['is_owner'] = self.request.user == user
#         return context
class ProfileView(LoginRequiredMixin, DetailView):
    model = ArtfluenceUser
    template_name = "gallery/profile.html"
    context_object_name = "user"

    def get_object(self, **kwargs):
        username = self.kwargs.get('username')
        return get_object_or_404(self.model, username=username)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.get_object()

        # Fetch posts owned by the profile user
        user_posts = Post.objects.filter(owner=user)

        # Annotate posts in 'collection' and 'for_sale' with 'is_liked_by_user'
        collection_posts = user_posts.filter(for_sale=False)
        for_sale_posts = user_posts.filter(for_sale=True)

        for post in collection_posts:
            post.is_liked_by_user = post.likes.filter(id=self.request.user.id).exists()

        for post in for_sale_posts:
            post.is_liked_by_user = post.likes.filter(id=self.request.user.id).exists()

        context['collection'] = collection_posts
        context['for_sale'] = for_sale_posts

        # Additional context for liked posts and user comments
        context['liked_posts'] = Post.objects.filter(likes=self.request.user)
        context['user_comments'] = Comment.objects.filter(creator=self.request.user)

        # Check if the profile belongs to the currently logged-in user
        context['is_owner'] = self.request.user == user

        return context

# new!!!!!!!!!!!!!!
class UserPostsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username, *args, **kwargs):
        user = get_object_or_404(ArtfluenceUser, username=username)
        user_posts = Post.objects.filter(owner=user)

        collection = user_posts.filter(for_sale=False)
        for_sale = user_posts.filter(for_sale=True)

        # Annotate posts with is_liked_by_user
        for post in collection:
            post.is_liked_by_user = post.likes.filter(id=request.user.id).exists()

        for post in for_sale:
            post.is_liked_by_user = post.likes.filter(id=request.user.id).exists()

        # Serialize the data
        collection_data = PostSerializer(collection, many=True, context={'request': request}).data
        for_sale_data = PostSerializer(for_sale, many=True, context={'request': request}).data

        return Response({
            'collection': collection_data,
            'for_sale': for_sale_data,
        })


class DebitCardManagementView(LoginRequiredMixin, TemplateView):
    template_name = "gallery/add_debit_card.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['debit_cards'] = self.request.user.debit_cards.all()
        context['form'] = DebitCardForm()
        return context

    def post(self, request, *args, **kwargs):
        form = DebitCardForm(request.POST)
        if form.is_valid():
            debit_card = form.save(commit=False)
            debit_card.owner = self.request.user
            debit_card.save()
            return redirect('profile', username=self.request.user.username)
        context = self.get_context_data()
        context['form'] = form
        return self.render_to_response(context)


def top_liked_posts(request):
    posts = Post.objects.annotate(likes_count=Count('likes')).order_by('-likes_count')[:5]
    starting_counter = 5
    posts = list(reversed(posts))

    for post in posts:
        post.is_liked_by_user = request.user in post.likes.all()
        post.likes_count = post.likes.count()
        post.comments_count = post.comments.count()

    return render(request, 'gallery/top_five.html', {'posts': posts, 'starting_counter': starting_counter})
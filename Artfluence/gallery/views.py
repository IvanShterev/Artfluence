from django.shortcuts import get_object_or_404
from django.views.generic import ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin
from Artfluence.accounts.models import ArtfluenceUser
from Artfluence.posts.models import Post, Comment


class Gallery(ListView):
    model = Post
    template_name = 'gallery/gallery.html'
    context_object_name = 'posts'
    queryset = Post.objects.prefetch_related('likes', 'comments__creator').select_related('owner')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        for post in context['posts']:
            post.likes_count = post.likes.count()
            post.comments_count = post.comments.count()
            post.is_liked_by_user = post.is_liked_by(self.request.user)

        return context


class ProfileView(LoginRequiredMixin, DetailView):
    model = ArtfluenceUser
    template_name = "gallery/profile.html"
    context_object_name = "user"

    def get_object(self, **kwargs):
        return get_object_or_404(self.model, pk=self.request.user.pk)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.get_object()
        context['collection'] = Post.objects.filter(owner=user, for_sale=False)
        context['for_sale'] = Post.objects.filter(owner=user, for_sale=True)
        return context
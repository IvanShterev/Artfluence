from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
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
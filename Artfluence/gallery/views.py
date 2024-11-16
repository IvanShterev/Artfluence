from django.shortcuts import get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

from Artfluence.accounts.forms import DebitCardForm
from Artfluence.accounts.models import ArtfluenceUser, DebitCard
from Artfluence.posts.models import Post, Comment


class Gallery(ListView):
    model = Post
    template_name = 'gallery/gallery.html'
    context_object_name = 'posts'
    queryset = Post.objects.prefetch_related('likes', 'comments__creator').select_related('owner')

    def get_queryset(self):
        return (
            Post.objects.prefetch_related('likes', 'comments__creator')
            .select_related('owner')
            .order_by('-created_at')
        )

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
        username = self.kwargs.get('username')
        return get_object_or_404(self.model, username=username)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.get_object()
        context['collection'] = Post.objects.filter(owner=user, for_sale=False)
        context['for_sale'] = Post.objects.filter(owner=user, for_sale=True)
        context['is_owner'] = self.request.user == user
        return context


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

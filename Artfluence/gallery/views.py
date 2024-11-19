from django.db.models import Count, Q
from django.shortcuts import get_object_or_404, redirect, render
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
        # return (
        #     Post.objects.prefetch_related('likes', 'comments__creator')
        #     .select_related('owner')
        #     .order_by('-created_at')
        # )
        queryset = Post.objects.prefetch_related('likes', 'comments__creator').select_related('owner')
        search_query = self.request.GET.get('search')

        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(owner__username__icontains=search_query)
            )

        return queryset.order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        for post in context['posts']:
            post.likes_count = post.likes.count()
            post.comments_count = post.comments.count()
            post.is_liked_by_user = post.is_liked_by(self.request.user)

        return context

    def post(self, request, *args, **kwargs):
        post_id = request.POST.get("post_id")
        post = get_object_or_404(Post, id=post_id)

        if "like" in request.POST:
            if post.likes.filter(id=request.user.id).exists():
                post.likes.remove(request.user)
            else:
                post.likes.add(request.user)

        elif "comment" in request.POST:
            content = request.POST.get("comment_content")
            if content:
                Comment.objects.create(post=post, creator=request.user, content=content)

        return redirect("gallery")


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

        user_posts = Post.objects.filter(owner=user)
        total_likes_received = user_posts.aggregate(total_likes=Count('likes'))['total_likes']
        total_comments_received = Comment.objects.filter(post__in=user_posts).count()

        context['collection'] = user_posts.filter(for_sale=False)
        context['for_sale'] = user_posts.filter(for_sale=True)
        context['liked_posts'] = Post.objects.filter(likes=self.request.user)
        context['user_comments'] = Comment.objects.filter(creator=self.request.user)
        context['total_likes_received'] = total_likes_received or 0
        context['total_comments_received'] = total_comments_received or 0
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


def top_liked_posts(request):
    posts = Post.objects.annotate(likes_count=Count('likes')).order_by('likes_count')[:5]
    starting_counter = 5

    for post in posts:
        post.is_liked_by_user = request.user in post.likes.all()
        post.likes_count = post.likes.count()
        post.comments_count = post.comments.count()

    return render(request, 'gallery/top_five.html', {'posts': posts, 'starting_counter': starting_counter})
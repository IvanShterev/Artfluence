import json

from django.contrib.auth.decorators import login_required
from django.db.models import Count, Q
from django.http import JsonResponse, HttpResponseNotAllowed
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
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

        context['search_query'] = self.request.GET.get('search')

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

        collection_posts = user_posts.filter(for_sale=False)
        for_sale_posts = user_posts.filter(for_sale=True)

        for post in collection_posts:
            post.is_liked_by_user = post.likes.filter(id=self.request.user.id).exists()

        for post in for_sale_posts:
            post.is_liked_by_user = post.likes.filter(id=self.request.user.id).exists()

        context['collection'] = collection_posts
        context['for_sale'] = for_sale_posts

        context['liked_posts'] = Post.objects.filter(likes=self.request.user)
        context['user_comments'] = Comment.objects.filter(creator=self.request.user)

        context['is_owner'] = self.request.user == user

        return context


class UserPostsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username, *args, **kwargs):
        user = get_object_or_404(ArtfluenceUser, username=username)
        user_posts = Post.objects.filter(owner=user)

        collection = user_posts.filter(for_sale=False)
        for_sale = user_posts.filter(for_sale=True)

        for post in collection:
            post.is_liked_by_user = post.likes.filter(id=request.user.id).exists()

        for post in for_sale:
            post.is_liked_by_user = post.likes.filter(id=request.user.id).exists()

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
            return redirect('add-debit-card', username=self.request.user.username)
        context = self.get_context_data()
        context['form'] = form
        return self.render_to_response(context)


class DeleteDebitCard(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, *args, **kwargs):
        debit_card = get_object_or_404(DebitCard, pk=pk, owner=request.user)
        debit_card.delete()
        return Response({"message": "Removed card successfully"}, status=204)


class SetDefaultDebitCard(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        debit_card = get_object_or_404(DebitCard, pk=pk, owner=request.user)

        DebitCard.objects.filter(owner=request.user, used_for_payments=True).update(used_for_payments=False)

        debit_card.used_for_payments = True
        debit_card.save()

        return Response({"message": "Card set as default for payments"})


class BuyArtfluencePointsTemplateView(TemplateView):
    template_name = "gallery/buy_ap.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        card = DebitCard.objects.filter(owner=user, used_for_payments=True).first()

        context['card'] = card
        return context


class BuyArtfluencePointsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ap_amount = request.data.get('ap_amount')

        if not ap_amount or int(ap_amount) <= 0:
            return Response({"message": "Enter a valid AP amount."}, status=status.HTTP_400_BAD_REQUEST)

        euro_equivalent = int(ap_amount) / 100

        user = request.user
        card = user.debit_cards.filter(used_for_payments=True).first()

        if not card:
            return Response({"message": "No payment card is set for purchases."}, status=status.HTTP_400_BAD_REQUEST)

        user.artfluence_points += int(ap_amount)
        user.save()

        return Response(
            {
                "message": f"You have successfully purchased {ap_amount} AP for €{euro_equivalent:.2f}.",
                "ap_purchased": ap_amount,
                "euro_cost": euro_equivalent,
            },
            status=status.HTTP_200_OK
        )


class TransferTemplateView(TemplateView):
    template_name = "gallery/transfer.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        card = DebitCard.objects.filter(owner=user, used_for_payments=True).first()

        context['card'] = card
        return context


class Transfer(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ap_amount = request.data.get('ap_amount')

        if not ap_amount or int(ap_amount) <= 0:
            return Response({"message": "Enter a valid AP amount."}, status=status.HTTP_400_BAD_REQUEST)

        ap_amount = int(ap_amount)
        euro_equivalent = ap_amount / 100

        user = request.user

        if user.artfluence_points < ap_amount:
            return Response(
                {"message": "You do not have enough Artfluence Points for this conversion."},
                status=status.HTTP_400_BAD_REQUEST
            )

        card = user.debit_cards.filter(used_for_payments=True).first()

        if not card:
            return Response({"message": "No payment card is set for withdrawals."}, status=status.HTTP_400_BAD_REQUEST)

        user.artfluence_points -= ap_amount
        user.save()

        return Response(
            {
                "message": f"You have successfully converted {ap_amount} AP into €{euro_equivalent:.2f}.",
                "ap_converted": ap_amount,
                "euro_equivalent": euro_equivalent,
            },
            status=status.HTTP_200_OK
        )


class BuyArtView(APIView):

    def get(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)

        return render(request, 'gallery/buy_art.html', {'post': post})

    def patch(self, request, post_id):
        body = json.loads(request.body)
        post_id = body.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        user = request.user
        seller = post.owner

        if user.artfluence_points < post.price:
            return Response({'success': False, 'error': 'Not enough AP'}, status=400)

        user.artfluence_points -= post.price
        user.save()

        seller.artfluence_points += post.price
        seller.save()

        post.owner = user
        post.for_sale = False
        post.save()

        redirect_url = f'/profile/{user.username}/'

        return JsonResponse({'success': True, 'redirect_url': redirect_url}, status=200)

# def top_liked_posts(request):
#     posts = Post.objects.annotate(likes_count=Count('likes')).order_by('-likes_count')[:5]
#     starting_counter = 5
#     posts = list(reversed(posts))
#
#     for post in posts:
#         post.is_liked_by_user = request.user in post.likes.all()
#         post.likes_count = post.likes.count()
#         post.comments_count = post.comments.count()
#
#     return render(request, 'gallery/top_five.html', {'posts': posts, 'starting_counter': starting_counter})


class TopFivePostsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Fetch the top 5 posts with the most likes
        top_posts = Post.objects.annotate(likes_count=Count('likes')).order_by('-likes_count')[:5]

        # Annotate each post with whether it's liked by the user
        for post in top_posts:
            post.is_liked_by_user = post.likes.filter(id=request.user.id).exists()

        if request.headers.get('Accept', '').lower() == 'text/html':
            return render(request, 'gallery/top_five.html', {'posts': top_posts})

        # Serialize the data
        top_posts_data = PostSerializer(top_posts, many=True, context={'request': request}).data

        return Response({
            'top_five_posts': top_posts_data,
        })
from django.db import models
from django.utils.timezone import now

from Artfluence.accounts.models import ArtfluenceUser


class Post(models.Model):
    owner = models.ForeignKey(
        to=ArtfluenceUser,
        on_delete=models.CASCADE,
        related_name='owned_posts'
    )
    title = models.CharField(
        max_length=15,
    )
    for_sale = models.BooleanField(
        default=False,
    )
    likes = models.ManyToManyField(
        to=ArtfluenceUser,
        blank=True,
        related_name='liked_posts'
    )
    price = models.IntegerField(
        null=True,
        blank=True,
    )
    image = models.ImageField(
        upload_to='art_pictures/',
    )
    created_at = models.DateTimeField(
        default=now,
        editable=False
    )
    def is_liked_by(self, user):
        return self.likes.filter(id=user.id).exists()


class Comment(models.Model):
    content = models.TextField(
        max_length=200,
    )
    creator = models.ForeignKey(
        to=ArtfluenceUser,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    post = models.ForeignKey(
        to=Post,
        on_delete=models.CASCADE,
        related_name='comments'
    )

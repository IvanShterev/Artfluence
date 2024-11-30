from django.db import models
from django.utils.timezone import now

from Artfluence.accounts.models import ArtfluenceUser
from Artfluence.posts.validators import validate_file_size


class Post(models.Model):
    owner = models.ForeignKey(
        to=ArtfluenceUser,
        on_delete=models.CASCADE,
        related_name='owned_posts'
    )
    title = models.CharField(
        max_length=30,
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
        validators=[validate_file_size],
    )
    created_at = models.DateTimeField(
        default=now,
        editable=False
    )

    def is_liked_by(self, user):
        return self.likes.filter(id=user.id).exists()

    def __str__(self):
        return self.title


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

    def __str__(self):
        return self.content

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class ArtfluenceUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)


class ArtfluenceUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        default='profile_pictures/default_profile_pic.png'
    )
    artfluence_points = models.PositiveIntegerField(default=0)
    has_posted = models.BooleanField(default=False)
    has_sold_art = models.BooleanField(default=False)
    has_bought_art = models.BooleanField(default=False)

    objects = ArtfluenceUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

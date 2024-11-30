from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinLengthValidator, RegexValidator
import hashlib
from django.db import models
from django.utils.crypto import get_random_string


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

    objects = ArtfluenceUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username


class DebitCard(models.Model):
    owner = models.ForeignKey(
        to='ArtfluenceUser',
        on_delete=models.CASCADE,
        related_name='debit_cards'
    )
    card_number = models.CharField(
        max_length=16,
        validators=[MinLengthValidator(16), RegexValidator(
            regex=r'^\d{16}$',
            message='Card number must contain exactly 16 digits.',
        )]
    )
    holder_name = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(4), RegexValidator(
            regex=r'^[A-Za-z\s]+$',
            message="Cardholder name must contain only letters and spaces."
        )]
    )
    expiration_date = models.DateField()
    cvv = models.CharField(
        max_length=3,
        validators=[MinLengthValidator(3), RegexValidator(
            regex=r'^\d{3}$',
            message="CVV must be exactly 3 digits."
        )]
    )
    used_for_payments = models.BooleanField(default=False)

    def formatted_expiration_date(self):
        return self.expiration_date.strftime('%m/%y')

    def __str__(self):
        return f'**** **** **** {self.card_number[:4]}'

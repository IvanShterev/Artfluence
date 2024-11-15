# Generated by Django 5.1.1 on 2024-11-15 09:39

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_artfluenceuser_is_first_login'),
    ]

    operations = [
        migrations.CreateModel(
            name='DebitCard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('card_number', models.IntegerField(max_length=16, validators=[django.core.validators.MinLengthValidator(16), django.core.validators.RegexValidator(message='Card number must contain exactly 16 digits.', regex='^\\d{16}$')])),
                ('holder_name', models.CharField(max_length=100, validators=[django.core.validators.MinLengthValidator(4), django.core.validators.RegexValidator(message='Cardholder name must contain only letters and spaces.', regex='^[A-Za-z\\s]+$')])),
                ('expiration_date', models.DateField()),
                ('cvv', models.CharField(max_length=3, validators=[django.core.validators.MinLengthValidator(3), django.core.validators.RegexValidator(message='CVV must be exactly 3 digits.', regex='^\\d{3}$')])),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='debit_cards', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

# Generated by Django 5.1.1 on 2024-11-28 13:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_debitcard_used_for_payments'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='artfluenceuser',
            name='has_bought_art',
        ),
        migrations.RemoveField(
            model_name='artfluenceuser',
            name='has_posted',
        ),
        migrations.RemoveField(
            model_name='artfluenceuser',
            name='has_sold_art',
        ),
        migrations.RemoveField(
            model_name='artfluenceuser',
            name='is_first_login',
        ),
    ]

# Generated by Django 5.1.1 on 2024-11-15 07:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='artfluenceuser',
            name='is_first_login',
            field=models.BooleanField(default=True),
        ),
    ]

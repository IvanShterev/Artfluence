from django.apps import AppConfig
from django.db.models.signals import post_migrate


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Artfluence.accounts'

    def ready(self):
        from django.contrib.auth.models import Group, Permission
        from django.contrib.contenttypes.models import ContentType
        from Artfluence.posts.models import Post, Comment
        from .models import ArtfluenceUser

        def create_groups(sender, **kwargs):
            editor_group, _ = Group.objects.get_or_create(name='Editor')
            moderator_group, _ = Group.objects.get_or_create(name='Moderator')

            content_type_user = ContentType.objects.get_for_model(ArtfluenceUser)
            content_type_post = ContentType.objects.get_for_model(Post)
            content_type_comment = ContentType.objects.get_for_model(Comment)

            moderator_permissions = [
                Permission.objects.get(codename='change_artfluenceuser', content_type=content_type_user),
                Permission.objects.get(codename='view_artfluenceuser', content_type=content_type_user),
                Permission.objects.get(codename='delete_artfluenceuser', content_type=content_type_user),
                Permission.objects.get(codename='view_permission', content_type=ContentType.objects.get_for_model(Permission)),
                Permission.objects.get(codename='add_comment', content_type=content_type_comment),
                Permission.objects.get(codename='change_comment', content_type=content_type_comment),
                Permission.objects.get(codename='delete_comment', content_type=content_type_comment),
                Permission.objects.get(codename='view_comment', content_type=content_type_comment),
                Permission.objects.get(codename='change_post', content_type=content_type_post),
                Permission.objects.get(codename='delete_post', content_type=content_type_post),
                Permission.objects.get(codename='view_post', content_type=content_type_post),
            ]

            assign_editor_permission, _ = Permission.objects.get_or_create(
                codename='can_assign_editor_permissions',
                name='Can assign editor staff permission',
                content_type=content_type_user,
            )
            moderator_permissions.append(assign_editor_permission)

            moderator_group.permissions.set(moderator_permissions)

            editor_permissions = [
                Permission.objects.get(codename='view_artfluenceuser', content_type=content_type_user),
                Permission.objects.get(codename='view_comment', content_type=content_type_comment),
                Permission.objects.get(codename='change_comment', content_type=content_type_comment),
                Permission.objects.get(codename='delete_comment', content_type=content_type_comment),
                Permission.objects.get(codename='change_post', content_type=content_type_post),
                Permission.objects.get(codename='delete_post', content_type=content_type_post),
                Permission.objects.get(codename='view_post', content_type=content_type_post),
            ]

            editor_group.permissions.set(editor_permissions)

        post_migrate.connect(create_groups, sender=self)

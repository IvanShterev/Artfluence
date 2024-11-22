from rest_framework import serializers
from .models import ArtfluenceUser


class UserSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField()

    class Meta:
        model = ArtfluenceUser
        fields = '__all__'

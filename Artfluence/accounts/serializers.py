from rest_framework import serializers
from .models import ArtfluenceUser, DebitCard
import re


class UserSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField()

    class Meta:
        model = ArtfluenceUser
        fields = '__all__'


class DebitCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebitCard
        fields = ['card_number', 'holder_name', 'expiration_date', 'cvv']

    def validate_card_number(self, value):
        if len(value) != 16 or not value.isdigit():
            raise serializers.ValidationError("Card number must contain exactly 16 digits.")
        return value

    def validate_cvv(self, value):
        if len(value) != 3 or not value.isdigit():
            raise serializers.ValidationError("CVV must contain exactly 3 digits.")
        return value

    def validate_expiration_date(self, value):
        if not re.match(r'^(0[1-9]|1[0-2])\/[2-9][0-9]$', value):
            raise serializers.ValidationError("Expiration date must be in MM/YY format and valid.")
        return value

from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from backend.accounts.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """Serializer for displaying user information."""
    class Meta:
        model = CustomUser
        fields=['id', 'user_type', 'club_name', 'email', 'first_name', 'last_name']

class CreateUserSerializer(serializers.ModelSerializer):
    """Serializer for registering user"""
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'confirm_password', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Hasła muszą być takie same."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UpdateUserSerializer(serializers.ModelSerializer):
    """Serializer for updating user data"""

    class Meta:
        model = CustomUser
        fields = ['email', 'first_name', 'last_name']



class UpdateUserPasswordSerializer(serializers.Serializer):
    """Serializer for updating user password"""
    old_password = serializers.CharField(write_only=True, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "New passwords does not match!"})
        return attrs

    def update(self, instance, validated_data):
        old_password = validated_data.get('old_password')
        new_password = validated_data.get('new_password')
        if not instance.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Wrong password!"})
        instance.set_password(new_password)
        instance.save()
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Enables login via email not username
    """
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            'user_id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        })
        return data
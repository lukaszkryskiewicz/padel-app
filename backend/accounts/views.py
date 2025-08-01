from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from backend.accounts.models import CustomUser
from backend.accounts.serializers import CreateUserSerializer, UserSerializer, UpdateUserSerializer, \
    UpdateUserPasswordSerializer, CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """POST: Register user"""
    queryset = CustomUser.objects.all()
    serializer_class = CreateUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class EditUserView(generics.RetrieveUpdateAPIView):
    """
    GET: Returns logged-in user's info
    PATCH: Updates logged-in user's info
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UpdateUserSerializer
        return UserSerializer

class ChangePasswordView(generics.UpdateAPIView):
    """
    PATCH: Change user's password.
    """
    serializer_class = UpdateUserPasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.update(user, serializer.validated_data)
        return Response({"detail": "SUccesfully changed password."}, status=status.HTTP_200_OK)

class AdminEditUserView(generics.RetrieveUpdateAPIView):
    """
    GET: Returns user info by user_id
    PATCH: Updates user info by user_id
    """

    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UpdateUserSerializer
        return UserSerializer

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        return get_object_or_404(CustomUser, pk=user_id)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
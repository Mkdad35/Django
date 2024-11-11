from rest_framework_simplejwt.views import TokenObtainPairView , TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer , CustomTokenRefreshSerializer
from django.shortcuts import render
from rest_framework.views import APIView , status
from rest_framework.response import Response
from .decorators import jwt_required 
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import AccessToken , RefreshToken


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

def login_page(request):
    return render(request, './user/login.html')


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework.response import Response
from rest_framework import status

class CustomTokenVerificationView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            
            return Response({
                'message': 'Tokens are valid',
                'access': request.data.get('token'),
                'refresh': request.data.get('refresh', None),  # Optionally return refresh token if provided
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)


class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer

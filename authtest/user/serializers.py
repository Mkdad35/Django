from rest_framework_simplejwt.serializers import TokenObtainPairSerializer , TokenRefreshSerializer
from django.conf import settings
from datetime import datetime, timezone
from rest_framework_simplejwt.tokens import RefreshToken

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # Add custom message with the username
        data['message'] = f"Welcome, {self.user.username}"

        # Get access and refresh tokens
        access_token = data['access']
        refresh_token = data['refresh']

        # Calculate expiry time in seconds
        utc_time_seconds = int(datetime.now(timezone.utc).timestamp())
        print((datetime.now(timezone.utc).timestamp()))
        accessExpiry = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds() + utc_time_seconds
        print(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds() , accessExpiry)

        # Add expiry times and lifetime to the response
        data['access_expiry'] = accessExpiry
        
        print("HERE" , data['access_expiry'])

        return data



from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from datetime import datetime, timezone
from rest_framework import serializers


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self , attrs):
        data = super().validate(attrs)
        
        refresh_token = attrs.get('refresh')
        if not refresh_token:
            raise serializers.ValidationError("Refresh token missing.")

        # Get a RefreshToken instance to generate a new access token
        refresh_token_instance = RefreshToken(refresh_token)

        # Generate new access token and calculate its expiration
        new_access_token = str(refresh_token_instance.access_token)
        
        utc_time_seconds = int(datetime.now(timezone.utc).timestamp())
        
        accessExpiry = settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds() + utc_time_seconds
        
        print("Refresh:" , accessExpiry)
        
        data['access_expiry'] = accessExpiry
        
        data['access'] = new_access_token
        
        return data
        
from django.urls import path , include
from rest_framework_simplejwt.views import TokenRefreshView , TokenObtainPairView , TokenVerifyView
from .views import CustomTokenObtainPairView , login_page , CustomTokenVerificationView , CustomTokenRefreshView

urlpatterns = [

    path('login/', login_page, name='login_page'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', CustomTokenVerificationView.as_view(), name='verify-token'),
    
    ]
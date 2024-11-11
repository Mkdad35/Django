from functools import wraps
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.http import JsonResponse
from rest_framework.request import Request

def jwt_required(view_func):
    @wraps(view_func)
    def wrapped_view(request: Request, *args, **kwargs):
        # Access the Authorization header using request.META
        auth_header = request.META.get('HTTP_AUTHORIZATION')  # Access via META
        print(f"Here Authorization Header: {auth_header}")  # Debugging line

        if auth_header:
            try:
                # Extract the token from the header
                token = auth_header.split()[1]
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                request.user = jwt_auth.get_user(validated_token)  # Attach user to request
                print(f"User: {request.user}")  # Debugging line
            except AuthenticationFailed:
                return JsonResponse({'error': 'Authentication failed'}, status=401)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=401)
        else:
            return JsonResponse({'error': 'Authorization header missing'}, status=401)

        # Call the actual view function and pass the request
        return view_func(request, *args, **kwargs)  # Pass request here

    return wrapped_view

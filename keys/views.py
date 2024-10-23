from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
import os


User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def index(request):
    if request.method == 'GET':
        response = os.getenv('AILAB_API_KEY')
        return Response({"key": response}, status=status.HTTP_200_OK)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from shinhan_api.exchange_rate import exchange_rate


User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def index(request):
    user = request.user
    if request.method == 'GET':
        response = exchange_rate(user.email)['REC']
        return Response(response, status=status.HTTP_200_OK)
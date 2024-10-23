from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from shinhan_api.demand_deposit import inquire_demand_deposit_account_list


User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def index(request):
    user = request.user
    if request.method == 'GET':
        response = []
        for i in inquire_demand_deposit_account_list(user.email)['REC']:
            response.append({'bankName': i['bankName'], 'accountNo': i['accountNo'], 'accountBalance': i['accountBalance']})
        return Response(response, status=status.HTTP_200_OK)
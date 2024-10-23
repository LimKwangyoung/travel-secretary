from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserCreationSerializer, UserSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth import logout as auth_logout
from django.contrib.auth import login as auth_login
from shinhan_api.member import signup as shinhan_signup
from shinhan_api.member import search
from shinhan_api.demand_deposit import create_demand_deposit_account
from rest_framework.authtoken.models import Token
import requests
from django.shortcuts import redirect
from django.conf import settings
from social_django.models import UserSocialAuth
import os
from dotenv import load_dotenv
import requests, json

load_dotenv()


User = get_user_model()


@api_view(['GET'])
def kakao_callback(request):
    code = request.GET.get('code')
    if os.getenv('DJANGO_ENV') == 'production':
        return redirect(f"{settings.SOCIAL_AUTH_LOGIN_REDIRECT_URL}/?code={code}")
    ######################
    # 인가 코드를 사용해 액세스 토큰 발급
    access_token = get_kakao_access_token(code)
    if not access_token:
        return Response({"error": 'access_token 발급 실패'}, status=status.HTTP_204_NO_CONTENT)
    
    # 액세스 토큰을 사용해 사용자 정보 조회
    kakao_user_info = get_kakao_user_info(access_token)
    if not kakao_user_info:
        return Response({"error": 'user_info 조회 실패'}, status=status.HTTP_204_NO_CONTENT)

    kakao_user_id = kakao_user_info['id']

    try:
        social_user = UserSocialAuth.objects.get(provider='kakao', uid=kakao_user_id)
        user = social_user.user
    except UserSocialAuth.DoesNotExist:
        user = User.objects.create(username=f'kakao_{kakao_user_id}')
        UserSocialAuth.objects.create(user=user, provider='kakao', uid=kakao_user_id)

    auth_login(request, user)
    social = request.user.social_auth.get(provider='kakao')
    social.extra_data['access_token'] = access_token
    social.save()
    token, created = Token.objects.get_or_create(user=user)
    if not request.user.user_key:  # 처음 로그인한 사람, 이미 로그인되어있는 사람은 user_key 다 있음
        create_account(request.user, kakao_user_id)
    return Response({'token': token.key,  'user_info': kakao_user_info, 'user': request.user.username}, status=status.HTTP_200_OK)
    ######################


@api_view(['POST'])
def get_token(request):
    code = request.data.get('code')
    
    # 인가 코드를 사용해 액세스 토큰 발급
    access_token = get_kakao_access_token(code)
    if not access_token:
        return Response({"error": 'access_token 발급 실패'}, status=status.HTTP_204_NO_CONTENT)
    
    # 발급받은 액세스 토큰으로 사용자 정보 조회
    kakao_user_info = get_kakao_user_info(access_token)
    if not kakao_user_info:
        return Response({"error": 'user_info 조회 실패'}, status=status.HTTP_204_NO_CONTENT)

    kakao_user_id = kakao_user_info['id']

    try:
        # 카카오 로그인된 유저가 있는지 확인
        social_user = UserSocialAuth.objects.get(provider='kakao', uid=kakao_user_id)
        user = social_user.user
    except UserSocialAuth.DoesNotExist:
        # 새로운 사용자 생성 및 카카오 소셜 인증 생성
        user = User.objects.create(username=f'kakao_{kakao_user_id}')
        UserSocialAuth.objects.create(user=user, provider='kakao', uid=kakao_user_id)

    # 로그인 처리
    auth_login(request, user)
    
    social = request.user.social_auth.get(provider='kakao')
    social.extra_data['access_token'] = access_token
    social.save()
    token, created = Token.objects.get_or_create(user=user)
    if not request.user.user_key:  # 처음 로그인한 사람, 이미 로그인되어있는 사람은 user_key 다 있음
        create_account(request.user, kakao_user_id)
    return Response({"token": token.key, 'user_info': kakao_user_info}, status=status.HTTP_200_OK)


def create_account(user, user_id):
    email = f"{user_id}ssafy@naver.com"
    response = shinhan_signup(email)
    flag = 1
    if 'userKey' in response:
        user_key = response['userKey']
    else:
        user_key = search(email)['userKey']
        flag = 0
    user.email = email
    user.user_key = user_key
    user.user_id = user_id
    user.save()
    if flag:
        create_demand_deposit_account(email)
    return 


def get_kakao_access_token(code):
    url = 'https://kauth.kakao.com/oauth/token'
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    data = {
        'grant_type': 'authorization_code',
        'client_id': f'{settings.SOCIAL_AUTH_KAKAO_KEY}',
        'code': code,
    }

    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        return response.json().get('access_token')
    else:
        return None
    
    
def get_kakao_user_info(access_token):
    url = 'https://kapi.kakao.com/v2/user/me'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        return None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    auth_logout(request)
    return Response({"message": "로그아웃 완료"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend(request):
    url = 'https://kapi.kakao.com/v1/api/talk/friends'
    social = request.user.social_auth.get(provider='kakao')
    access_token = social.extra_data['access_token']
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    response = requests.get(url, headers=headers)
    data = []
    for i in response.json()['elements']:
        temp = {'profile_nickname': i['profile_nickname'], 
                'profile_thumbnail_image': i['profile_thumbnail_image'], 
                'id': i['id'], 
                'uuid': i['uuid'], 
                }
        data.append(temp)
    if response.status_code == 200:
        return Response(data, status=status.HTTP_200_OK)
    if response.status_code == 401:
        return Response({'error': "카카오 로그인이 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({'error': [response.status_code, response.text]}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    social = request.user.social_auth.get(provider='kakao')
    access_token =  social.extra_data['access_token']
    url = "https://kapi.kakao.com/v1/api/talk/friends/message/send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    trip_name = request.data.get('trip_name')
    trip_id = request.data.get('trip_id')
    uuid_list = request.data.get('uuid_list')
    
    template_args = {
        'trip_name': trip_name, 
        'trip_id': trip_id, 
    }
    
    # 메시지 템플릿 데이터
    data = {
        'receiver_uuids': f'{uuid_list}',  # 친구들의 uuid 배열
        'template_id': '112658', 
        'template_args': json.dumps(template_args), 
    }

    response = requests.post(url, headers=headers, data=data)
    return
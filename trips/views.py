from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import TripCreateSerializer, TripSerializer, TripMainSerializer, MemberDetailSerializer
from .models import Trip, Member
from django.utils import timezone
from accounts.serializers import UserSerializer
import requests


User = get_user_model()

@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def create_trip(request):
    if request.method == 'POST':
        serializer = TripCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            trip = serializer.save()
            Member.objects.create(trip=trip, user=request.user, bank_account=request.data.get('bank_account'), is_participate=True, bank_name=request.data.get('bank_name'))
            return Response({"id": trip.pk}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'PUT':
        trip_id = request.data.get('trip_id')
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = TripCreateSerializer(trip, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            trip = serializer.save()
            return Response({"id": trip.pk}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend(request):
    url = 'https://kapi.kakao.com/v1/api/talk/friends'
    
    social = request.user.social_auth.get(provider='kakao')
    access_token =  social.extra_data['access_token']
    
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
        

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list(request):
    if request.method == 'GET':
        current_date = timezone.now().date()
        trips = Trip.objects.filter(
            member__user=request.user,
            member__is_participate=True
        ).order_by('start_date')

        past_trips = trips.filter(end_date__lt=current_date)
        current_trips = trips.filter(start_date__lte=current_date, end_date__gte=current_date)
        future_trips = trips.filter(start_date__gt=current_date)

        past_serializer = TripSerializer(past_trips, many=True)
        current_serializer = TripSerializer(current_trips, many=True)
        future_serializer = TripSerializer(future_trips, many=True)

        return Response({
            'past_trips': past_serializer.data,
            'current_trips': current_serializer.data,
            'future_trips': future_serializer.data
        }, status=status.HTTP_200_OK)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail(request):
    if request.method == 'GET':
        trip_id = request.GET.get('trip_id')
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response({'error': '해당 아이디에 해당하는 Trip이 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        
        if not Member.objects.filter(trip=trip_id, user=request.user).exists():
            return Response({'error': "현재 사용자는 해당 여행에 참여하지 않았습니다."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = TripMainSerializer(trip)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def budget(request):
    if request.method == 'POST':
        trip_id = request.data.get('trip_id')
        budget = request.data.get('budget')
        member = Member.objects.get(trip_id=trip_id, user=request.user)
        member.budget = budget
        member.save()
        return Response({'budget': budget}, status=status.HTTP_202_ACCEPTED)
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_image(request):
    if request.method == 'POST':
        trip_id = request.data.get('trip_id')
        if not Member.objects.filter(trip=trip_id, user=request.user).exists():
            return Response({'error': "현재 사용자는 해당 여행에 참여하지 않았습니다."}, status=status.HTTP_401_UNAUTHORIZED)
        trip = Trip.objects.get(id=trip_id)
        trip.image_url = request.data.get('image_url')
        trip.save()
        return Response({'message': "image url이 성공적으로 저장되었습니다."}, status=status.HTTP_202_ACCEPTED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def invite(request):
    if request.method == 'POST':
        try:
            member = Member.objects.get(user=request.user, trip=request.data.get('trip_id'))
            if member.is_participate:
                return Response({"message": "이미 여행에 참가한 사용자입니다."}, status=status.HTTP_208_ALREADY_REPORTED)
            member.budget = request.data.get('budget')
            member.bank_account = request.data.get('bank_account')
            member.bank_name = request.data.get('bank_name')
            member.is_participate = True
            member.save()
            return Response({"message": "여행 참가가 완료되었습니다."}, status=status.HTTP_202_ACCEPTED)
        except:
            return Response({'message': "해당 사용자는 여행에 초대되지 않았습니다."}, status=status.HTTP_204_NO_CONTENT)
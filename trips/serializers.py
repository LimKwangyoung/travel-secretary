from rest_framework import serializers
from .models import Trip, Location, Member
from django.contrib.auth import get_user_model
from shinhan_api.demand_deposit import inquire_demand_deposit_account as account
import requests, json

User = get_user_model()

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['country']

class MemberUUIDSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    uuid = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Member
        fields = ['id', 'uuid', 'bank_account']

class TripCreateSerializer(serializers.ModelSerializer):
    locations = LocationSerializer(many=True, write_only=True)
    members = MemberUUIDSerializer(many=True, write_only=True)
    bank_account = serializers.CharField()

    class Meta:
        model = Trip
        fields = ['trip_name', 'start_date', 'end_date', 'bank_account', 'locations', 'members']

    def create(self, validated_data):
        locations_data = validated_data.pop('locations')
        members_data = validated_data.pop('members')

        trip = Trip.objects.create(start_date=validated_data.pop('start_date'), end_date=validated_data.pop('end_date'), trip_name=validated_data.pop('trip_name'))

        # 위치 데이터 저장
        for location_data in locations_data:
            Location.objects.create(trip=trip, **location_data)
        
        # 멤버 데이터 처리
        uuid_list = []
        for member_data in members_data:
            user_id = member_data['id']
            uuid = member_data['uuid']
            try:
                user = User.objects.get(user_id=user_id)
                if not uuid:  # 요청한 사용자인 경우
                    continue
                Member.objects.create(trip=trip, user=user)
                uuid_list.append(uuid)
            except User.DoesNotExist:
                continue
        request = self.context.get('request')
        send_message(request, uuid_list, trip.trip_name, trip.id)
        return trip

    def update(self, instance, validated_data):
        # 기존 Location과 Member 삭제
        Location.objects.filter(trip=instance).delete()
        Member.objects.filter(trip=instance).delete()
        
        locations_data = validated_data.pop('locations')
        members_data = validated_data.pop('members')

        # Trip의 기본 필드를 업데이트
        instance.trip_name = validated_data.get('trip_name', instance.trip_name)
        instance.start_date = validated_data.get('start_date', instance.start_date)
        instance.end_date = validated_data.get('end_date', instance.end_date)
        instance.save()

        # 새로운 Location 데이터 추가
        for location_data in locations_data:
            Location.objects.create(trip=instance, **location_data)

        # 새로운 Member 데이터 추가
        for member_data in members_data:
            email = member_data['user']['email']
            bank_account = member_data['bank_account']
            try:
                user = User.objects.get(email=email)
                Member.objects.create(trip=instance, user=user, bank_account=bank_account)
            except User.DoesNotExist:
                continue

        return instance


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['locations'] = LocationSerializer(instance.location_set.all().order_by('country', 'city'), many=True).data
        return representation


class MemberDetailSerializer(serializers.ModelSerializer):
    member = serializers.CharField(source='user.username')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    id = serializers.CharField(source='user.user_id')
    class Meta:
        model = Member
        fields = ['member', 'bank_account', 'bank_name', 'is_participate', 'first_name', 'last_name', 'id']
        
        
class TripMainSerializer(serializers.ModelSerializer):
    locations = LocationSerializer(many=True, read_only=True)
    members = MemberDetailSerializer(many=True, read_only=True)
    class Meta:
        model = Trip
        fields = ['start_date', 'end_date', 'locations', 'members', "image_url", 'trip_name']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['locations'] = LocationSerializer(instance.location_set.all().order_by('country', 'city'), many=True).data
        representation['members'] = MemberDetailSerializer(instance.member_set.all().order_by('user__username'), many=True).data
        # request = self.context.get('request')
        for member in representation['members']:
            # bank_account = member['bank_account']
            is_participate = member['is_participate']
            if not is_participate:
                continue
            # if request.user.username == member['member']:
            #     member_account = account(request.user.email, bank_account)['REC']
            #     member['balance'] = member_account['accountBalance']
        return representation
    
    
def send_message(request, uuid_list, trip_name, trip_id):
    social = request.user.social_auth.get(provider='kakao')
    access_token =  social.extra_data['access_token']

    url = "https://kapi.kakao.com/v1/api/talk/friends/message/send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    template_args = {
        'trip_name': trip_name, 
        'trip_id': trip_id, 
    }

    data = {
            'receiver_uuids': json.dumps(uuid_list), 
            'template_id': '112658', 
            'template_args': json.dumps(template_args), 
        }
    response = requests.post(url, headers=headers, data=data)
    return


class MemberUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'budget', 'bank_account', "bank_name", "is_participate"]
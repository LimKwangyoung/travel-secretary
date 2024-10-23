from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from shinhan_api.demand_deposit import inquire_demand_deposit_account_list

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['account_list'] = [{"bank_name": i['bankName'], 
                                           "bank_account": i["accountNo"], 
                                           "balance": i['accountBalance']} 
                                          for i in inquire_demand_deposit_account_list(representation['email'])['REC']] 
        return representation

class UserCreationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # fields = ['username', 'password', 'email', 'user_key']
        fields = ['username', 'password']

    def create(self, validated_data):
        if User.objects.filter(email=validated_data['username']).exists():
            raise ValidationError("이미 존재하는 이메일 혹은 닉네임입니다.")
        user = User(
            username=validated_data['username'],
            # user_key=validated_data['user_key']
        )
        user.set_password(validated_data['password'])  # 비밀번호 해시
        user.save()
        return user

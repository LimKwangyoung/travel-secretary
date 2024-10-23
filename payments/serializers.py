from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Payment, Calculate
from trips.models import Member, Trip
from shinhan_api.demand_deposit import update_demand_deposit_account_Transfer as transfer
from shinhan_api.demand_deposit import inquire_demand_deposit_account_balance as balance

User = get_user_model()


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['amount', 'pay_date', 'pay_time', 'brand_name', 'category', 'bank_account']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation
    
    
class CalculateSerializer(serializers.ModelSerializer):
    user_id = serializers.CharField(source='member.user.user_id', read_only=True)
    
    class Meta:
        model = Calculate
        fields = ['user_id', 'cost', 'remain_cost']
        
        
class PaymentDetailSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Payment
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        bank_account = representation['bank_account']

        user = Member.objects.filter(bank_account=bank_account).first().user
        representation['user_id'] = user.user_id
        
        calculates = Calculate.objects.filter(payment=instance)
        if calculates.exists():
            representation['is_completed'] = 1 if all(c.remain_cost == 0 for c in calculates) else 0
        else:
            representation['is_completed'] = 0
        representation['calculates'] = CalculateSerializer(calculates, many=True).data
        return representation


class BillSerializer(serializers.Serializer):
    cost = serializers.IntegerField()
    bank_account = serializers.CharField(max_length=30)


class PaymentSerializer(serializers.Serializer):
    payment_id = serializers.IntegerField()
    bills = serializers.ListField(child=BillSerializer())


class CalculateCreateSerializer(serializers.Serializer):
    trip_id = serializers.IntegerField()
    payments = serializers.ListField(child=PaymentSerializer())

    def create(self, validated_data):
        trip_id = validated_data['trip_id']
        result = {'payments': []}
        request = self.context.get('request')
        for payment_data in validated_data['payments']:
            payment_id = payment_data['payment_id']
            
            # payment가 존재하지 않으면
            try:
                payment = Payment.objects.get(id=payment_id)
            except:
                continue
            
            # 정산 총 금액이 결제 금액과 다를 경우
            bills_data = payment_data['bills']
            if payment.amount != sum(item['cost'] for item in bills_data):
                continue
            
            temp = {'payment_id': payment_id, 'bills': []}
            deposit_bank_account = payment.bank_account
            calculates = Calculate.objects.filter(payment_id=payment_id)
            
            for bill_data in bills_data:
                withdrawal_bank_account = bill_data['bank_account']
                cost = bill_data['cost']
                member = Member.objects.get(trip=trip_id, bank_account=withdrawal_bank_account)
                
                # 이미 정산 내역이 존재하는 경우
                if calculates:
                    calculate = calculates.get(member=member)
                    if deposit_bank_account == withdrawal_bank_account:
                        calculate.cost = cost
                        calculate.save()
                        temp['bills'].append({
                            'cost': cost,
                            'user_id': member.user.user_id,
                            'remain_cost': calculate.remain_cost
                        })
                        continue
                    transfer_cost = calculate.remain_cost
                    transfer_cost += (cost - calculate.cost)
                    if transfer_cost < 0:  # 받을 돈이 더 큰 경우, 총무가 일부 돌려주면 된다
                        response = transfer(request.user.email, withdrawal_bank_account, deposit_bank_account, -transfer_cost)
                    elif 0 < transfer_cost:  # 줄 돈이 더 큰 경우, 총무에게 더 주면 된다
                        response = transfer(member.user.email, deposit_bank_account, withdrawal_bank_account, transfer_cost)
                    else:
                        response = []
                    if 'Header' not in response:  # 송금이 정상적으로 진행되지 않은 경우, 잔액부족이던 뭐던
                        calculate.remain_cost = transfer_cost
                    else:  # 송금이 정상적으로 진행되었다면
                        calculate.remain_cost = 0  # 0
                    calculate.cost = cost
                    calculate.save()
                    
                    temp['bills'].append({
                        'cost': cost,
                        'user_id': member.user.user_id,
                        'remain_cost': calculate.remain_cost
                    })
                    continue
                
                # 첫 정산인 경우
                # 같은 계좌 또는 금액이 0인 경우
                if deposit_bank_account == withdrawal_bank_account or not cost:
                    self._create_calculate(payment, cost, 0, temp, member)
                    continue
                
                # 금액 이체 로직 처리
                response = transfer(member.user.email, deposit_bank_account, withdrawal_bank_account, cost)
                if 'Header' in response:
                    self._create_calculate(payment, cost, 0, temp, member)
                else:
                    self._create_calculate(payment, cost, cost, temp, member)
                    
            result['payments'].append(temp)
        return result
    
    def _create_calculate(self, payment, cost, remain_cost, temp, member):
        Calculate.objects.create(
            payment=payment,
            member=member,
            cost=cost,
            remain_cost=remain_cost
        )
        
        # 결과에 추가
        temp['bills'].append({
            'cost': cost,
            'user_id': member.user.user_id,
            'remain_cost': remain_cost
        })
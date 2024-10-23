from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Payment, Calculate
from trips.models import Member, Trip
from .serializers import PaymentCreateSerializer, PaymentDetailSerializer, CalculateCreateSerializer
from shinhan_api.demand_deposit import update_demand_deposit_account_withdrawal as withdrawal
from shinhan_api.demand_deposit import update_demand_deposit_account_Transfer as transfer
from shinhan_api.demand_deposit import inquire_demand_deposit_account_balance as balance
from shinhan_api.demand_deposit import inquire_demand_deposit_account, update_demand_deposit_account_withdrawal, update_demand_deposit_account_deposit
from chatgpt_api.api import categorize


User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay(request):
    if request.method == 'POST':
        data = request.data
        trip_id = data.get('trip_id')
        try:
            bank_account = Member.objects.get(trip=trip_id, user=request.user).bank_account
        except:
            return Response({'error': "여행 계좌가 등록되지 않았거나, 참여하지 않은 사용자입니다."})
        # withdrawal(bank_account, data.get('amount'), request.user.email)
        
        try:
            data['category'] = categorize(data.get('brand_name'))
        except:
            data['category'] = "미정"
        data['bank_account'] = bank_account
        serializer = PaymentCreateSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pay_list(request):
    if request.method == 'GET':
        trip_id = request.GET.get('trip_id')
        trip = Trip.objects.get(pk=trip_id)
        
        members = Member.objects.filter(trip=trip_id)
        if not members.filter(user=request.user).exists():
            return Response({'error': "현재 사용자는 해당 여행에 참여하지 않았습니다."}, status=status.HTTP_401_UNAUTHORIZED)
        
        bank_accounts = members.values_list('bank_account', flat=True)
        
        payments = Payment.objects.filter(
            bank_account__in=bank_accounts, 
            pay_date__gte=trip.start_date, 
            pay_date__lte=trip.end_date
        ).order_by('pay_date', 'pay_time')
        serializer = PaymentDetailSerializer(payments, many=True)
        member = Member.objects.get(user=request.user, trip=trip_id)
        initial_budget = member.budget
        used_budget = sum(Calculate.objects.filter(
            member=member,
            payment__pay_date__gte=trip.start_date,
            payment__pay_date__lte=trip.end_date
            ).values_list('cost', flat=True))
        remain_budget = initial_budget - used_budget
        budget = {"initial_budget": initial_budget, "used_budget": used_budget, "remain_budget": remain_budget}
        return Response({"payments_list": serializer.data, 'budget': budget}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def adjustment(request):
    if request.method == 'POST':
        payments = request.data.get('payments')
        if not payments:
            return Response({'error': '0개의 결제 내역에 대한 정산을 요청했습니다.'}, status=status.HTTP_204_NO_CONTENT)
        for payment in payments:
            payment_id = payment.get('payment_id')
            bank_account = Payment.objects.get(id=payment_id).bank_account
            if not Member.objects.filter(bank_account=bank_account, user=request.user).exists():
                return Response({'error': "현재 사용자는 해당 계좌를 사용하고 있지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = CalculateCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid(raise_exception=True):
            trip_id = request.data.get('trip_id')
            trip = Trip.objects.get(pk=trip_id)
            result = serializer.save()
            member = Member.objects.get(user=request.user, trip=trip_id)
            initial_budget = member.budget
            used_budget = sum(Calculate.objects.filter(
                member=member,
                payment__pay_date__gte=trip.start_date,
                payment__pay_date__lte=trip.end_date
                ).values_list('cost', flat=True))
            remain_budget = initial_budget - used_budget
            budget = {"initial_budget": initial_budget, "used_budget": used_budget, "remain_budget": remain_budget}
            result['budget'] = budget
            result['balance'] = balance(request.user.email, bank_account)['REC']['accountBalance']
            return Response(result, status=status.HTTP_201_CREATED)
        
        
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def objection(request):
    if request.method == 'POST':
        trip_id = request.data.get('trip_id')
        payment_id = request.data.get('payment_id')
        calculates = Calculate.objects.filter(payment=payment_id)
        
        if not Member.objects.filter(trip=trip_id, user=request.user).exists():
            return Response({'error': "현재 사용자는 해당 여행에 참여하지 않았습니다."}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not Calculate.objects.filter(payment=payment_id).exists():
            return Response({'error': "해당 결제는 정산이 완료되지 않은 결제입니다."}, status=status.HTTP_402_PAYMENT_REQUIRED)
        
        members = Member.objects.filter(trip=trip_id)
        result = {}
        for member in members:
            if member.bank_account:
                result[member.user.username] = {"before_balance": int(balance(member.user.email, member.bank_account)['REC']['accountBalance'])}  # 정산 전 잔액

        payment = Payment.objects.get(id=payment_id)
        withdrawal_bank_account = payment.bank_account
        withdrawal_user = Member.objects.filter(bank_account=withdrawal_bank_account)[0].user
        withdrawal_email = withdrawal_user.email
        username = withdrawal_user.username
        for calculate in calculates:
            deposit_user = calculate.member
            deposit_bank_account = deposit_user.bank_account
            transfer(withdrawal_email, deposit_bank_account, withdrawal_bank_account, calculate.cost)
            
        budget = {}
        trip = Trip.objects.get(id=trip_id)
        start_date = trip.start_date
        end_date = trip.end_date
        for member in members:
            username = member.user.username
            initial_budget = member.budget
            used_budget = sum(Calculate.objects.filter(
                member=member,
                payment__pay_date__gte=start_date,
                payment__pay_date__lte=end_date
                ).values_list('cost', flat=True))
            remain_budget = initial_budget - used_budget
            budget[username] = {"initial_budget": initial_budget, "used_budget": used_budget, "remain_budget": remain_budget}
        
        calculates.delete()
        return Response(budget, status=status.HTTP_204_NO_CONTENT)
    
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete(request):
    if request.method == 'POST':
        payment_id = request.data.get('payment_id')
        try:
            payment = Payment.objects.get(id=payment_id)
        except:
            return Response({"error": "주어진 Id에 해당되는 결제 내역이 없습니다."}, status=status.HTTP_410_GONE)
        bank_account = payment.bank_account
        # 내가 결제한거 아니면 삭제할 수 없음
        if not Member.objects.filter(user=request.user, bank_account=bank_account).exists():
            return Response({"error": "사용자의 결제 내역이 아닙니다."}, status=status.HTTP_401_UNAUTHORIZED)
        # 정산이 완료된 결제 내역은 삭제할 수 없음
        if Calculate.objects.filter(payment=payment).exists():
            return Response({'error': "정산이 완료된 결제 내역입니다."}, status=status.HTTP_406_NOT_ACCEPTABLE)
        brand_name = payment.brand_name
        payment.delete()
        return Response({"messagae": f"{brand_name} 결제 내역이 삭제되었습니다."}, status=status.HTTP_204_NO_CONTENT)
    
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def prepare(request):
    if request.method == "POST":
        trip_id = request.data.get('trip_id')
        data = request.data
        
        trip = Trip.objects.get(id=trip_id)
        data['pay_date'] = trip.start_date
        data['pay_time'] = '00:00:00'
        data['bank_account'] = Member.objects.get(trip=trip, user=request.user).bank_account
        data['category'] = categorize(data.get('brand_name'))
        serializer = PaymentCreateSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        
@api_view(['POST'])
def zero(request):
    if request.method == 'POST':
        # 특정 사람의 잔액을 0원으로 만들어주는 코드
        dic = {'정태완': ['3719831726ssafy@naver.com', '9998624062331551'], 
               '임광영': ['3719854488ssafy@naver.com', "0234420981757582"], 
               '이선재': ['3720570145ssafy@naver.com', '0908607631513705'], 
               '박준영': ['3720611926ssafy@naver.com', '0041366933976143']
            }
        username = request.data.get('username')
        
        # 특정 사람의 잔액을 0원으로 만들어주는 코드
        email, bank_account = dic[username]
        accountBalance = inquire_demand_deposit_account(email, bank_account)['REC']['accountBalance']
        update_demand_deposit_account_withdrawal(bank_account, accountBalance, email)
        balance = inquire_demand_deposit_account(email, bank_account)['REC']['accountBalance']
        return Response({'balance': balance}, status=status.HTTP_200_OK)
    
            
@api_view(['POST'])
def rich(request):
    if request.method == 'POST':
        # 특정 사람에게 특정 금액을 입금하는 코드
        dic = {'정태완': ['3719831726ssafy@naver.com', '9998624062331551'], 
               '임광영': ['3719854488ssafy@naver.com', "0234420981757582"], 
               '이선재': ['3720570145ssafy@naver.com', '0908607631513705'], 
               '박준영': ['3720611926ssafy@naver.com', '0041366933976143']
            }
        username = request.data.get('username')
        
        email, bank_account = dic[username]
        deposit_amount = request.data.get('money')
        update_demand_deposit_account_deposit(email, bank_account, deposit_amount)
        balance = inquire_demand_deposit_account(email, bank_account)['REC']['accountBalance']
        return Response({'balance': balance}, status=status.HTTP_200_OK)
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shinhan_api.request import post
from shinhan_api.member import search
from dotenv import load_dotenv
import os
from datetime import datetime


load_dotenv()
API_KEY = os.getenv('API_KEY')

def make_header(apiName, email="jamie9@naver.com"):
    current_time = datetime.now()
    numeric_time = current_time.strftime("%Y%m%d%H%M%S") + f"{current_time.microsecond:06d}"
    common_body = {
        "apiName": apiName,  # 호출 API URL의 마지막 path 명
        "transmissionDate": current_time.strftime("%Y%m%d"), # API 전송 일자 요청일
        "transmissionTime": current_time.strftime("%H%M%S"), # API 전송 시각, 요청 시간 기준 +-5분
        "institutionCode": "00100", # 00100으로 고정
        "fintechAppNo": "001", # 001로 고정
        "apiServiceCode": apiName, # apiName 필드와 동일
        "institutionTransactionUniqueNo": numeric_time, # 기관별 API 서비스 호출 단위의 고유 코드, YYYYMMDD + HHMMSS + 일련번호 6자리 또는 20자리의 난수, 항상 새로운 번호로 임의 채번해야함
        "apiKey": API_KEY, # 앱 관리자가 발급받은 API KEY
        "userKey": search(email)["userKey"] # 앱 사용자가 회원가입할 때 발급받은 USER KEY
    }
    return {'Header': common_body}


def inquire_bank_codes():
    """
    2.3.2 은행 코드 조회
    """
    url = "edu/bank/inquireBankCodes"
    body = make_header(url.split('/')[-1])
    '''
    {'Header': {'responseCode': 'H0000', 'responseMessage': '정상처리 되었습니다.', 'apiName': 'inquireBankCodes', 'transmissionDate': '20240817', 'transmissionTime': '172106', 'institutionCode': '00100', 'apiKey': '4f6ee0e68a27481395921c3b96c77760', 'apiServiceCode': 'inquireBankCodes', 'institutionTransactionUniqueNo': '20240817172106097406'}, 'REC': [{'bankCode': '001', 'bankName': '한국은행'}, {'bankCode': '002', 'bankName': '산업은행'}, {'bankCode': '003', 'bankName': '기업은행'}, {'bankCode': '004', 'bankName': '국민은행'}, {'bankCode': '011', 'bankName': '농협은행'}, {'bankCode': '020', 'bankName': '우리은행'}, {'bankCode': '023', 'bankName': 'SC제일은행'}, {'bankCode': '027', 'bankName': '시티은행'}, {'bankCode': '032', 'bankName': '대구은행'}, {'bankCode': '034', 'bankName': '광주은행'}, {'bankCode': '035', 'bankName': '제주은행'}, {'bankCode': '037', 'bankName': '전북은행'}, {'bankCode': '039', 'bankName': '경남은행'}, {'bankCode': '045', 'bankName': '새마을금고'}, {'bankCode': '081', 'bankName': 'KEB하나은행'}, {'bankCode': '088', 'bankName': '신한은행'}, {'bankCode': '090', 'bankName': '카카오뱅크'}, {'bankCode': '999', 'bankName': '싸피은행'}]}
    '''
    return post(url, body)


def inquire_bank_currency():
    """
    2.3.3 통화코드 조회
    """
    url = "edu/bank/inquireBankCurrency"
    body = make_header(url.split('/')[-1])
    '''
    {'Header': {'responseCode': 'H0000', 'responseMessage': '정상처리 되었습니다.', 'apiName': 'inquireBankCurrency', 'transmissionDate': '20240817', 'transmissionTime': '172258', 'institutionCode': '00100', 'apiKey': '4f6ee0e68a27481395921c3b96c77760', 'apiServiceCode': 'inquireBankCurrency', 'institutionTransactionUniqueNo': '20240817172258597261'}, 'REC': [{'currency': 'KRW', 'currencyName': '원화'}, {'currency': 'USD', 'currencyName': '달러'}, {'currency': 'EUR', 'currencyName': '유로'}, {'currency': 'JPY', 'currencyName': '엔화'}, {'currency': 'CNY', 'currencyName': '위안화'}, {'currency': 'GBP', 'currencyName': '영국 파운드'}, {'currency': 'CHF', 'currencyName': '스위스 프랑'}, {'currency': 'CAD', 'currencyName': '캐나다 달러'}]}
    '''
    return post(url, body)
    

if __name__ == "__main__":
    inquire_bank_codes()
    # inquire_bank_currency()
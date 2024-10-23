from shinhan_api.request import post
from shinhan_api.common import make_header


def exchange_estimate():
    """
    2.10.1 환전 예상 금액 조회
    """
    url = "edu/exchange/estimate"
    body = make_header(url.split('/')[-1])
    body['currency'] = "USD"
    body['exchangeCurrency'] = "JPY"
    body['amount'] = 30000
    '''
    'REC': {'currency': {'amount': '201.07', 'currency': 'USD', 'currencyName': '달러'}, 'exchangeCurrency': {'amount': '30,000', 'currency': 'JPY', 'currencyName': '엔화'}}
    '''
    return post(url, body)


def exchange():
    """
    2.10.2 환전 신청
    """
    url = "edu/exchange"
    body = make_header(url.split('/')[-1])
    body['accountNo'] = "0886248123734384"
    body['exchangeCurrency'] = "JPY"
    body['exchangeAmount'] = 30000
    '''
    'REC': {'exchangeCurrency': {'amount': '30000', 'exchangeRate': '912.44', 'currency': 'JPY', 'currencyName': '엔화'}, 'accountInfo': {'accountNo': '0886248123734384', 'amount': '273732', 'balance': '4799626269'}}
    '''
    return post(url, body)


def exchange_history():
    """
    2.10.3 환전 신청내역 조회
    """
    url = "edu/exchange/history"
    body = make_header(url.split('/')[-1])
    body['accountNo'] = "0886248123734384"
    body['startDate'] = "20240815"
    body['endDate'] = 20240819
    '''
    '''
    return post(url, body)


if __name__ == "__main__":
    # exchange_estimate()
    # exchange()
    exchange_history()
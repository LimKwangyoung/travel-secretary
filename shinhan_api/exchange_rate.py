import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from shinhan_api.request import post
from shinhan_api.common import make_header


def exchange_rate(email):
    """
    2.9.1 환율 전체 조회
    """
    url = "edu/exchangeRate"
    body = make_header(url.split('/')[-1], email)
    '''
    'REC': [{'id': 3223, 'currency': 'CAD', 'exchangeRate': '991.3', 'exchangeMin': '140', 'created': '2024-08-16 23:56:22'}, {'id': 3224, 'currency': 'CHF', 'exchangeRate': '1,560.25', 'exchangeMin': '100', 'created': '2024-08-16 23:56:22'}, {'id': 3225, 'currency': 'CNY', 'exchangeRate': '190.32', 'exchangeMin': '800', 'created': '2024-08-16 23:56:22'}, {'id': 3226, 'currency': 'EUR', 'exchangeRate': '1,493.8', 'exchangeMin': '100', 'created': '2024-08-16 23:56:22'}, {'id': 3227, 'currency': 'GBP', 'exchangeRate': '1,750.08', 'exchangeMin': '80', 'created': '2024-08-16 23:56:22'}, {'id': 3228, 'currency': 'JPY', 'exchangeRate': '912.44', 'exchangeMin': '100', 'created': '2024-08-16 23:56:22'}, {'id': 3230, 'currency': 'USD', 'exchangeRate': '1,361.4', 'exchangeMin': '100', 'created': '2024-08-16 23:56:22'}]
    '''
    return post(url, body)


def exchange_rate_search():
    """
    2.9.2 환율 단건 조회
    """
    url = "edu/exchangeRate/search"
    body = make_header(url.split('/')[-1])
    body['currency'] = "CAD"
    '''
    'REC': {'id': 3223, 'currency': 'CAD', 'exchangeRate': '991.3', 'exchangeMin': '140', 'created': '2024-08-16 23:56:22'}
    '''
    return post(url, body)


if __name__ == "__main__":
    exchange_rate()
    # exchange_rate_search()
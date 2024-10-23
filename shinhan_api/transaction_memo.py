from shinhan_api.request import post
from shinhan_api.common import make_header


def transaction_memo():
    """
    2.12.1 거래내역 메모
    """
    url = "edu/transactionMemo"
    body = make_header(url.split('/')[-1])
    body['accountNo'] = "0886248123734384"
    body['transactionUniqueNo'] = '116'
    body["transactionMemo"] = "메모가 되나~"
    '''
    'REC': {'memoUniqueNo': '5', 'accountNo': '0886248123734384', 'transactionUniqueNo': '116', 'transactionMemo': '메모가 되나~', 'created': '2024-08-17T19:10:54.835211663+09:00[Asia/Seoul]'}
    '''
    return post(url, body)


if __name__ == "__main__":
    transaction_memo()
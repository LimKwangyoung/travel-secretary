from shinhan_api.request import post
from shinhan_api.common import make_header


def open_account_auth():
    """
    2.8.1 1원 송금
    """
    url = "edu/accountAuth/openAccountAuth"
    body = make_header(url.split('/')[-1])
    body['accountNo'] = "0886248123734384"
    body['authText'] = 'SSAFY'
    '''
    { "REC": { "transactionUniqueNo": "120", "accountNo": "0886248123734384" } }
    '''
    return post(url, body)


def check_auth_code():
    """
    2.8.2 1원 검증
    """
    url = "edu/accountAuth/checkAuthCode"
    body = make_header(url.split('/')[-1])
    body['accountNo'] = "0886248123734384"
    body['authText'] = 'SSAFY'
    body['authCode'] = '5412'
    '''
    {
        "REC": {
            "status": "SUCCESS",
            "transactionUniqueNo": "120",
            "accountNo": "0886248123734384"
        }
    }
    '''
    return post(url, body)


if __name__ == "__main__":
    # open_account_auth()
    check_auth_code()
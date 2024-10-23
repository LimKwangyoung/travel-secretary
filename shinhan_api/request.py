import requests


URL = "https://finopenapi.ssafy.io/ssafy/api/v1/"


def get_response(response):
    if "responseCode" in response:
        return {response['responseCode']: response['responseMessage']}
    return response


def post(url, body):
    url = URL + url
    response = requests.post(url, json=body).json()
    return get_response(response)


def get(url, body):
    url = URL + "edu/app/issuedApiKey"
    response = requests.get(url, json=body).json()
    return get_response(response)

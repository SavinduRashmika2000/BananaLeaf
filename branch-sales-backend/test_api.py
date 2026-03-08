import requests

def test_api():
    url = "http://localhost:8080/api/sales"
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.text)
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    test_api()

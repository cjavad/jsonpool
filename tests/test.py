# python script to test the endpoints
import requests

base_url = "http://localhost:8080/pool/"

POST = lambda: requests.post(base_url, json={"key":"value"})
GET = lambda id: requests.get(base_url + id)
PUT = lambda id, auth, json: requests.put(base_url + id, json={"auth":auth, "data":json})
DELETE = lambda id, auth: requests.delete(base_url + id, json={"auth":auth})


r1 = POST().json()
r12 = PUT(r1["id"], r1["auth"], {"OK":False})
# r2 = DELETE(r1["id"], r1["auth"])
print(r12.json())

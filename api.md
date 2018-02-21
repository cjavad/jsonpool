# API
All requests support cross-origin resource sharing (CORS) and *SSL.
###### *if supported by the host

## Root
All request can be found at the root of however you have it hosted so `https://jsonpool.herokuapp.com/` for our production instance.

### Create pool
To create a pool you will use the following scheme:
```http
POST /pool/
```
Were body is a json string (remember to specify the Content-Type) and if everything goes well then
the response should look like this:
```json
{
    "auth":"xxxxxxxxxxxxxxxxxxxxx",
    "id":"wfwe0DSos"
}
```
If you use the private query then your auth key is required for reading the file and we
will encrypt your data so even if the database was leaked nobody would be able to read the 
encrypted data and the hashed authkeys/passwords.

NOTE: this mean that if anyone got access to your database then if your pool was private they can not access it.

```http
POST /pool/?private=1
```

### Update an pool
NOTE: Update uses `PUT`

Update can do two things override an pool or append to an pool, you migth have noticed that the index.html by default overrides
the pool, you can do this by specifing the `override` key in the update payload json-string which should look like this:
```json
{
    "id":"wfwe0DSos",
    "auth":"xxxxxxxxxxxxxxxxxxxxx",
    "data":{"key":"value"}
    "override":true
}
```
the following payload will override the old data.
The expected response is where status is OK like this
```json
{
    "status":"ok"
}
```

Sample request:
```http
PUT /pool/:id
```

### Request Json
the json can be access by using the following scheme `https://hostname.com/:id`
which can also be access via browsers and whatnot.

A sample request
```http
GET /pool/:id
```
which should give you one if these responses:

if the pool exists and it isn't private then you should get your json data:
```json
{
    "key":"value",
    "int":5623490
}
```
if it is private then you will need to specify auth either as json in the body like this `{"auth":"xxxxxxxxxxxxxxxxxxxxx"}` or as a url-query `https://hostname.tld/pool/id?auth=xxxxxxxxxxxxxxxxxxxxx`.

### Delete your pool
lets say you dont want a specific pool anymore then you can delete it by using the `DELETE` http method with an payload/url-query that
contains the auth key like this:

```http
DELETE /pool/:id?auth=xxxxxxxxxxxxxxxxxxxxx
```

which should return the same status: ok response as update
```json
{
    "status":"ok"
}
```

## Errors
Ofcourse there is some error handling going on, with the `GET` requests getting some pretty html error pages.
There are three common errors excluding the common `404 page not found` for api-requests:

* 500: Json not valid, Body does not contain valid json
    - If a wrong payload has been used

* 500: Wrong auth key for pool "$id"
    - If the auth key is invalid

* 404: Pool does not exist
    - The pool can't be found/does not exist
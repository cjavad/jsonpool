JSON-STORAGE is a secure way to store json data online, using an rest api.

# API

There are four functions to choose from, those include:

    create pool: uses POST

    update pool: uses PUT

    delete pool: uses DELETE

    get pool: uses GET

All Api functions uses the same *endpoint

```http://${host}/pool/:id```

*except POST which only uses ```http://${host}/pool/```

So to create a post we can so the following

```
POST http://${host}/pool/ (json = '{"key":"value"}'})
```
and get an response like
```json
{
    "auth":"diqf93ugj23h29h238rh2398h2",
    "id":"wfi3fiIDWI"
}
```
We can then use the auth-key and the id to update the post:
```
PUT http://${host}/pool/wfi3fiIDWI (json = '{"auth":"diqf93ugj23h29h238rh2398h2", "data":{"key2":10}}')
```
then we will get an status: OK if everything went through
```json
{
    "status":"ok"
}
```

then we can check the pool
```
GET http://${host}/pool/wfi3fiIDWI
```
and hopyfully get a response like this
```json
{
    "key":"value",
    "key2":10
}
```
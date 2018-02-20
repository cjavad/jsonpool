JSON-POOl is a secure way to store json data online, using an rest api.
I was inspired by [myjson.com](http://myjson.com) to make an online json storage system, 
that unlike myjson gave you the ablity to modify/remove any data you have created using auth tokens

There is a production instance running on [https://jsonpool.herokuapp.com](https://jsonpool.herokuapp.com)
Which you can use all the time.

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
note the override, by using false (default) then you will append to the data
but if it is set to true then you will override it.
```
PUT http://${host}/pool/wfi3fiIDWI (json = '{"auth":"diqf93ugj23h29h238rh2398h2", "override":false, "data":{"key2":10}}')
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

# CLI
It is posible to start an CLI instance by install jsonpool with `npm i -g jsonpool`
and then executing `jsonpool`. To specify an port you will need to set the `PORT` env
variable like this `$PORT=8080`
# About

JSON-POOL is a secure way to store json data online, using an rest api.
I was inspired by [myjson.com](http://myjson.com) to make an online json storage system, 
that unlike myjson gave you the ablity to modify/remove any data you have created using auth tokens

There is a production instance running on [https://jsonpool.herokuapp.com](https://jsonpool.herokuapp.com)
Which you can use all the time.

## API
See [api.md](api.md)

## CLI
It is posible to start an CLI instance by installing jsonpool with `npm i -g jsonpool`
and then executing `jsonpool`. To specify an port you will need to set the `PORT` env
variable like this `$PORT=8080`. Rigth now there are two modes `fs` (filesystem) and `db`
(database). The file system create induvidial files for each pool, where as the database stores it all 
in a single json file, which migth be "cleaner" but in the long run if we end up having millions of millions
of pools and then a single file will get very very slow.


## News
The editor is now powered by [ace](https://ace.c9.io)

### TODO

- [x] Replace node-json-db with a seprate file system were the data can be encrypted
- [x] Dispose of auth key and instead only leave the hash
- [x] Replace jsoneditor with something else

# Http server
## I made simple http server for my practice in node js.

> Supports only Debian based systems

## Feautures:
- Object based router (GET & POST only)
- Shell script for testing
- Logs the network interfaces of server

## How to use:
### Open terminal and run:
```Shell
sudo apt install node
cd # Repo path
node ./server.js
```
## For test you can run special test file:
```Shell
chmod +x ./test.sh # In repo path
./test.sh
```
### Or you can do it yourself:
```Shell
curl -X GET http://0.0.0.0:3000/ 
# And
curl -X POST http://0.0.0.0:3000/ \
-H "content-type: application/json" \
-d '{"message": "hello world"}'
```
**For more info about CURL you can read the docs**
> https://curl.se/docs/

**By the way:**
> That a my practice project, and im learning js only for 3 weeks. So dont judge strictly

### Have fun!
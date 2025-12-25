#!/bin/bash
printf "1: "
curl -X GET http://0.0.0.0:3000 # Проверка GET
sleep 0.5
printf "\n\n2: " # Проверка сохранения -> 201 
curl -X POST http://0.0.0.0:3000 -H "content-type: application/json" -d '{"one": "two", "three": "four"}'
sleep 0.5
printf "\n\n3: " # Проверка content-type -> 400 Content-Type must be application/json
curl -X POST http://0.0.0.0:3000 -H "content-type: text/plain" -d '{"one": "two", "three": "four"}'
sleep 0.5
printf "\n\n4: " # Проверка на тип -> 400 Invalid JSON
curl -X POST http://0.0.0.0:3000 -H "content-type: application/json" -d "one two three four"
sleep 0.5
printf "\n\n5: " # Проверка обьекта -> 400 Data must be valid object
curl -X POST http://0.0.0.0:3000 -H 'content-type: application/json' -d '["one", "two"]'
sleep 0.5
printf "\n\n6: " # Проверка POST на неправильный путь
curl -X POST http://0.0.0.0:3000/yay -H "content-type: application/json" -d '{"one": "two", "three": "four"}'
sleep 0.5
printf "\n\n7: " # Проверка GET на неправильный путь
curl -X GET http://0.0.0.0:3000/yay
sleep 0.5
printf "\n\n8: " # Проверка сохранения -> 200 [{"one": "two", "three": "four"}]
curl -X GET http://0.0.0.0:3000
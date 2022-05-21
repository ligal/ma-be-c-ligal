const fs = require('fs');
const http = require('turbo-http');

const port = +process.argv[2] || 3000

const cardsData = fs.readFileSync('./cards.json');
const cards = JSON.parse(cardsData);

const cardsArr = []
cards.forEach(card => {
    cardsArr.push(Buffer.from('{"id":"' + card.id + '","name":"' + card.name + '"}'));
});

 const allCards = Buffer.from('{"id": "ALL CARDS"}');
 const ready = Buffer.from('{"ready": true}');

const client = require('redis').createClient()
client.on('error', (err) => console.log('Redis Client Error', err));

const requestListener = async (req, res) => {
    if (req.url.charAt(1) === "r") {
        res.setHeader('Content-Length', ready.length)
        res.write(ready);
    } else {
        let card = cardsArr[await client.incr(req.url) - 1] || allCards
        
        res.setHeader('Content-Length', card.length)
        res.write(card);
    }
};
const server = http.createServer(requestListener);
client.on('ready', () => {
    server.listen(port);
});

client.connect();

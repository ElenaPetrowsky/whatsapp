const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require("axios");
const qrcode = require('qrcode-terminal')
require('dotenv').config();

const authToken = process.env.AUTH_TOKEN;
const messageHandler = async (client, message) => {
    if(!message.isStatus){
        botId = "testbot";
        userId = message.from
        url = `http://localhost:3000/api/v1/bots/${botId}/converse/${userId}/`;
        axios.post(url, {
            type: "text",
            text: message.body.toString(),
        })
            .then((res) => {
                console.log(res.data);
                for(let mess of res.data.responses){
                    if(mess.variations && mess.variations.length > 0){
                        textIndex = Math.floor(Math.random() * mess.variations.length);
                        text = mess.variations[textIndex];
                    }else{
                        text = mess.text;
                    }
                    client.sendMessage(message.from, text);
                }
            })
            .catch(err => {console.log(err)});

        //client.sendMessage(message.from, message.body)
        // for (const [key, val] of Object.entries(message)) {
        //     console.log(key, val)
        // }
    }
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { 
        headless:true, 
        args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote'] 
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr,{
        small: true,
    })
});
client.on('message', message=>messageHandler(client, message))

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

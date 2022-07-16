const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal')
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr,{
        small: true,
    })
});
client.on('message', message=>{
    if(!message.isStatus){
        client.sendMessage(message.from, message.body)
        for (const [key, val] of Object.entries(message)) {
            console.log(key, val)
        }
    }
})

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();
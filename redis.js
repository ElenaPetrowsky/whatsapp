const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const axios = require('axios');


const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);


const app = express();
app.use(bodyParser.json());

//app.get("/repos/:username", getRepos);

app.post("/panier/:user", async (req, res) =>{
    await client.connect() // Connection à la base de données redis
    const user = req.params.user || req.body.user; // Récupération de l'utilisateur

    // Fonction permettant d'envoyer une réquête redis pour l'ajout d'éléments dans le panier
    client.rPush(
        `${user}:panier`, // Le nom du panier
        JSON.stringify(req.body) // Le contenu de l'élément à ajouter: Il faut le convertir en JSON

    ).then((data)=>{
        res.status(200).json(data); // On renvoie un code 200 et le nombre d'éléments ajoutés

    }).catch(err=>{console.log(err)})
      .finally(()=>{client.quit();}); // On ferme la connexion à Redis
})

app.get("/panier/:user", async (req, res) =>{
    await client.connect() // Connection à la base de données redis

    const { user } = req.params; // Récupération de l'utilisateur

    client.lRange(`${user}:panier`, 0, -1).then((data)=>{
        // On convertit les données en JSON
        data = data.map(item=>JSON.parse(item));
        
        res.status(200).json(data); // On renvoie un code 200 et les données du panier de l'utilisateur

    }).catch(err=>{console.log(err)}) // Afficher les eventuelles erreurs rencontrées

      .finally(()=>{client.quit();}) // On ferme la connexion à Redis
})

async function getRepos (req, res, next) {
    try{
        await client.connect();
        console.log(" Données en cours de chargement...");

        const { username } = req.params;
        const { data } = await axios.get(`https://api.github.com/users/${username}`);
        console.log(data);

        client.set(username, data.public_repos).then((data)=>{}).catch(err=>{console.log(err)});

        res.send(data);
    } catch(err) {
        console.log(err);
    }
}

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
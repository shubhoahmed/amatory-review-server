const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.snnxp9j.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const serviceCollection = client.db('amatoryReview').collection('services');
        const reviewCollection = client.db('amatoryReview').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(+req.query.limit);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const oid = new ObjectId(id)
            const query = { _id: oid };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.get('/reviews/:serviceId', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const services = await cursor.toArray();
            res.send(services);
        });

        app.post('/reviews/:serviceId', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            const services = await cursor.toArray();
            res.send(services);
        });


    }
    finally {

    }

}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('Amatory Review server is running')
})

app.listen(port, () => {
    console.log(`Amatory Review server running on ${port}`);
})
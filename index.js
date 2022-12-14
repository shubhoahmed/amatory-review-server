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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader)

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

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
            const cursor = serviceCollection.find(query).sort({ _id: -1 }).limit(+req.query.limit);
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

        app.post('/services', async (req, res) => {

            const result = await serviceCollection.insertOne(req.body)
            console.log(result)

            res.send(result);
        });

        app.get('/reviews/:serviceId', async (req, res) => {
            const query = { serviceId: req.params.serviceId }
            const cursor = reviewCollection.find(query).sort({ date: -1 })
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/reviewsByEmail/:email', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded);
            if (decoded.email !== req.params.email) {

                return res.status(403).send({ message: 'unauthorized access' })
            }
            const query = { email: req.params.email }
            const cursor = reviewCollection.find(query)
            const services = await cursor.toArray();
            res.send(services);
        });

        app.post('/reviews', async (req, res) => {

            const result = await reviewCollection.insertOne(req.body)
            console.log(result)

            res.send(result);
        });

        app.delete('/reviews/:id', async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        app.patch('/reviews/:id', async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) }
            const result = await reviewCollection.updateOne(query, { $set: { text: req.body.text } });
            res.send(result);
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
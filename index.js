const express = require('express');
const cors = require('cors');

const { MongoClient, MongoExpiredSessionError, ObjectId } = require('mongodb');


require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mango.qwtht.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
    try {
        await client.connect();
        console.log("datebase connected successfully");

        const database = client.db("on-the-go");
        const serviceCollection = database.collection("services");
        const orderCollection = database.collection("orders");

        //get all services api

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // GET Single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })

        //post api
        app.post('/services', async (req, res) => {
            console.log('api hitted')
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(`A document was inserted with the _id: ${result.insertedId}`);
        });


        // update api
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const updatedservice = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateservice = {
                $set: {
                    title: updatedservice.title,
                    description: updatedservice.description,
                    price: updatedservice.price,
                    image_url: updatedservice.image_url
                },
            };
            const result = await serviceCollection.updateOne(filter, updateservice, options)
            console.log('updating', id)
            res.json(result)
        })

        // DELETE service API
        app.delete('/services/:id', async (req, res) => {
            console.log("delete api hitted")
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.json(result);
        });


        // Add Orders API
        app.post('/orders', async (req, res) => {
            console.log('posting order')
            const order = req.body;
            console.log(order);
            order.status = 0;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });


      
        //get all orders api

        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

          // get orders by email
          app.post('/my-orders', async (req, res) => {
            console.log("getting single user orders")
            const userEmail = req.body.email;
            const cursor = orderCollection.find({ email: userEmail });
            const orders = await cursor.toArray();
            res.send(orders);
        })


        // Use POST to get  orders by keys
        app.post('/orders/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        });


        // DELETE ORDER API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        // update order status API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrderStatus = req.body;
            console.log(updatedOrderStatus);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateStatus = {
                $set: {
                    status: updatedOrderStatus.status
                },
            };
            const result = await orderCollection.updateOne(filter, updateStatus, options)
            console.log('updating', id)
            res.json(result)
        })


    }
    finally {
        // client.close();
    }
};

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('node server is running');
});

app.listen(port, () => {
    console.log('server running at port', port);
})


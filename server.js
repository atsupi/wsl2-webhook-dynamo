const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DynamoDBClient, ScanCommand, PutItemCommand, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

// DynamoDB Local connection settings
const client = new DynamoDBClient({
    region: "local",
    endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
    credentials: { accessKeyId: "fake", secretAccessKey: "fake" }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const TABLE_NAME = "Webhooks";

// Check if table exists, if not, create it
async function initTable() {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        console.log("Table exists.");
    } catch (err) {
        console.log("Creating table...");
        const params = {
            TableName: TABLE_NAME,
            KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
            AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        };
        await client.send(new CreateTableCommand(params));
    }
}

app.post('/webhook', async (req, res) => {
    const message = req.body.message || "Empty";
    const id = Date.now().toString();
    const timestamp = new Date().toLocaleString('ja-JP');

    const params = {
        TableName: TABLE_NAME,
        Item: {
            id: { S: id },
            message: { S: message },
            timestamp: { S: timestamp }
        }
    };

    try {
        await client.send(new PutItemCommand(params));
        res.status(200).send({ status: "success" });
    } catch (err) {
        res.status(500).send({ status: "error" });
    }
});

app.get('/messages', async (req, res) => {
    try {
        const data = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
        const items = data.Items.map(item => ({
            id: item.id.S,
            message: item.message.S,
            timestamp: item.timestamp.S
        }));
        res.json(items);
    } catch (err) {
        res.status(500).send([]);
    }
});

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server: http://localhost:${PORT}`);

    console.log("Waiting for DynamoDB to be ready...");
    setTimeout(async () => {
        try {
            await initTable();
            console.log("DynamoDB Initialization complete.");
        } catch (err) {
            console.error("Could not connect to DynamoDB:", err.message);
            console.log("Continuing without DB initialization... (Will retry on next request)");
        }
    }, 5000); // wait for 5 seconds
});

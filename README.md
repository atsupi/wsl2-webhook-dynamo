# WSL2 Webhook Receiver with DynamoDB Local 

A lightweight Webhook receiving environment built on WSL2 using Docker, Express (Node.js), and DynamoDB Local. This project allows you to send Webhooks from a Windows host via batch files and monitor them in real-time on a web browser. 

## Project Structure 
```text 
webhook-system/
 ├── docker-compose.yml     # Orchestrates Node.js and DynamoDB containers
 ├── Dockerfile             # Defines the Node.js server environment
 ├── server.js              # Web server logic (Webhook handling & DB operations)
 ├── package.json           # Node.js dependencies 
 ├── public/ 
 │   └── index.html         # Live monitoring dashboard 
 ├── windows/ 
 │   └── send_webhook.bat   # Batch script to send Webhooks from Windows 
 └── README.md              # This file 
```

## Features 

- **Instant Visibility**: Web dashboard refreshes every 5 seconds to show new messages. 
- **Local Database**: Uses DynamoDB Local, no AWS account required. 
- **Easy Testing**: Includes a Windows batch file for quick testing via `curl`. 
- **WSL2 Optimized**: Designed to work seamlessly with WSL2 Networking (Mirrored Mode). 

## Prerequisites 

- **Windows 11** (Recommended for Mirrored Mode) 
- **WSL2** (Ubuntu or other distributions) 
- **Docker & Docker Compose** installed within WSL2 
- (Optional) `.wslconfig` configured with `networkingMode=mirrored` 

## Getting Started 

### 1. Start the Containers Open your WSL2 terminal and navigate to the project directory: 
```bash 
docker-compose up -d 
``` 
This will start the Web server at `http://localhost:3000` and DynamoDB local at `http://localhost:8000`. 

### 2. Create initial table 

```bash
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --region ap-northeast-1 \
    --table-name YourTableName \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```
This will create initial table 'Webhooks' in the dynamodb local.

### 3. Open the Monitor 

Open your browser and go to: [http://localhost:3000](http://localhost:3000) 

### 4. Send a Test Webhook 

From your Windows File Explorer, go to the `windows` folder and run: `send_webhook.bat` Follow the prompt to enter a message. The web dashboard will update automatically within 5 seconds. 

## Configuration (Recommended) 

To ensure seamless communication between Windows and WSL2, create a `.wslconfig` file in your Windows user profile folder (`%USERPROFILE%`) with the following content: 
```
ini [wsl2] networkingMode=mirrored 
``` 
Then restart WSL with `wsl --shutdown`. 

## License 

This project is licensed under the MIT License - see LICENSE for details. 

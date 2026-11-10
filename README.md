# Drone API Server 
The API server acts as an intermediary for retrieving configuration data and managing temperature logs for the drone; it is developed using Node.js and Express.js.

## Project Installation and Execution (How to Run)
1. Install Dependencies:
   ```bash
   npm install
:
2. Create file .env At the root of the project, configure the following:
    PORT=4000
    CONFIG_URL=<URL_Drone_Config_Server>
    LOG_URL=<URL_Drone_Log_Server>
    LOG_API_TOKEN=<Bearer_Token>

3. Run Server:
    Bash
    npm start

The server will run at http://localhost:4000
import { Spooked } from 'spooked';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const app = new Spooked({
    database: {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        name: process.env.DB_NAME || 'Spooked',
    },
    server: {
        host: process.env.SERVER_HOST || 'localhost',
        port: Number(process.env.SERVER_PORT) || 5000,
    },
});

async function runApp(): Promise<void> {
    const database = app.getDatabase();

    // Connect to the database.
    await database.connect();

    const server = app.getServer();

    // Initialize the server.
    await server.listen();
}

try {
    runApp();
} catch (e) {
    console.log('Spooked Error', e);
}

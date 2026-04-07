const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: 'root',
  database: 'swasthyasetu'
});
client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to swasthyasetu as root');
    return client.query('SELECT current_database();');
  })
  .then(res => {
    console.log('DB NAME:', res.rows[0].current_database);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });

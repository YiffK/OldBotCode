const modes = {
    development: {
        dialect: 'sqlite',
        storage: './db.sqlite',
        logging: false,
    },
    test: {
        username: 'root',
        password: '',
        database: 'yiffycornerbot',
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: false,
        port: 3306,
    },
    production: {
        username: 'root',
        password: '',
        database: 'yiffycornerbot',
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: false,
        port: 3306,
    },
};

const currentMode = 'development';

module.exports = modes[currentMode];

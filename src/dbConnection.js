import mysql from 'mysql'

export const sphinxDBconnection = mysql.createPool ({
    host: '3.35.27.235',
    user: 'wemix',
    port: 8000,
    password: '1234',
    database: 'sphinx',
    multipleStatements: true,
})

export const game1DBconnection = mysql.createPool ({
    host: '3.35.27.235',
    user: 'wemix',
    port: 8000,
    password: '1234',
    database: 'game1',
    multipleStatements: true,
})

export const game2DBconnection = mysql.createPool ({
    host: '3.35.27.235',
    user: 'wemix',
    port: 8000,
    password: '1234',
    database: 'game2',
    multipleStatements: true,
})

export function getGame1DB(connectDB, query) {
    return new Promise((resolve, reject) => connectDB.getConnection(function (error, connection) {
        connection.query(query, function (error, data) {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(data);
            }
        });
        connection.release();
    }));
}

export function getGame2DB(connectDB, query) {
    return new Promise((resolve, reject) => connectDB.getConnection(function (error, connection) {
        connection.query(query, function (error, data) {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(data);
            }
        });
        connection.release();
    }));
}

export default {
    getGame2DB,
    getGame1DB,
    sphinxDBconnection,
    game1DBconnection,
    game2DBconnection
}
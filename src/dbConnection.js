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

export default {
    sphinxDBconnection,
    game1DBconnection,
    game2DBconnection
}
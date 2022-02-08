import express from 'express'
import { sphinxDBconnection, game1DBconnection, game2DBconnection } from './dbConnection.js'
import mysql from 'mysql'

var app = express()

// input: image url, stats, public key, name of game
app.post('/mintGameNFT', async(req, res) => {
})

// input: public key, name of game
app.post('/getItemInfo', async(req, res) => {

})

// input: address of old image, stats, address of new image
app.post('/changeItmeImage', async(req, res) => {

})

// input: address of image
app.get('/changeGame', async(req, res) => {
    const image = 123
    const stat = 23
    const game = "maple"
    const insert = mysql.format('insert into nft_binding_list (image, stat, game) values (?, ?, ?)', [image, stat, game])
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err)
        conn.query(insert, function(error, data) {
            if (error) {
                console.log(error)
            }
            console.log(data)
        })
        conn.release()
    })
    console.log(conne)
})

// input: image, value of image, public key
app.post('/mintDesignNFT', async(req, res) => {

})

app.listen(3030, () => {
    console.log(`Example app listening on port ${3030}`)
  })
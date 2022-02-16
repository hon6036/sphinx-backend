import express from 'express'
import { sphinxDBconnection, game1DBconnection, game2DBconnection } from './dbConnection.js'
import mysql from 'mysql'

var app = express()

// input: image url, stats, public key, name of game
app.post('/mintGameNFT', async(req, res) => {
})

// input: public key, name of game
app.get('/getItemInfo', async(req, res) => {
    const publicKey = req.body.publicKey
    const game = req.body.game
    const getItemInfo = mysql.format('select * from nft_binding_list where publicKey = ? and game = ?;', [publicKey, game] )
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err)
        conn.query(getItemInfo, function(error, data) {
            if (error) {
                console.log(error)
            }
            console.log(data)
        })
        conn.release()
    })
    console.log(conne)

})

// input: address of old image, stats, address of new image
app.get('/changeItemImage', async(req, res) => {
    const newImage = req.body.newImage
    const oldImage = req.body.oldImage
    const changeItemImage = mysql.format('update nft_binding_list set image = ? where image = ?;', [newImage, oldImage] )
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err)
        conn.query(changeItemImage, function(error, data) {
            if (error) {
                console.log(error)
            }
            console.log(data)
        })
        conn.release()
    })
    console.log(conne)
})

// input: address of image
app.get('/changeItemGame', async(req, res) => {
    const newGame = req.body.newGame
    const oldGame = req.body.oldGame
    const publicKey = req.body.publicKey
    const changeItemGame = mysql.format('update nft_binding_list set game = ? where game = ? and publicKey = ?;', [newGame, oldGame, publicKey] )
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err)
        conn.query(changeItemGame, function(error, data) {
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
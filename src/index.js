import express from 'express'
import { sphinxDBconnection, game1DBconnection, game2DBconnection, getGame1DB } from './dbConnection.js'
import mysql from 'mysql'
import aws from 'aws-sdk'
import multerS3 from 'multer-s3'
import multer from 'multer'
import cors from 'cors'
import getImage from './awsS3.js'
import sharp from 'sharp'
var app = express()
app.use(cors())

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

app.get('/upload', (req, res) => {
    aws.config.loadFromPath('./awsconfig.json'); 
    const s3 = new aws.S3();
    var bucketParams = {
        Bucket : "sphinx-game-image",
    };
    var key = {
        Key : "game1/weapon.png",
    }

    const params = {
        Bucket: "sphinx-game-image",
        Key: "game1/weapon.png",
    }
    console.log(1234)
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
        }
    })

    console.log(123)
})

app.post('/game1', async function(req,res) {
    const getItemInfo = mysql.format('select * from item')
    const game1List = await getGame1DB(game1DBconnection, getItemInfo)
    var gameItemList = []
    for (var i in game1List) {
        var params = {
            Bucket: "sphinx-game-image",
            Key: 'game1/' + game1List[i].name + '.png',
        }
        var img = await getImage(params)
        console.log(img.Body)
        gameItemList.push([game1List[i].name, img, game1List[i].attack])
    }
    res.send(gameItemList)
})

app.listen(3030, () => {
    console.log(`Example app listening on port ${3030}`)
  })
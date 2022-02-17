import express from 'express'
import { sphinxDBconnection, game1DBconnection, game2DBconnection } from './dbConnection.js'
import mysql from 'mysql'
import { create } from 'ipfs-http-client';

const ipfs = create();
const app = express();

// input: image url, stats, public key, name of game - cheolhoon
app.post('/mintGameNFT', async(req, res) => {
    var img_hash = '';
    var stat_hash = '';
    var attr_img_hash = '';
    var attr_stat_hash = '';
    var attr_img = {
        issuer: 'Sphinx',
        game: req.body.game,
        hash: '',
    };
    var attr_stat = {
        issuer: 'Sphinx',
        game: req.body.game,
        hash: '',
    }
    //assume image exist as buffer
    //img save at ipfs
    await ipfs.add(req.body.img)
    .then((response) => {
        console.log(response);
        img_hash = response.path;
        attr_img.hash = response.path;
    });
    //img attribute save at ipfs
    await ipfs.add(Buffer.from(JSON.stringify(attr_img)))
    .then((response) => {
        console.log(response);
        attr_img_hash = response.path;
    });
    //stat save at ipfs
    await ipfs.add(req.body.stat)
    .then((response) => {
        console.log(response);
        stat_hash = response.path;
        attr_stat.hash = response.path;
    });
    //stat attribute save at ipfs
    await ipfs.add(Buffer.from(JSON.stringify(attr_stat)))
    .then((response) => {
        console.log(response);
        attr_stat_hash = response.path;
    });

    //save img_hash, stat_hash at sphinx db
    const mintGameNFT = mysql.format('insert into nft_binding_list(image, stat, game) values(?, ?, ?);', [img_hash, stat_hash, req.body.game]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(mintGameNFT, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send({
                img_hash: img_hash,
                stat_hash: stat_hash,
                attr_img_hash: attr_img_hash,
                attr_stat_hash: attr_stat_hash
            })
        })
        conn.release();
    })
    console.log(conne);
})

// Txhash store at sphinx db, input: img_tx_hash, stat_tx_hash, img_hash - cheolhoon
app.post('/saveTxHash', async(req, res) => {
    const saveTxHash = mysql.format('update nft_binding_list set img_tx_hash = ?, stat_tx_hash = ? where image = ?', [req.body.img_tx_hash, req.body.stat_tx_hash, req.body.img_hash]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(saveTxHash, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send('success');
        });
        conn.release();
    });
    console.log(conne);
});

// User confirmed transaction, input: img_tx_hash - cheolhoon
app.get('/confirmTx', async(req, res) => {
    const confirmTx = mysql.format('update nft_binding_list set confirm_status = 1 where img_tx_hash = ?;', [req.query.img_tx_hash]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) { 
        console.log(err);
        conn.query(confirmTx, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send('success');
        });
        conn.release();
    });
    console.log(conne);
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

// input: image, value of image, public key - cheolhoon
app.post('/mintDesignNFT', async(req, res) => {
    var img_hash = '';
    var attr_img_hash = '';
    var attr_img = {
        issuer: 'Sphinx',
        game: req.body.game,
        hash: '',
    };
    //assume image exist as buffer
    //img save at ipfs
    await ipfs.add(req.body.img)
    .then((response) => {
        console.log(response);
        img_hash = response.path;
        attr_img.hash = response.path;
    });
    //img attribute save at ipfs
    await ipfs.add(Buffer.from(JSON.stringify(attr_img)))
    .then((response) => {
        console.log(response);
        attr_img_hash = response.path;
    });

    //save img_hash at sphinx db
    const mintDesignNFT = mysql.format('insert into nft_binding_list(image) values(?);', [img_hash]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(mintDesignNFT, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send({
                img_hash: img_hash,
                attr_img_hash: attr_img_hash,
            })
        })
        conn.release();
    })
    console.log(conne);
})

app.listen(3030, () => {
    console.log(`Example app listening on port ${3030}`)
  })
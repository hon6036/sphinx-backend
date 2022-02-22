import express from 'express'
import { sphinxDBconnection, game1DBconnection, game2DBconnection } from './dbConnection.js'
import mysql from 'mysql'
import { create } from 'ipfs-http-client';

const ipfs = create();
const app = express();

// input: image url, stats, public key, name of game - cheolhoon
app.post('/mintGameNFT', async(req, res) => {
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
        attr_stat.hash = response.path;
    });
    //stat attribute save at ipfs
    await ipfs.add(Buffer.from(JSON.stringify(attr_stat)))
    .then((response) => {
        console.log(response);
        attr_stat_hash = response.path;
    });

    res.send({
        attr_img_hash: attr_img_hash,
        attr_stat_hash: attr_stat_hash
    });
});

// Img_Token_id store at sphinx db, input: token_id, game, public_key - cheolhoon
app.post('/saveImgTokenId', async(req, res) => {
    const saveImgTokenId = mysql.format('insert into nft_binding_list(img_token_id, game, public_key) values(?, ?, ?);', [req.query.token_id, req.query.game, req.query.public_key]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(saveImgTokenId, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send({
                img_token_id: req.query.token_id,
                public_key: req.query.public_key
            });
        });
        conn.release();
    });
    console.log(conne);
});

// Stat_Token_id store at sphinx db, input: stat_token_id, img_token_id, public_key - cheolhoon
app.post('/saveStatTokenId', async(req, res) => {
    const saveStatTokenId = mysql.format('update nft_binding_list set stat_token_id = ? where img_token_id = ? and public_key = ?;', [req.query.stat_token_id, req.query.img_token_id, req.query.public_key]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(saveStatTokenId, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send('success');
        });
        conn.release();
    });
    console.log(conne);
});

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
    var attr_img_hash = '';
    var attr_img = {
        issuer: 'Sphinx',
        type: 'img',
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

    res.send(attr_img_hash);
});

// nft마켓 db에 등록하는 api input: token_id, public_key - cheolhoon
app.post('/saveMarketTokenId', async(req, res) => {
    const saveMarketTokenId = mysql.format('insert into nft_product_list(token_id, public_key) values(?, ?);', [req.query.token_id, req.query.public_key]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(saveMarketTokenId, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send('success');
        });
        conn.release();
    });
    console.log(conne);
});

// get trade market nft_product_list
// input: X - cheolhoon
app.get('/getItemList', async(req, res) => {
    const getItemList = mysql.format('select * from nft_product_list;');
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(getItemList, function(error, data) {
            if (error) {
                console.log(error);
            }
            res.send(data);
        });
        conn.release();
    });
    console.log(conne);
});

// NFT image buying at market
// delete at nft_product_list and insert at nft_binding_list
// input: token_id, public_key - cheolhoon
app.get('/buyNftImg', async(req, res) => {
    const buyNftImg1 = mysql.format('delete from nft_product_list where token_id = ?;', [req.query.token_id]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        console.log(err);
        conn.query(buyNftImg1, function(error, result) {
            if (error) {
                console.log(error);
            }
            const buyNftImg2 = mysql.format('insert into nft_binding_list(img_token_id, public_key) values(?, ?);', [req.query.token_id, req.query.public_key]);
            conn.query(buyNftImg2, function(error, data) {
                if (error) {
                    console.log(error);
                }
                res.send('success');
            });
        });
        conn.release();
    });
    console.log(conne);
})

app.listen(3030, () => {
    console.log(`Example app listening on port ${3030}`)
  })
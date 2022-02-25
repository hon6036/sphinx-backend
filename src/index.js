import express from 'express'
import { sphinxDBconnection, game1DBconnection, game2DBconnection, getGame1DB, getGame2DB } from './dbConnection.js'
import mysql from 'mysql'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from 'morgan';
import request from 'request';
import aws from 'aws-sdk'
import cors from 'cors'
import { getImage, uploadFile } from './awsS3.js';
import multer from 'multer';
import fs from 'fs';
var requester = request.defaults({encoding:null})


const upload = multer({dest: "upload/"});
const app = express();

app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// input: image url(img), shape of json stat, public_key, game's name game, item's name name - cheolhoon
app.post('/mintGameNFT', async(req, res) => {
    var attr_img_url = '';
    var attr_stat_url = '';

    var attr_img = {
        issuer: 'Sphinx',
        game: req.body.game,
        url: '',
    };
    var attr_stat = {
        issuer: 'Sphinx',
        game: req.body.game,
        url: '',
    };
    var img_params = {
        ACL: 'public-read',
        Bucket: 'sphinx-nft-data',
        Key: req.body.name + req.body.public_key + '_img.png',
        Body: ''
    }
    var stat_params = {
        ACL: 'public-read',
        Bucket: 'sphinx-nft-data',
        Key: req.body.name + req.body.public_key + '_stat.json',
        Body: Buffer.from(JSON.stringify(req.body.stat))
    }

    function handlingRequest(url) {
        return new Promise(function (resolve, reject) {
            requester.get(url, function (error, res, body) {
                return resolve(body)
            })
        })
    }
    const body = await handlingRequest(req.body.img);
    img_params.Body = Buffer.from(body)
    attr_img.url = await uploadFile(img_params);
    attr_stat.url = await uploadFile(stat_params);

    var attr_img_params = {
        ACL: 'public-read',
        Bucket: 'sphinx-nft-data',
        Key: req.body.public_key + req.body.name + '_img.json',
        Body: Buffer.from(JSON.stringify(attr_img))
    }
    var attr_stat_params = {
        ACL: 'public-read',
        Bucket: 'sphinx-nft-data',
        Key: req.body.public_key + req.body.name + '_stat.json',
        Body: Buffer.from(JSON.stringify(attr_stat))
    }

    attr_img_url = await uploadFile(attr_img_params);
    attr_stat_url = await uploadFile(attr_stat_params);
    

    res.send({
        attr_img_url: attr_img_url,
        attr_stat_url: attr_stat_url
    });
});

// Img_Token_id store at sphinx db, input: token_id, game, public_key - cheolhoon
app.get('/saveImgTokenId', async(req, res) => {
    const saveImgTokenId = mysql.format('insert into nft_binding_list(img_token_id, game, public_key, name) values(?, ?, ?, ?);', [req.query.token_id, req.query.game, req.query.public_key, req.query.name]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(saveImgTokenId, function(error, data) {
            if (error) {
                res.send('fail');
            }
            else {
                res.send('success');
            }
        });
        conn.release();
    });
});

// Stat_Token_id store at sphinx db, input: stat_token_id, img_token_id, public_key - cheolhoon
app.get('/saveStatTokenId', async(req, res) => {
    const saveStatTokenId = mysql.format('update nft_binding_list set stat_token_id = ? where img_token_id = ? and public_key = ?;', [req.query.stat_token_id, req.query.img_token_id, req.query.public_key]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(saveStatTokenId, function(error, data) {
            if (error) {
                res.send('fail');
            }
            else {
                res.send('success');
            }
        });
        conn.release();
    });
});

// input: public key, name of game
app.get('/getItemInfo', async(req, res) => {
    const publicKey = req.query.public_key
    const game = req.query.game
    const getItemInfo = mysql.format('select * from nft_binding_list where public_key = ? and game = ?;', [publicKey, game] )
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(getItemInfo, function(error, data) {
            if (error) {
                res.send("fail");
            }
            else {
                res.send(data);
            }
        })
        conn.release();
    })
})

// input: public_key
app.get('/getImgInfo', async(req, res) => {
    const getImgInfo = mysql.format('select * from nft_binding_list where public_key = ? and stat_token_id = 0;', [req.query.public_key] )
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(getImgInfo, function(error, data) {
            if (error) {
                res.send("fail");
            }
            else {
                res.send(data);
            }
        })
        conn.release();
    })
})

// input: new_img_token_id, old_img_token_id
app.get('/changeItemImage', async(req, res) => {
    const newImage = req.query.new_img_token_id
    const oldImage = req.query.old_img_token_id
    const statId = req.query.stat_id
    console.log(req.query)
    const changeItemImage2 = mysql.format('update nft_binding_list set img_token_id = ? where img_token_id = ?;', [oldImage, newImage]);
    const changeItemImage = mysql.format('update nft_binding_list set img_token_id = ? where stat_token_id = ?;', [newImage, statId]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(changeItemImage2+changeItemImage, function(error, data) {
            if (error) {
                res.send("fail");
            }
            else {
                res.send('success');
            }
        })
        conn.release();
    })
})

// input: img_token_id, newGame, oldGame, modified_stat
app.get('/changeItemGame', async(req, res) => {
    const imgTokenId = req.query.img_token_id
    const newGame = req.query.newGame;
    const oldGame = req.query.oldGame;
    const modified_stat = req.query.modified_stat;
    const changeItemGame = mysql.format('update nft_binding_list set game = ?, modified_stat = ? where game = ? and img_token_id = ?;', [newGame, modified_stat, oldGame, imgTokenId]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(changeItemGame, function(error, data) {
            if (error) {
                res.send('fail');
            }
            else {
                res.send('success');
            }
        })
        conn.release();
    })
})

// input: shape of buffer img, public_key, item's name name - cheolhoon
app.post('/mintDesignNFT', upload.single("img"),  async(req, res) => {
    var attr_img_url = '';
    var attr_img = {
        issuer: 'Sphinx',
        game: '',
        url: '',
    };

    const image = fs.readFileSync(req.file.path);

    var img_params = {
        ACL: 'public-read',
        Bucket: 'sphinx-nft-data',
        Key: req.body.name + req.body.public_key + '.png',
        Body: image
    }

    attr_img.url = await uploadFile(img_params);

    var attr_img_params = {
        ACL: 'public-read',
        Bucket: 'sphinx-nft-data',
        Key: req.body.name + req.body.public_key + '_img.json',
        Body: Buffer.from(JSON.stringify(attr_img))
    }

    attr_img_url = await uploadFile(attr_img_params);

    fs.unlink(req.file.path, ()=>{console.log('Image deleted successfully');})

    res.send({
        attr_img_url: attr_img_url
    });
});

// nft마켓 db에 등록하는 api input: token_id, public_key - cheolhoon
app.get('/saveMarketTokenId', async(req, res) => {
    const saveMarketTokenId = mysql.format('insert into nft_product_list(token_id, public_key, name) values(?, ?, ?);', [req.query.token_id, req.query.public_key, req.query.name]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(saveMarketTokenId, function(error, data) {
            if (error) {
                res.send("fail");
            }
            else {
                res.send('success');
            }
        });
        conn.release();
    });
});

// get trade market nft_product_list
// input: X - cheolhoon
app.get('/getItemList', async(req, res) => {
    const getItemList = mysql.format('select * from nft_product_list;');
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(getItemList, function(error, data) {
            if (error) {
                res.send("fail");
            }
            else {
                res.send(data);
            }
        });
        conn.release();
    });
    console.log(conne);
});

// NFT image buying at market
// delete at nft_product_list and insert at nft_binding_list
// input: token_id, public_key, name - cheolhoon
app.get('/buyNftImg', async(req, res) => {
    const buyNftImg1 = mysql.format('delete from nft_product_list where token_id = ?;', [req.query.token_id]);
    const conne = await sphinxDBconnection.getConnection(function(err, conn) {
        conn.query(buyNftImg1, function(error, result) {
            if (error) {
                res.send("fail")
            }
            const buyNftImg2 = mysql.format('insert into nft_binding_list(img_token_id, public_key, name) values(?, ?, ?);', [req.query.token_id, req.query.public_key, req.query.name]);
            conn.query(buyNftImg2, function(error, data) {
                if (error) {
                    res.send("fail");
                }
                else {
                    res.send('success');
                }
            });
        });
        conn.release();
    });
})

app.post('/game1', async function(req,res) {
    aws.config.loadFromPath('./awsconfig.json'); 
    const s3 = new aws.S3();
    const getItemInfo = mysql.format('select * from item')
    const game1List = await getGame1DB(game1DBconnection, getItemInfo)
    var gameItemList = []
    for (var i in game1List) {
        var params = {
            Bucket: "sphinx-game-image",
            Key: 'game1/' + game1List[i].name + '.png',
        }
        var imageurl = s3.getSignedUrl('getObject', {
            Bucket: params.Bucket,
            Key: params.Key
        })
        gameItemList.push([game1List[i].name, imageurl, game1List[i].attack, "game1"])
    }
    res.send(gameItemList)
})

app.post('/game2', async function(req,res) {
    aws.config.loadFromPath('./awsconfig.json'); 
    const s3 = new aws.S3();
    const getItemInfo = mysql.format('select * from item')
    const game1List = await getGame2DB(game2DBconnection, getItemInfo)
    var gameItemList = []
    for (var i in game1List) {
        var params = {
            Bucket: "sphinx-game-image",
            Key: 'game2/' + game1List[i].name + '.png',
        }
        var imageurl = s3.getSignedUrl('getObject', {
            Bucket: params.Bucket,
            Key: params.Key
        })
        gameItemList.push([game1List[i].name, imageurl, game1List[i].attack, "game2"])
    }
    res.send(gameItemList)
})

app.listen(3030, () => {
    console.log(`Example app listening on port ${3030}`)
})
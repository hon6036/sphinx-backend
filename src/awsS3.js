import aws from 'aws-sdk'

function getImage (params) {
    aws.config.loadFromPath('./awsconfig.json'); 
    const s3 = new aws.S3();
    return new Promise((resolve, reject) => s3.getObject(params, (err, imgData) => {
        if (err) {
            console.log(err)
        }
        else {
            return resolve(imgData)
        }
    }))
}

function uploadFile (params) {
    aws.config.loadFromPath('./awsconfig.json');
    const s3 = new aws.S3();
    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        return data.Location;
    })
}

export { getImage, uploadFile };
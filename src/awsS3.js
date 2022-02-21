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

export default getImage
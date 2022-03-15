const config = require('../config');
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const bucketName = config.AWS_BUCKET_NAME;
const region = config.AWS_BUCKET_REGION;
const accessKeyId = config.AWS_ACCESS_KEY;
const secretAccessKey = config.AWS_SECRET_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});

/**
 * Upload file to the S3
 * Source: https://github.com/AmirMustafa/upload_file_nodejs
 * @param file
 */
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
        ACL: 'public-read' // we want to allow users to se image profiles of other users
    };
    return s3.upload(uploadParams).promise();
}

module.exports = {uploadFile};
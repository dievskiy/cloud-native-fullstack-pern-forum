const multer = require("multer");
const fs = require("fs");
const uuid = require("uuid");

const dir = "./tmp/images";

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
}

/**
 * Abstraction over multer for file manipulations
 * Source: https://github.com/AmirMustafa/upload_file_nodejs
 */
const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, uuid.v4() + ".jpg");
    },
});

const upload = multer({storage: fileStorageEngine});

module.exports = upload;
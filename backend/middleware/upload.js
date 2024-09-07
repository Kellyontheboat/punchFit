const multer = require('multer')
const dotenv = require('dotenv')

dotenv.config()

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
})

module.exports = upload

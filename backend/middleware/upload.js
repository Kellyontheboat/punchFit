const multer = require('multer')
const dotenv = require('dotenv')

dotenv.config()

const storage = multer.memoryStorage()
const upload = multer({ storage })

// Export the upload middleware
module.exports = { upload }

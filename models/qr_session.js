const mongoose = require('mongoose')
const {Schema} = mongoose

const schema = new Schema({
    qrToken: String,
    browserCode: String
})
mongoose.model('qrSession', schema)
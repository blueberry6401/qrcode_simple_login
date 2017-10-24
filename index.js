require('dotenv').config()
const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const qrcode = require('yaqrcode');
app.use(bodyparser.json())

// setup mongo
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;
require('./models/qr_session')
const QrSession = mongoose.model('qrSession')

// Tao qr code
app.post('/api/request_qr', (req, res) => {
    const qrToken = makeId(50)
    const browserCode = makeId(30)
    const qrImgBase64 = qrcode(`muachung_login:${qrToken}`)
    // Save to mongo
    new QrSession({
        qrToken, browserCode
    }).save()

    res.status(201).send({
        base64: qrImgBase64,
        code: browserCode
    })
})

// API chờ mobile client quét qrcode
const responseKeeper = {}
app.post('/api/waiting', (req, res) => {
    const {browserCode} = req.body
    if (!browserCode) {
        res.status(504).send({message: 'You must provide browser code'})
        return
    }
    responseKeeper[browserCode] = res

    setTimeout(() => {
        const res = responseKeeper[browserCode]
        if (res) {
            // Delete mongo data
            QrSession.findOne({browserCode}).remove().exec()
                .then(() => res.status(202).send({message: 'QRCode timed out'}))
            // Delete response keeper
            delete responseKeeper[browserCode]
        }
    }, 20000)
})

// API mobile client quét qr code xong gửi lên check
app.post('/api/check_qr', (req, res) => {
    const {qrToken, email} = req.body
    if (!qrToken || !email) {
        res.status(504).send({message: 'You must provide qr token and email'})
        return
    }

    const qrElem = QrSession.findOne({qrToken})
    qrElem.then(qrSession => {
        if (!qrSession) {
            res.status(402).send({message: 'Token invalid'})
            return
        }
        
        // Gui tra ve browser
        if (responseKeeper[qrSession.browserCode]) {
            responseKeeper[qrSession.browserCode].status(201).send({message: `Dang nhap thanh cong tren email ${email}`})
            delete responseKeeper[qrSession.browserCode]
            qrElem.remove().exec()
        }
        
        // Response lai mobile client
        res.status(201).send({message: 'Dang nhap thanh cong'})
    })
})

function makeId(length = 10) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}


// React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
  
    const path = require('path');
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
  }

  
app.listen(process.env.PORT || 5000)
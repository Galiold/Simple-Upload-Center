require('dotenv').config()

const fs = require('fs')
const path = require('path')
const multer = require('multer')
const express = require('express')
const Mustache = require('mustache')
const session = require('express-session')
const exec = require('child_process').exec
const serveIndex = require('serve-index')
const url = require("url");

const auth = require('./lib/auth')

const app = express()

const port = process.env.PORT || 3000
const SECRET = process.env.SECRET ? process.env.SECRET : 'ETbrCY|PlBd(ig7'


app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.use(express.static(__dirname + '/public'))

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: SECRET
}));

app.post('/authenticate/:resource', (req, res) => {
    console.log('post auth');
    console.log(req.body);
    if (auth.passVerified(req.body['pass'])) {
        let payload = {
            message: 'User is valid'
        }
        req.session.auth = auth.signToken(payload)
        console.log('Pass verified');
        res.send({
            'redirectURL': `/uploads/${req.params.resource}`
        })
    }
    else {
        res.status(400).send('Failed to login')
    }
})

app.get('/uploads/:resource', (req, res, next) => {
    if (req.params.resource === 'configs') {
        if (auth.hasAccess(req).verify) return next()
        else {
            res.redirect(url.format({
                pathname: '/auth.html',
                query: {
                    resource: req.params.resource
                }
            }))
        }
    } else {
        next()
    }
})



app.use('/uploads', serveIndex(__dirname + '/public/uploads'))

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})


app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`)
})


app.post('/upload', (req, res) => {
    let upload = multer({
        storage: storage
    }).array('multiple-files')

    upload(req, res, err => {
        if (err) {
            console.log(err)
            res.status(400).send(err)
        } else {
            let view = {
                files: req.files.map(elem => {
                    return {
                        index: req.files.indexOf(elem) + 1,
                        name: elem.originalname,
                        uri: encodeURI(elem.originalname),
                        size: (Math.floor(elem.size / 1024)).toString() + ' KB'
                    }
                })
            }

            fs.readFile('public/result.html', 'utf8', (err, data) => {
                if (err) {
                    console.log(err)
                    res.status(400).send('Error Occured')
                } else {
                    res.send(Mustache.render(data, view))
                }
            })
        }
    })
})

app.post('/download', (req, res) => {
    let link = req.body.url
    var parsed = url.pathToFileURL(link)
    let fileName = path.basename(parsed.pathname)

    let cmd = `wget -P public/uploads ${link}`

    exec(cmd, (err, serr, sout) => {
        if (err) {
            console.log(err)
            res.status(400).send('Error Occured')
        } else {
            console.log(sout);

            let view = {
                files: [{
                    index: 1,
                    name: fileName,
                    uri: encodeURI(fileName)
                }]
            }

            fs.readFile('public/result.html', 'utf8', (err, data) => {
                if (err) {
                    console.log(err)
                    res.status(400).send('Error Occured')
                } else {
                    res.send(Mustache.render(data, view))
                }
            })
        }
    })

})
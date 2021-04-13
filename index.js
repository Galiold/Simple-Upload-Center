const express = require('express')
const multer = require('multer')
const path = require('path')
let Mustache = require('mustache')
let fs = require('fs')
const serveIndex = require('serve-index')

const app = express()
const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))
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
                    return { index: req.files.indexOf(elem) + 1, name: elem.originalname, uri: encodeURI(elem.originalname), size: (Math.floor(elem.size / 1024)).toString() + ' KB' }
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
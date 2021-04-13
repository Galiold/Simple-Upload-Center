const express = require('express')
const multer = require('multer')
const path = require('path')
let Mustache = require('mustache')
let fs = require('fs')
const serveIndex = require('serve-index')
const url = require("url");
const exec = require('child_process').exec
const e = require('express')

const app = express()
const port = process.env.PORT || 3000


app.use(express.urlencoded({extended: true}))
app.use(express.json())
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
                files: [
                    { index: 1, name: fileName, uri: encodeURI(fileName) }
                ]
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
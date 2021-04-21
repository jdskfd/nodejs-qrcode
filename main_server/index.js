const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const main = fs.readFileSync('./main.html', 'utf8');
const router = express.Router();
const bodyParser = require('body-parser');
const multer = require("multer");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", express.static(path.join(__dirname)));
app.use("/", express.static(__dirname + '/dbdata'));

var id = 0;

app.get('/', function (req, res) {
  List();
  console.log("-------------")
  res.send(main);
});
const upload = multer({
  dest: "/dbdata"
});
app.post(
  "/sendcomment",
  upload.single("file"),
  (req, res) => {
    //txt
    id++;
    var str_id = id.toString();
    fs.writeFile('/dbdata/job_' + str_id + '.txt', req.body.msg, function (err) {
      if (err) throw err;
      console.log('msg is :' + req.body.msg);
      console.log('TXT saved!');
    })
    //img
    console.log("req.body is :", req.body);
    console.log("req.file is :", req.file);
    const tempPath = path.join(__dirname, "./dbdata/" + req.file.filename);
    const targetPath = path.join(__dirname, "./dbdata/job_" + str_id + ".png");
    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, function (err) {
        if (err) throw err;
        console.log('PNG saved!')
      });
    } else {
      console.log('pls give png')
    }
    //write json
    fs.readFile('./dbdata/workstate.json', function (err, job) {
      if (err) {
        return console.error(err);
      }
      let jobState = {
        id: id,
        txt: '/dbdata/job_' + str_id + '.txt',
        png: './dbdata/job_' + str_id + '.png',
        qrcode: '',
        state: 'waiting'
      };
      var filedata = job.toString();
      filedata = JSON.parse(filedata);
      filedata.job.push(jobState);
      filedata.total = filedata.job.length;
      console.log(filedata.job);

      let data = JSON.stringify(filedata);
      fs.writeFile('/dbdata/workstate.json', data, function (err) {
        if (err) {
          console.error(err);
        }
        console.log('create json success.')
      })
    });
    res.redirect('/');
  });

const server = require('http').Server(app);
const port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log(`listening on port ${port}`);
});
const testFolder = '/dbdata';
function List() {
  fs.readdir(testFolder, function (err, files) {
    if (err) {
      console.log(err)
    } else {
      console.log(files)
    }
  })
}


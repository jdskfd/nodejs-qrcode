const QRCode = require('magic-qr-code');
const Canvas = require('canvas');
var fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = [0, 10, 20, 30, 40, 50];

let job = schedule.scheduleJob("*/5 * * * * *", () => {
    console.log('====================================')
    console.log('JOB START!');
    var bool = false;
    var jobID;
    fs.readFile('./dbdata/workstate.json', function (err, job) {
        if (err) {
            return console.error(err);
        }
        var filedata = job.toString();
        filedata = JSON.parse(filedata);
        for (var i = 0; i < filedata.total; i++) {
            if (filedata.job[i].state == "waiting") {
                //
                jobID = filedata.job[i].id;
                fs.readFile(filedata.job[i].txt, function (err, data) {
                    console.log("now the jobID is :", jobID);
                    if (err) throw err;
                    let txt = data.toString();
                    console.log('textfile content is: ', txt);
                    let result = QRCode.encode(txt.toUpperCase());
                    function draw(data, size = 1024) {
                        let marginSize = 1;
                        let dataLength = data.length;
                        let dataLengthWithMargin = dataLength + 2 * marginSize;
                        let canvas = Canvas.createCanvas(size, size);
                        let ctx = canvas.getContext('2d');
                        let pointSize = Math.floor(size / dataLengthWithMargin);
                        if (pointSize === 0) {
                            throw new Error('cannot draw this QR Code');
                        }
                        let margin = Math.floor((size - (pointSize * dataLength)) / 2);
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, size, size);
                        ctx.fillStyle = 'black';
                        for (let i = 0; i < dataLength; ++i) {
                            for (let j = 0; j < dataLength; ++j) {
                                if (data[i][j]) {
                                    let x = j * pointSize + margin;
                                    let y = i * pointSize + margin;
                                    ctx.fillRect(x, y, pointSize, pointSize);
                                }
                            }
                        }
                        return canvas;
                    }
                    let canvas = draw(result);
                    // Output
                    let pngBuffer = canvas.toBuffer();
                    fs.writeFileSync('/dbdata/qrcode_' + jobID + '.png', pngBuffer);
                });
                var qrpath = '/dbdata/qrcode_' + jobID + '.png';
                filedata.job[i].qrcode = qrpath;
                filedata.job[i].state = "qr_done";
                let finishJob = JSON.stringify(filedata);
                fs.writeFile('/dbdata/workstate.json', finishJob, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('rewrite json success.')
                    console.log('JOB DONE!');
                })
            } else {
                console.log('No Job now !')
            }
        }
    });
});
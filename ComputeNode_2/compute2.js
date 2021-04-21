const QRCode = require('magic-qr-code');
const Canvas = require('canvas');
var fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.second = [0, 10, 20, 30, 40, 50];

let job = schedule.scheduleJob("*/7 * * * * *", () => {
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
            if (filedata.job[i].state == "qr_done") {
                jobID = filedata.job[i].id;
                gm()
                .in('-geometry', '+0+0')
                .in(filedata.job[i].png)
                .in('-geometry', '500x500+100+200')
                .in(filedata.job[i].qrcode)
                .flatten()
                .write('/dbdata/' + jobID + '_final.png', function (err) {
                    if (err) console.log(err);
                });

                filedata.job[i].state = "done";
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
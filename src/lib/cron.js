import cron from 'cron';
import https from 'https';
import { ChildProcess } from 'child_process';

const job=new cron.CronJob('*/14 * * * *', function()  {
    https
    .get(process.env.API_URL,(res)=>{
        if (res.statusCode === 200) {
            console.log("Get Reuest Sent Successfully");}
            else {console.log("GET request failes", res.statusCode);}
    })
    .on('error', (e) => console.error(`Error while sending request:`));

});
export default job;  
// new cron js is done

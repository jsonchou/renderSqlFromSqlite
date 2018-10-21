const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('better-sqlite3')
const rainbow = require('done-rainbow')

const asyncExt = require("async");

const delay = 100;
const gap = 1500 * 1;
const limit = 5000;

let db;
let upsqls = [];
let dir = `./.tmp/update1.sql`

let sleep = (r) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(1), Math.random() * delay)
    })
}

let reqPv = async id => {
    return new Promise(async (resolve, reject) => {
        const options = {
            uri: 'https://baike.baidu.com/api/lemmapv',
            json: true,
            qs: {
                r: Date.now(),
                id,
            }
        };
        try {
            await sleep();
            const response = await request(options);
            resolve(response)
        } catch (error) {
            reject(error)
        }
    })
}

let reqShareLike = async lemma_new_id => {
    return new Promise(async (resolve, reject) => {
        const options = {
            uri: 'https://baike.baidu.com/api/wikiui/sharecounter',
            json: true,
            qs: {
                method: 'get',
                lemmaId: lemma_new_id,
            }
        };
        try {
            await sleep();
            const response = await request(options);
            resolve(response)
        } catch (error) {
            reject(error)
        }
    })
}

let update = async (ID, pv = 0, share = 0, like = 0) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = db.prepare("UPDATE Content SET lemma_pv = ?, lemma_like = ? , lemma_share = ?  WHERE ID= ? ");
            resolve(sql.run(pv, like, share, ID));
        } catch (error) {
            console.log('update error', error)
            reject(error)
        }
    })
}

let _diffTime = async (consoleStart) => {

    var date1 = new Date(consoleStart); //开始时间
    var date2 = new Date(); //结束时间
    var date3 = date2.getTime() - new Date(date1).getTime(); //时间差的毫秒数      

    //计算出相差天数
    var days = Math.floor(date3 / (24 * 3600 * 1000))

    //计算出小时数
    var leave1 = date3 % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000))

    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000))

    //计算相差秒数
    var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000)

    return " " + days + "天 " + hours + "小时 " + minutes + "分钟" + seconds + "秒";

}

let run = async () => {

    db = sqlite('d:/pv/SpiderResult.db3', {
        timeout: 10000
    });
    db.pragma('journal_mode = WAL');
    db.pragma('cache_size = 3200');

    let _evt = async () => {
        let rdm = Math.floor(Math.random() * 1000)
        let sql = db.prepare(`SELECT ID, pv_key, lemma_new_id FROM Content where lemma_pv = ? ORDER BY ID  limit ${limit} offset ${limit*rdm}`)
        let keyArrs = sql.all('')
        let consoleStart = Date.now();

        if (keyArrs && keyArrs.length) {
            asyncExt.mapSeries(keyArrs, async function (item, cb) {
                    let [resPv, resShareLike] = await Promise.all([reqPv(item.pv_key), reqShareLike(item.lemma_new_id)])
                    if (resPv && resShareLike) {
                        await update(item.ID, resPv.pv, resShareLike.shareCount, resShareLike.likeCount)
                        // return `ID:${item.ID},LID:${item.lemma_new_id},PV:${resPv.pv},SHARE:${resShareLike.shareCount},LIKE:${resShareLike.likeCount}`
                        return 1
                    } else {
                        return 'null resPv'
                    }
                },
                async function (err, results) {
                    // console.log(results, '\r\n', results.length)
                    let dt = new Date();
                    console.log(results.length, `${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`)
                    console.log('run time:', await _diffTime(consoleStart))
					console.log('sql offset:', rdm)
                    if (err) {
                        console.log('--------------------------------', err)
                    } else {
                        //返回所有成功的结果回去
                        setTimeout(async () => {
                            await _evt();
                        }, gap)
                    }
                })
        } else {
            rainbow('all done!')
            process.exit();
        }

    }

    await _evt();

    console.log('------------------------done!-----------------------------')

};

run()
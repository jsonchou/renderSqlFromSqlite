const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('better-sqlite3')
const rainbow = require('done-rainbow')

const asyncExt = require("async");

const delay = 100;
const gap = 1000 * 1;
const limit = 200;

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
            // await sleep();
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
            // await sleep();
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

let run = async () => {

    db = sqlite('d:/pv/SpiderResult.db3', {
        timeout: 10000
    });
    db.pragma('journal_mode = WAL');
    db.pragma('cache_size = 3200');

    let _evt = async () => {
        let sql = db.prepare(`SELECT ID, pv_key, lemma_new_id FROM Content where lemma_pv = ? limit ${limit}`)
        let keyArrs = sql.all('')

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
                function (err, results) {
                    // console.log(results, '\r\n', results.length)
                    console.log(results.length)
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
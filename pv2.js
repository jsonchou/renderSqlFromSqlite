const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('better-sqlite3')
const rainbow = require('done-rainbow')

const delay = 100;
const gap = 1000 * 1;
const limit = 100;

let db
let upsqls = [];
let dir = `./.tmp/update1.sql`

var sleep = (r) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(1), Math.random() * delay)
    })
}

let req = async id => {
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
        return response;
    } catch (error) {
        return false;
    }
}

let update = async (ID, pv = 0) => {
    try {
        let sql = db.prepare("UPDATE Content SET lemma_pv = ? WHERE ID= ? ");
        // console.log('update res', res)
        // fs.appendFileSync(dir, `UPDATE Content SET lemma_pv = ${pv} WHERE ID= ${ID}; \r\n`)
        return sql.run(pv, ID);
    } catch (error) {
        console.log('update error', error)
        return error;
    }
}

let run = async () => {

    db = sqlite('d:/pv/SpiderResult.db3', {
        timeout: 10000
    });
    db.pragma('journal_mode = WAL');
    db.pragma('cache_size = 32000');

    let _evt = async () => {
        let sql = db.prepare(`SELECT ID, pv_key FROM Content where lemma_pv = ? limit ${limit}`)
        let keyArrs = sql.all('')

        if (keyArrs && keyArrs.length) {

            let proms = keyArrs.map(async item => {
                let res = await req(item.pv_key)
                if (res && res.pv) {
                    // let sql = `UPDATE Content SET lemma_pv = ${res.pv} WHERE ID= ${item.ID};\r\n`;
                    // fs.appendFileSync(`./.tmp/update1.sql`, sql)
                    let res2 = await update(item.ID, res.pv)
                }
            })

            let sqlArrs = await Promise.all(proms).then(res => {

            }).catch(err => {
                console.error(err)
            })

            setTimeout(async () => {
                await _evt();
            }, gap)


        } else {
            rainbow('all done!')
            process.exit();
        }

    }

    await _evt();

    console.log('------------------------done!-----------------------------')

};

run()
const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('sqlite')
const rainbow = require('done-rainbow')

const delay = 100;
const gap = 1500;
const limit = 100;

let db

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
        let res = await db.run("UPDATE Content SET lemma_pv = ? WHERE ID= ? ", pv, ID);
        // console.log('update res', res)
        return res;
    } catch (error) {
        console.log('update error', error)
        return error;
    }
}

let run = async () => {

    db = await sqlite.open('d:/pv/SpiderResult.db3');

    let _evt = async () => {
        let keyArrs = await db.all(`SELECT ID, pv_key FROM Content where lemma_pv = '' limit ${limit}`)

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
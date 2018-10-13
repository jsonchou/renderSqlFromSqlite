const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('sqlite')
const rainbow = require('done-rainbow')

const delay = 100;

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

let update = async (ID, pv, key) => {
    try {
        let res = await db.run("UPDATE Content SET lemma_pv = ? WHERE ID= ? AND pv_key = ?", pv, ID, key);
        return res;
    } catch (error) {
        return error;
    }
}

let run = async () => {

    db = await sqlite.open('E:/perfect-last/Data/1587/SpiderResult.db3');

    let keyArrs = await db.all(`SELECT ID, pv_key FROM Content where lemma_pv='' limit ${limit}`)

    let proms = keyArrs.map(async item => {
        let res = await req(item.pv_key)
        let res2 = await update(item.ID, res.pv, item.pv_key)
    })

    let sqlArrs = await Promise.all(proms).then(res => {

    }).catch(err => {
        console.error(err)
    })

    console.log('------------------------done!-----------------------------')

};

run()
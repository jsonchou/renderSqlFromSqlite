const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('sqlite')
const rainbow = require('done-rainbow')

const dir = './.tmp/pv6.txt'

if (!fs.existsSync(dir)) {
    fs.createFileSync(dir)
}


let dox = async () => {
    const db = await sqlite.open('E:/perfect-last/Data/1587/SpiderResult.db3');

    // let keyArrs = await db.all(`SELECT pv_key FROM Content where ID<8000000 LIMIT 10`)
    let keyArrs = await db.all(`SELECT pv_key FROM Content where ID >18000000 and ID<=22000000 and pv_key !='' `)

    let proms = keyArrs.map(item => {
        fs.appendFileSync(dir, `https://baike.baidu.com/api/lemmapv?id=${item.pv_key}&r=${Date.now()}\r\n`)
    })

    let sqlArrs = await Promise.all(proms);

    rainbow('done!')

};

dox()
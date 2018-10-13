const fs = require('fs-extra')
const sqlite = require('sqlite')
const rainbow = require('done-rainbow')

const dir = './.tmp/pv.txt'

if (!fs.existsSync(dir)) {
    fs.createFileSync(dir)
}

let dox = async () => {
    const db = await sqlite.open('E:/perfect-last/Data/1587/SpiderResult.db3');

    let keyArrs = await db.all(`SELECT pv_key FROM Content limit 10`)

    let proms = keyArrs.map(item => {
        return fs.appendFileSync(dir, `https://baike.baidu.com/api/lemmapv?id=${item.pv_key}&r=${Date.now()}\r\n`)
    })

    let sqlArrs = Promise.all(proms).then(res => {

    }).catch(err => {
        console.error(err)
    })

    rainbow('done!')
    
};

dox()
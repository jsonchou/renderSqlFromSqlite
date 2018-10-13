import fs from 'fs-extra'
import request from 'request'
import sqlite from 'sqlite'

const db = await sqlite.open('E:\\perfect-last\\Data\\1587\\SpiderResult.db3');

let keyArrs = await db.all(`SELECT pv_key from Content`)

const path = './tmp/pv.txt'

if (!fs.existsSync(path)) {
    fs.createFileSync(path)
}

let proms = keyArrs.map(item => {
    return fs.writeFileSync(path, `https://baike.baidu.com/api/lemmapv?id=${item}&r=${Date.now()}`)
})

Promise.all(proms).then(res => {
    if (res && res.length) {
        console.info('done!')
    }
}).catch(err => {
    console.error(err)
})
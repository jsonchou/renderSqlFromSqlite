import fs from 'fs-extra'
import request from 'request'
import sqlite from 'sqlite'

const db = await sqlite.open('E:\\perfect-last\\Data\\1587\\SpiderResult.db3');

let keyArrs = await db.all(`SELECT share, from Content`)

const path = './tmp/share_like.txt'

if (!fs.existsSync(path)) {
    fs.createFileSync(path)
}

keyArrs.map(item => {
    fs.writeFileSync(path)
})
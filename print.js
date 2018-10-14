const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('sqlite')
const rainbow = require('done-rainbow')

let base = 10000;
let index = 1;

let dox = async () => {
    const db = await sqlite.open('E:/perfect-last/Data/1587/SpiderResult.db3');

    let _evt = async () => {

        let dir = './.tmp/index.txt'

        if (!fs.existsSync(dir)) {
            fs.createFileSync(dir)
        }

        let keyArrs = await db.all(`SELECT pv_key FROM Content where ID >${(index-1)*base} and ID<=${index*base} and pv_key !='' `)

        let proms = keyArrs.map(item => {
            fs.appendFileSync(dir, `<a href="//baike.baidu.com/api/lemmapv?id=${item.pv_key}&r=${new Date().getMinutes()}"></a>\r\n`)
        })

        let sqlArrs = await Promise.all(proms);

        index += 1;

        rainbow(` ${index} done!`)

        if (index >= 3) {
            rainbow('all done!')
            process.exit();
            return;
        }

        await _evt();

    }

    await _evt();

    rainbow('all done!')

};

dox()
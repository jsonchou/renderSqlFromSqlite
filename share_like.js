const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('better-sqlite3')
const rainbow = require('done-rainbow')

const delay = 100;
const gap = 1000 * 1;
const limit = 400;

let db

var sleep = (r) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(1), Math.random() * delay)
    })
}

//https://baike.baidu.com/api/wikiui/sharecounter?lemmaId=85897&method=get

let req = async lemma_new_id => {
    const options = {
        uri: 'https://baike.baidu.com/api/wikiui/sharecounter',
        json: true,
        qs: {
            method: 'get',
            lemmaId:lemma_new_id,
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

let update = async (ID, like=0, share=0) => {
    try {
        let res = await db.run("UPDATE Content SET lemma_like = ?, lemma_share = ? WHERE ID= ? ", like, share, ID);
        return res;
    } catch (error) {
        return error;
    }
}

let run = async () => {

    db = await sqlite.open('d:/pv/SpiderResult.db3');

    let _evt = async () => {
        let keyArrs = await db.all(`SELECT ID, lemma_new_id, lemma_like, lemma_share FROM Content where lemma_like = '' limit ${limit}`)

        if (keyArrs && keyArrs.length) {

            let proms = keyArrs.map(async item => {
                let res = await req(item.lemma_new_id)
                if (res && res.pv) {
                    // let sql = `UPDATE Content SET lemma_pv = ${res.pv} WHERE ID= ${item.ID};\r\n`;
                    // fs.appendFileSync(`./.tmp/update1.sql`, sql)
                    let res2 = await update(item.ID, res.likeCount, res.shareCount)
                }
            })

            let sqlArrs = await Promise.all(proms).then(res => {

            }).catch(err => {
                console.error(err)
            })

            _evt();

        } else {
            console.log(111111)
            rainbow('all done!')
            process.exit();
        }

    }

    await _evt();

    console.log('------------------------done!-----------------------------')

};

run()
const fs = require('fs-extra')
const request = require('request-promise')
const sqlite = require('sqlite')
const rainbow = require('done-rainbow')

const dir = './.tmp/pv1.txt'
const tar = './.tmp/pv5.txt'

let dox = async () => {

    let res = fs.readFileSync(tar)
    fs.appendFileSync(dir, res)
    rainbow('done!')

};

dox()
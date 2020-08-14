const fs = require('fs')
const path = require('path')
const Bot = require('../models/bot')
const Admin = require('../models/admin')
const Revision = require('../models/revision')

/*
* Import analytics data from local files to database.
* Data import is a required before data analytics.
*/
var adminList, botList;

const importData = async (req, res, next) => {
    try {
        const promisesReadFile = [
            readFile("./public/data/administrators.txt"),
            readFile("./public/data/bots.txt")
        ];
        Promise.all(promisesReadFile).then(result => {
            adminList = result[0];
            botList = result[1];
        });
        importEditors('bots'),
        importEditors('admin'),
        await importRevisions().then(
            await asyncUpdateUserType
        ).then(
            () => res.status(200).json({message: 'All data imported! You are ready to analytic data ~^-^~'})
        );
    } catch (error) {
        res.status(500).json({message: 'Failed to import data because of internal errors'})
    }
}


/**
 * Import bot authors and admin author stored in .txt files into databases .bots or database .admins
 */
const importEditors = async (type) => {
    try {
        switch (type) {
            case 'bots':
                const botsFile = fs.readFileSync(path.join(process.cwd(), '/public/data/bots.txt'), 'utf8')
                // split the contents by lines
                const botsLines = botsFile.split(/\r?\n/)
                //construct bots data to import
                let bots = []
                botsLines.forEach(botName => {
                    if (botName !== '')
                        bots.push({name: botName, type: 'bot'})
                })
                //clear 'bots' collection, then import new bots names
                await Bot.deleteMany({})
                console.log('importing bots...')
                Bot.insertMany(bots)
                    .then(() => console.log('bots imported'))
                    .catch(err => {
                        return err
                    })
                break
            case 'admin':
                const adminFile = fs.readFileSync(path.join(process.cwd(), '/public/data/administrators.txt'), 'utf8')
                // split the contents by lines
                const adminLines = adminFile.split(/\r?\n/);
                // construct bots data to import
                let admins = []
                adminLines.forEach(adminName => {
                    if (adminName !== '')
                        admins.push({name: adminName, type: 'admin'})
                })
                // clear 'admins' collection, then import new bot names
                await Admin.deleteMany({})
                console.log('importing admins...')
                Admin.insertMany(admins)
                    .then(() => console.log('admins imported'))
                    .catch(err => {
                        return err
                    })
                break
            default:
                break;

        }
    } catch (error) {
        throw err
    }
}

/**
 * Import revision JSON files from local public directory into database.revisions
 */
const importRevisions = async () => {
    try {
        await Revision.deleteMany({})
        const revisionsPath = path.join(process.cwd(), 'public/data/revisions/')
        const revisionFiles = fs.readdirSync(revisionsPath)
        const totalProcess = revisionFiles.length
        let currentProcess = 0

        for (const filename of revisionFiles) {
            console.log(`Importing ${filename} ...`)
            await Revision.insertMany(require(revisionsPath + filename), {ordered: false})
            console.log(`Revision Imported(${++currentProcess}/${totalProcess}): ${filename}`)
        }
    } catch (err) {
        throw err
    }
}

/**
 * Read txt files by filename
 * @param filename path of the file
 * @returns {Promise<unknown>} file to list
 */
function readFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFileAsync(filename)
            .then(function (val) {
                var userList = val.toString().split('\n');
                resolve(userList);
            })
            .catch(function (e) {
                console.error("unable to read file");
                reject();
            });
    });
}

/**
 * Delete userType field
 */
async function deleteUserType() {
    return new Promise(function (resolve, reject) {
        Revision.update({}, {$unset: {userType: 1}}, {multi: true},
            function (err, results) {
                if (err) {
                    console.log("Error");
                    resolve();
                } else {
                    // console.log(results)
                    console.log("userType field deleted");
                    resolve();
                }
            });
    });
}

/**
 * Update userType field for admin
 */
async function updateAdmin(userList) {
    return new Promise(function (resolve, reject) {
        Revision.updateMany(
            {$and: [{"user": {$in: userList}}, {"anon": {$exists: false}}]},
            {$set: {"userType": "admin"}},
            function (err, results) {
                if (err) {
                    console.log("Error");
                    resolve();
                } else {
                    // console.log(results.length)
                    console.log("admin updated");
                    resolve();
                }
            });
    });
}

/**
 * Update userType field for bot and adminAndBot
 */
async function updateAdminAndBot(userList) {
    return new Promise(function (resolve, reject) {
        Revision.updateMany(
            {"user": {$in: userList}, "userType": {$exists: true}, "anon": {$exists: false}},
            {$set: {"userType": "adminAndBot"}},
            function (err, results) {
                if (err) {
                    console.log("Error");
                    resolve();
                } else {
                    // console.log(results.length)
                    console.log("adminAndBot updated");
                    resolve();
                }
            }
        );
    });
}

/**
 * Update userType field for bot
 */
async function updateBot(userList) {
    return new Promise(function (resolve, reject) {
        Revision.updateMany(
            {"user": {$in: userList}, "userType": {$exists: false}, "anon": {$exists: false}},
            {$set: {"userType": "bot"}},
            function (err, results) {
                if (err) {
                    console.log("Error");
                    resolve();
                } else {
                    // console.log(results.length)
                    console.log("bot updated");
                    resolve();
                }
            }
        );
    });
}

/**
 * Update userType field for anonymous
 */
async function updateAnonymous() {
    return new Promise(function (resolve, reject) {
        Revision.updateMany(
            {"anon": {$exists: true}},
            {$set: {"userType": "anonymous"}},
            function (err, results) {
                if (err) {
                    console.log("Error");
                    resolve();
                } else {
                    // console.log(results.length)
                    console.log("anonymous updated");
                    resolve();
                }
            });
    });
}

/**
 * Update userType field for regular user
 */
async function updateRegular() {
    return new Promise(function (resolve, reject) {
        Revision.updateMany(
            {"userType": {$exists: false}},
            {$set: {"userType": "regular"}},
            function (err, results) {
                if (err) {
                    console.log("Error");
                    resolve();
                } else {
                    // console.log(results.length);
                    console.log("regular user updated");
                    resolve();
                }
            });
    });
}

/**
 * Update userType by admin, admin and bot, bot, anonymous and regular user
 */
async function asyncUpdateUserType() {
    await deleteUserType();
    await updateAdmin(adminList);
    await updateAdminAndBot(botList);
    await updateBot(botList);
    await updateAnonymous();
    await updateRegular();
};


module.exports = {
    importData,
    importEditors,
    importRevisions
}

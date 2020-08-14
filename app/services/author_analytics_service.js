const Revision = require('../models/revision')

/**
 * Find the name list of all distinct registered article editors/users.
 *
 * @return {Promise} - Resolve the list of  editor/user names if succeed, reject error if fail.
 */
const findAllAuthorNames = async () => {
    try {
        return await Revision.find({$or: [{userType: 'regular'}, {userType: 'admin'}]}).distinct('user')
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Find articles’ edited by a specific user, along with number of revisions and timestamps of all revisions made to
 * each article.
 *
 * @param {string} user - Name of the user.
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findRevisionsByUser = async (user) => {
    try {
        return await Revision.aggregate([
            {
                $match: {
                    user: user,
                    $or : [
                        {userType: 'regular'},
                        {userType: 'admin'},
                    ]
                }
            },
            {
                $group: {
                    _id: '$title',
                    timestamps: {
                        $addToSet: '$timestamp'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
    } catch (err) {
        return new Error(err)
    }

}

module.exports = {
    findAllAuthorNames,
    findRevisionsByUser
}

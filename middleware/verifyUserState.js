const db = require("../models");
const User = db.user;

checkBannedUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (user.banned === true) {
            res.status(400).send({ message: "Banned User!" });
            return;
        }
        next();
    } catch (err) {
        res.status(500).send({ message: err });
    }
};

const verifyUserState = {
    checkBannedUser
};

module.exports = verifyUserState;
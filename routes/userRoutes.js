
const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/signup", signup);
router.post("/login", login);

router.get("/", authMiddleware, roleMiddleware("admin"), getUsers);
router.get("/:id", authMiddleware, roleMiddleware("admin"), getUserById);
router.patch("/:id", authMiddleware, roleMiddleware("admin"), updateUser);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

module.exports = router;

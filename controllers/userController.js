
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let users = [];

const safeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
});

const initializeAdmin = async () => {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || !process.env.JWT_SECRET) {
        throw new Error("Admin credentials or JWT secret missing from .env");
    }

    const existingAdmin = users.find(user => user.email === email);

    if (existingAdmin) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({
        id: 1,
        name: process.env.ADMIN_NAME || "Admin",
        email,
        password: hashedPassword,
        role: "admin"
    });
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = users.find(user => user.email === normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newId = users.length
            ? Math.max(...users.map(user => user.id)) + 1
            : 1;

        const user = {
            id: newId,
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "student"
        };

        users.push(user);

        res.status(201).json({
            message: "Signup successful",
            user: safeUser(user)
        });
    } catch (error) {
        console.log("SIGNUP ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = users.find(user => user.email === normalizedEmail);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: safeUser(user)
        });
    } catch (error) {
        console.log("LOGIN ERROR:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

const getUsers = (req, res) => {
    res.json(users.map(safeUser));
};

const getUserById = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json(safeUser(user));
};

const updateUser = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const { name, email, role } = req.body;

    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Invalid name" });
        }
        user.name = name.trim();
    }

    if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = users.find(
            item => item.email === normalizedEmail && item.id !== id
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        user.email = normalizedEmail;
    }

    if (role !== undefined) {
        if (!["admin", "student"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        user.role = role;
    }

    res.json({
        message: "User updated successfully",
        user: safeUser(user)
    });
};

const deleteUser = (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const index = users.findIndex(user => user.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    users.splice(index, 1);

    res.json({
        message: "User deleted successfully"
    });
};

module.exports = {
    signup,
    login,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    initializeAdmin
};

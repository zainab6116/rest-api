
require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const { initializeAdmin } = require("./controllers/userController");

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "REST API is running"
    });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await initializeAdmin();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log("SERVER ERROR:", error.message);
        process.exit(1);
    }
};

startServer();

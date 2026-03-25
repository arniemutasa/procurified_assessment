const express = require("express");
const helmet = require("helmet");

// Import routes
const lineageRoutes = require("./routes/lineageRoutes");
const calculationRoutes = require("./routes/calculationRoutes");


const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");


function createApp(){
    const app = express();

    // Header tightning and json parsing middleware
    app.use(helmet());
    app.use(express.json({limit: '16kb'}))


    // Health check route
    app.get('/health', (req, res)=>{
        res.json({
            success: true,
            message: 'App is running.'
        })
    });

    app.use('/api/v1/lineage', lineageRoutes);
    app.use('/api/v1/calculations', calculationRoutes);

    // Global middleware
    app.use(notFound);
    app.use(errorHandler)

    return app;
}

module.exports = {createApp}
const express = require("express");
const helmet = require("helmet");


function createApp(){
    const app = express();

    // Global middleware
    app.use(helmet());
    app.use(express.json({limit: '16kb'}))


    // Health check route
    app.get('/health', (req, res)=>{
        res.json({
            success: true,
            message: 'App is running.'
        })
    });

    return app;
}

module.exports = {createApp}
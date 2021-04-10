#!/usr/bin/env node

const selection = require("@inquirer/select");
const { log } = require("console");

async function selectMode() {
    log("Welcome to DB-Manager! Follow the Steps below to Connect to your Database.\n")

    let mode = await selection({
        message: '[Step 1/2] - Which NPM Package do you use to Operate your Database?',
        choices: [
            {
                name: 'QuickMongo',
                description: 'Enter your MongoURI to Access your Database.',
                value: "cloud",
            },
            {
                name: 'Quick.DB',
                description: 'Enter the File Path to Your "json.sqlite" File to Access your Database.',
                value: "local",
            },
        ],
    })

    require(`./methods/${mode}`)
}

selectMode();
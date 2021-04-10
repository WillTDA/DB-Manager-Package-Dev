#!/usr/bin/env node
const { log } = require("console");
const fs = require("fs");
const selection = require("@inquirer/select");
const input = require("@inquirer/input");
const showData = require("../functions/showData");
const createErrorMessage = require("../functions/createErrorMessage");

async function main() {

    let dbPath = await input({
        message: '[Step 2/2] - Please Enter the File Path to Your "json.sqlite" File Below to Connect to your Database!\n\nIf it doesn\'t exist, you\'ll be prompted if you wish to make one.\n'
    })

    dbPath = await dbPath.replace(/"/g, '')

    try {
        let db;
        log("\nVerifying File Path...\n")
        if(dbPath === "") return createErrorMessage("No File Path was Provided!")
        if(!dbPath.includes(":")) return createErrorMessage(`"${dbPath}" Is Not a Valid Directory!`)
        if(!dbPath.endsWith("json.sqlite")) return createErrorMessage(`"${dbPath}" Is Not a Quick.DB/SQLite File!`)
        if(!fs.existsSync(dbPath.replace(/json.sqlite(?!.*json.sqlite)/, ""))) return createErrorMessage(`"${dbPath.replace(/json.sqlite(?!.*json.sqlite)/, "")}" is a Non-Existent Folder!`)
        if(!fs.existsSync(dbPath)) {
            let answer = await selection({
                message: `There is No Quick.DB/SQLite File at "${dbPath}".\nWould you Like to Create One There?`,
                choices: [
                    {
                        name: 'Yes',
                        description: `Create a Quick.DB/SQLite File at "${dbPath}".`,
                        value: 1,
                    },
                    {
                        name: 'No',
                        description: 'Close this Program.',
                        value: 2,
                    },
                ],
            })
            if (answer === 1) {
                fs.writeFileSync(dbPath, "");
            }
            else if (answer === 2) {
                return process.exit();
            }
        }

        db = require("@devsnowflake/quick.db").static(dbPath)

        log("Successfully Linked to Quick.DB/SQLite File!")
        log(`\nWelcome to DB-Manager's Root Menu!\nMode: Quick.DB/SQLite Database\nFile Path: ${dbPath}`)

        async function promptRootMenu() {
            let answer = await selection({
                message: 'Do you want to do Anything Else?',
                choices: [
                    {
                        name: 'Yes',
                        description: 'Go Back to the Root Menu and Choose Another Operation.',
                        value: 1,
                    },
                    {
                        name: 'No',
                        description: 'Close this Program.',
                        value: 2,
                    },
                ],
            })
            if (answer === 1) {
                return rootMenu()
            }
            else if (answer === 2) {
                return process.exit();
            }
        }

        async function rootMenu() {
            process.removeAllListeners()
            let operation = await selection({
                message: 'What Task would you like to Perform on your Database?',
                choices: [
                    {
                        name: 'Fetch',
                        description: 'Retrieve an Entry from the Database.',
                        value: "fetch",
                    },
                    {
                        name: 'Fetch All',
                        description: 'Retrieve All Entries from the Database.',
                        value: "fetchall",
                    },
                    {
                        name: 'Set',
                        description: 'Save a Value to the Database.',
                        value: "set",
                    },
                    {
                        name: 'Delete',
                        description: 'Delete an Entry from the Database.',
                        value: "delete",
                    },
                    {
                        name: 'Delete All',
                        description: 'Delete All Entries from the Database.',
                        value: "deleteall",
                    },
                    {
                        name: 'Exit Program',
                        description: 'Close this Program.',
                        value: "exit",
                    },
                ],
            })

            if (operation === "fetch") {
                let key = await input({
                    message: 'Please Enter the ID/Key for this Entry:\n'
                })

                if (!key) {
                    createErrorMessage("An ID/Key was Not Provided!")
                    return rootMenu()
                }

                let data = {
                    ID: (await db.get(key)) === null ? null : key,
                    data: await db.get(key)
                }
                showData(JSON.stringify(data, null, 4))
                return promptRootMenu()
            }
            else if (operation === "fetchall") {
                let data = await db.fetchAll()
                showData(JSON.stringify(data, null, 4))
                return promptRootMenu()
            }
            else if (operation === "set") {
                let key = await input({
                    message: 'Please Enter the ID/Key of this Entry:\n'
                })
                if (!key) {
                    createErrorMessage("An ID/Key was Not Provided!")
                    return rootMenu()
                }
                let value = await input({
                    message: 'Please Enter the Data/Value of this Entry:\n'
                })
                if (!value) {
                    createErrorMessage("An ID/Key was Not Provided!")
                    return rootMenu()
                }

                let data = {
                    ID: key,
                    data: value
                }
                let answer = await selection({
                    message: `Confirmation: You're about to Write this Entry to the Database:\n\n${JSON.stringify(data, null, 4)}\n\nIs this Correct?`,
                    choices: [
                        {
                            name: 'Yes',
                            description: 'Save this Data to the Database.',
                            value: 1,
                        },
                        {
                            name: 'No',
                            description: 'Go Back to the Root Menu. This Data won\'t be Saved.',
                            value: 2,
                        },
                    ],
                })
                if (answer === 1) {
                    await db.set(key, value)
                    showData("Data Successfully Saved!")
                    return promptRootMenu()
                }
                else if (answer === 2) {
                    return rootMenu()
                }
            }
            else if (operation === "delete") {
                let key = await input({
                    message: 'Please Enter the ID/Key for this Entry:\n'
                })

                if (!key) {
                    createErrorMessage("An ID/Key was Not Provided!")
                    return rootMenu()
                }

                let data = {
                    ID: key,
                    data: await db.get(key)
                }

                let answer = await selection({
                    message: `Confirmation: You're about to Delete this Entry from the Database:\n\n${JSON.stringify(data, null, 4)}\n\nAre you Sure?`,
                    choices: [
                        {
                            name: 'Yes',
                            description: 'Delete this Entry from the Database.',
                            value: 1,
                        },
                        {
                            name: 'No',
                            description: 'Go Back to the Root Menu. This Entry won\'t be Affected.',
                            value: 2,
                        },
                    ],
                })
                if (answer === 1) {
                    await db.delete(key)
                    showData("Entry Successfully Deleted!")
                    return promptRootMenu()
                }
                else if (answer === 2) {
                    return rootMenu()
                }
            }
            else if (operation === "deleteall") {
                let answer = await selection({
                    message: 'Are you Sure you want to Delete All Data? This can\'t be undone!',
                    choices: [
                        {
                            name: 'Yes',
                            description: 'Delete All Data from the Database.',
                            value: 1,
                        },
                        {
                            name: 'No',
                            description: 'Go Back to the Root Menu. Your Data won\'t be Affected.',
                            value: 2,
                        },
                    ],
                })
                if (answer === 1) {
                    await db.deleteAll()
                    showData("Successfully Deleted All Data!")
                    return promptRootMenu()
                }
                else if (answer === 2) {
                    return rootMenu()
                }
            }
            else if (operation === "exit") {
                process.exit();
            }

        }
        await rootMenu();
    } catch (e) {
        createErrorMessage("No/Invalid File Path was Provided!")
        console.log(e)
    }
}
main();
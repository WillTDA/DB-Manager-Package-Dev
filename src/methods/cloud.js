#!/usr/bin/env node
const { Database } = require("quickmongo");
const { log } = require("console");
const password = require("@inquirer/password");
const selection = require("@inquirer/select");
const input = require("@inquirer/input");
const showData = require("../functions/showData");
const createErrorMessage = require("../functions/createErrorMessage");

async function main() {

    let uri = await password({
        message: "[Step 2/2] - Please Enter Your MongoDB Database URI Below to Connect to your Database!\n",
        mask: "*",
    })

    try {
        log("Attempting to Connect...")
        const db = new Database(uri)
        await db.connect()

        log("Successfully Connected to Database!")
        log(`\nWelcome to DB-Manager's Root Menu!\nMode: QuickMongo/MongoDB Database`)

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
        createErrorMessage("No/Invalid MongoDB URI was Provided!")
    }
}
main();
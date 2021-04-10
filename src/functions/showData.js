module.exports = function (string) {
    if (string == null || string.length == 0 || string == "[]") {
        console.log("--------------------------------------\n")
        console.log("No Data to Display!")
        console.log("\n--------------------------------------")
    }
    else {
        console.log("--------------------------------------\n")
        console.log(string)
        console.log("\n--------------------------------------")
    }
}
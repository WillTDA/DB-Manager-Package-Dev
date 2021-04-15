module.exports = function (string) {
    if (string == null || string.length == 0 || string == "[]" || string == []) {
        console.log("\n--------------------------------------\n")
        console.log("No Data to Display!")
        console.log("\n--------------------------------------\n")
    }
    else {
        console.log("\n--------------------------------------\n")
        console.log(string)
        console.log("\n--------------------------------------\n")
    }
}
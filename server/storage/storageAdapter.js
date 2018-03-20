
var Storage = require("node-persist");
const path = require("path");
const SERVER_ENDPOINT = "/storageAdapter";
const SERVER_GET_ENDPOINT = SERVER_ENDPOINT + "/get";
const SERVER_SAVE_ENDPOINT = SERVER_ENDPOINT + "/save";
const bodyParser = require("body-parser");
console.log(SERVER_GET_ENDPOINT);
function serversideStorage(app) {
    Storage.initSync(
        {
            dir: "./persistence",
            logging: true
        }
    );
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
		extended: true
    }));
    app.post(SERVER_GET_ENDPOINT, (req, res) => {
        let { key } = req.body;
        console.log("SERVER GET", key);
        if (typeof key === "undefined") {
            return res.status(500).send("No key passed to Storage.get on the server.");
        }
        let data = Storage.getItemSync(key);
        console.log("GOT DATA", key, data);
        res.send(data);
    });

    app.post(SERVER_SAVE_ENDPOINT, (req, res) => {
        let { key, value } = req.body;
        console.log("SERVER SAVE", key, value);

        if (typeof key === "undefined") {
            return res.status(500).send("No key passed to Storage.save on the server.");
        }
        if (typeof value === "undefined") {
            return res.status(500).send("No value passed to Storage.save on the server.");
        }

        let data = Storage.setItemSync(key, value);
        res.send(data);
    });
};

module.exports = serversideStorage;
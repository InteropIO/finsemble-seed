
import AWS from "aws-sdk";
const Finsemble = require("@finsemble/finsemble-core");
const BaseStorage = Finsemble.models.baseStorage
const {
  Clients: { Logger },
} = Finsemble
//Because calls to this storage adapter will likely come from many different windows, we will log successes and failures in the central logger.
Logger.start();

const { log, error: errorLog } = Logger


AWS.config.update({
  region: "us-east-1",
  // endpoint: "http://localhost:8000",
  // endpoint: "https://dynamodb.us-west-2.amazonaws.com"

  // accessKeyId default can be used while using the downloadable version of DynamoDB.
  // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  accessKeyId: "YOUR_KEY_HERE",
  // secretAccessKey default can be used while using the downloadable version of DynamoDB.
  // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  secretAccessKey: "ACCESS_KEY_HERE"
});

const docClient = new AWS.DynamoDB.DocumentClient();
// const dynamodb = new AWS.DynamoDB();
const TABLE = "fsbl";




class awsAdapter extends BaseStorage {
  constructor(_storageAdapterName: string) {
    super(arguments);
  }


  /**
   * Save method.
   * @param {object} params
   * @param {string} params.topic A topic under which the data should be stored.
   * @param {string} params.key The key whose value is being set.
   * @param {any} params.value The value being saved.
   * @param {function} cb callback to be invoked upon save completion
   */
  save = (params: { topic: string; key: string; value: any; }, cb: (err: null, response: { status: string; }) => any) => {

    let combinedKey = this.getCombinedKey(this, params);

    docClient.update({
      TableName: TABLE,
      Key: {
        "combinedKey": combinedKey
      },
      UpdateExpression: "set params =:r",
      ExpressionAttributeValues: {
        ":r": params.value
      },
      ReturnValues: "UPDATED_NEW"
    }, function (err: any, data: any) {
      if (err) {
        errorLog("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        cb(err, { status: "failed" })
      } else {
        log("Added item:", JSON.stringify(data, null, 2));
        cb(null, { status: "success" });
      }
    });

    //need to implement
    // return cb(null, null);
  }

  /**
   * Get method.
   * @param {object} params
   * @param {string} params.topic A topic under which the data should be stored.
   * @param {string} params.key The key whose value is being set.
   * @param {function} cb callback to be invoked upon completion
   */
  get = (params: any, cb: (arg0: any, arg1: any) => any) => {
    let combinedKey = this.getCombinedKey(this, params);

    docClient.get({
      TableName: TABLE,
      Key: {
        "combinedKey": combinedKey
      }
    }, function (err: any, data: { Item: { params: any; }; }) {
      if (err) {
        errorLog("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        cb(err, { status: "failed" })
      } else {
        log("Read successful:", JSON.stringify(data, null, 2));
        cb(null, data.Item?.params);
      }
    });


    //need to implement
    // return cb(null, undefined);
  }

  /**
   * Returns all keys that we're saving data for.
   * @param {*} params
   * @param {*} cb
   */
  keys = (params: any, cb: (arg0: null, arg1: never[]) => any) => {
    // need to implement
    return cb(null, []);
  }

  /**
   * Delete method.
   * @param {object} params
   * @param {string} params.topic A topic under which the data should be stored.
   * @param {string} params.key The key whose value is being deleted.
   * @param {function} cb callback to be invoked upon completion
   */
  delete = (params: any, cb: (arg0: null, arg1: []) => void) => {
    let combinedKey = this.getCombinedKey(this, params);


    // console.log("Attempting a conditional delete...");
    // docClient.delete({
    //   TableName: TABLE,
    //   Key: {
    //     "combinedKey": combinedKey
    //   },
    //   ConditionExpression: "info.rating <= :val",
    //   ExpressionAttributeValues: {
    //     ":val": 5.0
    //   }
    // }
    //   , function (err, data) {
    //     if (err) {
    //       console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    //     } else {
    //       console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
    //     }
    //   });

    //need to implement
    cb(null, []);
  }

  /**
   * This method should be used very, very judiciously. It's essentially a method designed to wipe the database for a particular user.
   */
  clearCache = (params: any, cb: (arg0: null, arg1: { status: string; }) => void) => {
    //need to implement
    cb(null, { status: "success" });
  }

  /**
   * Wipes the storage container.
   * @param {function} cb
   */
  empty = (cb: () => void) => {
    //todo need to implement
    cb();
  }
}

export default new awsAdapter("awsAdapter");
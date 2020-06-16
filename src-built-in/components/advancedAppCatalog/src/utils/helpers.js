import { findIndex } from "lodash";

export const findAppIndexInFolder = (appID, folderName, folders) =>
	findIndex(folders[folderName].apps, (app) => app.appID === appID);

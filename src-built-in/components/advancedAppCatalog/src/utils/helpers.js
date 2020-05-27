import { findIndex } from 'lodash';

export const findAppIndexInFolder = (appID, folderName, folders) => {
    return findIndex(folders[folderName].apps, app => app.appID === appID);
}
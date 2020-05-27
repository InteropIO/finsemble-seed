import { findIndex } from 'lodash';
import { getStore } from '../stores/appStore';

export const findAppIndexInFolder = (appID, folderName, folders) => {
    return findIndex(folders[folderName].apps, app => app.appID === appID);
}
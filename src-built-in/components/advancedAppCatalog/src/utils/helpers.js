import { getStore } from '../stores/appStore';

export const findAppIndexInFolder = (appID, folderName) => {
    const folders = getStore().getValue("appFolders.folders");
    
    return findIndex(folders[folderName].apps, app => app.appID === appID);
}
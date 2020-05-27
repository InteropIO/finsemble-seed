import { findIndex } from 'lodash';
import storeActions from '../stores/StoreActions';

export const findAppIndexInFolder = (appID, folderName) => {
	const folder = storeActions.getSingleFolder(folderName);
	return findIndex(folder.apps, app => app.appID === appID);
}

export const isAppInFavorites = (appID) => {
	const index = findAppIndexInFolder(appID, "Favorites");

	if (index < 0)  return false;
	return true;
}
import { findIndex } from 'lodash';
import storeActions from '../stores/StoreActions';

export const findAppIndexInFolder = (appID, folderName) => {
	const folder = storeActions.getSingleFolder(folderName);
	return findIndex(folder.apps, app => app.appID === appID);
}

export const isAppInFavorites = (appID) => {
	const favorites = storeActions.getSingleFolder('Favorites').apps;
	const index = findAppIndexInFolder(appID, favorites);

	if (index < 0)  return false;
	return true;
}
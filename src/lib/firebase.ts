import { getAuth } from '@react-native-firebase/auth';
import { getDatabase } from '@react-native-firebase/database';
import { getStorage } from '@react-native-firebase/storage';

const authInstance = getAuth();

const app = (authInstance as any)?.app;
const appOptions = app?.options;
const projectId: string | undefined = appOptions?.projectId;
const configuredDatabaseURL: string | undefined = appOptions?.databaseURL;

// If native config is missing DATABASE_URL, Firebase Database may connect to the wrong host (or fail).
// We fallback to Firebase's default instance URL pattern.
const inferredDatabaseURL =
	!configuredDatabaseURL && projectId ? `https://${projectId}-default-rtdb.firebaseio.com` : undefined;

const db = inferredDatabaseURL ? getDatabase(app, inferredDatabaseURL) : getDatabase(app);
const storageInstance = getStorage(app);

if (__DEV__) {
	try {
		const options = (authInstance as any)?.app?.options;
		// Avoid logging secrets; these are safe identifiers.
		// eslint-disable-next-line no-console
		console.log(
			'[firebase] projectId:',
			options?.projectId,
			'hasDatabaseURL:',
			Boolean(options?.databaseURL),
			'hasStorageBucket:',
			Boolean(options?.storageBucket),
		);

		if (!options?.databaseURL) {
			// eslint-disable-next-line no-console
			console.warn(
				'[firebase] Realtime Database URL is missing from native config. ' +
					(inferredDatabaseURL
						? `Using inferred default: ${inferredDatabaseURL}`
						: 'Unable to infer default (missing projectId).') +
					'\nFix: add DATABASE_URL to ios/GoogleService-Info.plist and include android/app/google-services.json with firebase_url.',
			);
		}
	} catch {
		// ignore
	}
}

export { authInstance as auth, db, storageInstance as storage };

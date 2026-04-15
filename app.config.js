import fs from 'fs';
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const [major, minor, patch] = packageJson.version.split('.').map(Number);
const versionCode = (major * 10000) + (minor * 100) + patch;

export default ({ config }) => {
    const isDev = process.env.APP_VARIANT === 'development';

    return {
        ...config,
        android: {
            package: isDev 
                ? 'com.azureitte.scratchdroid.dev' 
                : 'com.azureitte.scratchdroid',
            versionCode,
        },
        ios: {
            bundleIdentifier: isDev 
                ? 'com.azureitte.scratchdroid.dev' 
                : 'com.azureitte.scratchdroid',
        },
        name: isDev ? 'Scratch (dev)' : 'Scratch',
    }
}
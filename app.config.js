export default ({ config }) => {
    const isDev = process.env.APP_VARIANT === 'development';

    const [major, minor, patch] = config.version.split('.').map(Number);
    const versionCode = (major * 10000) + (minor * 100) + patch;

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
export default ({ config }) => {
    const isDev = process.env.APP_VARIANT === 'development';

    return {
        ...config,
        android: {
            package: isDev 
                ? 'com.azureitte.scratchdroid.dev' 
                : 'com.azureitte.scratchdroid',
        },
        ios: {
            bundleIdentifier: isDev 
                ? 'com.azureitte.scratchdroid.dev' 
                : 'com.azureitte.scratchdroid',
        },
        name: isDev ? 'Scratch (dev)' : 'Scratch',
    }
}
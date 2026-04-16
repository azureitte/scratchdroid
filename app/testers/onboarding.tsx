import {
    StyleSheet,
    Text,
    ScrollView,
    View,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

import { sleep } from '@/util/functions';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useSettings } from '@/hooks/useSettings';
import Heading from '@/components/general/Heading';
import Button from '@/components/general/Button';

const TestersOnboardingPage = () => {

    const { setSetting } = useSettings();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleContinue = async () => {
        setSetting('flag_hasSeenTestersOnboarding', true);
        await sleep(777);
        router.replace('/home');
    }

    useChangeAppStateOnFocus({
        headerVisible: false,
        footerVisible: false,
        primaryColor: 'regular',
    });

    return (<>
        <ScrollView 
            style={[styles.container, { 
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            }]}
            contentContainerStyle={{
                gap: 12,
            }}
        >
            <Image 
                source={{ uri: 'https://cdn.kanava.ucrash.fun/scratchdroid/art/catblocklove.png' }} 
                style={[styles.image, {
                    aspectRatio: 16/9,
                    marginHorizontal: 'auto',
                    marginVertical: 32,
                    marginTop: 48,
                }]} 
                height={100}
            />

            <Heading style={{ fontSize: 32 }}>Welcome, dear testers!</Heading>

            <Text style={styles.paragraph}>
                Thank you for deciding to give this app a shot!
                As an early tester, your help means a lot to me.
            </Text>

            <Text style={styles.paragraph}>
                I want to preface this by saying that, in its current state,
                the app is very incomplete. Please do be aware, that some of
                the content missing is planned and will be added soon. Examples include:
            </Text>

            <View style={styles.ul}>
                <Text style={styles.li}>
                    - Studio pages
                </Text>
                <Text style={styles.li}>
                    - Account settings
                </Text>
                <Text style={styles.li}>
                    - Ability to edit profile and projects
                </Text>
                <Text style={styles.li}>
                    - Ability to view your private projects
                </Text>
                <Text style={styles.li}>
                    ... and more!
                </Text>
            </View>

            <Text style={styles.paragraph}>
                Please report all bugs, app crashes, feature ideas and other inquiries
                over to <Link href="mailto:azureitte@gmail.com" style={styles.link}>
                azureitte@gmail.com
                </Link>.
                I will try my best to address all of them.
            </Text>

            <Text style={styles.paragraph}>
                Have fun!
            </Text>


            <Button
                text="Continue"
                role="primary"
                variation="big"
                fullWidth
                onPress={handleContinue}
                style={{ marginTop: 32 }}
            />
        </ScrollView>
    </>);
    
};

export default TestersOnboardingPage;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1d2b4d',
        padding: 24,
    },

    paragraph: {
        fontSize: 20,
        lineHeight: 28,
        marginTop: 24,
        color: '#fff',
    },

    image: {
        maxWidth: '100%',
        borderRadius: 12,
    },

    ul: {
        gap: 8,
        marginTop: 12,
    },
    li: {
        fontSize: 20,
        lineHeight: 28,
        color: '#fff',
        marginStart: 18,
    },

    link: {
        color: "#93C0FF",
        fontWeight: 500,
        fontStyle: 'normal',
        textDecorationLine: 'underline',
    },
});

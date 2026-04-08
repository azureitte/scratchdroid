import {
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';

import { PNGS, SVGS } from '@/util/assets';
import type { ScratchExtension } from '@/util/types/api/project.types';

type ExtensionChipProps = {
    extension: ScratchExtension|'cloud';
}

const EXTENSIONS: Record<ScratchExtension|'cloud', {
    name: string;
    icon: any;
    isSvg?: boolean;
}> = {
    text2speech: {
        name: 'Text to Speech',
        icon: SVGS.project.extTts,
    },
    videoSensing: {
        name: 'Video Sensing',
        icon: SVGS.project.extVideo,
    },
    pen: {
        name: 'Pen',
        icon: SVGS.project.extPen,
    },
    music: {
        name: 'Music',
        icon: SVGS.project.extMusic,
    },
    translate: {
        name: 'Translate',
        icon: PNGS.project.extTranslate,
        isSvg: false,
    },
    makeymakey: {
        name: 'Makey Makey',
        icon: PNGS.project.extMakeymakey,
        isSvg: false,
    },
    microbit: {
        name: 'micro:bit',
        icon: PNGS.project.extMicrobit,
        isSvg: false,
    },
    gdxfor: {
        name: 'Force and Acceleration',
        icon: SVGS.project.extGdxfor,
    },
    ev3: {
        name: 'LEGO MINDSTORMS EV3',
        icon: SVGS.project.extEv3,
    },
    wedo2: {
        name: 'WeDo 2.0',
        icon: PNGS.project.extWedo2,
        isSvg: false,
    },
    faceSensing: {
        name: 'Face Sensing',
        icon: SVGS.project.extFaceSensing,
    },
    cloud: {
        name: 'Cloud Variables',
        icon: SVGS.project.cloud,
    },
};

const ExtensionChip = ({
    extension,
}: ExtensionChipProps) => {
    if (!EXTENSIONS[extension]) return null;
    const { name, icon, isSvg = true } = EXTENSIONS[extension];

    const Icon = isSvg ? icon : ((props: any) => <Image
        source={icon}
        {...props}
    />);

    return (<View style={styles.extensionChip}>
        <Icon style={styles.extensionChipIcon} height={24} width={24} />
        <Text style={styles.extensionChipText}>{name}</Text>
    </View>);
};

export default ExtensionChip;

const styles = StyleSheet.create({
    extensionChip: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
    },
    extensionChipIcon: {
        width: 24,
        height: 24,
    },
    extensionChipText: {
        fontSize: 16,
        fontWeight: 600,
        color: '#fff',
    },
});

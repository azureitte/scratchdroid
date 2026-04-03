import { View, StyleSheet } from 'react-native';

import { buildMenu } from '@/util/functions';
import { useSheet } from '@/hooks/useSheet';
import Button from '@/components/general/Button';

const CreateMenu = () => {
    const sheet = useSheet();

    return (
        <View style={styles.container}>
            <Button text="New Project" variation='big' role='primary' />
            <Button text="New Studio" variation='big' />
        </View>
    );
};

export default buildMenu({
    title: 'Create',
    render: () => <CreateMenu />,
    detents: ['auto', 1],
});

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 16,
    },
});

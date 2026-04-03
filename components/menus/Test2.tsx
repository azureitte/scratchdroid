import { View, Text } from 'react-native';

import { buildMenu } from '@/util/functions';

const Test2Menu = () => {
    return (
        <View style={{ height: 300 }}>
            <Text>Hiii</Text>
        </View>
    );
};

export default buildMenu({
    title: 'Test 2',
    render: () => <Test2Menu />,
});

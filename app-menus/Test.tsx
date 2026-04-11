import { View } from 'react-native';

import { buildMenu } from '@/util/functions';
import { useSheet } from '@/hooks/useSheet';
import FormInput from '@/components/general/FormInput';
import Button from '@/components/general/Button';

const TestMenu = () => {
    const sheet = useSheet();

    return (
        <View style={{ height: 500 }}>
            <FormInput label="Comment" placeholder="Comment" type="text" />
            <Button text="Test 2" onPress={() => sheet.push('test2')} />
        </View>
    );
};

export default buildMenu({
    title: 'Test Menu',
    render: () => <TestMenu />,
    detents: ['auto', 1],
});

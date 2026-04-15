import { StyleSheet, View } from "react-native";

import Button from "@/components/general/Button";

const ListLoadMore = ({
    hasNextPage,
    isLoading,
    fetchNextPage,
}: {
    hasNextPage: boolean;
    isLoading: boolean;
    fetchNextPage: () => void;
}) => (
    <View style={[styles.pageEnd]}>
        { hasNextPage && <Button
            text="general.loadMore"
            role="primary"
            fullWidth translate
            isLoading={isLoading}
            onPress={fetchNextPage}
        /> }
    </View>
);

export default ListLoadMore;

const styles = StyleSheet.create({
    pageEnd: {
        padding: 8,
        paddingTop: 16,
        paddingBottom: 24,
        width: '100%',
    },
});
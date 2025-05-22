import { useContext } from "react";
import { Text, View, Image } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";
import MyStyles from "../../styles/MyStyles";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
    const user = useContext(MyUserContext);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const logout = () => {
        dispatch({
            type: "logout"
        });

        nav.navigate("index");
    };

    return (
        <View style={styles.container}>
            {user?.avatar && (
                <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatar}
                />
            )}

            <Text style={styles.name}>
                {user?.last_name} {user?.first_name}
            </Text>

            <Text style={styles.username}>
                @{user?.username}
            </Text>

            {user?.resident && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Họ và tên: {user.resident.name}
                    </Text>
                    <Text style={styles.infoText}>
                        Quan hệ với chủ hộ: {user.resident.relationship_to_head}
                    </Text>
                </View>
            )}

            <Button
                onPress={logout}
                mode="contained"
                style={styles.logoutBtn}
                labelStyle={{ fontSize: 16 }}
            >
                Đăng xuất
            </Button>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    username: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    infoBox: {
        marginVertical: 20,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 16,
        color: '#444',
        marginBottom: 5,
    },
    logoutBtn: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 20,
        borderRadius: 10,
    },
};

export default Profile;

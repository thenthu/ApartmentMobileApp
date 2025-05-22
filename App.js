import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { useContext, useReducer } from "react";
import MyUserReducer from "./reducers/MyUserReducer";
import Home from "./components/Home/Home";
import Login from "./components/User/Login";
import Profile from "./components/User/Profile";
import MyInvoices from "./components/Resident/MyInvoices";
import MyLockers from "./components/Resident/MyLockers";
import MyComplaints from "./components/Resident/MyComplaints";
import Residents from "./components/Admin/Residents";
import ResidentDetails from "./components/Admin/ResidentDetail";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Residents" component={Residents} options={{ title: "Danh sách cư dân" }} />
      <Stack.Screen name="ResidentDetails" component={ResidentDetails} options={{ title: "Chi tiết cư dân" }} />
      <Stack.Screen name="MyInvoices" component={MyInvoices} options={{ title: "Danh sách hóa đơn" }} />
      <Stack.Screen name="MyLockers" component={MyLockers} options={{ title: "" }} />
      <Stack.Screen name="MyComplaints" component={MyComplaints} options={{ title: "" }} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);
  return (
    <Tab.Navigator>
      {user === null ? (
        <>
          <Tab.Screen
            name="login"
            component={Login}
            options={{
              title: 'Đăng nhập',
              headerShown: false,
              tabBarStyle: { display: 'none' },
              tabBarIcon: () => <Icon size={30} source="account" />,
            }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="home"
            component={StackNavigator}
            options={{
              headerShown: false,
              title: 'Trang chủ',
              tabBarIcon: () => <Icon size={30} source="home" />,
            }}
          />
          <Tab.Screen
            name="profile"
            component={Profile}
            options={{
              headerShown: false,
              title: 'Tài khoản',
              tabBarIcon: () => <Icon size={30} source="account" />,
            }}
          />
          
          <Tab.Screen
            name="Chat"
            component={Chat}
            options={{
              title: "Chat",
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;
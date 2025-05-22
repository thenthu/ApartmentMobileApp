import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { Card, Avatar, TouchableRipple } from "react-native-paper";
import { authApis, endpoints } from "../../configs/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyUserContext } from "../../configs/Contexts";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const quanHeVietHoa = {
  "owner": "Chủ hộ",
  "wife/husband": "Vợ/Chồng",
  "child": "Con cái",
  "other": "Khác"
};

const relationshipPriority = {
  "owner": 1,
  "wife/husband": 2,
  "child": 3,
  "other": 4
};

const groupResidentsByRoom = (residents) => {
  const grouped = {};
  residents.forEach((res) => {
    const room = res.apartment?.number ?? "Không rõ";
    if (!grouped[room]) grouped[room] = [];
    grouped[room].push(res);
  });

  Object.keys(grouped).forEach((room) => {
    grouped[room].sort((a, b) => {
      const relA = relationshipPriority[a.relationship_to_head] ?? 99;
      const relB = relationshipPriority[b.relationship_to_head] ?? 99;
      return relA - relB;
    });
  });

  return grouped;
};

const sortRooms = (rooms) => {
  return rooms.sort((a, b) => {
    const regex = /([a-zA-Z]*)(\d+)/;
    const matchA = a.match(regex);
    const matchB = b.match(regex);

    const letterA = matchA ? matchA[1] : "";
    const letterB = matchB ? matchB[1] : "";
    const numberA = matchA ? parseInt(matchA[2]) : 0;
    const numberB = matchB ? parseInt(matchB[2]) : 0;

    if (letterA < letterB) return -1;
    if (letterA > letterB) return 1;
    return numberA - numberB;
  });
};

const Residents = () => {
  const [groupedResidents, setGroupedResidents] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 3;
  const user = useContext(MyUserContext);

  const loadResidents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApis(token).get(endpoints["residents"]);
      const users = await authApis(token).get(endpoints["users"]);
      
      const usersData = users.data.reduce((acc, user) => {
        acc[user.resident?.id] = user;
        return acc;
      }, {});
      
      const residentsWithUser = res.data.map(resident => ({
        ...resident,
        user: usersData[resident.id] || null
      }));

      const grouped = groupResidentsByRoom(residentsWithUser);
      setGroupedResidents(grouped);
    } catch (err) {
      console.error("Lỗi khi tải cư dân:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadResidents();
  };

  const navigation = useNavigation();
  const renderResident = (resident) => (
    <TouchableRipple
      key={resident.id}
      onPress={() => navigation.navigate("ResidentDetails", { residentId: resident.id })}
    >
      <Card style={styles.card}>
        <Card.Title
          title={resident.name}
          subtitle={`👤 ${quanHeVietHoa[resident.relationship_to_head] ?? "Không rõ"}`}
          left={(props) => <Avatar.Text {...props} label={resident.name.charAt(0).toUpperCase()} />}
          right={() => (
            resident.user ? (
              <Avatar.Image source={{ uri: resident.user.avatar }} size={40} />
            ) : null
          )}
        />
        {resident.user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{resident.user.username}</Text>
            <Text style={styles.userFullName}>{`${resident.user.first_name} ${resident.user.last_name}`}</Text>
          </View>
        )}
      </Card>
    </TouchableRipple>
  );

  const renderRoomItem = ({ item: room }) => (
    <View style={styles.roomContainer}>
      <Text style={styles.roomTitle}>Phòng {room}</Text>
      {groupedResidents[room].map(renderResident)}
    </View>
  );

  const getPagedRooms = () => {
    const rooms = Object.keys(groupedResidents);
    const sortedRooms = sortRooms(rooms);

    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = currentPage * roomsPerPage;
    return sortedRooms.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(Object.keys(groupedResidents).length / roomsPerPage);

  return (
    <View style={styles.container}>

      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" />
      ) : (
        <FlatList
          data={getPagedRooms()}
          keyExtractor={(room) => room}
          renderItem={renderRoomItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <View style={styles.paginationContainer}>
        <TouchableOpacity
          onPress={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={[styles.pageButton, { opacity: currentPage === 1 ? 0.5 : 1 }]}>
          <Ionicons name="chevron-back-outline" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.pageInfo}>{currentPage} / {totalPages}</Text>

        <TouchableOpacity
          onPress={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[styles.pageButton, { opacity: currentPage === totalPages ? 0.5 : 1 }]}>
          <Ionicons name="chevron-forward-outline" size={17} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  roomContainer: {
    marginBottom: 24,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  card: {
    marginBottom: 10,
    elevation: 2,
    borderRadius: 10,
  },
  userInfoContainer: {
    padding: 1,
    marginLeft: '5',
    marginRight: '5',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  username: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  userFullName: {
    fontSize: 12,
    color: "#777",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  pageButtonText: {
    color: "white",
    fontSize: 16,
    marginRight: 10,
  },
  pageInfo: {
    fontSize: 16,
    marginHorizontal: 12,
    color: "#333",
  },
});

export default Residents;

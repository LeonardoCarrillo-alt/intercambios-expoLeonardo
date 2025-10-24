import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { useProfileStore } from "../../src/store/useProfileStore";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";

const DrawerLayout = () => {
  const { colors } = useThemeColors();
  const { setProfile, clearProfile } = useProfileStore();
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          const data = userSnap.exists() ? userSnap.data() : {};
          const role = (data?.role ?? "user").toString().toLowerCase();
          setProfile({
            uid: currentUser.uid,
            displayName: data?.displayName ?? currentUser.displayName ?? currentUser.email ?? null,
            isAdmin: role === "admin",
          });
        } catch {
          clearProfile();
        }
      } else {
        clearProfile();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <Drawer
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        drawerContentStyle: { backgroundColor: colors.drawerBackground },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props} style={{ backgroundColor: colors.drawerBackground }}>
          <DrawerItem
            label="Inicio"
            onPress={() => props.navigation.navigate("(tabs)")}
            labelStyle={{ color: colors.text }}
          />
          <DrawerItem
            label="Sobre la app"
            onPress={() => props.navigation.navigate("about")}
            labelStyle={{ color: colors.text }}
          />
          <DrawerItem
            label="Cerrar sesión"
            onPress={async () => {
              const res = await logout();
              if (res.success) {
                props.navigation.navigate("login");
              } else {
                console.log("Error al cerrar sesión:", res.error);
              }
            }}
            labelStyle={{ color: "red", fontWeight: "bold" }}
          />
          <DrawerItem
            label="Chat"
            onPress={() => props.navigation.navigate("chats")}
            labelStyle={{ color: colors.text }}
          />
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: "Sobre la app",
          drawerLabel: "About",
        }}
      />
      <Drawer.Screen
        name="chats"
        options={{
          title: "Chat",
          drawerLabel: "Chat",
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;

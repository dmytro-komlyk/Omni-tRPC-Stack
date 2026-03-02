import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { trpc } from '@package/api/client';
import { useAuthStore } from '@package/store/auth-native';
import { Link, useRouter } from 'expo-router';

import { Toast } from 'toastify-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const colorScheme = useColorScheme();

  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      const response = await logoutMutation.mutateAsync();
      Toast.success(response.message);
    } catch (error) {
      console.warn('Backend logout failed or token expired', error);
    } finally {
      await logout();
    }
  };

  const dynamicCardStyle = {
    backgroundColor: colorScheme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.9)',
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={[styles.userCard, dynamicCardStyle]}>
        <View style={styles.userInfoRow}>
          <Image
            source={user?.avatarUrl ? { uri: user.avatarUrl } : require('@/assets/images/icon.png')}
            style={styles.avatar}
            contentFit="cover"
            transition={500}
          />
          <View style={styles.userTextContainer}>
            <View style={styles.welcomeRow}>
              <ThemedText type="title" style={styles.welcomeText}>
                Hello,
              </ThemedText>
              <HelloWave />
            </View>
            <ThemedText type="subtitle" style={styles.nickName}>
              {user?.nickName || 'Guest'}
            </ThemedText>
            <ThemedText style={styles.emailText}>{user?.email}</ThemedText>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
          <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5, // для Android
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#A1CEDC',
  },
  userTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  welcomeText: {
    fontSize: 20,
    opacity: 0.7,
  },
  nickName: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  emailText: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FF4747',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4747',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

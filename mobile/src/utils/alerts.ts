import { Alert } from 'react-native';

export function showComingSoonAlert(message: string) {
  Alert.alert('Coming soon', message);
}

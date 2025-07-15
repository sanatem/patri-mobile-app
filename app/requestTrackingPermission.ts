import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export async function requestTrackingPermission() {
    const { status } = await requestTrackingPermissionsAsync();
    if (status === 'granted') {
        console.log('Tracking permission granted.');
    } else {
        console.log('Tracking permission denied.');
    }
    return status;
}

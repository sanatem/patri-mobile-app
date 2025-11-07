# Biometric Authentication Test Checklist

## Prerequisites
- [ ] App is built with latest changes
- [ ] Testing on physical device (iOS or Android)
- [ ] Device has Face ID/Touch ID/Fingerprint configured

## Test Cases

### 1. First Time User Flow
- [ ] Launch app for first time
- [ ] Complete splash screens
- [ ] Verify navigation to login screen (not Auth0 webview)
- [ ] Login options visible: Google, Apple (iOS only), Email
- [ ] No biometric option shown (not enabled yet)

### 2. Normal Login Flow
- [ ] Login with Google
- [ ] Login with Apple (iOS only)
- [ ] Login with Email/Auth0
- [ ] Verify successful navigation to main app
- [ ] Verify no Auth0 popup loops

### 3. Enable Biometric
- [ ] Navigate to Settings while logged in
- [ ] Find biometric toggle
- [ ] Enable biometric authentication
- [ ] Verify Face ID/Touch ID prompt appears
- [ ] Authenticate successfully
- [ ] Verify toggle shows as enabled

### 4. Logout and Biometric Login
- [ ] Logout from Settings
- [ ] Verify navigation to login screen
- [ ] Verify biometric option is now visible
- [ ] Verify biometric prompt auto-appears after ~500ms
- [ ] Cancel biometric → shows login options
- [ ] Try biometric login → authenticate → verify successful login

### 5. Failed Attempts Lockout
- [ ] Logout and return to login screen
- [ ] Fail biometric authentication 3 times
- [ ] Verify lockout message appears with countdown timer
- [ ] Verify biometric option is hidden
- [ ] Wait 30 minutes (or adjust BIOMETRIC_LOCKOUT_TIME for testing)
- [ ] Verify biometric option reappears after lockout expires

### 6. Token Expiration Handling
- [ ] Login with biometric
- [ ] Wait for token to expire (or manually expire it)
- [ ] Try to access protected content
- [ ] Verify "Sesión expirada" alert appears
- [ ] Verify automatic redirect to login screen
- [ ] Verify biometric is disabled (need fresh login)

### 7. Disable Biometric
- [ ] Login normally
- [ ] Go to Settings
- [ ] Disable biometric toggle
- [ ] Confirm in alert dialog
- [ ] Logout
- [ ] Verify biometric option not shown on login screen

### 8. Device Enrollment Changes
- [ ] Enable biometric in app
- [ ] Go to device settings
- [ ] Add/remove fingerprint or Face ID
- [ ] Return to app
- [ ] Verify biometric still works (or prompts to re-enable)

### 9. Error Scenarios
- [ ] Network offline during biometric login
- [ ] Backend returns 401 during biometric validation
- [ ] Token exists but is corrupted
- [ ] SecureStorage access fails

### 10. Multi-User Scenarios
- [ ] User A enables biometric
- [ ] User A logs out
- [ ] User B logs in (different account)
- [ ] Verify biometric not auto-enabled for User B
- [ ] User B enables biometric
- [ ] Verify each user's biometric works with their account

## Edge Cases to Verify

### Navigation States
- [ ] No Auth0 popup loops on any screen
- [ ] Proper navigation after each auth method
- [ ] Back button behavior on login screen
- [ ] App state restoration after backgrounding

### Security
- [ ] Token stored in SecureStorage (iOS Keychain/Android Keystore)
- [ ] Token cleared on logout
- [ ] Failed attempts counter persists across app restarts
- [ ] Biometric disabled when token expires

### UX Polish
- [ ] Loading states during authentication
- [ ] Clear error messages in Spanish
- [ ] Smooth transitions between screens
- [ ] Biometric icon matches device type (Face/Fingerprint)

## Performance
- [ ] Login screen loads quickly
- [ ] Biometric prompt appears promptly
- [ ] No UI freezes during auth operations
- [ ] Token validation doesn't block UI

## Accessibility
- [ ] VoiceOver/TalkBack works on all buttons
- [ ] Color contrast meets standards
- [ ] Touch targets are adequate size
- [ ] Error messages are announced

## Final Verification
- [ ] All auth methods work reliably
- [ ] Biometric enhances UX without compromising security
- [ ] No regressions in existing auth flows
- [ ] App meets all acceptance criteria from spec

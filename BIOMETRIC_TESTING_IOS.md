# iOS Biometric Authentication Testing Plan

## 📱 Prerequisites

### Device Requirements
- Physical iOS device with Face ID or Touch ID
- iOS 13.0 or later
- Face ID/Touch ID configured with at least one enrolled face/fingerprint

### App Requirements
- Development build installed on device
- Clean state (fresh install or logged out)

### Before Starting
```bash
# Build and install development version
eas build --profile development --platform ios --local

# Or use Expo Go for initial testing (limited biometric support)
npx expo start --ios
```

---

## 🧪 Test Suite

### TEST 1: Initial Setup & Capabilities Check

#### Objective
Verify the app correctly detects iOS biometric capabilities.

#### Steps
1. Install fresh build on device
2. Launch app
3. Complete normal Auth0 login
4. Navigate to Settings
5. Look for "Autenticación biométrica" option

#### Expected Results
- ✅ Settings shows biometric option
- ✅ Option displays correct type:
  - iPhone X+: "Acceso rápido con Face ID"
  - iPhone 8/SE: "Acceso rápido con Touch ID"
- ✅ Toggle switch is OFF by default
- ✅ No errors in console

#### Pass/Fail Criteria
- [ ] **PASS**: Biometric option visible and shows correct type
- [ ] **FAIL**: Option missing or shows wrong biometric type

#### Debug Checks
```
Console should show:
✓ "Biometric capability checked"
✓ "Type: facial" or "Type: fingerprint"
✓ "Supported: true"
```

---

### TEST 2: Enable Biometric Authentication

#### Objective
Test the biometric enrollment flow.

#### Steps
1. From Settings, tap the biometric toggle to ON
2. System should show native biometric prompt
3. Authenticate with Face ID/Touch ID
4. Observe the result

#### Expected Results
- ✅ Native iOS biometric prompt appears
- ✅ Prompt text: "Confirma tu identidad para habilitar el acceso biométrico"
- ✅ On success: Toggle stays ON
- ✅ Toast/confirmation message appears
- ✅ Token saved to iOS Keychain

#### Pass/Fail Criteria
- [ ] **PASS**: Toggle ON, no errors, confirmation shown
- [ ] **FAIL**: Toggle reverts to OFF, error alert, or no prompt

#### Debug Checks
```
Console should show:
✓ "Enabling biometric authentication"
✓ "Biometric authentication successful"
✓ "Token saved to SecureStore"
✓ "Biometric preference saved: true"
```

#### Test Variations
- **2A**: Cancel the biometric prompt
  - Expected: Toggle returns to OFF, no error alert
- **2B**: Fail authentication (look away for Face ID)
  - Expected: Error message, toggle stays OFF

---

### TEST 3: First Biometric Login (Happy Path)

#### Objective
Test successful biometric login after app restart.

#### Steps
1. With biometric enabled, close app completely (swipe up from app switcher)
2. Wait 5 seconds
3. Reopen app from home screen
4. Observe biometric prompt

#### Expected Results
- ✅ BiometricPrompt screen appears immediately
- ✅ Shows correct icon (Face ID or Touch ID)
- ✅ Text: "Bienvenido de vuelta"
- ✅ Button text matches biometric type
- ✅ "Usar contraseña" option visible

#### Steps to Complete
5. Tap "Usar Face ID" (or Touch ID) button
6. Authenticate successfully
7. Observe result

#### Expected Results
- ✅ Native prompt appears
- ✅ Authentication succeeds
- ✅ App navigates to /(tabs)/patrimony
- ✅ User data loaded correctly
- ✅ No loading state hangs

#### Pass/Fail Criteria
- [ ] **PASS**: Successful auth, enters app normally
- [ ] **FAIL**: Stuck on loading, wrong screen, or error

#### Debug Checks
```
Console should show:
✓ "Checking biometric on app start"
✓ "Biometric enabled: true"
✓ "Showing BiometricPrompt"
✓ "Authenticating with biometric"
✓ "Authentication successful"
✓ "Token retrieved from SecureStore"
✓ "Token validated with backend"
✓ "User authenticated successfully"
```

---

### TEST 4: Failed Biometric Authentication

#### Objective
Test the 3-attempt limit and lockout behavior.

#### Steps
1. Close and reopen app
2. BiometricPrompt appears
3. Tap biometric button
4. **FAIL authentication** (Face ID: look away, Touch ID: wrong finger)
5. Repeat step 4 two more times (total 3 failures)

#### Expected Results After Each Failure
- **Attempt 1**: Error message, prompt remains
- **Attempt 2**: Error message, prompt remains
- **Attempt 3**:
  - ✅ Error: "Demasiados intentos fallidos..."
  - ✅ "Intenta nuevamente en 30 segundos"
  - ✅ Biometric button disabled for 30 seconds

#### Steps to Continue
6. Wait 30 seconds
7. Try again

#### Expected Results
- ✅ After timeout, biometric available again
- ✅ Counter reset
- ✅ Can authenticate successfully

#### Pass/Fail Criteria
- [ ] **PASS**: Lockout works, timeout expires, can retry
- [ ] **FAIL**: No lockout, infinite attempts, or can't retry

#### Debug Checks
```
Console should show:
✓ "Failed attempt 1/3"
✓ "Failed attempt 2/3"
✓ "Failed attempt 3/3 - Lockout initiated"
✓ "Lockout until: [timestamp]"
✓ "Lockout expired - attempts reset"
```

---

### TEST 5: Fallback to Password Login

#### Objective
Verify "Usar contraseña" button works correctly.

#### Steps
1. Close and reopen app
2. BiometricPrompt appears
3. Tap "Usar contraseña" button

#### Expected Results
- ✅ BiometricPrompt disappears
- ✅ App navigates to /auth/webview
- ✅ Normal Auth0 login screen shows
- ✅ Can login with Google/Apple/Email

#### Steps to Continue
4. Complete normal login
5. Navigate back to Settings
6. Check biometric toggle status

#### Expected Results
- ✅ Biometric still enabled
- ✅ Token updated in Keychain
- ✅ Next app restart shows BiometricPrompt again

#### Pass/Fail Criteria
- [ ] **PASS**: Can bypass biometric, normal login works
- [ ] **FAIL**: Stuck on prompt, can't access login

---

### TEST 6: Disable Biometric Authentication

#### Objective
Test disabling biometric and cleanup.

#### Steps
1. In Settings, tap biometric toggle to OFF
2. Observe confirmation alert
3. Tap "Deshabilitar" on alert

#### Expected Results
- ✅ Alert appears: "¿Estás seguro de que deseas deshabilitar Face ID?"
- ✅ Two options: "Cancelar" and "Deshabilitar"
- ✅ On confirm:
  - Toggle switches to OFF
  - Preference cleared from SecureStore
  - Token remains in AsyncStorage (for normal auth)

#### Steps to Continue
4. Close and reopen app

#### Expected Results
- ✅ No BiometricPrompt appears
- ✅ App shows normal auth flow
- ✅ User remains logged in (token in AsyncStorage)

#### Pass/Fail Criteria
- [ ] **PASS**: Disabled, no prompt on restart
- [ ] **FAIL**: Prompt still appears, or logged out

#### Debug Checks
```
Console should show:
✓ "Disabling biometric authentication"
✓ "Biometric preference cleared"
✓ "SecureStore cleaned"
```

---

### TEST 7: Logout Cleanup

#### Objective
Verify biometric data cleared on logout.

#### Steps
1. Enable biometric authentication (if not enabled)
2. Navigate to Settings
3. Scroll down and tap "Cerrar sesión"
4. Confirm logout

#### Expected Results
- ✅ User logged out
- ✅ Redirected to auth screen
- ✅ All tokens cleared from:
  - AsyncStorage
  - SecureStore (Keychain)
- ✅ Biometric preference cleared

#### Steps to Continue
5. Login again normally
6. Go to Settings
7. Check biometric toggle

#### Expected Results
- ✅ Biometric toggle is OFF (needs re-enrollment)
- ✅ Must enable biometric again

#### Pass/Fail Criteria
- [ ] **PASS**: Clean logout, biometric reset
- [ ] **FAIL**: Old biometric data persists

---

### TEST 8: Token Expiration Handling

#### Objective
Test expired token scenario.

#### Steps
1. Enable biometric
2. Close app
3. **Simulate token expiration**:
   - Option A: Wait 24+ hours
   - Option B: Manually invalidate token in backend
   - Option C: Modify token in Keychain (developer mode)
4. Reopen app
5. Complete biometric authentication

#### Expected Results
- ✅ Biometric prompt appears
- ✅ Biometric authentication succeeds
- ✅ Backend validation fails (expired token)
- ✅ Error message shown
- ✅ Redirected to Auth0 login
- ✅ Token cleared from SecureStore

#### Steps to Continue
6. Complete normal login
7. Biometric should work again with new token

#### Pass/Fail Criteria
- [ ] **PASS**: Graceful fallback to Auth0
- [ ] **FAIL**: Stuck in loop, or app crash

---

### TEST 9: Background/Foreground Behavior

#### Objective
Test biometric prompt on app resume.

#### Steps
1. Login with biometric enabled
2. Use app normally
3. Send app to background (home button)
4. Wait 30 seconds
5. Reopen app from app switcher

#### Expected Results
- ✅ App resumes to last screen
- ✅ No biometric prompt (already authenticated)
- ✅ Session persists

#### Test Variation 9A: Long Background Duration
6. Send app to background again
7. Wait 10+ minutes
8. Reopen app

#### Expected Results
- ✅ App resumes normally
- ✅ May show biometric prompt (depends on implementation)
- ✅ Session token still valid

#### Pass/Fail Criteria
- [ ] **PASS**: Smooth resume, appropriate prompts
- [ ] **FAIL**: Crashes, unnecessary re-auth

---

### TEST 10: Device Biometric Changes

#### Objective
Test behavior when user modifies Face ID/Touch ID.

#### Steps
1. Enable biometric in app
2. Go to iOS Settings
3. Settings > Face ID & Passcode (or Touch ID)
4. Remove/reset biometric enrollment
5. Return to app

#### Expected Results
- ✅ App detects biometric unavailable
- ✅ In Settings, biometric option shows:
  - "Tu dispositivo no soporta autenticación biométrica"
  - OR disabled state with explanation

#### Steps to Continue
6. Re-enroll Face ID/Touch ID in iOS Settings
7. Return to app
8. Try enabling biometric again

#### Expected Results
- ✅ Option becomes available again
- ✅ Can re-enable successfully

#### Pass/Fail Criteria
- [ ] **PASS**: Graceful handling, clear messaging
- [ ] **FAIL**: App assumes biometric available, crashes

---

### TEST 11: Multiple Login/Logout Cycles

#### Objective
Test stability over repeated use.

#### Steps
1. Login with Auth0
2. Enable biometric
3. Close app
4. Reopen, login with biometric
5. Logout
6. **Repeat steps 1-5 five times**

#### Expected Results
- ✅ No memory leaks
- ✅ No performance degradation
- ✅ Consistent behavior every time
- ✅ No duplicate prompts
- ✅ Clean state management

#### Pass/Fail Criteria
- [ ] **PASS**: All 5 cycles work identically
- [ ] **FAIL**: Degradation, errors, or inconsistency

---

### TEST 12: iOS Keychain Access

#### Objective
Verify secure storage in iOS Keychain.

#### Prerequisites
- Mac with Xcode
- Device paired for debugging

#### Steps
1. Enable biometric authentication
2. Connect device to Mac
3. Open Xcode > Window > Devices and Simulators
4. Select your device > View Device Logs
5. In terminal on Mac:
```bash
# View keychain items (requires jailbreak or debug build)
security dump-keychain
```

#### Expected Results
- ✅ Token stored in Keychain
- ✅ Item protected with biometric policy
- ✅ Cannot access without authentication
- ✅ Proper accessibility settings

#### Pass/Fail Criteria
- [ ] **PASS**: Token in Keychain, secure attributes
- [ ] **FAIL**: Token missing, or insecure attributes

---

## 📊 Test Results Summary

### Test Execution Sheet

| Test | Description | Status | Notes |
|------|-------------|--------|-------|
| 1 | Capabilities Check | ⬜ | |
| 2 | Enable Biometric | ⬜ | |
| 3 | First Login (Happy) | ⬜ | |
| 4 | Failed Auth & Lockout | ⬜ | |
| 5 | Fallback to Password | ⬜ | |
| 6 | Disable Biometric | ⬜ | |
| 7 | Logout Cleanup | ⬜ | |
| 8 | Token Expiration | ⬜ | |
| 9 | Background/Foreground | ⬜ | |
| 10 | Device Changes | ⬜ | |
| 11 | Multiple Cycles | ⬜ | |
| 12 | Keychain Access | ⬜ | |

**Legend**: ⬜ Not Started | 🟡 In Progress | ✅ Pass | ❌ Fail

---

## 🐛 Common Issues & Solutions

### Issue 1: Biometric Prompt Not Appearing
**Symptoms**: App starts but no BiometricPrompt shows

**Debug Steps**:
1. Check console for biometric state:
```javascript
console.log('Biometric State:', biometricState);
```
2. Verify SecureStore has preference:
```javascript
const enabled = await SecureStorageService.isBiometricEnabled();
console.log('Biometric Enabled:', enabled);
```

**Solutions**:
- Ensure biometric was enabled in Settings first
- Check iOS Settings > Face ID & Passcode is configured
- Verify app.json has correct permissions

---

### Issue 2: "Token Not Found" Error
**Symptoms**: Biometric succeeds but login fails

**Debug Steps**:
1. Check SecureStore:
```javascript
const token = await SecureStorageService.getAuthToken();
console.log('Token:', token ? 'EXISTS' : 'MISSING');
```

**Solutions**:
- Re-login with Auth0 to refresh token
- Check that token is saved after normal login
- Verify handleAuthResponse saves to SecureStore

---

### Issue 3: Infinite Loading State
**Symptoms**: App stuck loading after biometric

**Debug Steps**:
1. Check network requests in console
2. Verify backend validation endpoint is reachable

**Solutions**:
- Check internet connection
- Verify backend endpoint `/api/v2/auth/validate`
- Check token format is valid JWT

---

### Issue 4: Native Prompt in Wrong Language
**Symptoms**: Biometric prompt shows in English

**Solutions**:
- Check iOS device language settings
- Verify i18n is initialized properly
- Update prompt messages to use i18n keys

---

## ✅ Acceptance Criteria

All tests must pass before considering iOS implementation complete:

- [ ] All 12 tests pass on Face ID device
- [ ] All 12 tests pass on Touch ID device (if available)
- [ ] No console errors during any test
- [ ] No crashes or hangs
- [ ] All error messages in Spanish
- [ ] Native prompts appear correctly
- [ ] Performance is acceptable (< 2s for biometric auth)
- [ ] Keychain storage verified secure

---

## 📝 Test Report Template

```
iOS Biometric Testing Report
Date: ___________
Tester: ___________
Device: iPhone _____ (iOS ___.__)
Biometric Type: Face ID / Touch ID
App Version: ___________

Summary:
- Tests Passed: __ / 12
- Tests Failed: __ / 12
- Blocker Issues: __
- Minor Issues: __

Critical Issues Found:
1. ...
2. ...

Recommendations:
- ...
- ...

Sign-off: ___________
```

---

## 🚀 Next Steps After Testing

1. **If all tests pass**:
   - Document test results
   - Proceed to Android testing
   - Prepare for production build

2. **If tests fail**:
   - Log issues with details
   - Fix blockers first
   - Re-test failed scenarios
   - Full regression test

3. **Before production**:
   - User acceptance testing with 3-5 real users
   - Performance profiling
   - Security audit of Keychain implementation


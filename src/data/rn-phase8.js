const rnPhase8 = {
  id: "phase-8",
  title: "Phase 8: Native Integration & Platform Expertise",
  emoji: "🔧",
  description: "Write native modules for Android & iOS, handle permissions, push notifications architecture, deep linking, background tasks, app state management, and platform-specific optimization.",
  topics: [
    {
      id: "native-modules",
      title: "Writing Native Modules (Android & iOS)",
      explanation: `**Native modules** let you write platform-specific code (Kotlin/Java for Android, Swift/ObjC for iOS) and call it from JavaScript. This is necessary when:
- No existing JS/RN library covers your need
- You need to access platform APIs not exposed by React Native
- Performance-critical code that must run natively (image processing, encryption)
- Integrating third-party native SDKs

**Old architecture (Bridge-based) native module:**
- Register module with the bridge
- Methods are async-only (return via Promise or callback)
- Data crosses the bridge as JSON — serialization overhead

**New architecture (TurboModules):**
- Define TypeScript spec → codegen creates native interface
- Supports synchronous methods (via JSI)
- Lazy-loaded — only initialized when first used
- Type-safe across the JS-Native boundary

**When to write native vs stay in JS:**
| Need | Approach |
|------|----------|
| File system access | Native module (or expo-file-system) |
| Bluetooth | Native module (platform-specific APIs) |
| Image manipulation | Native module (hardware-accelerated) |
| Encryption | Native module (platform keychain/keystore) |
| Complex animations | Reanimated worklets (stay in JS) |
| API calls | JS (fetch/axios) — no native needed |
| Data transformation | JS — unless processing >100MB |`,
      codeExample: `// === TURBOMODULE: Full Example ===

// 1. TypeScript Spec (shared between platforms)
// specs/NativeSecureStorage.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Synchronous — uses iOS Keychain / Android Keystore
  setItem(key: string, value: string): boolean;
  getItem(key: string): string | null;
  removeItem(key: string): boolean;
  getAllKeys(): string[];
  
  // Async for potentially slow operations
  clear(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('SecureStorage');

// 2. Android Implementation (Kotlin)
/*
package com.myapp.modules

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import android.security.keystore.KeyGenParameterSpec
import java.security.KeyStore

@ReactModule(name = SecureStorageModule.NAME)
class SecureStorageModule(reactContext: ReactApplicationContext) 
  : NativeSecureStorageSpec(reactContext) {
  
  companion object {
    const val NAME = "SecureStorage"
  }
  
  private val prefs by lazy {
    // EncryptedSharedPreferences for secure storage
    EncryptedSharedPreferences.create(
      "secure_prefs",
      MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
      reactApplicationContext,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
  }
  
  override fun getName() = NAME
  
  override fun setItem(key: String, value: String): Boolean {
    return try {
      prefs.edit().putString(key, value).commit()
    } catch (e: Exception) {
      false
    }
  }
  
  override fun getItem(key: String): String? {
    return prefs.getString(key, null)
  }
  
  override fun removeItem(key: String): Boolean {
    return prefs.edit().remove(key).commit()
  }
  
  override fun getAllKeys(): WritableArray {
    val keys = Arguments.createArray()
    prefs.all.keys.forEach { keys.pushString(it) }
    return keys
  }
  
  override fun clear(promise: Promise) {
    try {
      prefs.edit().clear().commit()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("CLEAR_ERROR", e.message)
    }
  }
}
*/

// 3. iOS Implementation (Swift)
/*
@objc(SecureStorage)
class SecureStorage: NSObject, NativeSecureStorageSpec {
  
  @objc func setItem(_ key: String, value: String) -> Bool {
    let data = value.data(using: .utf8)!
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: key,
      kSecValueData as String: data,
    ]
    SecItemDelete(query as CFDictionary) // Remove existing
    let status = SecItemAdd(query as CFDictionary, nil)
    return status == errSecSuccess
  }
  
  @objc func getItem(_ key: String) -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrAccount as String: key,
      kSecReturnData as String: true,
    ]
    var result: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    guard status == errSecSuccess, let data = result as? Data else { return nil }
    return String(data: data, encoding: .utf8)
  }
}
*/

// 4. Usage in JS — same API regardless of platform
import SecureStorage from './specs/NativeSecureStorage';

// Synchronous access (JSI-powered)
const token = SecureStorage.getItem('auth_token');
if (token) {
  api.setAuthHeader(token);
}

// Store new token
const success = SecureStorage.setItem('auth_token', newToken);
if (!success) {
  ErrorReporter.report(new Error('Failed to store auth token'));
}`,
      exercise: `**Native Module Exercises:**
1. Write a TurboModule spec for a device information module (battery level, device model, OS version)
2. Implement a native module that accesses the platform's biometric authentication (Face ID / Fingerprint)
3. Create a native module that wraps a third-party SDK (e.g., a payment provider)
4. Build a native module that performs heavy image processing (resize, crop) off the JS thread
5. Implement a platform-specific module with different behavior on iOS vs Android using the same JS API
6. Write comprehensive tests for a native module — mock the native side and test the JS interface`,
      commonMistakes: [
        "Not handling errors in native modules — native exceptions that propagate to JS cause cryptic crashes",
        "Running heavy operations on the main thread in native code — blocks UI just like blocking the JS thread",
        "Forgetting to handle the case where the native module is not available — always check for null from TurboModuleRegistry",
        "Not properly cleaning up native resources — event listeners, timers, and callbacks in native code must be deallocated",
        "Using the old bridge-based NativeModules API in new projects — always use TurboModules with codegen for new modules",
      ],
      interviewQuestions: [
        {
          type: "conceptual",
          q: "When should you write a native module vs finding a JS-only solution?",
          a: "Write native when: (1) You need platform APIs not exposed by RN (Bluetooth, NFC, HealthKit). (2) Performance is critical — native image/video processing, encryption, ML inference. (3) You're integrating a native SDK (payment providers, analytics). (4) You need synchronous access to native data (device info, secure storage via JSI). Stay in JS when: API calls, data transformation, business logic, UI interactions, animations (Reanimated handles this). Rule of thumb: if a well-maintained library exists, use it before writing your own native module.",
        },
        {
          type: "scenario",
          q: "You need to integrate a payment SDK that only has native iOS and Android libraries. How do you approach this?",
          a: "**Step by step:** (1) Define the TypeScript interface you want to expose — keep it minimal and platform-agnostic. (2) Write the TurboModule spec with codegen. (3) Implement iOS wrapper in Swift, calling the SDK's APIs and translating results to your spec's types. (4) Implement Android wrapper in Kotlin, same approach. (5) Handle platform differences in the native layer — JS consumers see a unified API. (6) Test: unit test native code independently, then integration test the JS ↔ Native flow. (7) Consider edge cases: SDK initialization failure, network errors during payment, backgrounding during payment flow.",
        },
      ],
    },
    {
      id: "push-notifications-deep-linking",
      title: "Push Notifications & Deep Linking Architecture",
      explanation: `**Push notifications** and **deep linking** are architecturally interconnected — a notification tap often deep links to a specific screen. Getting them right at scale requires careful architecture.

**Push Notification Architecture:**
\`\`\`
Server → APNs (iOS) / FCM (Android) → Device OS → App
                                                    ↓
                                        Foreground: onMessage handler
                                        Background: onBackgroundMessage
                                        Killed: onNotificationOpenedApp
\`\`\`

**The 3 notification scenarios:**
1. **Foreground** — App is open and active. You receive the payload and decide how to display it (in-app banner, badge, ignore).
2. **Background** — App is in memory but not visible. System shows the notification. When tapped, your app receives the data.
3. **Killed/Quit** — App is not running. System shows the notification. When tapped, app launches and receives the initial notification.

**Deep Linking Architecture:**
Deep links navigate users to specific content within your app. Sources:
- Push notification taps
- External URLs (email, SMS, web)
- Universal Links (iOS) / App Links (Android)
- Other apps (social media shares)

**Architecture for handling deep links:**
\`\`\`
Deep Link Received
  → URL Parser (extract route + params)
  → Auth Gate (is user logged in?)
    → If no: queue link → show login → after login, navigate
    → If yes: navigate directly
  → Navigation Handler
    → Stack reset if needed (clear back stack)
    → Navigate to target screen with params
\`\`\``,
      codeExample: `// === PUSH NOTIFICATION ARCHITECTURE ===

import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// 1. Notification Service — centralized handling
class NotificationService {
  private static instance: NotificationService;
  private deepLinkHandler: DeepLinkHandler;
  
  static getInstance() {
    if (!this.instance) this.instance = new NotificationService();
    return this.instance;
  }
  
  async initialize() {
    // Request permission
    const status = await messaging().requestPermission();
    if (status === messaging.AuthorizationStatus.AUTHORIZED) {
      const token = await messaging().getToken();
      await this.registerToken(token);
    }
    
    // Token refresh
    messaging().onTokenRefresh(this.registerToken);
    
    // Foreground messages
    messaging().onMessage(async (remoteMessage) => {
      await this.handleForegroundNotification(remoteMessage);
    });
    
    // Background/quit notification tap
    messaging().onNotificationOpenedApp((remoteMessage) => {
      this.handleNotificationTap(remoteMessage);
    });
    
    // App opened from killed state via notification
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      this.handleNotificationTap(initialNotification);
    }
  }
  
  private async handleForegroundNotification(message: FirebaseMessagingTypes.RemoteMessage) {
    // Show in-app notification using Notifee
    await notifee.displayNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
      },
    });
  }
  
  private handleNotificationTap(message: FirebaseMessagingTypes.RemoteMessage) {
    // Extract deep link from notification data
    const deepLink = message.data?.deepLink as string;
    if (deepLink) {
      this.deepLinkHandler.handle(deepLink);
    }
  }
  
  private async registerToken(token: string) {
    await api.registerPushToken({ token, platform: Platform.OS });
  }
}

// === DEEP LINKING ARCHITECTURE ===

// 2. Deep Link Handler with auth gating
class DeepLinkHandler {
  private pendingLink: string | null = null;
  private navigationRef: NavigationContainerRef<any>;
  
  constructor(navigationRef: NavigationContainerRef<any>) {
    this.navigationRef = navigationRef;
  }
  
  async handle(url: string) {
    const parsed = this.parseDeepLink(url);
    if (!parsed) return;
    
    // Auth gate
    const isAuthenticated = await authService.isAuthenticated();
    if (parsed.requiresAuth && !isAuthenticated) {
      this.pendingLink = url; // Queue for after login
      this.navigationRef.navigate('Login');
      return;
    }
    
    // Navigate
    this.navigateTo(parsed);
  }
  
  // Call this after successful login
  processPendingLink() {
    if (this.pendingLink) {
      const link = this.pendingLink;
      this.pendingLink = null;
      this.handle(link);
    }
  }
  
  private parseDeepLink(url: string): ParsedLink | null {
    // myapp://product/123 → { screen: 'ProductDetail', params: { id: '123' } }
    // myapp://chat/456    → { screen: 'ChatRoom', params: { roomId: '456' } }
    const routes: Record<string, RouteConfig> = {
      'product/:id': { screen: 'ProductDetail', requiresAuth: false },
      'chat/:roomId': { screen: 'ChatRoom', requiresAuth: true },
      'profile/:userId': { screen: 'UserProfile', requiresAuth: true },
      'settings': { screen: 'Settings', requiresAuth: true },
    };
    
    // Match URL against route patterns and extract params
    for (const [pattern, config] of Object.entries(routes)) {
      const match = matchPath(url, pattern);
      if (match) {
        return { ...config, params: match.params };
      }
    }
    return null;
  }
  
  private navigateTo(link: ParsedLink) {
    // Reset stack and navigate — prevents deep back stacks
    this.navigationRef.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Home' },         // Always have Home at the bottom
          { name: link.screen, params: link.params },
        ],
      })
    );
  }
}

// 3. React Navigation deep linking config
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      ProductDetail: 'product/:id',
      ChatRoom: 'chat/:roomId',
      UserProfile: 'profile/:userId',
      Settings: 'settings',
    },
  },
};`,
      exercise: `**Push Notifications & Deep Linking Exercises:**
1. Implement a complete push notification setup with Firebase Cloud Messaging
2. Handle all 3 notification states (foreground, background, killed) correctly
3. Build a deep link handler with auth gating and pending link queue
4. Create notification channels on Android with different priorities
5. Implement rich notifications with images and action buttons
6. Test deep linking from: push notifications, external URLs, and universal links`,
      commonMistakes: [
        "Not handling the 'app killed' notification scenario — getInitialNotification() is often forgotten, losing the user's intent",
        "Navigating before the navigation container is ready — use a ref and wait for isReady signal",
        "Not gating authenticated deep links — navigating to a chat room before login causes crashes or empty screens",
        "Hardcoding deep link routes instead of using a route map — makes changes error-prone and untestable",
        "Not handling notification permissions gracefully — crashing or showing nothing when permission is denied",
      ],
      interviewQuestions: [
        {
          type: "scenario",
          q: "Design a notification system for a chat app that handles message notifications, typing indicators, and read receipts.",
          a: "**Architecture:** (1) **Message notifications**: FCM/APNs for delivery. When foreground: in-app banner (Notifee) showing sender + message preview. When background: system notification with reply action. When killed: system notification → tap navigates to chat. (2) **Typing indicators**: NOT push notifications — use WebSocket/SSE for real-time. Too frequent for push. (3) **Read receipts**: Send via API on screen focus, batch for efficiency. Don't use push notifications for receipts. (4) **Grouping**: Multiple messages from same chat grouped into one notification (Android: NotificationCompat.Group). (5) **Badge count**: Update app badge via native API on notification receipt.",
        },
        {
          type: "conceptual",
          q: "What's the difference between Universal Links (iOS) and App Links (Android)?",
          a: "Both allow HTTPS URLs to open your app instead of the browser. **Universal Links (iOS)**: Require an `apple-app-site-association` file hosted at your domain. iOS verifies the association at app install time. No fallback to browser if the app is installed. **App Links (Android)**: Require an `assetlinks.json` file at your domain. Verified at install time. Android shows a disambiguation dialog by default — must be verified to skip. Both require: HTTPS (not HTTP), domain ownership verification, proper app configuration. In React Native, configure both in the linking config and handle the URL in your deep link handler.",
        },
      ],
    },
  ],
};

export default rnPhase8;

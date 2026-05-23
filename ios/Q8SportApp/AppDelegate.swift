import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    configureFirebaseIfNeeded()
    configureReactNativeFactoryIfNeeded()

    return true
  }

  func application(
    _ application: UIApplication,
    configurationForConnecting connectingSceneSession: UISceneSession,
    options: UIScene.ConnectionOptions
  ) -> UISceneConfiguration {
    let configuration = UISceneConfiguration(
      name: "Default Configuration",
      sessionRole: connectingSceneSession.role
    )
    configuration.delegateClass = SceneDelegate.self
    return configuration
  }

  func attachReactNative(to window: UIWindow, launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) {
    configureReactNativeFactoryIfNeeded()
    self.window = window
    reactNativeFactory?.startReactNative(
      withModuleName: "Q8SportApp",
      in: window,
      launchOptions: launchOptions
    )
  }

  private func configureReactNativeFactoryIfNeeded() {
    if reactNativeFactory != nil {
      return
    }

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
  }

  private func inferDefaultDatabaseURL(projectId: String?) -> String? {
    guard let projectId, !projectId.isEmpty else { return nil }
    // NOTE: This is Firebase's default RTDB host pattern.
    // If your RTDB instance is in a specific region, you'll need to set DATABASE_URL explicitly
    // in GoogleService-Info.plist (iOS) and google-services.json (Android).
    return "https://\(projectId)-default-rtdb.firebaseio.com"
  }

  private func configureFirebaseIfNeeded() {
    if FirebaseApp.app() != nil {
      return
    }

    guard let filePath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
          let options = FirebaseOptions(contentsOfFile: filePath) else {
      FirebaseApp.configure()
      return
    }

        if let override = Bundle.main.object(forInfoDictionaryKey: "FIREBASE_DATABASE_URL_OVERRIDE") as? String,
       !override.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      options.databaseURL = override.trimmingCharacters(in: .whitespacesAndNewlines)
    #if DEBUG
      print("[firebase] Using RTDB URL override from Info.plist: \(options.databaseURL ?? "")")
    #endif
        } else if (options.databaseURL == nil || options.databaseURL?.isEmpty == true),
          let inferred = inferDefaultDatabaseURL(projectId: options.projectID) {
      options.databaseURL = inferred
#if DEBUG
      print("[firebase] DATABASE_URL missing; using inferred default: \(inferred)")
#endif
    }

    FirebaseApp.configure(options: options)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}

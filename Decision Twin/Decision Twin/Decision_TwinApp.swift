import SwiftUI
import SwiftData

@main
struct Decision_TwinApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([DecisionSession.self, DecisionInsight.self])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            VoiceChatView()
        }
        .modelContainer(sharedModelContainer)
    }
}

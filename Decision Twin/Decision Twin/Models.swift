import Foundation
import SwiftData

@Model
final class DecisionSession {
    var id: UUID
    var createdAt: Date
    var rawMessages: Data
    var insight: String?

    init() {
        self.id = UUID()
        self.createdAt = Date()
        self.rawMessages = Data()
        self.insight = nil
    }

    var messages: [ChatMessage] {
        get { (try? JSONDecoder().decode([ChatMessage].self, from: rawMessages)) ?? [] }
        set { rawMessages = (try? JSONEncoder().encode(newValue)) ?? Data() }
    }

    func append(_ message: ChatMessage) {
        var current = messages
        current.append(message)
        messages = current
    }
}

struct ChatMessage: Codable, Identifiable {
    enum Role: String, Codable { case user, assistant }
    var id: UUID = UUID()
    var role: Role
    var text: String
    var timestamp: Date = Date()
}

@Model
final class DecisionInsight {
    var updatedAt: Date
    var profile: String

    init(profile: String) {
        self.updatedAt = Date()
        self.profile = profile
    }
}

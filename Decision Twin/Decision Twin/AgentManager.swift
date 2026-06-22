import Foundation
import FoundationModels
import Observation

@Observable
final class AgentManager {
    var isThinking = false
    var isAvailable = false
    var unavailableReason = ""

    private var session: LanguageModelSession?

    private let systemPrompt = """
    You are DecisionTwin, a warm and thoughtful decision-making companion. \
    Help the user think through decisions by asking one focused clarifying question \
    at a time. Surface their values, priorities, and blind spots gently. \
    Be concise — 2-4 sentences max per response. Never lecture. \
    When appropriate, reflect back what matters most to them.
    """

    func setup() {
        let model = SystemLanguageModel.default
        switch model.availability {
        case .available:
            session = LanguageModelSession(model: model, instructions: systemPrompt)
            isAvailable = true
        case .unavailable(let reason):
            unavailableReason = String(describing: reason)
            isAvailable = false
        @unknown default:
            isAvailable = false
        }
    }

    func respond(to userText: String) async -> String {
        guard let session else {
            return simulatorFallback(for: userText)
        }
        isThinking = true
        defer { isThinking = false }
        do {
            let response = try await session.respond(to: userText)
            return response.content
        } catch {
            return "I couldn't process that. Could you try saying it differently?"
        }
    }

    func synthesizeInsight(from messages: [ChatMessage]) async -> String {
        let transcript = messages
            .map { "\($0.role.rawValue.capitalized): \($0.text)" }
            .joined(separator: "\n")

        let prompt = """
        Summarize in 2-3 sentences the key values and decision factors this person \
        revealed in the following conversation. Focus on what mattered most to them, \
        not the decision itself.

        \(transcript)
        """

        if let session {
            do {
                let synthSession = LanguageModelSession(
                    model: SystemLanguageModel.default,
                    instructions: "You are a concise decision insight synthesizer."
                )
                let response = try await synthSession.respond(to: prompt)
                return response.content
            } catch {}
        }
        return ""
    }

    // Fallback responses for simulator (where on-device model isn't available)
    private func simulatorFallback(for input: String) -> String {
        let responses = [
            "What matters most to you about this decision?",
            "What would you regret more — acting on this, or not acting?",
            "Who else is affected by this choice, and how does that weigh on you?",
            "If you had to decide right now, what would your gut say?",
            "What would make you feel at peace with this decision a year from now?",
        ]
        return responses.randomElement()!
    }
}

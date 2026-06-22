import SwiftUI
import SwiftData
import Combine

struct VoiceChatView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \DecisionSession.createdAt, order: .reverse) private var sessions: [DecisionSession]

    @State private var speech = SpeechManager()
    @State private var agent = AgentManager()
    @State private var currentSession: DecisionSession?
    @State private var pulse = false
    @State private var outerPulse = false
    @State private var showHistory = false

    private var activeSession: DecisionSession {
        if let s = currentSession { return s }
        let s = DecisionSession()
        modelContext.insert(s)
        currentSession = s
        return s
    }

    var body: some View {
        ZStack {
            background

            VStack(spacing: 0) {
                header
                transcript
                Spacer()
                orbSection
                statusLabel
                    .padding(.bottom, 48)
            }
        }
        .task { await boot() }
        .sheet(isPresented: $showHistory) { HistoryView(sessions: sessions) }
    }

    // MARK: – Subviews

    private var background: some View {
        LinearGradient(
            colors: [
                Color(red: 0.99, green: 0.97, blue: 0.93),
                Color(red: 0.96, green: 0.93, blue: 0.87),
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }

    private var header: some View {
        HStack {
            Text("DecisionTwin")
                .font(.system(size: 17, weight: .semibold, design: .rounded))
                .foregroundStyle(Color(red: 0.35, green: 0.28, blue: 0.20))
            Spacer()
            Button { showHistory = true } label: {
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: 20))
                    .foregroundStyle(Color(red: 0.6, green: 0.48, blue: 0.35))
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 8)
    }

    private var transcript: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    if let session = currentSession {
                        ForEach(session.messages) { msg in
                            MessageBubble(message: msg)
                                .id(msg.id)
                        }
                    }
                    if speech.isRecording && !speech.liveTranscript.isEmpty {
                        MessageBubble(message: ChatMessage(role: .user, text: speech.liveTranscript), isLive: true)
                    }
                    if agent.isThinking {
                        ThinkingIndicator()
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .onChange(of: currentSession?.messages.count) {
                if let last = currentSession?.messages.last {
                    withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                }
            }
        }
    }

    private var orbSection: some View {
        ZStack {
            if speech.isRecording {
                Circle()
                    .fill(Color(red: 0.95, green: 0.65, blue: 0.30).opacity(0.15))
                    .frame(width: 160, height: 160)
                    .scaleEffect(outerPulse ? 1.3 : 1.0)
                    .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: outerPulse)
            }
            Circle()
                .fill(orbColor)
                .frame(width: 100, height: 100)
                .scaleEffect(pulse ? 1.08 : 1.0)
                .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: pulse)
                .shadow(color: orbColor.opacity(0.4), radius: 16, x: 0, y: 6)
                .overlay {
                    Image(systemName: orbIcon)
                        .font(.system(size: 32, weight: .medium))
                        .foregroundStyle(.white)
                }
        }
        .frame(height: 180)
        .contentShape(Circle())
        .onTapGesture { handleOrbTap() }
    }

    private var statusLabel: some View {
        Text(statusText)
            .font(.system(size: 14, weight: .medium, design: .rounded))
            .foregroundStyle(Color(red: 0.55, green: 0.45, blue: 0.32))
            .padding(.top, 12)
            .animation(.easeInOut, value: statusText)
    }

    // MARK: – Computed helpers

    private var orbColor: Color {
        if speech.isRecording { return Color(red: 0.92, green: 0.55, blue: 0.22) }
        if agent.isThinking  { return Color(red: 0.50, green: 0.40, blue: 0.75) }
        if speech.isSpeaking { return Color(red: 0.30, green: 0.65, blue: 0.55) }
        return Color(red: 0.72, green: 0.58, blue: 0.42)
    }

    private var orbIcon: String {
        if speech.isRecording { return "waveform" }
        if agent.isThinking  { return "ellipsis" }
        if speech.isSpeaking { return "speaker.wave.2" }
        return "mic"
    }

    private var statusText: String {
        if speech.permissionDenied { return "Microphone access needed" }
        if speech.isRecording       { return "Listening… tap to send" }
        if agent.isThinking         { return "Thinking…" }
        if speech.isSpeaking        { return "Speaking… tap to stop" }
        return "Tap to speak your decision"
    }

    // MARK: – Actions

    private func boot() async {
        await speech.requestPermissions()
        agent.setup()
        pulse = true
    }

    private func handleOrbTap() {
        if speech.isSpeaking {
            speech.stopSpeaking()
            return
        }
        if speech.isRecording {
            let text = speech.stopRecording()
            guard !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
            Task { await sendMessage(text) }
        } else {
            outerPulse = true
            speech.startRecording()
        }
    }

    private func sendMessage(_ text: String) async {
        let session = activeSession
        let userMsg = ChatMessage(role: .user, text: text)
        session.append(userMsg)

        let reply = await agent.respond(to: text)
        let assistantMsg = ChatMessage(role: .assistant, text: reply)
        session.append(assistantMsg)

        speech.speak(reply)

        // Synthesize insight in background after 4+ turns
        if session.messages.count >= 4 && session.messages.count % 4 == 0 {
            Task.detached(priority: .background) {
                let insight = await self.agent.synthesizeInsight(from: session.messages)
                if !insight.isEmpty {
                    await MainActor.run { session.insight = insight }
                }
            }
        }
    }
}

// MARK: – Message Bubble

struct MessageBubble: View {
    let message: ChatMessage
    var isLive = false

    var body: some View {
        HStack {
            if message.role == .user { Spacer() }
            Text(message.text)
                .font(.system(size: 16, design: .rounded))
                .foregroundStyle(message.role == .user
                    ? Color(red: 0.25, green: 0.18, blue: 0.10)
                    : Color(red: 0.20, green: 0.32, blue: 0.30))
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(bubbleColor)
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .opacity(isLive ? 0.6 : 1.0)
            if message.role == .assistant { Spacer() }
        }
    }

    private var bubbleColor: Color {
        message.role == .user
            ? Color(red: 0.94, green: 0.88, blue: 0.76)
            : Color(red: 0.82, green: 0.90, blue: 0.86)
    }
}

// MARK: – Thinking Indicator

struct ThinkingIndicator: View {
    @State private var phase = 0
    let timer = Timer.publish(every: 0.4, on: .main, in: .common).autoconnect()

    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<3, id: \.self) { i in
                Circle()
                    .fill(Color(red: 0.50, green: 0.40, blue: 0.75).opacity(i == phase ? 1 : 0.3))
                    .frame(width: 8, height: 8)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(red: 0.82, green: 0.90, blue: 0.86))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .onReceive(timer) { _ in phase = (phase + 1) % 3 }
    }
}

// MARK: – History View

struct HistoryView: View {
    let sessions: [DecisionSession]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List(sessions) { session in
                VStack(alignment: .leading, spacing: 6) {
                    Text(session.createdAt, style: .date)
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                    if let insight = session.insight {
                        Text(insight)
                            .font(.system(size: 13, design: .rounded))
                            .foregroundStyle(.secondary)
                            .lineLimit(3)
                    } else {
                        Text("\(session.messages.count) messages")
                            .font(.system(size: 13))
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.vertical, 4)
            }
            .navigationTitle("Past Decisions")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

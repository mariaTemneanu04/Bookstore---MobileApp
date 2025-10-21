package ro.pdm.websocketConfig;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WSHandler extends TextWebSocketHandler {

    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println("[WSHandler] Client connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("[WSHandler] Received: " + message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        System.out.println("[WSHandler] Client disconnected: " + session.getId());
    }

    public void broadcast(String jsonMessage) throws IOException {
        System.out.println("[WSHandler] Broadcasting message to " + sessions.size() + " sessions");
        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                System.out.println("[WSHandler] Sending to: " + s.getId());
                s.sendMessage(new TextMessage(jsonMessage));
            }
        }
    }
}

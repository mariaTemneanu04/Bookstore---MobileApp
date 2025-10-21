package ro.pdm.controller;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ro.pdm.domain.Book;
import ro.pdm.repository.IBookRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import ro.pdm.websocketConfig.WSHandler;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/bookstore/books")
public class BookControllerWS {

    private final IBookRepo repo;
    private final WSHandler webSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public BookControllerWS(IBookRepo repo, WSHandler webSocketHandler) {
        this.repo = repo;
        this.webSocketHandler = webSocketHandler;
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @PostMapping("/add")
    public void add(@RequestBody Book book) {
        System.out.println("[CREATE] Creating Book: " + book);
        repo.save(book);
        System.out.println("[CREATE] Book created -> " + book);

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("event", "created");
            message.put("payload", Map.of("item", book));

            String json = objectMapper.writeValueAsString(message);
            System.out.println("AJUNGE LA BROADCAST");
            webSocketHandler.broadcast(json);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @GetMapping
    public Iterable<Book> getAllBooks() {
        System.out.println("[GET] Returning all books");
        return repo.getAll();
    }
}

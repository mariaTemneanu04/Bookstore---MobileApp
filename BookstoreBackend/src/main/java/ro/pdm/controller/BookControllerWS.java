package ro.pdm.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import ro.pdm.domain.Book;
import ro.pdm.repository.IBookRepo;

@CrossOrigin
@RestController
@RequestMapping("api/bookstore/books")
public class BookControllerWS {
    @Autowired
    protected IBookRepo repo;

    @Autowired
    protected SimpMessagingTemplate messagingTemplate;

    public BookControllerWS(IBookRepo repo, SimpMessagingTemplate messagingTemplate) {
        this.repo = repo;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/add")
    public void add(@RequestBody Book book) {
        System.out.println("[CREATE] Creating Book: " + book);
        repo.save(book);
        System.out.println("[CREATE] Book created -> " + book);

        notifyBookChanges();
    }

    @RequestMapping(method = RequestMethod.GET)
    public Iterable<Book> getAllBooks() {
        System.out.println("[GET] Finding all books");
        return repo.getAll();
    }

    public void notifyBookChanges() {
        System.out.println("[WS] Sending updated books to clients...");
        messagingTemplate.convertAndSend("/topic/books", repo.getAll());
    }
}

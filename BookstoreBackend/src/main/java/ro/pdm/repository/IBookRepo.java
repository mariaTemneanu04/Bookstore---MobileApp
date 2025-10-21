package ro.pdm.repository;

import org.springframework.stereotype.Component;
import ro.pdm.domain.Book;

@Component
public interface IBookRepo extends Repository<Integer, Book> {
    Integer getMaxId();
}

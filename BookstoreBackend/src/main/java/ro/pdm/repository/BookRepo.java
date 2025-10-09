package ro.pdm.repository;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Component;
import ro.pdm.domain.Book;
import ro.pdm.domain.HibernateUtils;

@Component
public class BookRepo implements IBookRepo {

    protected SessionFactory sessionFactory;

    public BookRepo() {
        this.sessionFactory = HibernateUtils.getSessionFactory();
    }

    @Override
    public Iterable<Book> getAll() {
        try (Session session = sessionFactory.openSession()) {
            return session.createQuery("from Book", Book.class).list();
        }
    }

    // TODO
}

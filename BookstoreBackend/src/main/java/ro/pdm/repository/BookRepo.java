package ro.pdm.repository;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
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
    public void save(Book entity) {
        Transaction tr = null;

        try (Session session = sessionFactory.openSession()) {
            tr = session.beginTransaction();
            session.persist(entity);
            tr.commit();

        } catch (Exception e) {
            if (tr != null)
                tr.rollback();

            e.printStackTrace();
        }
    }

    @Override
    public Iterable<Book> getAll() {
        try (Session session = sessionFactory.openSession()) {
            return session.createQuery("from Book", Book.class).list();
        }
    }

    @Override
    public Integer getMaxId() {
        try (Session session = sessionFactory.openSession()) {
            return session.createQuery("select max(b.id) from Book b", Integer.class)
                    .uniqueResult();
        } catch (Exception e) {
            return null;
        }
    }

}

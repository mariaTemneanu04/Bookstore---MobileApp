package ro.pdm.repository;

import ro.pdm.domain.Entity;

public interface Repository<ID, E extends Entity<ID>> {
    void save(E entity);
    Iterable<E> getAll();
}

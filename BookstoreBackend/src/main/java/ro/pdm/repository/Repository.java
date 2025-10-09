package ro.pdm.repository;

import ro.pdm.domain.Entity;

public interface Repository<ID, E extends Entity<ID>> {
    Iterable<E> getAll();
}

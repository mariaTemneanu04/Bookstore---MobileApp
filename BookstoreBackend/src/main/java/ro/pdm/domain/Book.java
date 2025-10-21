package ro.pdm.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.time.LocalDateTime;

@jakarta.persistence.Entity
@Table(name = "books")
public class Book extends Entity<Integer> {

    @Column(nullable = false)
    private String title;

    @Column(nullable = true)
    private String author;

    @Column(name = "published")
    private LocalDateTime published;

    @Column(nullable = false)
    private boolean available; // 0 -> indisponibil, 1 -> disponibil

    public Book(String title, String author, LocalDateTime published, boolean available) {
        this.title = title;
        this.author = author;
        this.published = published;
        this.available = available;
    }

    public Book() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public LocalDateTime getPublished() {
        return published;
    }

    public void setPublished(LocalDateTime published) {
        this.published = published;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    @Override
    public String toString() {
        return "Book{" +
                ", available=" + available +
                ", published=" + published +
                ", author='" + author + '\'' +
                ", title='" + title + '\'' +
                '}';
    }
}

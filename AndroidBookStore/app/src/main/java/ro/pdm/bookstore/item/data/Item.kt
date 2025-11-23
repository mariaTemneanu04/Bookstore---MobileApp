package ro.pdm.bookstore.item.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "items")
data class Item(
    @PrimaryKey val id: String = "",
    val title: String = "",
    val author: String? = "",
    val published: String? = "",
    val available: Boolean = false,
    val dirty: Boolean? = false,
    val photo: String? = null,
    val latitude: Double? = 0.0,
    val longitude: Double? = 0.0
)
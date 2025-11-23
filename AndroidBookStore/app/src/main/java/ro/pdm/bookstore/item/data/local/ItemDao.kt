package ro.pdm.bookstore.item.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow
import ro.pdm.bookstore.item.data.Item

@Dao
interface ItemDao {
    @Query("select * from items")
    fun getAll(): Flow<List<Item>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: Item)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(items: List<Item>)

    @Update
    suspend fun update(item: Item): Int

    @Query("delete from items where id = :id")
    suspend fun deleteById(id: String): Int

    @Query("delete from items")
    suspend fun deleteAll()
}
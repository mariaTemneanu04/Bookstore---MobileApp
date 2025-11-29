package ro.pdm.bookstore.item.data.remote

import android.annotation.SuppressLint
import android.util.Log
import ro.pdm.bookstore.item.data.Item
import ro.pdm.bookstore.item.data.ItemRepository

object ItemWorkManager {
    @SuppressLint("StaticFieldLeak")
    lateinit var itemRepository: ItemRepository

    suspend fun create(item: Item):  Boolean {
        return try {
            Log.d("Create from WorkManager", "book title: ${item.title}")
            itemRepository.save(item)
            true
        } catch (e: Exception) {
            Log.i("Create failed from WorkManager", e.toString())
            false
        }
    }

    suspend fun update(item: Item): Boolean {
        return try {
            Log.d("Update from WorkManager", "book title: ${item.title}")
            itemRepository.update(item)
            true

        } catch (e: Exception) {
            Log.i("Update failed from WorkManager", e.toString())
            false
        }
    }
}
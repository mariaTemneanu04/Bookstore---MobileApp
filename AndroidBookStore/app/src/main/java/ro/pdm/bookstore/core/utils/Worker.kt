package ro.pdm.bookstore.core.utils

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import ro.pdm.bookstore.BookstoreAppDatabase
import ro.pdm.bookstore.item.data.remote.ItemWorkManager

class Worker (
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val itemDao = BookstoreAppDatabase.getDatabase(applicationContext).itemDao()
        val dirtyItems = itemDao.getDirtyItems()

        dirtyItems.forEach { dirtyIt ->
            Log.d("Worker do work", "book title: ${dirtyIt.title}")

            val newItem = dirtyIt.copy(dirty = false)
            if (dirtyIt.id.toInt() > 0)
                ItemWorkManager.update(newItem)

            else {
                ItemWorkManager.create(newItem)
                Log.d("Update from WorkManager", "book title: ${newItem.title} and id: ${newItem.id} and result: ${newItem.id}")

                Thread.sleep(1000)
                itemDao.deleteItem(dirtyIt)
            }
        }

        if (dirtyItems.isNotEmpty()) {
            Log.d("Worker", "List of items has been synchronized with the server")
        }

        return Result.success()
    }
}
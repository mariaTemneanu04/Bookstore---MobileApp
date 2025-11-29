package ro.pdm.bookstore.item.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.withContext
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.remote.Api
import ro.pdm.bookstore.core.utils.ConnectivityManagerNetworkMonitor
import ro.pdm.bookstore.item.data.local.ItemDao
import ro.pdm.bookstore.item.data.remote.ItemEvent
import ro.pdm.bookstore.item.data.remote.ItemService
import ro.pdm.bookstore.item.data.remote.ItemWsClient

class ItemRepository (
    private val itemService: ItemService,
    private val itemWsClient: ItemWsClient,
    private val itemDao: ItemDao,
    private val connectivityManagerNetworkMonitor: ConnectivityManagerNetworkMonitor
) {
    val itemStream by lazy { itemDao.getAll() }

    init {
        Log.d(TAG, "init")
    }

    private lateinit var context: Context
    private fun getBearerToken() = "Bearer ${Api.tokenInterceptor.token}"

    suspend fun refresh() {
        Log.d(TAG, "refresh started")
        try {
            val items = itemService.getAll(authorization = getBearerToken())
            itemDao.deleteAll()
            items.forEach { itemDao.insert(it) }
            Log.d(TAG, "refresh succeeded")
        } catch (e: Exception) {
            Log.w(TAG, "refresh failed", e)
        }
    }

    suspend fun openWsClient() {
        Log.d(TAG, "openWsClient")
        withContext(Dispatchers.IO) {
            getItemEvents().collect {
                Log.d(TAG, "Item event collected $it")
                if (it.isSuccess) {
                    val itemEvent = it.getOrNull();
                    when (itemEvent?.type) {
                        "created" -> handleItemCreated(itemEvent.payload)
                        "updated" -> handleItemUpdated(itemEvent.payload)
                        "deleted" -> handleItemDeleted(itemEvent.payload)
                    }
                }
            }
        }
    }

    suspend fun closeWsClient() {
        Log.d(TAG, "closeWsClient")
        withContext(Dispatchers.IO) {
            itemWsClient.closeSocket()
        }
    }

    private suspend fun getItemEvents(): Flow<Result<ItemEvent>> = callbackFlow {
        Log.d(TAG, "getItemEvents started")
        itemWsClient.openSocket(
            onEvent = {
                Log.d(TAG, "onEvent $it")
                if (it != null) {
                    trySend(Result.success(it))
                }
            },
            onClosed = { close() },
            onFailure = { close() });
        awaitClose { itemWsClient.closeSocket() }
    }

    suspend fun update(item: Item): Item {
        Log.d(TAG, "update $item...")

        return if (isOnline()) {
                val updatedItem =
                    itemService.update(id = item.id, item = item, authorization = getBearerToken())
                Log.d(TAG, "update $item succeeded")
                handleItemUpdated(updatedItem)
                updatedItem
            } else {
                Log.d(TAG, "update $item locally")
                val dirtyItem = item.copy(dirty = true)
                handleItemUpdated(dirtyItem)
                dirtyItem
            }
    }

    suspend fun save(item: Item): Item {
        Log.d(TAG, "save $item...")

        return if (isOnline()) {
            val createdItem = itemService.create(item = item, authorization = getBearerToken())
            Log.d(TAG, "save ON SERVER $item succeeded")
            handleItemCreated(createdItem)
            createdItem
        } else {
            Log.d(TAG, "save $item locally")
            val dirtyItem = item.copy(dirty = true)
            handleItemCreated(dirtyItem)
            dirtyItem
        }
    }

    private suspend fun handleItemDeleted(item: Item) {
        Log.d(TAG, "handleItemDeleted - todo $item")
    }

    private suspend fun handleItemUpdated(item: Item) {
        Log.d(TAG, "handleItemUpdated...")
        itemDao.update(item)
    }

    private suspend fun handleItemCreated(item: Item) {
        Log.d(TAG, "handleItemCreated...")

        if (item.id.isNotEmpty() && item.id.toInt() > 0) {
            Log.d(TAG, "handleItemCreated - insert an existing book")
            itemDao.insert(item.copy(dirty = false))
            Log.d(TAG, "handleItemCreated - insert an existing book SUCCESS!!")
        } else {
            val randomId = (-10000000..-1).random()
            val localItem = item.copy(id = randomId.toString(), dirty = true)
            Log.d(TAG, "handleItemCreated - create a new item locally $localItem")
            itemDao.insert(localItem)
            Log.d(TAG, "handleItemCreated - create a new item locally SUCCESS!!")
        }
    }

    private suspend fun isOnline(): Boolean {
        Log.d(TAG, "verify online state...")
        return connectivityManagerNetworkMonitor.isOnline.first()
    }

    suspend fun deleteAll() {
        itemDao.deleteAll()
    }

    fun setToken(token: String) {
        itemWsClient.authorize(token)
    }

    fun setContext(context: Context) {
        this.context = context
    }
}
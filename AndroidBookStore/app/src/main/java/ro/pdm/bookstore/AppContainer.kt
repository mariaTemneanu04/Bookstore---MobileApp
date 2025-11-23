package ro.pdm.bookstore

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.preferencesDataStore
import ro.pdm.bookstore.auth.AuthRepository
import ro.pdm.bookstore.auth.data.AuthDataSource
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.UserPreferencesRepository
import ro.pdm.bookstore.core.data.remote.Api
import ro.pdm.bookstore.item.data.ItemRepository
import ro.pdm.bookstore.item.data.remote.ItemService
import ro.pdm.bookstore.item.data.remote.ItemWsClient
import kotlin.getValue

val Context.userPreferencesDataStore by preferencesDataStore(
    name = "user_preferences"
)

class AppContainer(val context: Context) {
    init {
        Log.d(TAG, "init")
    }

    private val authDataSource: AuthDataSource = AuthDataSource()
    private val itemService: ItemService = Api.retrofit.create(ItemService::class.java)
    private val itemWsClient: ItemWsClient = ItemWsClient(Api.okHttpClient)

    private val database: BookstoreAppDatabase by lazy { BookstoreAppDatabase.getDatabase(context) }

    val itemRepository: ItemRepository by lazy {
        ItemRepository(itemService, itemWsClient, database.itemDao())
    }

    val authRepository: AuthRepository by lazy {
        AuthRepository(authDataSource)
    }

    val userPreferencesRepository: UserPreferencesRepository by lazy {
        UserPreferencesRepository(context.userPreferencesDataStore)
    }

}
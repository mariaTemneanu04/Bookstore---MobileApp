package ro.pdm.bookstore

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.launch
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.UserPreferences
import ro.pdm.bookstore.core.data.UserPreferencesRepository
import ro.pdm.bookstore.item.data.ItemRepository

class BookstoreViewModel (
    private val userPreferencesRepository: UserPreferencesRepository,
    private val itemRepository: ItemRepository
) : ViewModel() {

    init {
        Log.d(TAG, "init")
    }

    fun logout() {
        viewModelScope.launch {
            itemRepository.deleteAll()
            userPreferencesRepository.save(UserPreferences())
        }
    }

    fun setToken(token: String) {
        itemRepository.setToken(token)
    }

    companion object {
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val app = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as BookstoreApp)
                BookstoreViewModel(
                    app.container.userPreferencesRepository,
                    app.container.itemRepository
                )
            }
        }
    }
}
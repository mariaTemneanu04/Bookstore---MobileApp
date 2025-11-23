package ro.pdm.bookstore.core.ui

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import ro.pdm.bookstore.BookstoreApp
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.UserPreferences
import ro.pdm.bookstore.core.data.UserPreferencesRepository

class UserPreferencesViewModel(private val userPreferencesRepository: UserPreferencesRepository) :
    ViewModel() {
        val uiState: Flow<UserPreferences> = userPreferencesRepository.userPreferencesStream

    init {
        Log.d(TAG, "init")
    }

    fun save(userPreferences: UserPreferences) {
        viewModelScope.launch {
            Log.d(TAG, "saveUserPreferences...")
            userPreferencesRepository.save(userPreferences)
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val app = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as BookstoreApp)
                UserPreferencesViewModel(app.container.userPreferencesRepository)
            }
        }
    }
}
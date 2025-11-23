package ro.pdm.bookstore.auth

import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.launch
import ro.pdm.bookstore.BookstoreApp
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.UserPreferences
import ro.pdm.bookstore.core.data.UserPreferencesRepository

data class LoginUiState(
    val isAuthenticating: Boolean = false,
    val authenticationError: Throwable? = null,
    val authenticationCompleted: Boolean = false,
    val token: String = ""
)

class LoginViewModel(
    private val authRepository: AuthRepository,
    private val userPreferencesRepository: UserPreferencesRepository

) : ViewModel() {
    var uiState: LoginUiState by mutableStateOf(LoginUiState())

    init {
        Log.d(TAG, "init")
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            Log.v(TAG, "login...")
            uiState = uiState.copy(isAuthenticating = true, authenticationError = null)

            val result = authRepository.login(username, password)
            if (result.isSuccess) {
                userPreferencesRepository.save(
                    UserPreferences(
                        username,
                        result.getOrNull()?.token ?: ""
                    )
                )

                uiState = uiState.copy(isAuthenticating = false, authenticationCompleted = true)
                Log.v(TAG, "onLogin success!")
            } else {
                uiState = uiState.copy(
                    isAuthenticating = false,
                    authenticationError = result.exceptionOrNull()
                )
            }
        }
    }


    companion object {
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val app = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as BookstoreApp)
                LoginViewModel (
                    app.container.authRepository,
                    app.container.userPreferencesRepository
                )
            }
        }
    }
}
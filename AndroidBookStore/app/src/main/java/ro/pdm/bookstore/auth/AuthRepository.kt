package ro.pdm.bookstore.auth

import android.util.Log
import ro.pdm.bookstore.auth.data.AuthDataSource
import ro.pdm.bookstore.auth.data.TokenHolder
import ro.pdm.bookstore.auth.data.User
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.remote.Api

class AuthRepository(private val authDataSource: AuthDataSource) {
    init {
        Log.d(TAG, "init")
    }

    fun clearToken() {
        Api.tokenInterceptor.token = null
    }

    suspend fun login(username: String, password: String): Result<TokenHolder> {
        val user = User(username, password)
        val result = authDataSource.login(user)
        if (result.isSuccess) {
            Api.tokenInterceptor.token = result.getOrNull()?.token
        }
        return result
    }
}
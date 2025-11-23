package ro.pdm.bookstore.auth.data

import android.util.Log
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.data.remote.Api

class AuthDataSource() {
    interface AuthService {
        @Headers("Content-Type: application/json")
        @POST("api/auth/login")
        suspend fun login(@Body user: User): TokenHolder
    }

    private val authService: AuthService = Api.retrofit.create(AuthService::class.java)

    suspend fun login(user: User): Result<TokenHolder> {
        try {
            return Result.success(authService.login(user))
        } catch (e: Exception) {
            Log.w(TAG, "login failed", e)
            return Result.failure(e)
        }
    }
}
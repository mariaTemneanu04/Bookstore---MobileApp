package ro.pdm.bookstore.item.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import ro.pdm.bookstore.item.data.Item

interface ItemService {
    @GET("/api/book")
    suspend fun getAll(@Header("Authorization") authorization: String): List<Item>

    @GET("/api/book/{id}")
    suspend fun read (
        @Header("Authorization") authorization: String,
        @Path("id") id: String?
    ): Item

    @Headers("Content-Type: application/json")
    @POST("/api/book")
    suspend fun create(@Header("Authorization") authorization: String, @Body item: Item): Item

    @Headers("Content-Type: application/json")
    @PUT("/api/book/edit/{id}")
    suspend fun update(
        @Header("Authorization") authorization: String,
        @Path("id") id: String?,
        @Body item: Item
    ): Item
}
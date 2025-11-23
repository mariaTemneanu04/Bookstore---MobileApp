package ro.pdm.bookstore

import android.app.Application
import android.util.Log
import ro.pdm.bookstore.core.TAG

class BookstoreApp : Application() {
    lateinit var container: AppContainer

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "init")
        container = AppContainer(this)
    }
}
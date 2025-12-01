package ro.pdm.bookstore.item.ui.item

import android.util.Log
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.launch
import okhttp3.Call
import ro.pdm.bookstore.BookstoreApp
import ro.pdm.bookstore.core.DateUtils
import ro.pdm.bookstore.item.data.Item
import ro.pdm.bookstore.core.Result
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.item.data.ItemRepository

data class ItemUiState (
    val id: String? = null,
    val item: Item = Item(),
    var loadResult: Result<Item>? = null,
    var submitResult: Result<Item>? = null,
)

class ItemViewModel(
    private val id: String?,
    private val itemRepository: ItemRepository
) : ViewModel() {

    var uiState: ItemUiState by mutableStateOf(ItemUiState(loadResult = Result.Loading))
        private set

    init {
        Log.d(TAG, "init")
        if (id != null) {
            loadItem()
        } else {
            uiState = uiState.copy(loadResult = Result.Success(Item()))
        }
    }

    fun loadItem() {
        viewModelScope.launch {
            itemRepository.itemStream.collect { items ->
                Log.d(TAG, "Collecting books")

                if (uiState.loadResult !is Result.Loading) {
                    return@collect
                }
                Log.d(TAG, "Collecting books - loadResult is loading, attempting to find book with id: ${id}")

                val item = items.find { it.id == id } ?: Item()
                uiState = uiState.copy(item = item, loadResult = Result.Success(item))
            }
        }
    }

    fun saveOrUpdateItem(
        title: String,
        author: String?,
        published: String?,
        available: Boolean,
        latitude: Double?,
        longitude: Double?
    ) {
        viewModelScope.launch {
            Log.d(TAG, "saveOrUpdateItem...")

            try {
                uiState = uiState.copy(submitResult = Result.Loading)

                var dateToSave: String? = null
                if (!published.isNullOrBlank()) {
                    val formattedDate = DateUtils.parseDDMMYYYY(published)

                    if (formattedDate == null && published != "") {
                        uiState = uiState.copy(submitResult = Result.Error(Exception("Invalid date format")))
                        return@launch
                    }

                    dateToSave = DateUtils.formatDDMMYYYY(formattedDate)
                }

                val item = uiState.item.copy(
                    title = title,
                    author = author,
                    published = dateToSave,
                    available = available,
                    latitude = latitude,
                    longitude = longitude
                )

                val saved: Item = if (id == null)
                    itemRepository.save(item)
                else
                    itemRepository.update(item)

                Log.d(TAG, "saveOrUpdateItem succeeded")
                uiState = uiState.copy(submitResult = Result.Success(saved))
            } catch (e: Exception) {
                Log.d(TAG, "saveOrUpdateItem failed")
                uiState = uiState.copy(submitResult = Result.Error(e))
            }
        }
    }

    companion object {
        fun Factory(id: String?) : ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val app = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as BookstoreApp)
                ItemViewModel(id, app.container.itemRepository)
            }
        }
    }
}
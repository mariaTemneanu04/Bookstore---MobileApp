package ro.pdm.bookstore.item.data.remote

import ro.pdm.bookstore.item.data.Item

data class ItemEvent(val type: String, val payload: Item)
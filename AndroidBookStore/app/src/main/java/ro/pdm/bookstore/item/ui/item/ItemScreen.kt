package ro.pdm.bookstore.item.ui.item

import android.app.Application
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import ro.pdm.bookstore.R
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import ro.pdm.bookstore.core.DateUtils
import ro.pdm.bookstore.core.Result
import ro.pdm.bookstore.core.ui.MyLocation
import ro.pdm.bookstore.core.ui.MyLocationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemScreen(id: String?, onClose: () -> Unit) {
    Log.d("BookScreen", "recompose")
    Log.d("BookScreen", "id = $id")

    val itemViewModel = viewModel<ItemViewModel>(factory = ItemViewModel.Factory(id))
    val itemUiState = itemViewModel.uiState

    var title by rememberSaveable { mutableStateOf(itemUiState.item.title) }
    var author by rememberSaveable { mutableStateOf(itemUiState.item.author) }
    var published by rememberSaveable { mutableStateOf(itemUiState.item.published) }
    var available by rememberSaveable { mutableStateOf(itemUiState.item.available) }
    var lat by rememberSaveable { mutableStateOf(itemUiState.item.latitude) }
    var lng by rememberSaveable { mutableStateOf(itemUiState.item.longitude) }

    Log.d("BookScreen", "title = $title, author = $author, published = $published, available = $available, lat = $lat, lng = $lng")

    LaunchedEffect(itemUiState.submitResult) {
        Log.d("ItemScreen", "Submit = ${itemUiState.submitResult}")
        if (itemUiState.submitResult is Result.Success) {
            Log.d("ItemScreen", "Closing screen")
            onClose()
        }
    }

    var textInitialized by remember { mutableStateOf(id == null) }
    LaunchedEffect(id, itemUiState.loadResult) {
        if (textInitialized) {
            return@LaunchedEffect
        }

        if (itemUiState.loadResult !is Result.Loading) {
            title = itemUiState.item.title
            author = itemUiState.item.author
            published = itemUiState.item.published
            available = itemUiState.item.available
            lat = itemUiState.item.latitude
            lng = itemUiState.item.longitude

            textInitialized = true
        }
    }

    var canSave by rememberSaveable { mutableStateOf(true) }
    var errorMessage by rememberSaveable { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(id = R.string.item)) },
                actions = {
                    Button(
                        enabled = canSave,
                        onClick = {
                            if (title.length < 3) {
                                errorMessage += "\n\tTitle must be at least 3 characters long!"
                                canSave = false
                            }

                            var convertedDate: String? = null
                            if (published.toString().isNotEmpty()) {
                                val parsed = DateUtils.parseDDMMYYYY(published)

                                if (parsed == null && !published.isNullOrBlank()) {
                                    errorMessage += "\n\tInvalid date format! (Use DD/MM/YYYY | DD.MM.YYYY | DD-MM-YYYY)"
                                    canSave = false
                                } else {
                                    convertedDate = DateUtils.formatDDMMYYYY(parsed)
                                }

                                if (convertedDate == null) {
                                    errorMessage +="\n\tInvalid date format! (Use DD/MM/YYYY | DD.MM.YYYY | DD-MM-YYY)"
                                    canSave = false
                                }
                            }

                            if (canSave) {
                                errorMessage = "" // reset the error message

                                itemViewModel.saveOrUpdateItem(
                                    title,
                                    author,
                                    convertedDate,
                                    available,
                                    latitude = lat,
                                    longitude = lng
                                )
                            }
                        })
                    {
                        Row(
                            modifier = Modifier.padding(horizontal = 1.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = null
                            )
                        }
                    }

                }
            )
        }
    ) { it ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(it)
        ) {
            // UI for loading state
            if (itemUiState.loadResult is Result.Loading) {
                CircularProgressIndicator()
                return@Scaffold
            }
            if (itemUiState.submitResult is Result.Loading) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) { LinearProgressIndicator() }
            }
            if (itemUiState.loadResult is Result.Error) {
                Text(text = "Failed to load book - ${(itemUiState.loadResult as Result.Error).exception?.message}")
            }

            // UI for loaded state
            Row {
                StyledTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = "Title"
                )
            }
            Row {
                StyledTextField(
                    value = author ?: "",
                    onValueChange = { author = it },
                    label = "Author")
            }
            Row {
                StyledTextField(
                    value = published ?: "",
                    onValueChange = { published = it },
                    label = "Publication Date"
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
                    .background(
                        shape = RoundedCornerShape(50), brush = Brush.linearGradient(
                            listOf(
                                MaterialTheme.colorScheme.tertiary,
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.secondary
                            )
                        )
                    ) ,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = available,
                    onCheckedChange = { isChecked -> available = isChecked },
                    modifier = Modifier
                        .padding(8.dp)
                        .background(
                            shape = RoundedCornerShape(50),
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                )

                Text(text = if (available) "Available" else "Not Available", color = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.fillMaxWidth())
            }

            Row {
                StyledTextField(value = lat.toString(), onValueChange = { lat = it.toDoubleOrNull() ?: 0.0 }, label = "Latitude")
            }

            Row {
                StyledTextField(value = lng.toString(), onValueChange = { lng = it.toDoubleOrNull() ?: 0.0 }, label = "Longitude")
            }

            Row {
                val myLocationViewModel = viewModel<MyLocationViewModel>(
                    factory = MyLocationViewModel.Factory(
                        LocalContext.current.applicationContext as Application
                    )
                )

                val location = myLocationViewModel.uiState
                if (lat != 0.0 && lng != 0.0) {
                    MyLocation(lat, lng) { newLatLng ->
                        lat = newLatLng.latitude
                        lng = newLatLng.longitude
                    }
                } else if (location != null) {
                     MyLocation(location.latitude, location.longitude) { newLatLng ->
                         lat = newLatLng.latitude
                         lng = newLatLng.longitude
                     }

                    lat = location.latitude
                    lng = location.longitude
                } else {
                    LinearProgressIndicator()
                }
            }

            if (itemUiState.submitResult is Result.Error) {
                Text(
                    text = "Failed to submit book - ${(itemUiState.submitResult as Result.Error).exception?.message}",
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }

        LaunchedEffect(canSave) {
            if (!canSave) {
                delay(5000L)
                canSave = true
            } else {
                delay(1500L)
                errorMessage = ""
            }
        }
    }
}


@Preview
@Composable
fun PreviewBookScreen() {
    ItemScreen(id = "0", onClose = {})
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StyledTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier
) {
    TextField(
        modifier = modifier
            .fillMaxWidth()
            .padding(10.dp, 5.dp)
            .clip(RoundedCornerShape(30.dp))
            .background(
                brush = Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.tertiary,
                        MaterialTheme.colorScheme.primary,
                        MaterialTheme.colorScheme.secondary
                    )
                )
            ),
        value = value,
        onValueChange = onValueChange,
        textStyle = TextStyle(
            color = MaterialTheme.colorScheme.onPrimary,
            fontSize = MaterialTheme.typography.bodyLarge.fontSize
        ),
        label = { Text(label, color = MaterialTheme.colorScheme.onSecondary) },
        placeholder = { Text(label, color = MaterialTheme.colorScheme.onSecondary) },
    )
}
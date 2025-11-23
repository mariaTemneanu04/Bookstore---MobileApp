package ro.pdm.bookstore.item.ui.items

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import ro.pdm.bookstore.item.data.Item

typealias OnItemFn = (id: String?) -> Unit

@Composable
fun ItemList(itemList: List<Item>, onItemClick: OnItemFn, modifier: Modifier) {
    Log.d("ItemList", "recompose")

    for (item in itemList) {
        Log.d("ItemList", item.title)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(12.dp)
    ) {
        items(itemList) { item ->
            ItemDetail(item, onItemClick)
        }
    }
}


@Composable
fun ItemDetail(item: Item, onItemClick: OnItemFn) {
    var isExpanded by remember { mutableStateOf(false) }

    val gradientColors = listOf(
        MaterialTheme.colorScheme.primary,
        MaterialTheme.colorScheme.secondary,
    )
    val textColor = MaterialTheme.colorScheme.onPrimary

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .clip(RoundedCornerShape(15.dp))
            .background(brush = Brush.linearGradient(gradientColors))
            .clickable(onClick = {
                isExpanded = !isExpanded
            })
            .padding(12.dp)
    ) {

        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, color = textColor),
                    modifier = Modifier.weight(1f)
                )

                Box(
                    modifier = Modifier
                        .clickable {
                            onItemClick(item.id)
                        }
                        .padding(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit Item",
                        tint = MaterialTheme.colorScheme.onPrimary
                    )
                }
            }

            Text(
                text = "Author: ${item.author}",
                style = MaterialTheme.typography.bodyMedium.copy(color = textColor.copy(alpha = 0.8f)),
                modifier = Modifier.padding(bottom = 6.dp)
            )

            if (isExpanded) {
                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Publication Date: ${item.published}",
                    style = MaterialTheme.typography.bodyMedium.copy(color = textColor),
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                Text(
                    text = "Is Available: ${if (item.available) "yes" else "no"}",
                    style = MaterialTheme.typography.bodyMedium.copy(color = textColor),
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                Text(
                    text = "Lat: ${item.latitude.toString().take(7)}, Lng: ${item.longitude.toString().take(7)}",
                    style = MaterialTheme.typography.bodyMedium.copy(color = textColor),
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                Text(
                    text = "Sync Needed: ${if (item.dirty == true) "yes" else "no"}",
                    style = MaterialTheme.typography.bodySmall.copy(color = textColor.copy(alpha = 0.6f)),
                )
            }
        }
    }
}
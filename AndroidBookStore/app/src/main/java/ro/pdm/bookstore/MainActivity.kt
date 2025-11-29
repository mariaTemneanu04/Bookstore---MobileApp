package ro.pdm.bookstore

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.ui.MyNetworkStatus
import ro.pdm.bookstore.ui.theme.AndroidBookStoreTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            (application as BookstoreApp).container.itemRepository.setContext(this@MainActivity)
            Log.d(TAG, "onCreate")
            MyApp {
                MyAppNavHost()
            }

            MyNetworkStatus()
        }
    }

    override fun onResume() {
        super.onResume()
        lifecycleScope.launch {
            (application as BookstoreApp).container.itemRepository.openWsClient()
            (application as BookstoreApp).container.itemRepository.setContext(this@MainActivity)
        }
    }

    override fun onPause() {
        super.onPause()
        lifecycleScope.launch {
            (application as BookstoreApp).container.itemRepository.closeWsClient()
            (application as BookstoreApp).container.itemRepository.setContext(this@MainActivity)
        }
    }
}


@Composable
fun MyApp(content: @Composable () -> Unit) {
    Log.d("MyApp", "recompose")
    AndroidBookStoreTheme {
        Surface {
            content()
        }
    }
}

@Preview
@Composable
fun PreviewMyApp() {
    MyApp {
        MyAppNavHost()
    }
}
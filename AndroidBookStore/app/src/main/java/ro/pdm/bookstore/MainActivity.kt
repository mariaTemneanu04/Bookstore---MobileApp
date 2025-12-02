package ro.pdm.bookstore

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import android.provider.Settings
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import okio.AsyncTimeout.Companion.lock
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.core.ui.MyNetworkStatus
import ro.pdm.bookstore.core.utils.createNotificationChannel
import ro.pdm.bookstore.ui.theme.AndroidBookStoreTheme
import ro.pdm.bookstore.core.utils.Permissions
import android.Manifest
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import ro.pdm.bookstore.sensors.LightSensor

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalPermissionsApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            createNotificationChannel(channelId = "Books Channel", context = this@MainActivity)
            (application as BookstoreApp).container.itemRepository.setContext(this@MainActivity)
            Log.d(TAG, "onCreate")

            lock.lock()
            askPermissions(this)
            lock.unlock()

            Permissions(
                permissions = listOf(
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ),
                rationaleText = "Please allow app to use location",
                dismissedText = "Oh no! No location provider allowed!"
            ) {
                MyApp {
                    MyAppNavHost()
                }
                MyNetworkStatus()
                LightSensor()
            }
        }
    }

    private fun askPermissions(context: Context) {
        if (!Settings.System.canWrite(context)) {
            val i = Intent(Settings.ACTION_MANAGE_WRITE_SETTINGS)
            context.startActivity(i)
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
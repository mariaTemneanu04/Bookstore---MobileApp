package ro.pdm.bookstore

import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.rememberNavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import kotlinx.coroutines.delay
import ro.pdm.bookstore.auth.LoginScreen
import ro.pdm.bookstore.core.data.UserPreferences
import ro.pdm.bookstore.core.data.remote.Api
import ro.pdm.bookstore.core.ui.UserPreferencesViewModel
import ro.pdm.bookstore.item.ui.items.ItemsScreen
import androidx.compose.runtime.getValue
import androidx.navigation.NavType
import androidx.navigation.navArgument
import ro.pdm.bookstore.item.ui.item.ItemScreen

const val authRoute = "auth"
const val itemsRoute = "items"

@Composable
fun MyAppNavHost() {
    val navController = rememberNavController()

    val onCloseItem = {
        Log.d("MyAppNavHost", "navigate back to list")
        navController.popBackStack()
    }

    val userPreferencesViewModel =
        viewModel<UserPreferencesViewModel>(factory = UserPreferencesViewModel.Factory)

    val userPreferenceUiState by userPreferencesViewModel.uiState.collectAsStateWithLifecycle(
        initialValue = UserPreferences()
    )

    val myAppViewModel = viewModel<BookstoreViewModel>(factory = BookstoreViewModel.Factory)

    NavHost(
        navController = navController,
        startDestination = authRoute
    ) {
        composable(itemsRoute) {
            ItemsScreen(
                onLogout = {
                    Log.d("MyAppNavHost", "logout")
                    myAppViewModel.logout()

                    Api.tokenInterceptor.token = null
                    navController.navigate(authRoute) {
                        popUpTo(0)
                    }

                },

                onItemClick = { itemId ->
                    Log.d("MyAppNavHost", "navigate to item $itemId to edit")
                    navController.navigate("$itemsRoute/edit/$itemId")
                },

                onAddItem = {
                    Log.d("MyAppNavHost", "navigate to new item to add")
                    navController.navigate("$itemsRoute/add")
                }
            )
        }

        composable(
            route = "$itemsRoute/edit/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType })
        ) {
            ItemScreen(
                id = it.arguments?.getString("id"),
                onClose = { onCloseItem() }
            )
        }

        composable(route = "$itemsRoute/add") {
            ItemScreen(
                id = null,
                onClose = { onCloseItem() }
            )
        }

        composable(route = authRoute) {
            LoginScreen(
                onClose = {
                    Log.d("MyAppNavHost", "navigate to list")
                    navController.navigate(itemsRoute)
                }
            )
        }
    }

    LaunchedEffect(userPreferenceUiState.token) {
        if (userPreferenceUiState.token.isNotEmpty()) {
            delay(1500)
            Log.d("MyAppNavHost", "Launched effect navigate to items")
            Api.tokenInterceptor.token = userPreferenceUiState.token
            myAppViewModel.setToken(userPreferenceUiState.token)
            navController.navigate(itemsRoute) {
                popUpTo(0)
            }
        }
    }
}
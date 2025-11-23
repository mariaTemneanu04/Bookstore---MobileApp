package ro.pdm.bookstore.auth

import android.util.Log
import androidx.compose.foundation.Image
import ro.pdm.bookstore.R
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import ro.pdm.bookstore.core.TAG
import ro.pdm.bookstore.ui.theme.BackgroundColor
import ro.pdm.bookstore.ui.theme.BurntUmber
import ro.pdm.bookstore.ui.theme.Cinnamon

@Composable
fun LoginScreen(onClose: () -> Unit)  {
    val loginViewModel = viewModel<LoginViewModel>(factory = LoginViewModel.Factory)
    val loginUiState = loginViewModel.uiState

    Scaffold(
        containerColor = BackgroundColor
    ) { innerPadding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            var username by remember { mutableStateOf("") }
            var password by remember { mutableStateOf("") }

            Spacer(modifier = Modifier.height(30.dp))

            Image(
                painter = painterResource(id = R.drawable.woman_reading),
                contentDescription = null,
                modifier = Modifier
                    .width(389.dp)
                    .height(337.dp)
            )

            Text(
                text = "Login to your Account",
                fontSize = 28.sp,
                fontFamily = FontFamily(Font(R.font.playfair_display)),
                color = BurntUmber,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 8.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            CustomTextField(
                value = username,
                onValueChange = { username = it },
                placeholder = "Username"
            )

            Spacer(modifier = Modifier.height(16.dp))

            CustomTextField(
                value = password,
                onValueChange = { password = it },
                placeholder = "Password"
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { loginViewModel.login(username, password) },
                modifier = Modifier
                    .width(268.dp)
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Cinnamon
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text(
                    text = "Login",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            if (loginUiState.authenticationError != null) {
                Text(text = "Login failed ${loginUiState.authenticationError.message}")
            }
        }
    }

    LaunchedEffect(loginUiState.authenticationCompleted) {
        Log.d(TAG, "Auth completed")
        if (loginUiState.authenticationCompleted) {
            onClose()
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginScreenPreview() {
    LoginScreen {}
}


package ro.pdm.bookstore.core

import android.util.Log
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class DateUtils {

    companion object {
        private val inputFormats = listOf(
            SimpleDateFormat("dd/MM/yyyy", Locale.getDefault()),
            SimpleDateFormat("dd-MM-yyyy", Locale.getDefault()),
            SimpleDateFormat("dd.MM.yyyy", Locale.getDefault()),
        )

        private val outputFormat = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())

        fun parseDDMMYYYY(dateString: String?): Date? {
            if (dateString.isNullOrBlank())
                return null

            Log.d(TAG, "Parsing date: $dateString")

            for (format in inputFormats) {
                try {
                    format.isLenient = false
                    val parsed = format.parse(dateString)
                    if (parsed != null) {
                        Log.i(TAG, "Date parsed successfully: $parsed")
                        return parsed
                    }
                } catch (_: Exception) {}
            }

            Log.e(TAG, "Failed to parse date: $dateString")
            return null
        }

        fun formatDDMMYYYY(date: Date?): String? {
            if (date == null) return null
            return outputFormat.format(date)
        }
    }
}
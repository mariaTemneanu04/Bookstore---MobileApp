package ro.pdm.bookstore

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import ro.pdm.bookstore.item.data.Item
import ro.pdm.bookstore.item.data.local.ItemDao

@Database(entities = [Item::class], version = 2)
abstract class BookstoreAppDatabase : RoomDatabase() {
    abstract fun itemDao(): ItemDao

    companion object {
        @Volatile
        private var INSTANCE: BookstoreAppDatabase? = null

        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                database.execSQL("alter table items rename to items_old")

                database.execSQL("""
                    create table items (
                        id text primary key not null,
                        title text not null,
                        author text,
                        published text,
                        available integer not null,
                        dirty integer, 
                        photo text,
                        latitude real,
                        longitude real
                    )
                """)

                database.execSQL("""
                    insert into items (id, title, author, published, available, dirty, photo, latitude, longitude)
                    select id, title, author, published, available, dirty, photo, latitude, longitude
                    from items_old
                """)

                database.execSQL("drop table items_old")
            }
        }

        fun getDatabase(context: Context): BookstoreAppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context,
                    BookstoreAppDatabase::class.java,
                    "app_database"
                )
                    .setJournalMode(JournalMode.WRITE_AHEAD_LOGGING)
                    .addMigrations(MIGRATION_1_2)
                    .build()

                INSTANCE = instance
                instance
            }
        }
    }
}
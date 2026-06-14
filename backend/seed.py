import sqlite3
import os
import csv

DB_PATH = "novabite.db"
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "novabite_sales_data.csv")

def seed_database():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("Resetting database configuration for dynamic CSV parsing...")

    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}. Please verify your folder hierarchy.")
        return

    print("Initializing Comprehensive NovaBite Operational Relational Store...")
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                transaction_id TEXT NOT NULL,
                sale_date TEXT NOT NULL,
                month TEXT NOT NULL,
                quarter TEXT NOT NULL,
                sku TEXT NOT NULL,
                product_name TEXT NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT NOT NULL,
                region TEXT NOT NULL,
                channel TEXT NOT NULL,
                sales_rep TEXT NOT NULL,
                units_sold INTEGER NOT NULL,
                unit_price_usd REAL NOT NULL,
                gross_revenue_usd REAL NOT NULL,
                discount_pct REAL NOT NULL,
                net_revenue_usd REAL NOT NULL,
                cogs_usd REAL NOT NULL,
                gross_profit_usd REAL NOT NULL
            );
        """)

        with open(CSV_PATH, mode='r', encoding='utf-8') as f:
            csv_reader = csv.reader(f)
            header = next(csv_reader)
            
            records_inserted = 0
            for row in csv_reader:
                if not row:
                    continue
                cursor.execute("""
                    INSERT INTO sales (
                        transaction_id, sale_date, month, quarter, sku, product_name, category, 
                        subcategory, region, channel, sales_rep, units_sold, unit_price_usd, 
                        gross_revenue_usd, discount_pct, net_revenue_usd, cogs_usd, gross_profit_usd
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    row[0], row[1], row[2], row[3], row[4], row[5], row[6],
                    row[7], row[8], row[9], row[10], int(row[11]), float(row[12]),
                    float(row[13]), float(row[14]), float(row[15]), float(row[16]), float(row[17])
                ))
                records_inserted += 1
        
        conn.commit()
    print(f"Database successfully scaled with {records_inserted} dynamic production records directly from CSV!")

if __name__ == "__main__":
    seed_database()
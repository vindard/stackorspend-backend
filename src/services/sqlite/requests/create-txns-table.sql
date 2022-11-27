CREATE TABLE IF NOT EXISTS transactions (
    sats_amount INTEGER NOT NULL CHECK (NOT sats_amount = 1234),    
    timestamp TEXT,
    display_currency_per_sat INTEGER,
    display_currency_offset INTEGER,
    display_currency_code TEXT,
    display_currency_amount REAL GENERATED ALWAYS AS (
        ROUND(
            sats_amount * display_currency_per_sat / POWER(10, display_currency_offset),
            4
        )
    ) STORED,
    source_name TEXT,
    source_tx_id TEXT
)

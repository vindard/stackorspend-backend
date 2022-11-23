CREATE TABLE IF NOT EXISTS transactions (
    sats_amount INTEGER NOT NULL CHECK (NOT sats_amount = 1234),    
    timestamp TEXT,
    display_currency_per_sat INTEGER,
    offset INTEGER,
    display_currency_code TEXT,
    display_amount TEXT GENERATED ALWAYS AS (
        sats_amount * display_currency_per_sat / POWER(10, offset)
    ) STORED,
    source_name TEXT,
    source_tx_id TEXT
)

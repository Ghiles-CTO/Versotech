from pathlib import Path

import pandas as pd


IN_PATH = Path("VERSO/datafixing/dashboard_introducer_summary_extracted.csv")
OUT_PATH = Path("VERSO/datafixing/zero_ownership_introductions.csv")


def _to_numeric(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return None


def _clean_text(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip()


def _investor_key(row):
    entity = _clean_text(row.get("investor_entity"))
    if entity:
        return entity
    first = _clean_text(row.get("investor_first"))
    last = _clean_text(row.get("investor_last"))
    full = f"{first} {last}".strip()
    return full


def main():
    df = pd.read_csv(IN_PATH)

    df["ownership_position"] = df["ownership_position"].apply(_to_numeric)
    df["amount_invested"] = df["amount_invested"].apply(_to_numeric)
    df["num_shares"] = df["num_shares"].apply(_to_numeric)

    df["introducer_name_mapped"] = df["introducer_name_mapped"].fillna("").astype(str)
    df = df[df["introducer_name_mapped"].str.strip() != ""].copy()
    df = df[df["ownership_position"] == 0].copy()

    df["investor_key"] = df.apply(_investor_key, axis=1)
    df = df[df["investor_key"].str.strip() != ""].copy()

    df["vc_code"] = df["vc_code"].fillna("").astype(str).str.upper()

    df = df.drop_duplicates(
        subset=["vc_code", "introducer_name_mapped", "investor_key"]
    )

    df.to_csv(
        OUT_PATH,
        index=False,
        columns=[
            "vc_code",
            "sheet",
            "introducer_name_mapped",
            "investor_entity",
            "investor_first",
            "investor_last",
            "investor_key",
            "ownership_position",
            "amount_invested",
            "num_shares",
        ],
    )


if __name__ == "__main__":
    main()

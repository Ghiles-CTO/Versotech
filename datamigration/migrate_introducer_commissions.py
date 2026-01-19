#!/usr/bin/env python3
"""
VERSO Introducer Commissions Migration Script
=============================================
Migrates extracted dashboard data to the database:
1. Matches investors to subscriptions
2. Creates introducer_commissions records
3. Updates subscriptions with introducer_id

Usage: python3 migrate_introducer_commissions.py [--dry-run]
"""

import json
import os
import sys
from typing import Optional, Dict, List, Any
from datetime import datetime

# Check if we have supabase-py installed
try:
    from supabase import create_client, Client
except ImportError:
    print("ERROR: supabase-py not installed. Run: pip install supabase")
    sys.exit(1)

# Configuration
DATA_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/extracted_data_v2.json"
OUTPUT_FILE = "/Users/ghilesmoussaoui/Desktop/Versotech/datamigration/migration_report.json"

# Get Supabase credentials from environment or use direct values
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

# Introducer name to ID mapping (dashboard name -> DB id)
# Note: This handles variations like Terra/TERRA/TERRA Financial
INTRODUCER_MAP = {
    "Aboud": "3cc51575-6b04-4d46-a1ac-e66630a50e7b",
    "Alpha Gaia": "bc23b7c7-4253-40c2-889b-97a5044c23d5",
    "Anand": "b661243f-e6b4-41f1-b239-de4b197a689a",
    "Anand Sethia": "e0e79380-89ef-457b-a45c-0c9bef2cbf01",
    "Anand+Dan": "ade750b8-011a-4fd2-a32c-30ba609b5643",
    "AUX": "0aebf77c-47a3-4011-abd4-74ee3772d78e",
    "Dan": "81e78a56-bed0-45dd-8c52-45566f5895b6",
    "Elevation": "faace30d-09ed-4974-a609-38dba914ce01",
    "Elevation+Rick": "1e77ff44-332a-4939-83f9-acf96c851f72",
    "Enguerrand": "736a31b2-b8a6-4a0e-8abe-ed986014d0c4",
    "FINSA": "5a765445-bee7-4716-96f6-e2e2ca0329c7",
    "Gemera": "61e01a81-0663-4d4a-9626-fc3a6acb4d63",
    "Gio": "bcaaab40-eef5-4a3c-92d7-101f498489ac",
    "John": "19b4ce66-494a-41e0-8221-14b230d0c5f2",
    "Julien": "8964a91a-eb92-4f65-aa47-750c417cd499",
    "Manna Capital": "a2a0b0a1-817a-4039-bcbf-160b84f51567",
    "Omar": "ae4d8764-3c68-4d34-beca-9f4fec4c71a9",
    "Pierre Paumier": "41974010-e41d-40a6-9cbf-725618e7e00c",
    "Rick": "55b67690-c83d-4406-a2b4-935032d22739",
    "Rick + Andrew": "4d17ec21-5eeb-4957-9a50-992f731ebd56",
    "Robin": "6147711e-310e-45ec-8892-ac072e25c3b0",
    "Sandro": "87571ef2-b05d-4d7d-8095-2992d43b9aa8",
    "Simone": "6c63f6f1-d916-4275-8ea8-b951e333bc64",
    "Stableton+Terra": "cca3a4b2-5a53-464a-8387-1ad326a168ed",
    "Terra": "1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d",
    "TERRA": "1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d",
    "TERRA Financial": "1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d",
    "VERSO BI": "98fdce26-5a61-486e-a450-8e13dd4cfbf4",
}


def get_introducer_id(name: str) -> Optional[str]:
    """Get introducer ID from name."""
    return INTRODUCER_MAP.get(name)


def percent_to_bps(pct: Optional[float]) -> Optional[int]:
    """Convert percentage to basis points (e.g., 0.02 -> 200)."""
    if pct is None:
        return None
    # The dashboard stores rates as decimals (0.02 for 2%)
    return int(pct * 10000)


def parse_threshold(thresh: Optional[str]) -> Optional[str]:
    """Parse threshold string (e.g., '0x', '1x', '2x')."""
    if thresh is None or thresh == '':
        return None
    return thresh.strip()


class MigrationRunner:
    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.supabase: Optional[Client] = None
        self.stats = {
            "records_processed": 0,
            "subscriptions_matched": 0,
            "subscriptions_not_found": 0,
            "commissions_created": 0,
            "subscriptions_updated": 0,
            "errors": [],
        }
        self.results = []

    def connect(self) -> bool:
        """Connect to Supabase."""
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
            print("Set them as environment variables or update the script")
            return False

        try:
            self.supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            print("Connected to Supabase")
            return True
        except Exception as e:
            print(f"ERROR: Failed to connect to Supabase: {e}")
            return False

    def find_subscription(self, vehicle_code: str, investor_last_name: Optional[str],
                         investor_entity: Optional[str], amount: Optional[float]) -> Optional[Dict]:
        """
        Find a subscription by vehicle code and investor info.
        Returns subscription with investor and deal info.
        """
        if not self.supabase:
            return None

        try:
            # Build query to find subscription
            query = self.supabase.table("subscriptions") \
                .select("id, investor_id, vehicle_id, introducer_id, committed_capital, investors(id, legal_name, last_name, first_name, type), vehicles(id, entity_code), deals(id)") \
                .eq("vehicles.entity_code", vehicle_code)

            response = query.execute()

            if not response.data:
                return None

            # Filter by investor name or entity
            for sub in response.data:
                if not sub.get("investors"):
                    continue

                inv = sub["investors"]
                inv_last_name = (inv.get("last_name") or "").upper()
                inv_legal_name = (inv.get("legal_name") or "").upper()

                # Try to match by last name
                if investor_last_name and inv_last_name:
                    if investor_last_name.upper() == inv_last_name:
                        return sub

                # Try to match by entity/legal name
                if investor_entity and inv_legal_name:
                    if investor_entity.upper() in inv_legal_name or inv_legal_name in investor_entity.upper():
                        return sub

                # Try partial match on legal name with last name
                if investor_last_name and inv_legal_name:
                    if investor_last_name.upper() in inv_legal_name:
                        return sub

            return None

        except Exception as e:
            print(f"  ERROR finding subscription: {e}")
            return None

    def get_deal_for_vehicle(self, vehicle_id: str) -> Optional[str]:
        """Get the deal ID for a vehicle (assumes 1 deal per vehicle)."""
        if not self.supabase:
            return None

        try:
            response = self.supabase.table("deals") \
                .select("id") \
                .eq("vehicle_id", vehicle_id) \
                .limit(1) \
                .execute()

            if response.data:
                return response.data[0]["id"]
            return None
        except Exception as e:
            print(f"  ERROR getting deal: {e}")
            return None

    def create_commission(self, introducer_id: str, investor_id: str, deal_id: str,
                         basis_type: str, rate_bps: Optional[int], accrual_amount: Optional[float],
                         threshold: Optional[str] = None, notes: str = "") -> bool:
        """Create an introducer_commissions record."""
        if not self.supabase:
            return False

        try:
            data = {
                "introducer_id": introducer_id,
                "investor_id": investor_id,
                "deal_id": deal_id,
                "basis_type": basis_type,
                "rate_bps": rate_bps,
                "accrual_amount": accrual_amount,
                "notes": f"Migrated from dashboard {datetime.now().strftime('%Y-%m-%d')}. {notes}",
            }

            if threshold:
                data["threshold_multiplier"] = threshold

            if self.dry_run:
                print(f"    [DRY-RUN] Would create commission: {basis_type}, {rate_bps} bps, ${accrual_amount}")
                self.stats["commissions_created"] += 1
                return True

            response = self.supabase.table("introducer_commissions").insert(data).execute()

            if response.data:
                self.stats["commissions_created"] += 1
                return True
            return False

        except Exception as e:
            print(f"    ERROR creating commission: {e}")
            self.stats["errors"].append(f"Commission creation error: {e}")
            return False

    def update_subscription_introducer(self, subscription_id: str, introducer_id: str) -> bool:
        """Update subscription with introducer_id."""
        if not self.supabase:
            return False

        try:
            if self.dry_run:
                print(f"    [DRY-RUN] Would update subscription {subscription_id} with introducer {introducer_id}")
                self.stats["subscriptions_updated"] += 1
                return True

            response = self.supabase.table("subscriptions") \
                .update({"introducer_id": introducer_id}) \
                .eq("id", subscription_id) \
                .execute()

            if response.data:
                self.stats["subscriptions_updated"] += 1
                return True
            return False

        except Exception as e:
            print(f"    ERROR updating subscription: {e}")
            self.stats["errors"].append(f"Subscription update error: {e}")
            return False

    def process_record(self, record: Dict, vehicle_code: str) -> Dict:
        """Process a single record from the extracted data."""
        result = {
            "vehicle_code": vehicle_code,
            "introducer_name": record.get("introducer_name"),
            "investor_last_name": record.get("investor_last_name"),
            "investor_entity": record.get("investor_entity"),
            "amount_invested": record.get("amount_invested"),
            "status": "pending",
            "commissions_created": [],
            "errors": [],
        }

        self.stats["records_processed"] += 1

        # Get introducer ID
        introducer_name = record.get("introducer_name")
        introducer_id = get_introducer_id(introducer_name)

        if not introducer_id:
            result["status"] = "error"
            result["errors"].append(f"Unknown introducer: {introducer_name}")
            return result

        result["introducer_id"] = introducer_id

        # Find the subscription
        subscription = self.find_subscription(
            vehicle_code,
            record.get("investor_last_name"),
            record.get("investor_entity"),
            record.get("amount_invested")
        )

        if not subscription:
            result["status"] = "not_found"
            result["errors"].append("Subscription not found in database")
            self.stats["subscriptions_not_found"] += 1
            return result

        result["subscription_id"] = subscription["id"]
        result["investor_id"] = subscription["investor_id"]
        self.stats["subscriptions_matched"] += 1

        # Get deal ID
        deal_id = None
        if subscription.get("deals"):
            deal_id = subscription["deals"]["id"]
        else:
            deal_id = self.get_deal_for_vehicle(subscription["vehicle_id"])

        if not deal_id:
            result["errors"].append("Deal not found for vehicle")

        result["deal_id"] = deal_id

        # Update subscription with introducer_id if not already set
        if not subscription.get("introducer_id"):
            self.update_subscription_introducer(subscription["id"], introducer_id)

        # Create commission records for non-zero fees
        investor_id = subscription["investor_id"]

        # 1. Subscription fees -> invested_amount basis
        sub_fee_amt = record.get("sub_fee_amt")
        sub_fee_pct = record.get("sub_fee_pct")
        if sub_fee_amt and sub_fee_amt > 0 and deal_id:
            rate_bps = percent_to_bps(sub_fee_pct)
            if self.create_commission(introducer_id, investor_id, deal_id,
                                     "invested_amount", rate_bps, sub_fee_amt):
                result["commissions_created"].append(f"invested_amount: ${sub_fee_amt}")

        # 2. Performance fee 1
        perf_fee_1 = record.get("perf_fee_1_pct")
        thresh_1 = record.get("thresh_1")
        if perf_fee_1 and perf_fee_1 > 0 and deal_id:
            rate_bps = percent_to_bps(perf_fee_1)
            threshold = parse_threshold(thresh_1)
            if self.create_commission(introducer_id, investor_id, deal_id,
                                     "performance_fee", rate_bps, None, threshold,
                                     f"Performance fee 1, threshold: {threshold}"):
                result["commissions_created"].append(f"performance_fee: {perf_fee_1*100}%, threshold={threshold}")

        # 3. Performance fee 2
        perf_fee_2 = record.get("perf_fee_2_pct")
        thresh_2 = record.get("thresh_2")
        if perf_fee_2 and perf_fee_2 > 0 and deal_id:
            rate_bps = percent_to_bps(perf_fee_2)
            threshold = parse_threshold(thresh_2)
            if self.create_commission(introducer_id, investor_id, deal_id,
                                     "performance_fee", rate_bps, None, threshold,
                                     f"Performance fee 2, threshold: {threshold}"):
                result["commissions_created"].append(f"performance_fee: {perf_fee_2*100}%, threshold={threshold}")

        # 4. Spread fees
        spread_pps_fees = record.get("spread_pps_fees")
        spread_pps = record.get("spread_pps")
        if spread_pps_fees and spread_pps_fees > 0 and deal_id:
            # spread_pps is the rate (e.g., 0.9 for 0.9%), convert to bps
            rate_bps = int(spread_pps * 100) if spread_pps else None
            if self.create_commission(introducer_id, investor_id, deal_id,
                                     "spread", rate_bps, spread_pps_fees,
                                     notes=f"Spread PPS: {spread_pps}"):
                result["commissions_created"].append(f"spread: ${spread_pps_fees}")

        result["status"] = "success" if result["commissions_created"] else "no_fees"
        return result

    def run(self, data: Dict) -> bool:
        """Run the migration."""
        print("\n" + "=" * 60)
        print("VERSO Introducer Commissions Migration")
        print("=" * 60)
        print(f"Mode: {'DRY-RUN (no changes)' if self.dry_run else 'LIVE (making changes)'}")
        print("=" * 60)

        if not self.connect():
            return False

        # Process each vehicle
        for vehicle_code, vehicle_data in data.get("data", {}).items():
            records = vehicle_data.get("records", [])
            if not records:
                continue

            print(f"\n=== Processing {vehicle_code} ({len(records)} records) ===")

            for record in records:
                result = self.process_record(record, vehicle_code)
                self.results.append(result)

                # Print summary for each record
                status_icon = "✓" if result["status"] == "success" else "✗" if result["status"] == "error" else "?"
                investor = result.get("investor_last_name") or result.get("investor_entity") or "Unknown"
                print(f"  {status_icon} {investor}: {result['introducer_name']} -> {result['status']}")

                if result.get("commissions_created"):
                    for comm in result["commissions_created"]:
                        print(f"      + {comm}")

        # Print summary
        print("\n" + "=" * 60)
        print("MIGRATION SUMMARY")
        print("=" * 60)
        print(f"Records processed: {self.stats['records_processed']}")
        print(f"Subscriptions matched: {self.stats['subscriptions_matched']}")
        print(f"Subscriptions not found: {self.stats['subscriptions_not_found']}")
        print(f"Commissions created: {self.stats['commissions_created']}")
        print(f"Subscriptions updated: {self.stats['subscriptions_updated']}")
        print(f"Errors: {len(self.stats['errors'])}")

        if self.stats["errors"]:
            print("\nErrors:")
            for err in self.stats["errors"][:10]:
                print(f"  - {err}")
            if len(self.stats["errors"]) > 10:
                print(f"  ... and {len(self.stats['errors']) - 10} more")

        # Save results
        output = {
            "migration_date": datetime.now().isoformat(),
            "dry_run": self.dry_run,
            "stats": self.stats,
            "results": self.results,
        }

        with open(OUTPUT_FILE, 'w') as f:
            json.dump(output, f, indent=2, default=str)

        print(f"\nResults saved to: {OUTPUT_FILE}")

        return True


def main():
    # Check for --dry-run flag
    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv

    if not dry_run:
        print("WARNING: This will make changes to the database!")
        print("Use --dry-run to test without making changes.")
        response = input("Continue? (yes/no): ")
        if response.lower() != "yes":
            print("Aborted.")
            return

    # Load extracted data
    print(f"Loading data from: {DATA_FILE}")
    with open(DATA_FILE, 'r') as f:
        data = json.load(f)

    print(f"Loaded {data['summary']['total_records']} records")

    # Run migration
    runner = MigrationRunner(dry_run=dry_run)
    runner.run(data)


if __name__ == "__main__":
    main()

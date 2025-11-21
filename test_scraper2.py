#!/usr/bin/env python3
"""Test scraper on non-Stockholm municipalities"""

import csv
from scrape_emails import get_session, scrape_agency_emails
import time

def main():
    input_file = '/home/user/stylespace2/agencies.csv'

    session = get_session()

    # Read the CSV
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Test on municipalities (skip Stockholm districts)
    test_agencies = [
        row for row in rows[15:40]  # Start from row 16 (actual municipalities)
    ][:5]

    print(f"Testing scraper on {len(test_agencies)} municipalities...")
    print("=" * 60)

    for i, row in enumerate(test_agencies, 1):
        homepage = row.get('Home page', '')
        name = row.get('Name', '')

        if not homepage:
            continue

        print(f"\n[{i}/{len(test_agencies)}]", end=" ")

        try:
            registrator, regular, all_found = scrape_agency_emails(session, homepage, name)

            if all_found:
                print(f"   ✅ Success! Found {len(all_found)} email(s)")
                print(f"      All emails: {', '.join(sorted(all_found))}")
            else:
                print(f"   ⚠️  No emails found")

        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(2)

    print("\n" + "=" * 60)
    print("Test complete!")

if __name__ == '__main__':
    main()

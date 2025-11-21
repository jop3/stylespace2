#!/usr/bin/env python3
"""Test scraper on first 5 agencies"""

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

    # Test on first 5 agencies
    print("Testing scraper on first 5 agencies...")
    print("=" * 60)

    for i, row in enumerate(rows[:5], 1):
        homepage = row.get('Home page', '')
        name = row.get('Name', '')

        if not homepage:
            continue

        print(f"\n[{i}/5]", end=" ")

        try:
            registrator, regular, all_found = scrape_agency_emails(session, homepage, name)

            if all_found:
                print(f"   ✅ Success! Found {len(all_found)} email(s)")
                print(f"      All emails: {', '.join(sorted(all_found))}")
            else:
                print(f"   ❌ No emails found")

        except Exception as e:
            print(f"   ❌ Error: {e}")

        time.sleep(1)

    print("\n" + "=" * 60)
    print("Test complete!")

if __name__ == '__main__':
    main()

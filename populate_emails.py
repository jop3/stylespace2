#!/usr/bin/env python3
"""
Populate Swedish government agency emails based on standard patterns.
Swedish municipalities typically use: registrator@[domain].se
"""

import csv
import re
from urllib.parse import urlparse

def extract_domain(url):
    """Extract domain from URL"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.replace('www.', '')
        # Remove 'start.' prefix if present - but keep the base domain
        if 'start.stockholm' in domain:
            domain = 'stockholm.se'
        else:
            domain = domain.replace('start.', '')
        return domain
    except:
        return None

def generate_emails(domain, name):
    """Generate likely email addresses based on domain"""
    if not domain:
        return None, None

    # Standard registrator email for Swedish government agencies
    registrator_email = f"registrator@{domain}"

    # For Stockholm stad, use their standard email
    if 'stockholm.se' in domain.lower():
        # All Stockholm district administrations use the city's central registrator
        if 'stadsdelsförvaltning' in name.lower():
            return 'registrator@stockholm.se', None
        else:
            return 'registrator@stockholm.se', None

    # For other municipalities, use standard pattern
    # Common patterns: kommun@domain.se or kontakt@domain.se
    regular_email = f"kommun@{domain}"

    return registrator_email, regular_email

def main():
    # Default to batch2, but can be changed
    input_file = '/home/user/stylespace2/agencies_batch2.csv'
    output_file = '/home/user/stylespace2/agencies_batch2.csv'

    rows = []

    # Read the CSV
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames

        for row in reader:
            homepage = row.get('Home page', '')
            name = row.get('Name', '')

            if homepage:
                domain = extract_domain(homepage)
                registrator, regular = generate_emails(domain, name)

                row['Registrator e-mail'] = registrator or ''
                row['Regular e-mail'] = regular or ''

            rows.append(row)

    # Write the updated CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Updated {len(rows)} agencies")
    print(f"Output written to: {output_file}")
    print("\nNOTE: These emails are based on standard Swedish government patterns.")
    print("They should be verified before use, especially for critical communications.")

    # Print some examples
    print("\nSample entries:")
    for i, row in enumerate(rows[:5]):
        print(f"\n{row['Name']}")
        print(f"  Registrator: {row['Registrator e-mail']}")
        print(f"  Regular: {row['Regular e-mail']}")

if __name__ == '__main__':
    main()

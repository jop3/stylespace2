#!/usr/bin/env python3
"""
Scrape actual email addresses from Swedish government agency websites.
Looks for contact pages, footers, and email patterns.
"""

import csv
import re
import time
import requests
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

# Common Swedish contact page patterns
CONTACT_PATHS = [
    '/kontakt',
    '/kontakta-oss',
    '/om-oss/kontakt',
    '/om-kommunen/kontakt',
    '/contact',
    '/en/contact',
]

def get_session():
    """Create a session with realistic headers to avoid bot detection"""
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    })
    return session

def extract_emails_from_text(text):
    """Extract email addresses from text using regex"""
    # Pattern for email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return list(set(emails))  # Remove duplicates

def find_emails_on_page(session, url, timeout=10):
    """Find emails on a specific page"""
    try:
        response = session.get(url, timeout=timeout, allow_redirects=True, verify=True)
        response.raise_for_status()

        # Parse with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Look for emails in different places
        emails = set()

        # 1. Search in mailto: links
        for link in soup.find_all('a', href=re.compile(r'^mailto:')):
            email = link['href'].replace('mailto:', '').split('?')[0]
            emails.add(email.lower())

        # 2. Search in footer
        footer = soup.find('footer')
        if footer:
            emails.update(extract_emails_from_text(footer.get_text()))

        # 3. Search in elements with common contact classes/ids
        for selector in ['.contact', '.kontakt', '#contact', '#kontakt', '.footer']:
            elements = soup.select(selector)
            for elem in elements:
                emails.update(extract_emails_from_text(elem.get_text()))

        # 4. Search entire page text (as fallback)
        if not emails:
            page_text = soup.get_text()
            emails.update(extract_emails_from_text(page_text))

        # Filter out common false positives
        emails = {e.lower() for e in emails if e and '@' in e}
        emails = {e for e in emails if not any(x in e for x in ['example.com', 'domain.com', 'test.'])}

        return emails

    except requests.exceptions.SSLError:
        print(f"  ⚠ SSL error for {url}")
        return set()
    except requests.exceptions.Timeout:
        print(f"  ⚠ Timeout for {url}")
        return set()
    except requests.exceptions.RequestException as e:
        print(f"  ⚠ Error for {url}: {e}")
        return set()
    except Exception as e:
        print(f"  ⚠ Unexpected error for {url}: {e}")
        return set()

def scrape_agency_emails(session, base_url, agency_name):
    """Scrape emails from an agency website"""
    print(f"\n🔍 Scraping: {agency_name}")
    print(f"   URL: {base_url}")

    all_emails = set()
    registrator_email = None
    regular_email = None

    # Try the main page first
    print("   Checking main page...")
    emails = find_emails_on_page(session, base_url)
    all_emails.update(emails)

    # Try common contact pages
    for path in CONTACT_PATHS:
        contact_url = urljoin(base_url, path)
        print(f"   Trying: {path}")
        emails = find_emails_on_page(session, contact_url)
        if emails:
            print(f"   ✓ Found emails on {path}")
            all_emails.update(emails)
            # If we found emails on a contact page, we can stop
            if len(all_emails) >= 2:
                break
        time.sleep(0.5)  # Be polite

    # Categorize emails
    for email in all_emails:
        if 'registrator' in email:
            registrator_email = email
        elif not regular_email and 'kommun' in email:
            regular_email = email
        elif not regular_email and 'kontakt' in email:
            regular_email = email

    # If no categorization worked, just assign them
    if all_emails and not registrator_email:
        emails_list = sorted(list(all_emails))
        # Prefer registrator@ if we find it
        registrator_candidates = [e for e in emails_list if 'registrator' in e]
        if registrator_candidates:
            registrator_email = registrator_candidates[0]
        else:
            # Use any email we found
            registrator_email = emails_list[0]

        if len(emails_list) > 1 and not regular_email:
            regular_email = emails_list[1]

    print(f"   📧 Registrator: {registrator_email or 'Not found'}")
    print(f"   📧 Regular: {regular_email or 'Not found'}")

    return registrator_email, regular_email, all_emails

def main():
    input_file = '/home/user/stylespace2/agencies.csv'
    output_file = '/home/user/stylespace2/agencies_scraped.csv'

    session = get_session()

    # Read the CSV
    rows = []
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    print(f"Found {len(rows)} agencies to scrape")
    print("=" * 60)

    # Process each agency
    for i, row in enumerate(rows, 1):
        homepage = row.get('Home page', '')
        name = row.get('Name', '')

        if not homepage:
            continue

        print(f"\n[{i}/{len(rows)}]", end=" ")

        try:
            registrator, regular, all_found = scrape_agency_emails(session, homepage, name)

            # Update the row
            if registrator:
                row['Registrator e-mail'] = registrator
            if regular:
                row['Regular e-mail'] = regular

        except Exception as e:
            print(f"   ❌ Failed: {e}")

        # Be polite - add delay between requests
        if i % 10 == 0:
            print(f"\n   💤 Brief pause (processed {i} agencies)...")
            time.sleep(2)
        else:
            time.sleep(1)

    # Write the updated CSV
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Scraping complete!")
    print(f"📄 Results saved to: {output_file}")

    # Statistics
    found_registrator = sum(1 for r in rows if r.get('Registrator e-mail'))
    found_regular = sum(1 for r in rows if r.get('Regular e-mail'))
    print(f"\n📊 Statistics:")
    print(f"   Registrator emails found: {found_registrator}/{len(rows)}")
    print(f"   Regular emails found: {found_regular}/{len(rows)}")

if __name__ == '__main__':
    main()

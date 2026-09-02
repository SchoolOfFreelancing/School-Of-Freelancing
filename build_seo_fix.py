#!/usr/bin/env python3
"""
Local Ubuntu Build Script for GSC Indexation Fix
Path: /var/www/html/build_seo_fix.py
"""

import os
import re
import xml.etree.ElementTree as ET
from xml.dom import minidom

WEB_ROOT = "/var/www/html"
SITE_URL = "https://schooloffreelancing.com"  # Replace with your production domain

def scan_html_files(root_dir):
    """Scans all directory-based index.html pages."""
    pages = []
    for dirpath, _, filenames in os.walk(root_dir):
        if 'index.html' in filenames:
            rel_dir = os.path.relpath(dirpath, root_dir)
            rel_url = "/" if rel_dir == "." else f"/{rel_dir}/"
            full_path = os.path.join(dirpath, 'index.html')
            
            pages.append({
                'rel_url': rel_url,
                'full_path': full_path
            })
    return pages

def generate_sitemap(pages, output_path):
    """Generates an optimized sitemap.xml."""
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    
    for page in pages:
        if '404' in page['rel_url']:
            continue
            
        url_elem = ET.SubElement(urlset, "url")
        loc_elem = ET.SubElement(url_elem, "loc")
        loc_elem.text = f"{SITE_URL}{page['rel_url']}"
        
        priority_elem = ET.SubElement(url_elem, "priority")
        if page['rel_url'] == '/':
            priority_elem.text = "1.0"
        elif any(k in page['rel_url'] for k in ['client-support', 'freelancing-training']):
            priority_elem.text = "0.8"
        elif 'locations' in page['rel_url']:
            priority_elem.text = "0.6"
        else:
            priority_elem.text = "0.5"

    xml_str = minidom.parseString(ET.tostring(urlset)).toprettyxml(indent="  ")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(xml_str)

def build_fix():
    print("=== Processing Local Ubuntu Site Files ===")
    pages = scan_html_files(WEB_ROOT)
    print(f"[*] Total index.html files found: {len(pages)}")
    
    # Target deep location, client-support, and training pages
    location_pages = [p for p in pages if '/locations/' in p['rel_url'] and p['rel_url'] != '/locations/']
    support_pages = [p for p in pages if '/client-support/' in p['rel_url'] and p['rel_url'] != '/client-support/']
    training_pages = [p for p in pages if '/freelancing-training/' in p['rel_url'] and p['rel_url'] != '/freelancing-training/']

    # Generate HTML link block for directory hubs
    link_patch_html = '\n<!-- GSC Internal Link Equity Patch -->\n<div class="seo-directory-index" style="margin-top:20px; padding:15px; background:#f9f9f9;">\n<h3>Site Directory Index</h3>\n<ul>\n'
    for p in (location_pages + support_pages + training_pages):
        clean_name = p['rel_url'].strip('/').replace('-', ' ').title()
        link_patch_html += f'  <li><a href="{p["rel_url"]}">{clean_name}</a></li>\n'
    link_patch_html += '</ul>\n</div>\n<!-- End Patch -->\n'

    # Inject into main index/hub pages locally
    hubs = ['sitemap/index.html', 'locations/index.html', 'sitemap.html']
    for hub in hubs:
        hub_path = os.path.join(WEB_ROOT, hub)
        if os.path.exists(hub_path):
            with open(hub_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'GSC Internal Link Equity Patch' not in content:
                content = content.replace('</footer>', f'{link_patch_html}\n</footer>')
                with open(hub_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[✓] Added internal links to: {hub}")

    # Rebuild sitemap.xml locally
    sitemap_path = os.path.join(WEB_ROOT, "sitemap.xml")
    generate_sitemap(pages, sitemap_path)
    print(f"[✓] Rebuilt sitemap.xml ({len(pages)} URLs)")

if __name__ == "__main__":
    build_fix()

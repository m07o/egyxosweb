#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wecima Movies Scraper
يحك البيانات من موقع Wecima ويحفظها في JSON
للموقع الرئيسي بـ Next.js
"""

import requests
import json
import time
import sys
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote
from datetime import datetime
from pathlib import Path

BASE_URL = "https://wecima.bar"
OUTPUT_DIR = Path(__file__).parent.parent / "public"
OUTPUT_FILE = OUTPUT_DIR / "movies.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
    "Referer": BASE_URL,
}

class MovieScraper:
    def __init__(self, max_pages=5):
        self.max_pages = max_pages
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.movies = []
        self.errors = []

    def fetch_page(self, url, retry=3):
        """جلب صفحة HTML مع Retry Logic"""
        for attempt in range(1, retry + 1):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                response.encoding = 'utf-8'
                return response.text
            except requests.RequestException as e:
                if attempt < retry:
                    print(f"  ⚠ Retry {attempt}/{retry} for {url}")
                    time.sleep(attempt * 1.5)
                else:
                    error_msg = f"Failed to fetch {url}: {str(e)}"
                    print(f"  ❌ {error_msg}")
                    self.errors.append(error_msg)
                    return None

    def clean_text(self, text):
        """تنظيف النصوص"""
        if not text:
            return ""
        return " ".join(text.split()).strip()

    def is_ad_link(self, url):
        """التحقق من أن الرابط ليس إعلان"""
        if not url:
            return True
        ad_keywords = ['ads', 'ad', 'tracker', 'google-analytics', 'facebook.com', 'go.', 'bitly']
        return any(keyword in url.lower() for keyword in ad_keywords)

    def detect_quality(self, text):
        """استكشاف جودة الفيلم"""
        if not text:
            return "720p"
        text_lower = text.lower()
        if '1080' in text_lower:
            return "1080p"
        elif '720' in text_lower:
            return "720p"
        elif '480' in text_lower:
            return "480p"
        elif 'cam' in text_lower:
            return "CAM"
        elif 'hd' in text_lower:
            return "HD"
        elif 'sd' in text_lower:
            return "SD"
        return "720p"

    def detect_type(self, text):
        """استكشاف نوع المحتوى"""
        text_lower = text.lower()
        if 'مسلسل' in text_lower or 'سلسل' in text_lower or 'حلق' in text_lower or 'episode' in text_lower:
            return "series"
        elif 'أنمي' in text_lower or 'anime' in text_lower:
            return "anime"
        return "movie"

    def parse_movie(self, article_html):
        """استخراج بيانات فيلم من HTML"""
        try:
            soup = BeautifulSoup(article_html, 'html.parser')

            # العنوان
            title_elem = soup.find('h2') or soup.find('h3') or soup.find(class_=['title', 'post-title'])
            title = ""
            if title_elem:
                title = self.clean_text(title_elem.get_text())

            if not title:
                return None

            # الرابط
            link_elem = soup.find('a', href=True)
            if not link_elem or self.is_ad_link(link_elem['href']):
                return None

            url = urljoin(BASE_URL, link_elem['href'])

            # الصورة
            img_elem = soup.find('img', src=True)
            image_url = ""
            if img_elem:
                image_url = urljoin(BASE_URL, img_elem['src'])

            # الجودة والنوع
            text_content = self.clean_text(article_html)
            quality = self.detect_quality(text_content)
            content_type = self.detect_type(text_content + " " + title)

            return {
                "id": url.split('/')[-2] or "unknown",
                "title": title,
                "url": url,
                "imageUrl": image_url,
                "quality": quality,
                "type": content_type,
            }
        except Exception as e:
            self.errors.append(f"Error parsing movie: {str(e)}")
            return None

    def scrape_page(self, page_num):
        """حك صفحة واحدة"""
        try:
            if page_num == 1:
                url = BASE_URL
            else:
                url = f"{BASE_URL}/page/{page_num}/"

            print(f"  📄 Page {page_num}: {url}")
            html = self.fetch_page(url)

            if not html:
                return False

            soup = BeautifulSoup(html, 'html.parser')
            articles = soup.find_all('article')

            if not articles:
                print(f"  ⚠ No articles found, stopping.")
                return False

            count = 0
            for article in articles:
                movie = self.parse_movie(str(article))
                if movie:
                    self.movies.append(movie)
                    count += 1

            print(f"  ✅ Found {count} movies")

            if count < 5:
                print(f"  ⚠ Last page reached.")
                return False

            if page_num < self.max_pages:
                time.sleep(2)  # Delay بين الصفحات

            return True
        except Exception as e:
            error_msg = f"Error scraping page {page_num}: {str(e)}"
            print(f"  ❌ {error_msg}")
            self.errors.append(error_msg)
            return False

    def scrape_all(self):
        """حك كل الصفحات"""
        print("═" * 50)
        print("🎬 Wecima Movies Scraper")
        print(f"📡 Target: {BASE_URL}")
        print(f"📄 Max Pages: {self.max_pages}")
        print(f"⏰ Started: {datetime.now().isoformat()}")
        print("═" * 50)

        start_time = time.time()

        for page in range(1, self.max_pages + 1):
            if not self.scrape_page(page):
                break

        duration = time.time() - start_time

        print("\n" + "═" * 50)
        print("✅ SCRAPE COMPLETED")
        print(f"   🎬 Movies found: {len(self.movies)}")
        print(f"   ❌ Errors: {len(self.errors)}")
        print(f"   ⏱ Duration: {duration:.1f}s")
        print(f"   📅 Finished: {datetime.now().isoformat()}")
        print("═" * 50)

    def save_json(self):
        """حفظ البيانات في JSON"""
        try:
            OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

            data = {
                "timestamp": datetime.now().isoformat(),
                "source": "wecima.bar",
                "totalMovies": len(self.movies),
                "movies": self.movies,
                "errors": self.errors,
            }

            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"\n💾 Saved to: {OUTPUT_FILE}")
            print(f"   📊 File size: {OUTPUT_FILE.stat().st_size / 1024:.1f} KB")
        except Exception as e:
            print(f"❌ Error saving JSON: {str(e)}")
            sys.exit(1)

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Wecima Movies Scraper')
    parser.add_argument('--pages', type=int, default=5, help='Number of pages to scrape')
    args = parser.parse_args()

    scraper = MovieScraper(max_pages=args.pages)
    scraper.scrape_all()
    scraper.save_json()

if __name__ == "__main__":
    main()

"""Quick download test: verify SSE and BSE can actually download PDFs."""
import sys, os, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

CHROMEDRIVER_PATH = r"D:\chromedriver-win64-148\chromedriver.exe"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data_collection", "scrapers", "data", "risk_events")

service = Service(CHROMEDRIVER_PATH)
opts = Options()
opts.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-gpu")
opts.add_argument("--window-size=1920,1080")
opts.add_argument("--disable-blink-features=AutomationControlled")

def test_sse_download():
    save_dir = os.path.join(DATA_DIR, "sse")
    os.makedirs(save_dir, exist_ok=True)
    prefs = {
        "download.default_directory": os.path.abspath(save_dir),
        "download.prompt_for_download": False,
        "plugins.always_open_pdf_externally": True,
        "profile.default_content_setting_values.automatic_downloads": 1,
    }
    opts.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(service=service, options=opts)
    files_before = set(os.listdir(save_dir))

    try:
        url = "https://www.sse.com.cn/disclosure/listedinfo/announcement/"
        print(f"SSE: Opening {url}")
        driver.get(url)
        main_window = driver.current_window_handle
        time.sleep(5)

        # Click first 3 PDF links
        pdf_links = driver.find_elements(By.XPATH, "//a[contains(@href, '.pdf')]")
        print(f"SSE: Found {len(pdf_links)} PDF links, clicking first 3...")
        for i, a in enumerate(pdf_links[:3]):
            try:
                text = (a.text or "").strip()[:40]
                href = a.get_attribute("href")
                print(f"  [{i}] Clicking: {text}")
                driver.execute_script(f"window.open('{href}', '_blank');")
                time.sleep(3)
                if len(driver.window_handles) > 1:
                    for h in driver.window_handles:
                        if h != main_window:
                            driver.switch_to.window(h)
                            driver.close()
                    driver.switch_to.window(main_window)
            except Exception as e:
                print(f"  [{i}] Error: {e}")

        time.sleep(5)
    finally:
        driver.quit()

    files_after = set(os.listdir(save_dir))
    new_files = files_after - files_before
    print(f"SSE: Downloaded {len(new_files)} new files")
    for f in sorted(new_files):
        fpath = os.path.join(save_dir, f)
        size = os.path.getsize(fpath)
        print(f"  {f} ({size:,} bytes)")
    return len(new_files) > 0


def test_bse_download():
    save_dir = os.path.join(DATA_DIR, "bse")
    os.makedirs(save_dir, exist_ok=True)
    prefs = {
        "download.default_directory": os.path.abspath(save_dir),
        "download.prompt_for_download": False,
        "plugins.always_open_pdf_externally": True,
        "profile.default_content_setting_values.automatic_downloads": 1,
    }
    opts.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(service=service, options=opts)
    files_before = set(os.listdir(save_dir))

    try:
        url = "https://www.bse.cn/disclosure/disciplinary_aciton.html"
        print(f"\nBSE: Opening {url}")
        driver.get(url)
        main_window = driver.current_window_handle
        time.sleep(5)

        pdf_links = driver.find_elements(By.XPATH, "//a[contains(@href, '.pdf')]")
        print(f"BSE: Found {len(pdf_links)} PDF links, clicking first 3...")
        for i, a in enumerate(pdf_links[:3]):
            try:
                text = (a.text or a.get_attribute("title") or "").strip()[:40]
                href = a.get_attribute("href")
                print(f"  [{i}] Clicking: {text}")
                driver.execute_script(f"window.open('{href}', '_blank');")
                time.sleep(3)
                if len(driver.window_handles) > 1:
                    for h in driver.window_handles:
                        if h != main_window:
                            driver.switch_to.window(h)
                            driver.close()
                    driver.switch_to.window(main_window)
            except Exception as e:
                print(f"  [{i}] Error: {e}")

        time.sleep(5)
    finally:
        driver.quit()

    files_after = set(os.listdir(save_dir))
    new_files = files_after - files_before
    print(f"BSE: Downloaded {len(new_files)} new files")
    for f in sorted(new_files):
        fpath = os.path.join(save_dir, f)
        size = os.path.getsize(fpath)
        print(f"  {f} ({size:,} bytes)")
    return len(new_files) > 0


if __name__ == "__main__":
    print("=== Testing PDF Downloads ===\n")
    sse_ok = test_sse_download()
    bse_ok = test_bse_download()
    print(f"\n=== Results ===")
    print(f"SSE download: {'OK' if sse_ok else 'FAILED'}")
    print(f"BSE download: {'OK' if bse_ok else 'FAILED'}")

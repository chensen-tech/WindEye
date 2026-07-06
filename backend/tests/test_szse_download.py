"""Quick test: verify SZSE encode-open PDF download works."""
import sys, os, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

CHROMEDRIVER_PATH = r"D:\chromedriver-win64-148\chromedriver.exe"
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data_collection", "scrapers", "data", "risk_events")

save_dir = os.path.join(DATA_DIR, "szse")
os.makedirs(save_dir, exist_ok=True)

service = Service(CHROMEDRIVER_PATH)
opts = Options()
opts.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-gpu")
opts.add_argument("--window-size=1920,1080")
opts.add_argument("--disable-blink-features=AutomationControlled")
opts.add_experimental_option("prefs", {
    "download.default_directory": os.path.abspath(save_dir),
    "download.prompt_for_download": False,
    "plugins.always_open_pdf_externally": True,
    "profile.default_content_setting_values.automatic_downloads": 1,
})

driver = webdriver.Chrome(service=service, options=opts)
files_before = set(os.listdir(save_dir))

try:
    url = "https://www.szse.cn/disclosure/supervision/measure/pushish/index.html"
    print(f"Opening: {url}")
    driver.get(url)
    main_window = driver.current_window_handle
    time.sleep(6)
    print(f"Title: {driver.title}")

    # Find encode-open links
    rows = driver.find_elements(By.XPATH, "//tbody/tr")
    print(f"Table rows: {len(rows)}")

    encode_links = driver.find_elements(By.XPATH, "//a[@encode-open]")
    print(f"encode-open links: {len(encode_links)}")

    for i, a in enumerate(encode_links[:5]):
        try:
            encode_val = a.get_attribute("encode-open") or ""
            text = a.text.strip()[:60]
            print(f"\n[{i}] encode-open: {encode_val[:120]}")
            print(f"    text: {text}")

            # Click to trigger download
            driver.execute_script("arguments[0].click();", a)
            time.sleep(3)

            # Close any new tabs
            if len(driver.window_handles) > 1:
                print(f"    (closing {len(driver.window_handles)-1} new tab(s))")
                for h in driver.window_handles:
                    if h != main_window:
                        driver.switch_to.window(h)
                        driver.close()
                driver.switch_to.window(main_window)
        except Exception as e:
            print(f"    ERROR: {e}")

    # Wait for downloads
    print("\nWaiting for downloads...")
    for _ in range(15):
        time.sleep(1)
        downloading = any(
            f.endswith((".crdownload", ".tmp"))
            for f in os.listdir(save_dir)
        )
        if not downloading:
            break

finally:
    driver.quit()

print(f"\n=== Results ===")
files_after = set(os.listdir(save_dir))
new_files = files_after - files_before
print(f"New files: {len(new_files)}")

for f in sorted(new_files):
    fpath = os.path.join(save_dir, f)
    size = os.path.getsize(fpath)
    with open(fpath, "rb") as fh:
        magic = fh.read(4)
    valid = magic == b"%PDF"
    print(f"  {f} ({size:,} bytes) valid={valid}")

if not new_files:
    # Check ALL files in dir
    all_files = os.listdir(save_dir)
    print(f"All files in dir ({len(all_files)}):")
    for f in sorted(all_files):
        fpath = os.path.join(save_dir, f)
        print(f"  {f} ({os.path.getsize(fpath):,} bytes)")

"""Quick live test: check SSE / SZSE / BSE page structure with headless Chrome."""
import sys, os, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

# Use existing chromedriver (Selenium Manager can't download from Google in China)
CHROMEDRIVER_PATH = os.environ.get("CHROMEDRIVER_PATH") or r"D:\chromedriver-win64-148\chromedriver.exe"
if not os.path.isfile(CHROMEDRIVER_PATH):
    CHROMEDRIVER_PATH = r"D:\chromedriver-win64\chromedriver.exe"
if not os.path.isfile(CHROMEDRIVER_PATH):
    CHROMEDRIVER_PATH = r"C:\Program Files\Google\Chrome\Application\chromedriver.exe"

print(f"Using chromedriver: {CHROMEDRIVER_PATH}")
service = Service(CHROMEDRIVER_PATH)

opts = Options()
opts.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-gpu")
opts.add_argument("--window-size=1920,1080")
opts.add_argument("--disable-blink-features=AutomationControlled")

EXCHANGES = [
    ("SSE", "https://www.sse.com.cn/disclosure/listedinfo/announcement/"),
    ("SZSE", "https://www.szse.cn/disclosure/supervision/measure/pushish/index.html"),
    ("BSE-typo", "https://www.bse.cn/disclosure/disciplinary_aciton.html"),
    ("BSE-corrected", "https://www.bse.cn/disclosure/disciplinary_action.html"),
]

for name, url in EXCHANGES:
    print(f"\n=== {name}: {url} ===")
    driver = webdriver.Chrome(service=service, options=opts)
    try:
        driver.get(url)
        time.sleep(6)
        print(f"  Title: {driver.title[:100] if driver.title else '(empty)'}")

        # PDF links
        pdf_links = driver.find_elements(By.XPATH, "//a[contains(@href, '.pdf')]")
        print(f"  PDF links: {len(pdf_links)}")
        if pdf_links:
            for i, a in enumerate(pdf_links[:3]):
                print(f"    [{i}] text={a.text[:60]} href={a.get_attribute('href')[:120]}")

        # Table rows (for SZSE)
        rows = driver.find_elements(By.XPATH, "//tbody/tr")
        if rows:
            print(f"  Table rows: {len(rows)}")
            # Check for encode-open attribute (custom PDF link attribute)
            encode_elems = driver.find_elements(By.XPATH, "//a[@encode-open]")
            if encode_elems:
                print(f"  encode-open links: {len(encode_elems)}")
                e0 = encode_elems[0].get_attribute("encode-open") or ""
                print(f"    First: {e0[:100]}")

        # Category spans (SSE)
        for type_id in ["13", "26", "31"]:
            try:
                elem = driver.find_element(By.XPATH, f"//span[@name='{type_id}']")
                print(f"  Category {type_id}: FOUND (span[@name])")
            except:
                pass

        # Next page
        for btn_xpath in [
            "//a[contains(text(), '下一页')]",
            "//a[contains(text(), '下页')]",
            "//li[contains(@class, 'next')]//a",
        ]:
            try:
                driver.find_element(By.XPATH, btn_xpath)
                print(f"  Next page: FOUND ({btn_xpath[:50]})")
                break
            except:
                pass

        print(f"  Result: PAGE LOADED OK")
    except Exception as e:
        print(f"  ERROR: {e}")
    finally:
        driver.quit()

print("\n=== Done ===")

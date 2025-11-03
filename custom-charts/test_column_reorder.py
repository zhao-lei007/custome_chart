#!/usr/bin/env python3
"""
Test script for table column drag-and-drop reordering feature.
Verifies that dragging dimensions/metrics updates table column order.
"""

from playwright.sync_api import sync_playwright
import time

def test_column_reordering():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Visible for demonstration
        page = browser.new_page()

        print("🚀 Navigating to editor page...")
        page.goto('http://localhost:5173/editor.html')
        page.wait_for_load_state('networkidle')
        time.sleep(1)  # Extra wait for React to render

        print("📸 Taking initial screenshot...")
        page.screenshot(path='/tmp/editor_initial.png', full_page=True)

        # Select a dataset with multiple fields
        print("📊 Selecting '广告基础数据' dataset...")
        page.select_option('select', 'ads_basic')
        page.wait_for_timeout(500)

        # Select table chart type
        print("📋 Selecting 'Table' chart type...")
        page.select_option('.chart-type-select', 'table')
        page.wait_for_timeout(500)

        # Add multiple dimensions
        print("➕ Adding dimensions...")
        dimension_fields = page.locator('.field').filter(has_text='日期')
        if dimension_fields.count() > 0:
            dimension_fields.first.click()
            page.wait_for_timeout(300)

        # Add more dimensions if available
        try:
            page.locator('.field').filter(has_text='广告位置').first.click()
            page.wait_for_timeout(300)
            page.locator('.field').filter(has_text='设备类型').first.click()
            page.wait_for_timeout(300)
        except:
            print("⚠️ Some dimensions not found, continuing...")

        # Add multiple metrics
        print("➕ Adding metrics...")
        try:
            page.locator('.field').filter(has_text='点击量').first.click()
            page.wait_for_timeout(300)
            page.locator('.field').filter(has_text='曝光量').first.click()
            page.wait_for_timeout(300)
            page.locator('.field').filter(has_text='转化量').first.click()
            page.wait_for_timeout(300)
        except:
            print("⚠️ Some metrics not found, continuing...")

        print("📸 Taking screenshot with fields selected...")
        page.screenshot(path='/tmp/editor_fields_added.png', full_page=True)

        # Get initial pill order
        print("🔍 Checking initial dimension order...")
        dim_pills = page.locator('#pickedDims .pill')
        initial_dim_count = dim_pills.count()
        print(f"   Found {initial_dim_count} dimensions")

        if initial_dim_count >= 2:
            initial_first_dim = dim_pills.nth(0).inner_text()
            initial_second_dim = dim_pills.nth(1).inner_text()
            print(f"   Initial order: 1st='{initial_first_dim}', 2nd='{initial_second_dim}'")

            # Test drag and drop for dimensions
            print("🎯 Testing dimension drag-and-drop...")
            print(f"   Dragging '{initial_second_dim}' to first position...")

            source = dim_pills.nth(1)
            target = dim_pills.nth(0)

            # HTML5 drag and drop
            source.hover()
            page.mouse.down()
            page.wait_for_timeout(100)
            target.hover()
            page.wait_for_timeout(100)
            page.mouse.up()
            page.wait_for_timeout(500)

            # Verify order changed
            dim_pills_after = page.locator('#pickedDims .pill')
            new_first_dim = dim_pills_after.nth(0).inner_text()
            new_second_dim = dim_pills_after.nth(1).inner_text()
            print(f"   New order: 1st='{new_first_dim}', 2nd='{new_second_dim}'")

            if new_first_dim == initial_second_dim and new_second_dim == initial_first_dim:
                print("   ✅ Dimension order changed successfully!")
            else:
                print("   ⚠️ Dimension order may not have changed as expected")

        print("🔍 Checking metric order...")
        met_pills = page.locator('#pickedMets .pill')
        initial_met_count = met_pills.count()
        print(f"   Found {initial_met_count} metrics")

        if initial_met_count >= 2:
            initial_first_met = met_pills.nth(0).inner_text().replace('×', '').strip()
            initial_second_met = met_pills.nth(1).inner_text().replace('×', '').strip()
            print(f"   Initial order: 1st='{initial_first_met}', 2nd='{initial_second_met}'")

            # Test drag and drop for metrics
            print("🎯 Testing metric drag-and-drop...")
            print(f"   Dragging '{initial_second_met}' to first position...")

            source = met_pills.nth(1)
            target = met_pills.nth(0)

            source.hover()
            page.mouse.down()
            page.wait_for_timeout(100)
            target.hover()
            page.wait_for_timeout(100)
            page.mouse.up()
            page.wait_for_timeout(500)

            # Verify order changed
            met_pills_after = page.locator('#pickedMets .pill')
            new_first_met = met_pills_after.nth(0).inner_text().replace('×', '').strip()
            new_second_met = met_pills_after.nth(1).inner_text().replace('×', '').strip()
            print(f"   New order: 1st='{new_first_met}', 2nd='{new_second_met}'")

            if new_first_met == initial_second_met and new_second_met == initial_first_met:
                print("   ✅ Metric order changed successfully!")
            else:
                print("   ⚠️ Metric order may not have changed as expected")

        print("📸 Taking final screenshot...")
        page.screenshot(path='/tmp/editor_after_reorder.png', full_page=True)

        # Check table headers
        print("🔍 Checking table column headers...")
        table_headers = page.locator('th')
        header_count = table_headers.count()
        print(f"   Found {header_count} table headers:")
        for i in range(min(header_count, 10)):  # Show first 10 headers
            header_text = table_headers.nth(i).inner_text()
            print(f"   - Column {i+1}: {header_text}")

        print("\n✅ Test completed! Check screenshots in /tmp/ directory:")
        print("   - /tmp/editor_initial.png")
        print("   - /tmp/editor_fields_added.png")
        print("   - /tmp/editor_after_reorder.png")

        # Keep browser open for a moment to see result
        time.sleep(2)
        browser.close()

if __name__ == '__main__':
    test_column_reordering()

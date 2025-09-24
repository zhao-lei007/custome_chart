// Verification script for Custom Charts integration
// Run this in browser console to verify functionality

console.log('🔍 Custom Charts Integration Verification');
console.log('==========================================');

// Test 1: Check if main files exist
async function checkFiles() {
    console.log('\n📁 Checking file availability...');
    
    const files = [
        '/index.html',
        '/custom-charts/dist/manage.html',
        '/custom-charts/dist/editor.html',
        '/test-integration.html'
    ];
    
    for (const file of files) {
        try {
            const response = await fetch(file, { method: 'HEAD' });
            console.log(`✅ ${file}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${file}: Error - ${error.message}`);
        }
    }
}

// Test 2: Check localStorage functionality
function checkLocalStorage() {
    console.log('\n💾 Checking localStorage functionality...');
    
    try {
        // Test basic localStorage
        localStorage.setItem('test_key', 'test_value');
        const value = localStorage.getItem('test_key');
        localStorage.removeItem('test_key');
        
        if (value === 'test_value') {
            console.log('✅ localStorage: Working');
        } else {
            console.log('❌ localStorage: Not working properly');
        }
        
        // Check for existing custom charts data
        const datasets = localStorage.getItem('bi_datasets');
        const charts = localStorage.getItem('bi_user_queries');
        
        console.log(`📊 Datasets in storage: ${datasets ? 'Found' : 'Not found'}`);
        console.log(`📈 Charts in storage: ${charts ? JSON.parse(charts).length + ' charts' : 'None'}`);
        
    } catch (error) {
        console.log(`❌ localStorage: Error - ${error.message}`);
    }
}

// Test 3: Check iframe embedding capability
function checkIframeEmbedding() {
    console.log('\n🖼️ Checking iframe embedding...');
    
    try {
        // Check if we can create iframe
        const testIframe = document.createElement('iframe');
        testIframe.style.display = 'none';
        document.body.appendChild(testIframe);
        
        console.log('✅ Iframe creation: Working');
        
        // Check postMessage capability
        if (typeof window.postMessage === 'function') {
            console.log('✅ PostMessage API: Available');
        } else {
            console.log('❌ PostMessage API: Not available');
        }
        
        // Clean up
        document.body.removeChild(testIframe);
        
    } catch (error) {
        console.log(`❌ Iframe embedding: Error - ${error.message}`);
    }
}

// Test 4: Check if custom charts functions are available
function checkCustomChartsFunctions() {
    console.log('\n⚙️ Checking custom charts functions...');
    
    if (typeof window.openCustomCharts === 'function') {
        console.log('✅ openCustomCharts function: Available');
    } else {
        console.log('❌ openCustomCharts function: Not available');
    }
    
    if (typeof window.debugCustomCharts === 'function') {
        console.log('✅ debugCustomCharts function: Available');
    } else {
        console.log('❌ debugCustomCharts function: Not available');
    }
}

// Test 5: Check DOM structure
function checkDOMStructure() {
    console.log('\n🏗️ Checking DOM structure...');
    
    // Check for menu elements
    const menuSelectors = [
        '.components-LeftMenu-index-module__leftMenu',
        '[class*="leftMenu"]',
        '.ant-menu'
    ];
    
    let menuFound = false;
    for (const selector of menuSelectors) {
        if (document.querySelector(selector)) {
            console.log(`✅ Menu found: ${selector}`);
            menuFound = true;
            break;
        }
    }
    
    if (!menuFound) {
        console.log('⚠️ Menu: Not found with standard selectors');
    }
    
    // Check for header elements
    const headerSelectors = [
        '.de-ant-layout-header',
        'header',
        '[class*="Header"]',
        '.ant-layout-header'
    ];
    
    let headerFound = false;
    for (const selector of headerSelectors) {
        if (document.querySelector(selector)) {
            console.log(`✅ Header found: ${selector}`);
            headerFound = true;
            break;
        }
    }
    
    if (!headerFound) {
        console.log('⚠️ Header: Not found with standard selectors');
    }
}

// Test 6: Simulate custom charts loading
function testCustomChartsLoading() {
    console.log('\n🚀 Testing custom charts loading...');
    
    if (typeof window.openCustomCharts === 'function') {
        try {
            console.log('📱 Attempting to load management page...');
            window.openCustomCharts('manage');
            
            setTimeout(() => {
                const iframe = document.getElementById('customChartsFrame');
                if (iframe) {
                    console.log('✅ Custom charts iframe created successfully');
                    console.log(`📏 Iframe dimensions: ${iframe.offsetWidth}x${iframe.offsetHeight}`);
                } else {
                    console.log('❌ Custom charts iframe not found');
                }
            }, 1000);
            
        } catch (error) {
            console.log(`❌ Custom charts loading: Error - ${error.message}`);
        }
    } else {
        console.log('❌ Cannot test loading: openCustomCharts function not available');
    }
}

// Run all tests
async function runAllTests() {
    await checkFiles();
    checkLocalStorage();
    checkIframeEmbedding();
    checkCustomChartsFunctions();
    checkDOMStructure();
    testCustomChartsLoading();
    
    console.log('\n🎉 Verification complete!');
    console.log('📋 Summary:');
    console.log('- If all tests show ✅, the integration is working correctly');
    console.log('- If you see ❌ or ⚠️, there may be issues to address');
    console.log('- You can run individual test functions if needed');
}

// Export functions for manual testing
window.verifyCustomCharts = {
    runAll: runAllTests,
    checkFiles,
    checkLocalStorage,
    checkIframeEmbedding,
    checkCustomChartsFunctions,
    checkDOMStructure,
    testCustomChartsLoading
};

console.log('\n🔧 Available commands:');
console.log('- verifyCustomCharts.runAll() - Run all tests');
console.log('- verifyCustomCharts.checkFiles() - Check file availability');
console.log('- verifyCustomCharts.testCustomChartsLoading() - Test loading');

// Auto-run if not in iframe
if (window === window.top) {
    runAllTests();
}

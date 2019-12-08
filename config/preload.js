// 绕过window.chrome检测
window.navigator.chrome = window.chrome = {
    ...window.chrome,
    runtime: {},
};

// 绕过The Languages检测
Object.defineProperty(navigator, "languages", {
    get: function () {
        return ["en-US", "en", "bn"];
    }
});

// 绕过webdriver等检测
Object.defineProperty(navigator, 'webdriver', { get: () => false });
Object.defineProperty(navigator, '__driver_evaluate', { get: () => false });
Object.defineProperty(navigator, '__webdriver_evaluate', { get: () => false });
Object.defineProperty(navigator, '__selenium_evaluate', { get: () => false });
Object.defineProperty(navigator, '__fxdriver_evaluate', { get: () => false });
Object.defineProperty(navigator, '__driver_unwrapped', { get: () => false });

// 绕过plugins长度检测
Object.defineProperty(navigator, 'plugins', {
    get: () => [1, 2, 3, 4, 5],
});

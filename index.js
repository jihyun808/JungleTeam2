document.addEventListener('DOMContentLoaded', function() {
        // --- Banner Animation Logic ---
        let currentBanner = 0;
        let bannerInterval;
        const banners = document.querySelectorAll('.banner-slide');

        function showBanner(index) {
            banners.forEach((banner, i) => {
                banner.classList.add('hidden');
                banner.classList.remove('fade-in');
            });
            
            const activeBanner = banners[index];
            if (activeBanner) {
                activeBanner.classList.remove('hidden');
                activeBanner.classList.add('fade-in');
            }
        }

        function nextBanner() {
            currentBanner = (currentBanner + 1) % banners.length;
            showBanner(currentBanner);
        }

        function prevBanner() {
            currentBanner = (currentBanner - 1 + banners.length) % banners.length;
            showBanner(currentBanner);
        }

        function startBannerAnimation() {
            bannerInterval = setInterval(nextBanner, 5000);
        }

        function stopBannerAnimation() {
            clearInterval(bannerInterval);
        }

        // Initial setup
        showBanner(currentBanner);
        startBannerAnimation();

        // Event Listeners
        document.getElementById('nextBannerBtn').addEventListener('click', () => {
            stopBannerAnimation();
            nextBanner();
            startBannerAnimation();
        });
        
        document.getElementById('prevBannerBtn').addEventListener('click', () => {
            stopBannerAnimation();
            prevBanner();
            startBannerAnimation();
        });
    });
function generateCaptcha() {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            document.getElementById('captcha').textContent = result;
        }

        // Generate captcha on load
        window.onload = generateCaptcha;

        // Optionally, validate captcha on form submission
        document.getElementById('registrationForm').addEventListener('submit', function (e) {
            const generated = document.getElementById('captcha').textContent;
            const entered = document.getElementById('captchaInput').value;
            if (generated !== entered) {
                alert('Incorrect captcha. Please try again.');
                generateCaptcha();
                e.preventDefault();
            }
        });
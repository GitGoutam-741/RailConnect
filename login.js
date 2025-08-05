 // Function to generate random captcha
    function generateCaptcha() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O/0, I/1
      let captcha = '';
      for (let i = 0; i < 5; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      document.getElementById('captcha').textContent = captcha;
    }

    // Generate captcha on page load
    window.onload = generateCaptcha;
let currentTheme = localStorage.getItem('theme') || 'light';

function initializeTheme() {
    document.documentElement.setAttribute('data-theme',currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme',currentTheme);
    localStorage.setItem('theme',currentTheme);
    updateThemeIcon();
}

function updateThemeIcon(){
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

initializeTheme();
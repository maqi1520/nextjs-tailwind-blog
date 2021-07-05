var skin = localStorage.getItem('skin');
if (skin) {
  document.documentElement.classList.add(skin);
}

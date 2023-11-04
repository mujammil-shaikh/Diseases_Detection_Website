function toggleLinks() {
  var links = document.querySelectorAll("#nav .action-buttons a");
  for (var i = 0; i < links.length; i++) {
    if (links[i].style.display === "none" || links[i].style.display === "") {
      links[i].style.display = "block";
    } else {
      links[i].style.display = "none";
    }
  }
}

function hideLinks() {
  var links = document.querySelectorAll("#nav .action-buttons a");
  for (var i = 0; i < links.length; i++) {
    links[i].style.display = "none";
  }
}

document.getElementById("logo").addEventListener("click", function() {
  if (window.innerWidth <= 768) {
    toggleLinks();
  }
});

// Initialize the links to be hidden when the page loads
window.addEventListener("load", function() {
  if (window.innerWidth <= 768) {
    hideLinks();
  }
});

// Add a window resize event listener to toggle the links when the screen width changes
window.addEventListener("resize", function() {
  if (window.innerWidth <= 768) {
    hideLinks();
  } else {
    toggleLinks();
  }
});
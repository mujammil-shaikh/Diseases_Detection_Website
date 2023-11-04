// Modify the paths to the HTML elements based on your directory structure
const imagePreview = document.getElementById('imagePreview');
const imageInput = document.getElementById('imageInput');
const fileButton = document.getElementById('fileButton');
const predictButton = document.getElementById('predictButton');
const resultBar = document.getElementById('resultBar');
let capturedImage = null;

// Disease div elements
const diseaseDivs = {
  Actinic_keratoses: document.getElementById('Actinic_keratoses'),
  Basal_cell_carcinoma: document.getElementById('Basal_cell_carcinoma'),
  Benign_keratosis: document.getElementById('Benign_keratosis'),
  Dermatofibroma: document.getElementById('Dermatofibroma'),
  Melanoma: document.getElementById('Melanoma'),
  Melanocytic_nevi: document.getElementById('Melanocytic_nevi'),
  Vascular_lesions: document.getElementById('Vascular_lesions'),
};

// Event listeners
fileButton.addEventListener('click', () => {
  imageInput.click();
  console.log('File Input:', imageInput);
});
imageInput.addEventListener('change', () => {
  displaySelectedImage(imageInput);
});
predictButton.addEventListener('click', () => {
  sendImageForPrediction();
});

// Function to convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Function to display a selected image
function displaySelectedImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Selected Image">`;
      capturedImage = e.target.result;
      console.log('Selected Image:', capturedImage);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Function to send the selected/uploaded image for prediction
async function sendImageForPrediction() {
  if (!capturedImage) {
    resultBar.textContent = 'Please select or upload an image first.';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('image', dataURLtoBlob(capturedImage));
    console.log('FormData:', formData);

    resultBar.textContent = 'Predicting...';
    console.log('Fetch URL:', '/skin/upload');

    const response = await fetch('/skin/upload', {
      method: 'POST',
      body: formData, // Remove the 'Content-Type' header, the browser handles it
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Prediction Result:', result);

      if (Array.isArray(result) && result.length > 0) {
        // Find the prediction with the highest score
        const topPrediction = result[0];
        const diseaseName = topPrediction.label;

        // Show the corresponding disease div with the highest prediction
        for (const key in diseaseDivs) {
          if (key === diseaseName) {
            diseaseDivs[key].style.display = 'block';
          } else {
            diseaseDivs[key].style.display = 'none';
          }
        }

        // Display the top five predictions with score bars
        if (result.length >= 5) {
          let resultHTML = '<div class="prediction-results">';
          for (let i = 0; i < 5; i++) {
            resultHTML += `
              <div class="prediction">
                <span class="label">${result[i].label}</span>
                <span class="score">${(result[i].score * 100).toFixed(2)}%</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${(result[i].score * 100)}%;"></div>
                </div>
              </div>
            `;
          }
          resultHTML += '</div>';
          resultBar.innerHTML = resultHTML;
        }
      } else {
        resultBar.textContent = 'No predictions available.';
      }
    } else {
      resultBar.textContent = 'Error predicting the image.';
      console.log('Fetch Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error(error);
    resultBar.textContent = 'An error occurred while predicting the image.';
  }
}

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
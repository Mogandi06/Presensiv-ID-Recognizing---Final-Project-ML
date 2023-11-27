const URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions;
let isScanning = false;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(546, 546);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  if (isScanning) {
    await predict();
  }
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;

    // Check if the probability is above 98% for a specific class (adjust class index and threshold as needed)
    if (prediction[i].probability > 0.99) {
      // Check if the detected class is not 'No ID Detect'
      if (prediction[i].className !== "No ID Detected") {
        // Show modal with the class name and stop scanning
        showModal(prediction[i].className);
        isScanning = false;
        webcam.stop();
        break; // Stop the loop since we found a match
      }
    }
  }
}

function showModal(className) {
  // Update modal body content with the class name
  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = "<b class='fs-5'>"+className + "</b> is present!";

  // Show the modal
  const resultModal = new bootstrap.Modal(
    document.getElementById("resultModal")
  );
  resultModal.show();
}

function toggleScan() {
  var labelContainerCol = document.getElementById("label-container-col");
  labelContainerCol.classList.toggle("d-block"); // Toggle the 'd-none' class

  if (isScanning) {
    // Stop scanning
    webcam.stop();
    isScanning = false;
  } else {
    // Start scanning
    init();
    isScanning = true;
  }
}

// Tambahkan script ini setelah semua script lainnya
document.addEventListener("DOMContentLoaded", function () {
  const closeModalButton = document.getElementById("closeModalButton");

  closeModalButton.addEventListener("click", function () {
    // Reload halaman saat tombol close modal ditekan
    location.reload();
  });
});

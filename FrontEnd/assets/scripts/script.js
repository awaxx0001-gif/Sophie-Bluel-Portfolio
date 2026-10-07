const token = localStorage.getItem("token");
const loginLink = document.querySelector("#login-link");
const editProjectsButton = document.querySelector("#edit-projects");
const editModeBar = document.querySelector("#edit-mode-bar");
const modal = document.querySelector("#modal");
const closeModalButton = document.querySelector("#close-modal");
const addPhotoButton = document.querySelector("#add-photo");
const addPhotoView = document.querySelector("#add-photo-view");
const modalContent = document.querySelector(".modal-content");
const backToGalleryButton = document.querySelector("#back-to-gallery");
const closeAddPhotoButton = document.querySelector("#close-add-photo");
const addPhotoForm = document.querySelector("#add-photo-form");
const photoFileInput = document.querySelector("#photo-file");
const photoTitleInput = document.querySelector("#photo-title");
const photoCategorySelect = document.querySelector("#photo-category");
if (token) {
    
    loginLink.textContent = "logout";
    editProjectsButton.style.display = "block";
    editModeBar.style.display = "block";
    document.querySelector(".filters").style.display = "none";

    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "./login.html";
    });

} else {
    loginLink.textContent = "login";
    editProjectsButton.style.display = "none";
    editModeBar.style.display = "none";

    loginLink.addEventListener("click", () => {
        window.location.href = "./login.html";
    });
}
editProjectsButton.addEventListener("click", () => {
    modal.style.display = "flex";
});
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
});
addPhotoButton.addEventListener("click", () => {
  resetAddPhotoForm();
  modalContent.style.display = "none";
  addPhotoView.style.display = "block";
});

backToGalleryButton.addEventListener("click", () => {
    addPhotoView.style.display = "none";
    modalContent.style.display = "block";
});

closeAddPhotoButton.addEventListener("click", () => {
    modal.style.display = "none";
    addPhotoView.style.display = "none";
    modalContent.style.display = "block";
});

addPhotoForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = photoFileInput.files[0];
    const title = photoTitleInput.value;
    const category = photoCategorySelect.value;
    if (!file || !title.trim() || !category) {
    alert("Please complete all fields before adding a project.");
    return;
}

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", category);

    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });

    if (response.ok) {
        addPhotoForm.reset();
        addPhotoView.style.display = "none";
        modalContent.style.display = "block";
        getWorks();
    } else {
        alert("Unable to add this project.");
    }
});
photoFileInput.addEventListener("change", () => {
  let file = photoFileInput.files[0];
  const preview = document.querySelector("#photo-preview");
  const icon = document.querySelector("#upload-icon");
  const uploadButton = document.querySelector(".upload-button");
  const uploadHelp = document.querySelector(".upload-box p");

  if (preview.src.startsWith("blob:")) {
    URL.revokeObjectURL(preview.src);
  }

  if (file) {
    const validType = ["image/jpeg", "image/png"].includes(file.type);
    const validSize = file.size <= 4 * 1024 * 1024;

    if (!validType || !validSize) {
      alert("Choose a JPG or PNG image no larger than 4 MB.");
      photoFileInput.value = "";
      file = undefined;
    }
  }

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    icon.style.display = "none";
    uploadButton.style.display = "none";
    uploadHelp.style.display = "none";
  } else {
    preview.removeAttribute("src");
    preview.style.display = "none";
    icon.style.display = "";
    uploadButton.style.display = "";
    uploadHelp.style.display = "";
  }

  updateValidateButton();
});
function resetAddPhotoForm() {
  addPhotoForm.reset();

  const preview = document.querySelector("#photo-preview");
  if (preview.src.startsWith("blob:")) {
    URL.revokeObjectURL(preview.src);
  }

  preview.removeAttribute("src");
  preview.style.display = "none";
  document.querySelector("#upload-icon").style.display = "";
  document.querySelector(".upload-button").style.display = "";
  document.querySelector(".upload-box p").style.display = "";

  updateValidateButton();
}
function updateValidateButton() {
  const form = document.querySelector("#add-photo-form");
  const file = document.querySelector("#photo-file").files[0];
  const title = document.querySelector("#photo-title").value.trim();
  const category = document.querySelector("#photo-category").value;

  const validPhoto = file &&
    ["image/jpeg", "image/png"].includes(file.type) &&
    file.size <= 4 * 1024 * 1024;

  form.querySelector(".validate-photo").disabled =
    !(validPhoto && title && category);
      let message = form.querySelector("#photo-form-error");

  if (!message) {
    message = document.createElement("p");
    message.id = "photo-form-error";
    message.setAttribute("role", "status");
    message.style.color = "red";
    message.style.margin = "0";
    form.querySelector(".photo-form-divider").before(message);
  }

  let error = "";

  if (file || title) {
    if (!validPhoto) {
      error = "Choose a JPG or PNG image no larger than 4 MB.";
    } else if (!title) {
      error = "Please enter a title.";
    } else if (!category) {
      error = "Please select a category.";
    }
  }

  message.textContent = error;
  message.hidden = !error;
}

document.querySelector("#add-photo-form")
  .addEventListener("input", updateValidateButton);

document.querySelector("#add-photo-form")
  .addEventListener("change", updateValidateButton);

updateValidateButton();
async function getWorks(categoryId = "all") {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
    const filteredWorks =
    categoryId === "all"
        ? works
        : works.filter((work) => work.categoryId === categoryId);

displayWorks(filteredWorks);
displayModalWorks(works);
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
gallery.innerHTML = "";
    works.forEach((work) => {
 
        const figure = document.createElement("figure");

        const image = document.createElement("img");
        image.src = work.imageUrl;
        image.alt = work.title;

        const caption = document.createElement("figcaption");
        caption.textContent = work.title;

        figure.appendChild(image);
        figure.appendChild(caption);

        gallery.appendChild(figure);
    });
    }
    function displayModalWorks(works) {
    const modalGallery = document.querySelector("#modal-gallery");
    modalGallery.innerHTML = "";

    works.forEach((work) => {
        const item = document.createElement("div");
        item.classList.add("modal-item");

        const image = document.createElement("img");
        image.src = work.imageUrl;
        image.alt = work.title;
         const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-work");
    deleteButton.textContent = "🗑";
    deleteButton.dataset.workId = work.id;
    deleteButton.addEventListener("click", async () => {
    const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        getWorks();
    } else {
        alert("Unable to delete this project.");
    }
});

        item.appendChild(image);
        item.appendChild(deleteButton);
        modalGallery.appendChild(item);
    });

}

getWorks();
async function getCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();

    displayFilters(categories);
    displayCategoryOptions(categories);
}

getCategories();
    function displayCategoryOptions(categories) {
    const categorySelect = document.querySelector("#photo-category");

    categorySelect.innerHTML = "";

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;

        categorySelect.appendChild(option);
    });
}
function displayFilters(categories) {
    const filtersContainer = document.querySelector(".filters");
    function setActiveFilter(selectedButton) {
    filtersContainer.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("active");
    });
    selectedButton.classList.add("active");
}

    const allButton = document.createElement("button");
    allButton.textContent = "All";
    allButton.dataset.categoryId = "all";
    allButton.classList.add("active");
    filtersContainer.appendChild(allButton);
    allButton.addEventListener("click", () => {
        setActiveFilter(allButton);
    getWorks();
});

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.categoryId = category.id;
    filtersContainer.appendChild(button);
    button.addEventListener("click", () => {
        setActiveFilter(button);
    getWorks(category.id);
});
});
}
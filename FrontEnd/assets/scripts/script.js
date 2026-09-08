const token = localStorage.getItem("token");
const loginLink = document.querySelector("#login-link");
const editProjectsButton = document.querySelector("#edit-projects");
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

    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "./login.html";
    });

} else {
    loginLink.textContent = "login";
    editProjectsButton.style.display = "none";

    loginLink.addEventListener("click", () => {
        window.location.href = "./login.html";
    });
}
editProjectsButton.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModalButton.addEventListener("click", () => {
    modal.style.display = "none";
});
addPhotoButton.addEventListener("click", () => {
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
    const file = photoFileInput.files[0];
    const preview = document.querySelector("#photo-preview");

    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
    }
});
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

    const allButton = document.createElement("button");
    allButton.textContent = "All";
    allButton.dataset.categoryId = "all";
    filtersContainer.appendChild(allButton);
    allButton.addEventListener("click", () => {
    getWorks();
});

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.categoryId = category.id;
    filtersContainer.appendChild(button);
    button.addEventListener("click", () => {
    getWorks(category.id);
});
});
}
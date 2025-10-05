let categories = [];
let currentCategory = 'all';
let editMode = false;
let currentDropdown = null;
let tempSelectedIcon = null;
let selectedIcon = '';

window.onload = function () {
    initializeCategories();
    cleanLocalStorage();
    const savedButtons = JSON.parse(localStorage.getItem('buttons')) || [];
    if (window.innerWidth < 1200) {
        window.resizeTo(1200, 800);
    }
    console.log("Loading saved data..."); // Debug log
    initializeCategories();

    console.log("Saved buttons data:", savedButtons); // Debug log

    const container = document.getElementById('buttonContainer');
    container.innerHTML = '';

    savedButtons.forEach((buttonData) => {
        console.log("Processing button:", buttonData); // Debug log
        const div = document.createElement('div');
        div.className = 'button-entry';
        div.setAttribute('data-category', buttonData.category);

        const button = document.createElement('button');
        button.setAttribute('data-url', buttonData.url);
        button.setAttribute('data-category', buttonData.category);
        button.classList.add('link-button');

        // Check for and restore icon
        if (buttonData.image) {
            console.log("Restoring icon:", buttonData.image); // Debug log
            button.innerHTML = `
                <img src="${buttonData.image}" alt="Icon" 
                style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"
                onerror="this.style.display='none'">
                ${buttonData.title}
            `;
        } else {
            button.textContent = buttonData.title;
        }

        button.onclick = function (event) {
            if (editMode) {
                event.stopPropagation();
                showActionDropdown(button, div, buttonData.title, buttonData.url, buttonData.category);
            } else {
                const fullUrl = buttonData.url.startsWith('http') ? buttonData.url : 'http://' + buttonData.url;
                window.open(fullUrl, '_blank');
            }
        };

        const categoryLabel = document.createElement('div');
        categoryLabel.className = 'category-label';
        categoryLabel.textContent = `${buttonData.category}`;

        div.appendChild(button);
        div.appendChild(categoryLabel);
        container.appendChild(div);
    });
};

window.onclick = function (event) {
    const popup = document.getElementById("linkPopup");
    if (event.target === popup) {
        popup.style.display = "none";
    }
}

window.onclick = function (event) {
    const importPopup = document.getElementById("importPopup");
    if (event.target === importPopup) {
        importPopup.style.display = "none";
    }
}

window.addEventListener('click', function (event) {
    const popup = document.getElementById('iconPopup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

document.getElementById('saveIconSelection').addEventListener('click', function () {
    if (tempSelectedIcon) {
        selectedIcon = tempSelectedIcon;
        console.log('Icon saved:', selectedIcon);
        closeIconPopup();
    } else {
        alert('Please select an icon before saving.');
    }
});

document.getElementById('cancelIconSelection').addEventListener('click', function () {
    console.log('Icon selection canceled.');
    closeIconPopup();
});

document.getElementById('iconBrowse').addEventListener('click', openIconPopup);

document.addEventListener('DOMContentLoaded', () => {
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(icon => {
        icon.addEventListener('click', function () {
            // Deselect previously selected icon
            iconOptions.forEach(i => i.classList.remove('selected-icon'));

            // Highlight the clicked icon
            this.classList.add('selected-icon');
            selectedIcon = this.dataset.icon;  // Save selected icon path
            console.log('Selected Icon:', selectedIcon);
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    console.log("JavaScript loaded!");

    const manageBtn = document.getElementById('manageCategoriesBtn');
    if (manageBtn) {
        manageBtn.addEventListener('click', toggleCategoryManagement);
    } else {
        console.log("Manage Categories button not found!");
    }
    manageBtn.addEventListener('click', toggleCategoryManagement);

    document.getElementById('addLinkPopUp').addEventListener('click', openPopup);
    document.getElementById('addButton').addEventListener('click', () => {
        addButton();
    });
    document.addEventListener('DOMContentLoaded', loadIcons);
    document.getElementById('cancelPopup').addEventListener('click', closePopup);
    document.getElementById('editToggle').addEventListener('click', toggleEditMode);
    document.getElementById('cancelEdit').addEventListener('click', toggleEditMode);
    document.getElementById('exportSettings').addEventListener('click', saveToServer);
    document.getElementById('importSettings').addEventListener('click', openImportPopup);
    document.getElementById('closeImportPopup').addEventListener('click', closeImportPopup);
    document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('closePopupBtn').addEventListener('click', closePopup);
    document.addEventListener('DOMContentLoaded', function () {
        document.body.style.backgroundColor = editMode ? '#0d0000' : 'white';
    });
});

document.addEventListener('click', function (event) {
    if (currentDropdown && !currentDropdown.contains(event.target)) {
        const clickedButton = event.target.closest('.button-entry button');
        if (!clickedButton) {
            currentDropdown.remove();
            currentDropdown = null;
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const importFileInput = document.getElementById('importFile');
    importFileInput.addEventListener('change', importData);
});

document.addEventListener('DOMContentLoaded', () => {
    const iconOptions = document.querySelectorAll('.icon-option'); // Icons in the popup

    iconOptions.forEach(icon => {
        icon.addEventListener('click', function () {
            tempSelectedIcon = this.dataset.icon; // Save the selected icon path

            const iconPreview = document.getElementById('iconPreview');
            if (tempSelectedIcon) {
                iconPreview.src = tempSelectedIcon; // Set the preview image source
                iconPreview.style.display = 'block'; // Show the preview
            }
        });
    });
});

document.getElementById('iconBrowse').addEventListener('click', () => {
    openIconPopup();
});

function showActionDropdown(button, div, title, url) {
    if (currentDropdown) {
        currentDropdown.remove();
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function () {
        console.log("Edit button clicked");
        const category = div.getAttribute('data-category');
        dropdown.remove();
        showEditPopup(button, div, title, url, category);
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.onclick = function () {
        div.remove();
        saveButtons();
        dropdown.remove();
    };

    dropdown.appendChild(editBtn);
    dropdown.appendChild(removeBtn);
    document.body.appendChild(dropdown);

    const rect = button.getBoundingClientRect();
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.display = "block";

    currentDropdown = dropdown;
}

function showEditPopup(button, div, title, url, category) {
    console.log("showEditPopup called with:", { title, url, category });
    const cancelButton = document.getElementById("cancelPopup");
    cancelButton.disabled = false;

    const addButton = document.getElementById("addButton");
    addButton.disabled = false;

    // Open the Add New Link popup for editing
    const popup = document.getElementById("linkPopup");
    const titleInput = document.getElementById("buttonTitle");
    const urlInput = document.getElementById("buttonUrl");
    const categorySelect = document.getElementById("buttonCategory");
    const popupTitle = popup.querySelector("h2"); // Get the popup title element

    // Set popup title to "Edit Link"
    popupTitle.textContent = "Edit Link";

    cancelButton.onclick = function () {
        console.log("Cancel button clicked");
        closePopup();
    };

    titleInput.value = title;
    urlInput.value = url;

    categorySelect.innerHTML = "";
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        if (cat === category) option.selected = true;
        categorySelect.appendChild(option);
    });

    // Show the popup
    popup.style.display = "block";

    const saveButton = document.getElementById("addButton");
    saveButton.disabled = false;
    saveButton.textContent = "Save"; // Change button text
    const originalOnClick = saveButton.onclick;

    titleInput.value = title;
    urlInput.value = url;

    saveButton.onclick = function () {
        const titleInputNew = document.getElementById("buttonTitle");
        const urlInputNew = document.getElementById("buttonUrl");
        const categorySelectNew = document.getElementById("buttonCategory");


        const updatedTitle = titleInputNew.value;
        const updatedUrl = urlInputNew.value;
        const updatedCategory = categorySelectNew.value;


        const oldTitle = button.textContent.trim();
        const oldUrl = button.getAttribute('data-url');

        const newTitle = titleInput.value.trim();
        const newUrl = urlInput.value.trim();
        const newCategory = categorySelect.value;

        console.log("Updating button with:", { updatedTitle, updatedUrl, updatedCategory });

        //if (titleInput.value && urlInput.value) {
            // Update the button details
        deleteButtonFromLocalStorage(oldTitle, oldUrl);
            button.innerHTML = `
                ${selectedIcon ? `<img src="${selectedIcon}" alt="Icon" style="width: 20px; height: 20px; margin-right: 8px;">` : ""}
                ${titleInputNew.value}
            `;
            button.dataset.url = urlInputNew.value;
            div.setAttribute("data-category", categorySelect.value);

            // Update localStorage and UI
            saveEdit(button, div, newTitle, newUrl, newCategory);

            // Restore the original Save button functionality and close the popup
            saveButton.onclick = originalOnClick;
            saveButton.textContent = "Add Button"; // Restore button text
            popupTitle.textContent = "Add New Link"; // Restore the default title
            closePopup();
        // } else {
        //     alert("Please fill in all required fields.");
        // }
    };
}

function saveEdit(button, div, newTitle, newUrl, newCategory) {
    if (!newTitle || !newUrl || !newCategory) {
        console.error("Invalid input: Title, URL, or Category is empty.");
        return;
    }

    if (!button || !div) {
        console.error("Button or div is undefined. Cannot save edit.");
        return;
    }

    const oldTitle = button.textContent.trim();
    const oldUrl = button.dataset.url;

    // First, remove the old button data from localStorage
    deleteButtonFromLocalStorage(oldTitle, oldUrl);

    // Update the existing button element instead of creating a new one
    button.innerHTML = `
        ${selectedIcon ? `<img src="${selectedIcon}" alt="Icon" style="width: 20px; height: 20px; margin-right: 8px;">` : ""}
        ${newTitle}
    `;
    button.dataset.url = newUrl;
    div.setAttribute("data-category", newCategory);

    // Update category label
    const categoryLabel = div.querySelector('.category-label');
    if (categoryLabel) {
        categoryLabel.textContent = `${newCategory}`;
    }

    // Save the updated button data to localStorage
    const updatedButtonData = {
        title: newTitle,
        url: newUrl,
        category: newCategory,
        image: selectedIcon || ""
    };
    saveButtonToLocal(updatedButtonData);

    // Update the button's onclick handler
    button.onclick = function(event) {
        if (editMode) {
            event.stopPropagation();
            showActionDropdown(button, div, newTitle, newUrl, newCategory);
        } else {
            const fullUrl = newUrl.startsWith('http') ? newUrl : 'http://' + newUrl;
            window.open(fullUrl, '_blank');
        }
    };

    // Refresh the display based on current category filter
    filterButtons(currentCategory);

    // Close popup and reset UI
    closePopup();
    const saveButton = document.getElementById("addButton");
    saveButton.textContent = "Add Button";
    saveButton.onclick = saveButtons;
}

function importData(event) {
    const file = event.target.files[0];

    if (!file) {
        alert('No file selected.');
        return;
    }


    if (!confirm('Importing this file will erase existing data. Proceed?')) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.categories || !data.buttons) {
                alert('Invalid file format. Please select a valid JSON file.');
                return;
            }

            categories = data.categories;
            localStorage.setItem('buttons', JSON.stringify(data.buttons));
            updateCategoryUI();
            document.getElementById('buttonContainer').innerHTML = '';

            data.buttons.forEach(({title, url, category, image}) => {
                const div = addButton(title, url, category);
                const button = div.querySelector('button');

                if (image) {
                    button.innerHTML = `
                        <img src="${image}" alt="Logo"
                        style="width: 20px; height: 20px; margin-right: 8px;">
                        ${title}
                    `;
                }
            });

            alert('Data imported successfully!');
            event.target.value = '';
        } catch (error) {
            console.error('Error importing file:', error);
            alert('Failed to import. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

function initializeCategories() {
    categories = JSON.parse(localStorage.getItem('categories')) || ['Work', 'Personal', 'Social'];
    updateCategoryUI();
}

function updateCategoryUI() {
    const tabsContainer = document.getElementById('categoryTabs');
    const categoriesList = document.getElementById('categoriesList');

    tabsContainer.innerHTML = '';
    categoriesList.innerHTML = '';

    const allTab = document.createElement('button');
    allTab.className = `category-tab ${currentCategory === 'all' ? 'active' : ''}`;
    allTab.textContent = 'All';
    allTab.dataset.category = 'all';
    tabsContainer.appendChild(allTab);

    categories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = `category-tab ${currentCategory === category ? 'active' : ''}`;
        tab.textContent = category;
        tab.dataset.category = category;
        tabsContainer.appendChild(tab);

        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <span>${category}</span>
            <button class="edit-category" data-category="${category}">✎</button>
            <button class="remove-category" data-category="${category}">×</button>
        `;
        categoriesList.appendChild(categoryItem);
    });

    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', function () {
            const category = btn.getAttribute('data-category');
            editCategory(category);
        });
    });

    document.querySelectorAll('.remove-category').forEach(btn => {
        btn.addEventListener('click', function () {
            const category = btn.getAttribute('data-category');
            removeCategory(category);
        });
    });

    tabsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('category-tab')) {
            filterButtons(event.target.dataset.category);
        }
    });

    localStorage.setItem('categories', JSON.stringify(categories));
}

function addCategory() {
    const input = document.getElementById('newCategoryInput');
    const newCategory = input.value.trim();

    const categoryExists = categories.some(cat => cat.trim().toLowerCase() === newCategory.toLowerCase());

    if (newCategory && !categoryExists) {
        categories.push(newCategory);
        updateCategoryUI();
        input.value = '';
    } else {
        alert('Please enter a unique category name.');
    }
}

function removeCategory(category) {
    if (confirm(`Remove category "${category}"?`)) {
        categories = categories.filter(c => c !== category);
        if (categories.length === 0) {
            categories = ['Uncategorized'];
        }
        updateCategoryUI();
        saveButtons();
    }
}

function editCategory(oldCategory) {
    const newName = prompt('Enter new category name:', oldCategory);
    if (newName && newName.trim() && newName !== oldCategory) {
        categories = categories.map(c => c === oldCategory ? newName : c);

        document.querySelectorAll('.button-entry').forEach(entry => {
            if (entry.getAttribute('data-category') === oldCategory) {
                entry.setAttribute('data-category', newName);
                entry.querySelector('button').setAttribute('data-category', newName);
                entry.querySelector('.category-label').textContent = `Category: ${newName}`;
            }
        });

        updateCategoryUI();
        saveButtons();
    }
}

function filterButtons(category) {
    currentCategory = category;

    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const selectedTab = document.querySelector(`.category-tab[data-category="${category}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    document.querySelectorAll('.button-entry').forEach(entry => {
        const buttonCategory = entry.getAttribute('data-category');
        entry.style.display = (category === 'all' || buttonCategory === category) ? 'block' : 'none';
    });
}

function cleanLocalStorage() {
    let buttons = JSON.parse(localStorage.getItem("buttons")) || [];
    buttons = buttons.filter(button => button.title && button.url && button.category);
    localStorage.setItem("buttons", JSON.stringify(buttons));
    console.log("Cleaned up localStorage:", buttons);
}

function addButton(title = '', url = '', category = '') {
    console.log("Add button:", title, url, category);

    if (!title) title = document.getElementById('buttonTitle').value;
    if (!url) url = document.getElementById('buttonUrl').value;
    if (!category) category = document.getElementById('buttonCategory').value;

    if (!title.trim() || !url.trim() || !category.trim()) {
        alert('Please fill all fields (Title, URL, Category)');
        return;
    }

    const iconPath = selectedIcon;
    const container = document.getElementById('buttonContainer');
    const div = document.createElement('div');
    div.className = 'button-entry';
    div.setAttribute('data-category', category);

    const button = document.createElement('button');
    button.setAttribute('data-url', url);
    button.setAttribute('data-category', category);
    button.setAttribute('data-icon', iconPath);
    button.classList.add('link-button');

    if (iconPath) {
        button.innerHTML = `
            <img src="${iconPath}" alt="Icon" 
            style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;">
            ${title}
        `;
    } else {
        button.textContent = title;
    }

    const categoryLabel = document.createElement('div');
    categoryLabel.className = 'category-label';
    categoryLabel.textContent = `${category}`;

    div.appendChild(button);
    div.appendChild(categoryLabel);
    container.appendChild(div);

    saveButtonToLocal({ title, url, category, image: iconPath });

    // Reset fields and icon selection
    document.getElementById('buttonTitle').value = '';
    document.getElementById('buttonUrl').value = '';
    document.getElementById('buttonCategory').value = '';
    selectedIcon = '';
    tempSelectedIcon = '';
    const iconPreview = document.getElementById('iconPreview');
    iconPreview.src = '';
    iconPreview.style.display = 'none';
    console.log('Icon selection reset.');

    closePopup();
    return div;
}

function saveButtonToLocal(buttonData) {
    let buttons = JSON.parse(localStorage.getItem('buttons')) || [];

    // Find existing button by title and URL
    const existingIndex = buttons.findIndex(b =>
        b.title === buttonData.title &&
        b.url === buttonData.url
    );

    if (existingIndex > -1) {
        buttons[existingIndex] = buttonData;
        console.log("Updated existing button:", buttonData);
    } else {
        buttons.push(buttonData);
        console.log("Added new button:", buttonData);
    }

    localStorage.setItem('buttons', JSON.stringify(buttons));
}

function saveButtons() {
    const buttons = [];
    document.querySelectorAll('.button-entry').forEach(entry => {
        const button = entry.querySelector('button');
        const img = button.querySelector('img');
        const iconPath = img ? img.getAttribute('src') : '';

        const buttonData = {
            title: button.textContent.trim(),
            url: button.getAttribute('data-url'),
            category: entry.getAttribute('data-category'),
            image: iconPath
        };

        console.log("Saving button data:", buttonData); // Debug log
        buttons.push(buttonData);
    });

    localStorage.setItem('buttons', JSON.stringify(buttons));
    console.log("All buttons saved:", buttons); // Debug log
    closePopup();
}

function deleteButtonFromLocalStorage(title, url) {
    try {
        let buttons = JSON.parse(localStorage.getItem("buttons")) || [];
        console.log("Buttons before deletion:", buttons);
        console.log("Attempting to delete button with title:", title, "and url:", url);

        buttons = buttons.filter(button =>
            !(button.title.trim().toLowerCase() === title.trim().toLowerCase() &&
                button.url.trim().toLowerCase() === url.trim().toLowerCase())
        );

        localStorage.setItem("buttons", JSON.stringify(buttons));
        console.log("Buttons after deletion:", buttons);
    } catch (error) {
        console.error("Error processing localStorage buttons:", error);
    }
}

function toggleCategoryManagement() {
    console.log("toggleCategoryManagement called!");
    const management = document.getElementById('categoryManagement');
    if (management) {
        management.classList.toggle('visible');

        management.style.display = management.classList.contains('visible') ? 'block' : 'none';

        console.log("Category management classList:", management.classList);
        console.log("Category section display:", window.getComputedStyle(management).display);
    } else {
        console.log("Category management div not found!");
    }
}

function toggleEditMode() {
    editMode = !editMode;
    const allButtons = document.querySelectorAll('button');

    allButtons.forEach(button => {
        if (button.id !== 'editToggle' && button.id !== 'cancelEdit' && !button.classList.contains('link-button')) {
            button.disabled = editMode;
        }
    });


    document.getElementById('editToggle').style.display = editMode ? 'none' : 'block';
    document.getElementById('cancelEdit').style.display = editMode ? 'block' : 'none';

    document.body.style.backgroundColor = editMode ? '#0d0000' : 'white';


    if (editMode) {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#9ea3aa';
    } else {
        document.body.style.backgroundImage = 'url("bk.jpg")';
        document.body.style.backgroundColor = 'white';
    }

    if (!editMode && currentDropdown) {
        currentDropdown.remove();
        currentDropdown = null;
    }
}

function saveToServer() {
    const data = {
        categories,
        buttons: JSON.parse(localStorage.getItem('buttons')) || []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'button_manager_data.json';
    a.click();

    alert('Data exported successfully!');
}

function openPopup() {
    const popup = document.getElementById("linkPopup");
    const categorySelect = document.getElementById("buttonCategory");
    const popupTitle = popup.querySelector("h2"); // Get the popup title element

    // Set popup title to "Add New Link"
    popupTitle.textContent = "Add New Link";

    // Clear input fields
    document.getElementById("buttonTitle").value = "";
    document.getElementById("buttonUrl").value = "";

    // Populate the category dropdown
    categorySelect.innerHTML = "";
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    categorySelect.value = currentCategory;

    // Show the popup
    popup.style.display = "block";
}

function closePopup() {
    document.getElementById('linkPopup').style.display = 'none';

    // Reset icon selection and preview
    selectedIcon = '';
    tempSelectedIcon = '';
    const iconPreview = document.getElementById('iconPreview');
    iconPreview.src = ''; // Clear the preview image
    iconPreview.style.display = 'none'; // Hide the preview
    console.log('Popup closed and icon selection reset.'); // Debug log
}

function openImportPopup() {
    document.getElementById("importPopup").style.display = "block";
}

function closeImportPopup() {
    document.getElementById("importPopup").style.display = "none";
}

function loadIcons() {
    const iconSelect = document.getElementById('buttonIcon');
    const icons = ['link.png', 'email.png', 'work.png'];

    iconSelect.innerHTML = '';
    icons.forEach(icon => {
        const option = document.createElement('option');
        option.value = icon;
        option.textContent = icon.split('.')[0];
        iconSelect.appendChild(option);
    });
}

function openIconPopup() {
    const popup = document.getElementById('iconPopup');
    const gallery = document.getElementById('iconPopupGallery');
    gallery.innerHTML = '';

    const iconPaths = [
        'icons/i1.png', 'icons/i2.png', 'icons/i3.png', 'icons/i4.png',
        'icons/i5.png', 'icons/i6.png', 'icons/i7.png', 'icons/i8.png',
        'icons/i9.png', 'icons/i10.png', 'icons/i12.png',
        'icons/i13.png' , 'icons/i15.png' , 'icons/i16.png' ,
        'icons/i17.png', 'icons/i18.png', 'icons/i18.png', 'icons/i19.png',
        'icons/i20.png', 'icons/i21.png', 'icons/i22.png',
        'icons/i23.png', 'icons/i24.png','icons/i26.png', 'icons/i27.png',
        'icons/i28.png', 'icons/i29.png', 'icons/i30.png', 'icons/i31.png',
        'icons/i32.png', 'icons/i33.png','icons/i34.png', 'icons/i35.png'
    ];

    iconPaths.forEach(icon => {
        const img = document.createElement('img');
        img.src = icon;
        img.alt = 'Icon';
        img.dataset.icon = icon;
        img.className = 'icon-option'; // Add class for styling

        img.addEventListener('click', () => {
            tempSelectedIcon = icon; // Save the selected icon
            console.log('Icon selected:', tempSelectedIcon); // Debug

            // Highlight the selected icon
            gallery.querySelectorAll('.icon-option').forEach(i => i.classList.remove('selected-icon'));
            img.classList.add('selected-icon');

            // Update the preview
            const iconPreview = document.getElementById('iconPreview');
            iconPreview.src = tempSelectedIcon; // Set the preview image source
            iconPreview.style.display = 'block'; // Ensure preview is visible
            console.log('Preview updated:', iconPreview.src); // Debug
        });

        gallery.appendChild(img);
    });

    popup.style.display = 'block'; // Show the popup
}

function closeIconPopup() {
    const popup = document.getElementById('iconPopup');
    popup.style.display = 'none'; // Hide the popup

    // Clear temporary selection
    tempSelectedIcon = null;

    // Optionally reset the preview
    const iconPreview = document.getElementById('iconPreview');
    if (!selectedIcon) {
        iconPreview.src = ''; // Clear the preview image
        iconPreview.style.display = 'none'; // Hide the preview
    }
}

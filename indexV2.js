let categories = [];
let currentCategory = 'all';
let editMode = false;
let currentDropdown = null;
let tempSelectedIcon = null;
let selectedIcon = '';


document.getElementById('iconBrowse').addEventListener('click', openIconPopup);


document.addEventListener('DOMContentLoaded', () => {
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(icon => {
        icon.addEventListener('click', function() {
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
        dropdown.remove();
        showEditDropdown(button, div, title, url);
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
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
    dropdown.style.display = 'block';

    currentDropdown = dropdown;
}


function showEditDropdown(button, div, title, url, category) {
    console.log("showEditDropdown called");
    const allButtons = document.querySelectorAll('.link-button');
    allButtons.forEach(btn => {
        if (btn !== button) {
            btn.disabled = true; // Disable other buttons
        }
    })
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';

    const buttonData = {
        title,
        url,
        category,
        image: button.querySelector('img') ? button.querySelector('img').getAttribute('src') : ''
    };

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = title;
    titleInput.placeholder = 'Edit Title';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = url;
    urlInput.placeholder = 'Edit URL';

    const categorySelect = document.createElement('select');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === category) option.selected = true;
        categorySelect.appendChild(option);
    });

    const cancelBtn = document.createElement('button');
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = function () {
        dropdown.remove();
        allButtons.forEach(btn => btn.disabled = false);

    }
    saveBtn.onclick = function () {
        if (titleInput.value && urlInput.value) {
            button.innerHTML = titleInput.value;

            button.dataset.url = urlInput.value;
            button.setAttribute('data-url', urlInput.value);
            div.setAttribute('data-category', categorySelect.value);


            button.onclick = function () {
                const fullUrl = urlInput.value.startsWith('http') ? urlInput.value : 'http://' + urlInput.value;
                window.open(fullUrl, '_blank');
            };

            saveButtons();
            saveButtonToLocal(buttonData);
            allButtons.forEach(btn => btn.disabled = false);
            dropdown.remove();
        }
        dropdown.remove();
    };

    dropdown.appendChild(createLabeledInput("Title", titleInput));
    dropdown.appendChild(createLabeledInput("URL", urlInput));
    dropdown.appendChild(createLabeledInput("Category", categorySelect));
    dropdown.appendChild(createLabeledInput("", saveBtn));
    dropdown.appendChild(createLabeledInput("", cancelBtn));

    document.body.appendChild(dropdown);

    const rect = button.getBoundingClientRect();
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.top = `${rect.bottom}px`;

    console.log("Dropdown appended to DOM");

}


function createLabeledInput(labelText, inputElement) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginBottom = '10px';

    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.marginRight = '10px';
    label.style.width = '60px';

    container.appendChild(label);
    container.appendChild(inputElement);
    return container;
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

window.onload = function () {
    initializeCategories();
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


function addButton(title = '', url = '', category = '') {
    if (!title) title = document.getElementById('buttonTitle').value;
    if (!url) url = document.getElementById('buttonUrl').value;
    if (!category) category = document.getElementById('buttonCategory').value;

    // Store the complete icon path
    const iconPath = selectedIcon;
    console.log("Adding button with icon path:", iconPath); // Debug log

    if (!title || !url || !category) {
        alert('Please fill all fields (Title, URL, Category)');
        return;
    }

    const container = document.getElementById('buttonContainer');
    const div = document.createElement('div');
    div.className = 'button-entry';
    div.setAttribute('data-category', category);

    const button = document.createElement('button');
    button.setAttribute('data-url', url);
    button.setAttribute('data-category', category);
    button.setAttribute('data-icon', iconPath); // Store full icon path
    button.classList.add('link-button');

    // Store complete button data
    const buttonData = {
        title: title.trim(),
        url,
        category,
        image: iconPath // Store the full icon path
    };

    // Create button content with icon
    if (iconPath) {
        console.log("Setting button HTML with icon:", iconPath); // Debug log
        button.innerHTML = `
            <img src="${iconPath}" alt="Icon" 
            style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;">
            ${title}
        `;
    } else {
        button.textContent = title;
    }

    // Save immediately to ensure data is stored
    saveButtonToLocal(buttonData);

    button.onclick = function (event) {
        if (editMode) {
            event.stopPropagation();
            showActionDropdown(button, div, title, url, category);
        } else {
            const fullUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'http://' + url;
            window.open(fullUrl, '_blank');
        }
    };

    const categoryLabel = document.createElement('div');
    categoryLabel.className = 'category-label';
    categoryLabel.textContent = `${category}`;

    div.appendChild(button);
    div.appendChild(categoryLabel);
    container.appendChild(div);

    // Save all buttons to ensure consistency
    saveButtons();

    // Reset form
    document.getElementById('buttonTitle').value = '';
    document.getElementById('buttonUrl').value = '';
    document.getElementById('buttonCategory').value = '';
    selectedIcon = '';

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
    const categorySelect = document.getElementById('buttonCategory');
    categorySelect.innerHTML = '';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    categorySelect.value = currentCategory;

    document.getElementById("linkPopup").style.display = "block";
}

function closePopup() {
    document.getElementById("linkPopup").style.display = "none";
}

window.onclick = function (event) {
    const popup = document.getElementById("linkPopup");
    if (event.target === popup) {
        popup.style.display = "none";
    }
}

function openImportPopup() {
    document.getElementById("importPopup").style.display = "block";
}

function closeImportPopup() {
    document.getElementById("importPopup").style.display = "none";
}

window.onclick = function (event) {
    const importPopup = document.getElementById("importPopup");
    if (event.target === importPopup) {
        importPopup.style.display = "none";
    }
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
        'icons/i9.png', 'icons/i10.png', 'icons/i11.png', 'icons/i12.png',
        'icons/i13.png'
    ];

    iconPaths.forEach(icon => {
        const img = document.createElement('img');
        img.src = icon;
        img.alt = 'Icon';
        img.dataset.icon = icon;

        img.addEventListener('click', () => {
            tempSelectedIcon = icon;
            gallery.querySelectorAll('img').forEach(i => i.classList.remove('selected-icon'));
            img.classList.add('selected-icon');
            document.getElementById('saveIconSelection').disabled = false;
        });

        gallery.appendChild(img);
    });

    // Reset state for save button
    document.getElementById('saveIconSelection').disabled = true;
    popup.style.display = 'block';
}

// Close Icon Popup
function closeIconPopup() {
    document.getElementById('iconPopup').style.display = 'none';
}

// Save Icon Selection
document.getElementById('saveIconSelection').addEventListener('click', function() {
    if (tempSelectedIcon) {
        selectedIcon = tempSelectedIcon;
        console.log('Icon path when selected:', selectedIcon);
        // Log the full URL
        console.log('Full icon URL:', new URL(selectedIcon, window.location.href).href);
        closeIconPopup();
    }
});

document.getElementById('cancelIconSelection').addEventListener('click', function() {
    tempSelectedIcon = null;
    closeIconPopup();
});


window.addEventListener('click', function(event) {
    const popup = document.getElementById('iconPopup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

function selectIcon(iconPath) {
    selectedIcon = iconPath;  // Store the full path
    console.log("Icon selected:", selectedIcon);
}
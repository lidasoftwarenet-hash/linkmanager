let categories = [];
let currentCategory = 'all';
let editMode = false;
let currentDropdown = null;
let tempSelectedIcon = null;
let selectedIcon = '';
let popupMode = "add";


window.onload = function () {
    initializeCategories();
    cleanLocalStorage();
    const savedButtons = JSON.parse(localStorage.getItem('buttons')) || [];
    if (window.innerWidth < 1200) {
        window.resizeTo(1200, 800);
    }
    console.log("Loading saved data..."); 
    initializeCategories();

    console.log("Saved buttons data:", savedButtons); 

    const container = document.getElementById('buttonContainer');
    container.innerHTML = '';

    savedButtons.forEach((buttonData) => {
        console.log("Processing button:", buttonData); 
        const div = document.createElement('div');
        div.className = 'button-entry';
        div.setAttribute('data-category', buttonData.category);

        const button = document.createElement('button');
        button.setAttribute('data-url', buttonData.url);
        button.setAttribute('data-category', buttonData.category);
        button.classList.add('link-button');

        // Check for and restore icon
        if (buttonData.image) {
            console.log("Restoring icon:", buttonData.image); 
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
        showCustomAlert('Please select an icon before saving.');
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

            iconOptions.forEach(i => i.classList.remove('selected-icon'));


            this.classList.add('selected-icon');
            selectedIcon = this.dataset.icon;
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
    document.getElementById('addLinkButton').addEventListener('click', () => {
        console.log('popupMode: ' + popupMode);
        if (popupMode === "add") {
            addButton();
        } else if (popupMode === "edit") {
            addButton('', '', '', true);
        }
    });
    document.addEventListener('DOMContentLoaded', loadIcons);
    document.getElementById('cancelPopup').addEventListener('click', closePopup);
    document.getElementById('editToggle').addEventListener('click', toggleEditMode);
    document.getElementById('cancelEdit').addEventListener('click', toggleEditMode);
    document.getElementById('exportSettings').addEventListener('click', exportData);
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
            tempSelectedIcon = this.dataset.icon;

            const iconPreview = document.getElementById('iconPreview');
            if (tempSelectedIcon) {
                iconPreview.src = tempSelectedIcon;
                iconPreview.style.display = 'block';
            }
        });
    });
});

function showCustomAlert(showCustomAlertText, reload = false) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Create showCustomAlert box
    const showCustomAlertBox = document.createElement('div');
    showCustomAlertBox.style.backgroundColor = '#ffffff';
    showCustomAlertBox.style.borderRadius = '8px';
    showCustomAlertBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    showCustomAlertBox.style.padding = '20px';
    showCustomAlertBox.style.width = '90%';
    showCustomAlertBox.style.maxWidth = '400px';
    showCustomAlertBox.style.textAlign = 'center';
    showCustomAlertBox.style.fontFamily = '"Arial", sans-serif';

    // Add message to showCustomAlert box
    const message = document.createElement('p');
    message.style.margin = '0 0 20px 0';
    message.style.fontSize = '16px';
    message.style.lineHeight = '1.5';
    message.textContent = showCustomAlertText;
    showCustomAlertBox.appendChild(message);

    // Add OK button
    const okButton = document.createElement('button');
    okButton.style.padding = '10px 20px';
    okButton.style.backgroundColor = '#007BFF';
    okButton.style.color = '#ffffff';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '4px';
    okButton.style.cursor = 'pointer';
    okButton.style.fontSize = '14px';
    okButton.style.transition = 'background-color 0.3s ease';
    okButton.textContent = 'OK';

    // Add hover effect for the button
    okButton.onmouseenter = () => {
        okButton.style.backgroundColor = '#0056b3';
    };
    okButton.onmouseleave = () => {
        okButton.style.backgroundColor = '#007BFF';
    };

    if (reload) {
        okButton.onclick = () => {
            document.body.removeChild(overlay);
            chrome.runtime.reload();

        };

    }
    if (!reload) {
        okButton.onclick = () => {
            document.body.removeChild(overlay);
        };
    }


    showCustomAlertBox.appendChild(okButton);
    overlay.appendChild(showCustomAlertBox);
    document.body.appendChild(overlay);
}

function showCustomAlertNoOk(showCustomAlertText) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Create showCustomAlert box
    const showCustomAlertBox = document.createElement('div');
    showCustomAlertBox.style.backgroundColor = '#ffffff';
    showCustomAlertBox.style.borderRadius = '8px';
    showCustomAlertBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    showCustomAlertBox.style.padding = '20px';
    showCustomAlertBox.style.width = '90%';
    showCustomAlertBox.style.maxWidth = '400px';
    showCustomAlertBox.style.textAlign = 'center';
    showCustomAlertBox.style.fontFamily = '"Arial", sans-serif';

    // Add message to showCustomAlert box
    const message = document.createElement('p');
    message.style.margin = '0 0 20px 0';
    message.style.fontSize = '16px';
    message.style.lineHeight = '1.5';
    message.textContent = showCustomAlertText;
    showCustomAlertBox.appendChild(message);

    overlay.appendChild(showCustomAlertBox);
    document.body.appendChild(overlay);
}

function showActionDropdown(button, div, title, url) {
    showCustomAlert('⚠️ Please cancel edit mode to continue with normal functioning and open links.');
}

function showEditPopup(button, div, title, url, category) {
    console.log("showEditPopup called with:", { title, url, category });

    // Get DOM elements
    const popup = document.getElementById("linkPopup");
    const titleInput = document.getElementById("buttonTitle");
    const urlInput = document.getElementById("buttonUrl");
    const categorySelect = document.getElementById("buttonCategory");
    const saveButton = document.getElementById("addLinkButton");
    const cancelButton = document.getElementById("cancelPopup");

    // Remove any existing event listeners
    const newSaveButton = saveButton.cloneNode(true);
    const newCancelButton = cancelButton.cloneNode(true);
    saveButton.parentNode.replaceChild(newSaveButton, saveButton);
    cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);

    // Set popup mode and title
    popupMode = "edit";
    popup.querySelector("h2").textContent = "Edit Link";
    newSaveButton.textContent = "Save";

    // Set initial values
    titleInput.value = title;
    urlInput.value = url;

    // Populate category dropdown
    categorySelect.innerHTML = "";
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        if (cat === category) option.selected = true;
        categorySelect.appendChild(option);
    });

    // Show popup
    popup.style.display = "block";

    // Add new event listener for save
    newSaveButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const updatedTitle = titleInput.value.trim();
        const updatedUrl = urlInput.value.trim();
        const updatedCategory = categorySelect.value;
        const updateIconPreview = document.getElementById('iconPreview');

        // Validate inputs
        if (!updatedTitle || !updatedUrl || !updatedCategory) {
            showCustomAlert('Please fill all fields (Title, URL, Category)');
            return;
        }

        // Delete old button data
        deleteButtonFromLocalStorage(title, url);

        // 1. Grab the existing icon from the button (if there is one)
        const existingIconElement = button.querySelector('img');
        const existingIcon = existingIconElement ? existingIconElement.src : '';

        // 2. Decide which icon to use: the newly selected one or the existing one
        const finalIcon = selectedIcon || existingIcon;

        // 3. Update the button in the DOM with finalIcon
        button.innerHTML = `
        ${finalIcon ? `<img src="${finalIcon}" alt="Icon" style="width: 20px; height: 20px; margin-right: 8px;">` : ''}
        ${updatedTitle}
    `;
        button.dataset.url = updatedUrl;
        div.setAttribute('data-category', updatedCategory);

        // 4. Prepare updated data object for saving
        const buttonData = {
            title: updatedTitle,
            url: updatedUrl,
            category: updatedCategory,
            image: finalIcon // use the final icon
        };

        // 5. Push to localStorage
        let buttons = JSON.parse(localStorage.getItem('buttons')) || [];
        buttons.push(buttonData);
        localStorage.setItem('buttons', JSON.stringify(buttons));

        // 6. Update category label
        const categoryLabel = div.querySelector('.category-label');
        if (categoryLabel) {
            categoryLabel.textContent = updatedCategory;
        }

        // 7. Reset icon variables, close popup
        selectedIcon = '';
        tempSelectedIcon = '';
        showCustomAlertNoOk('Data updated successfully! The extension will now reload. Please reopen it to see the updates.');
        setTimeout(() => {
                chrome.runtime.reload();
            }, 2000);
        closePopup();
    });


    // Add new event listener for cancel
    newCancelButton.addEventListener('click', function(e) {
        e.preventDefault();
        closePopup();
    });
}

function importData(event) {
    const file = event.target.files[0];

    if (!file) {
        showCustomAlert('No file selected.');
        return;
    }

    if (!confirm('Importing this file will overwrite existing data. Proceed?')) {
        return;
    }
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            console.log("Initial parsed data:", data);

            if (typeof data !== 'object' || data === null) {
                showCustomAlert('Invalid file format. Please select a valid JSON file.');
                return;
            }

            // Process and validate image paths
            if (data.buttons && Array.isArray(data.buttons)) {
                console.log("Processing buttons:", data.buttons);
                data.buttons = data.buttons.map(button => {
                    if (button.image) {
                        console.log("Processing image path:", button.image);
                        // Handle relative paths
                        if (button.image.startsWith('./')) {
                            button.image = button.image.replace('./', 'icons/');
                            console.log("Converted relative path to:", button.image);
                        }
                        // Handle direct icon references
                        if (!button.image.startsWith('icons/')) {
                            button.image = `icons/${button.image}`;
                            console.log("Added icons/ prefix:", button.image);
                        }

                        // Ensure the image path exists in our valid icons list
                        const validIconPaths = [
                            'icons/i1.png', 'icons/i2.png', 'icons/i3.png', 'icons/i4.png',
                            'icons/i5.png', 'icons/i6.png', 'icons/i7.png', 'icons/i8.png',
                            'icons/i9.png', 'icons/i10.png', 'icons/i12.png',
                            'icons/i13.png', 'icons/i15.png', 'icons/i16.png',
                            'icons/i17.png', 'icons/i18.png', 'icons/i19.png',
                            'icons/i20.png', 'icons/i21.png', 'icons/i22.png',
                            'icons/i23.png', 'icons/i24.png', 'icons/i26.png', 'icons/i27.png',
                            'icons/i28.png', 'icons/i29.png', 'icons/i30.png', 'icons/i31.png',
                            'icons/i32.png', 'icons/i33.png', 'icons/i34.png', 'icons/i35.png',

                            'icons/i36.png', 'icons/i37.png', 'icons/i38.png', 'icons/i39.png','icons/i40.png',

                            'icons/i41.png', 'icons/i42.png', 'icons/i43.png', 'icons/i44.png', 'icons/i45.png',
                            'icons/i46.png', 'icons/i47.png', 'icons/i48.png', 'icons/i49.png','icons/i50.png',

                            'icons/i51.png', 'icons/i52.png', 'icons/i53.png', 'icons/i54.png', 'icons/i55.png',
                            'icons/i56.png', 'icons/i57.png', 'icons/i58.png', 'icons/i59.png','icons/i60.png',

                             'icons/i62.png', 'icons/i63.png', 'icons/i64.png', 'icons/i65.png',
                            'icons/i66.png', 'icons/i67.png', 'icons/i68.png', 'icons/i69.png','icons/i70.png',

                            'icons/i71.png', 'icons/i72.png', 'icons/i73.png', 'icons/i74.png', 'icons/i80.png',

                            'icons/i81.png', 'icons/i82.png', 'icons/i83.png', 'icons/i84.png', 'icons/i85.png',
                            'icons/i86.png', 'icons/i87.png', 'icons/i88.png',
                            'icons/i89.png', 'icons/i90.png', 'icons/i91.png', 'icons/i92.png', 'icons/i93.png',
                            'icons/i94.png', 'icons/i95.png', 'icons/i96.png'

                        ];

                        if (!validIconPaths.includes(button.image)) {
                            console.warn(`Invalid icon path: ${button.image}. Removing icon.`);
                            button.image = '';
                        } else {
                            console.log("Valid icon path confirmed:", button.image);
                        }
                    }
                    return button;
                });
                console.log("Processed buttons:", data.buttons);
            }

            // Clear localStorage and import new data
            localStorage.clear();
            Object.keys(data).forEach(key => {
                localStorage.setItem(key, JSON.stringify(data[key]));
                console.log(`Saved to localStorage - Key: ${key}, Value:`, JSON.parse(localStorage.getItem(key)));
            });

            // Reload categories and buttons
            categories = JSON.parse(localStorage.getItem('categories')) || [];
            const buttons = JSON.parse(localStorage.getItem('buttons')) || [];
            console.log("Retrieved from localStorage - Buttons:", buttons);
            updateCategoryUI();

            const container = document.getElementById('buttonContainer');
            container.innerHTML = '';

            buttons.forEach(({ title, url, category, image }) => {
                console.log("Creating button with data:", { title, url, category, image });
                const div = document.createElement('div');
                div.className = 'button-entry';
                div.setAttribute('data-category', category);

                const button = document.createElement('button');
                button.setAttribute('data-url', url);
                button.setAttribute('data-category', category);
                button.classList.add('link-button');
                if (image) {
                    console.log("Adding image to button:", image);
                    // Test if the image exists
                    const testImage = new Image();
                    testImage.onload = function() {
                        console.log("Image loaded successfully:", image);
                    };
                    testImage.onerror = function() {
                        console.error("Image failed to load:", image);
                    };
                    testImage.src = image;

                    button.innerHTML = `
                        <img src="${image}" 
                            alt="Icon" 
                            style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"
                            onerror="console.error('Image failed to load in button:', this.src); this.style.display='none'">
                        ${title}
                    `;
                } else {
                    console.log("Creating button without image");
                    button.textContent = title;
                }

                const categoryLabel = document.createElement('div');
                categoryLabel.className = 'category-label';
                categoryLabel.textContent = category;

                div.appendChild(button);
                div.appendChild(categoryLabel);
                container.appendChild(div);
                console.log("Button created and added to container");
            });

            showCustomAlert('Data imported successfully!', true);
            event.target.value = ''; // Reset the file input

        } catch (error) {
            console.error('Error importing file:', error);
            showCustomAlert('Failed to import. Please check the file format.');
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

            // Check if any button belongs to this category
            const buttonsInCategory = document.querySelectorAll(`.button-entry[data-category="${category}"]`);

            if (buttonsInCategory.length > 0) {
                // showCustomAlert the user and block deletion
                showCustomAlert(`Cannot delete category "${category}" because it has associated buttons. Please move or delete them first.`);
            } else {
                // Proceed with deletion
                removeCategory(category);
            }
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
    const maxTitleLength = 12;

    if (newCategory.length > maxTitleLength) {
        showCustomAlert(`Title must not exceed ${maxTitleLength} characters.`);
        return;
    }
    if (newCategory && !categoryExists) {
        categories.push(newCategory);
        updateCategoryUI();
        input.value = '';
    } else {
        showCustomAlert('Please enter a unique category name.');
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
    // Find the category item based on the text content
    const categoryItems = document.querySelectorAll('.category-item span');
    let categoryItem = null;

    categoryItems.forEach((item) => {
        if (item.textContent.trim() === oldCategory) {
            categoryItem = item;
        }
    });

    if (!categoryItem) return;

    // Create an input box for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldCategory;
    input.style.marginRight = '5px'; // Optional: Add some spacing
    input.className = 'edit-category-input';

    // Create the "Enter" icon button
    const enterButton = document.createElement('button');
    enterButton.innerHTML = '✔'; // Enter/checkmark icon
    enterButton.className = 'enter-button';
    enterButton.disabled = true; // Initially disabled

    // Create the "Cancel" button
    const cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel'; // Cancel button text
    cancelButton.className = 'enter-button';

    // Replace the span with the input box and add the buttons
    const parent = categoryItem.parentElement;
    categoryItem.replaceWith(input);
    parent.appendChild(enterButton);
    parent.appendChild(cancelButton);

    // Automatically focus the input
    input.focus();

    // Enable the "Enter" button if the input value changes
    input.addEventListener('input', () => {
        enterButton.disabled = input.value.trim() === oldCategory;
    });

    // Cancel logic to revert changes
    const cancelNewCategory = () => {
        const restoredSpan = document.createElement('span');
        console.log('Reverting to old category:', oldCategory); // Debugging log
        restoredSpan.textContent = oldCategory;

        // Replace the input field with the original category span
        parent.replaceChild(restoredSpan, input);

        // Remove the buttons
        enterButton.remove();
        cancelButton.remove();
    };

    // Save the new category name
    const saveNewCategory = () => {
        const newCategory = input.value.trim();
        if (!newCategory) {
            showCustomAlert('Category name cannot be empty.');
            return;
        }

        // Check for duplicate category names
        if (categories.includes(newCategory) && newCategory !== oldCategory) {
            showCustomAlert('Category name must be unique.');
            return;
        }

        // Update categories array
        const index = categories.indexOf(oldCategory);
        if (index !== -1) {
            categories[index] = newCategory;
        }

        // Update category appearance in links
        const buttonEntries = document.querySelectorAll('.button-entry');
        buttonEntries.forEach((entry) => {
            const categoryLabel = entry.querySelector('.category-label');
            const buttonCategory = entry.getAttribute('data-category');

            if (buttonCategory === oldCategory) {
                entry.setAttribute('data-category', newCategory); // Update data-category attribute
                if (categoryLabel) {
                    categoryLabel.textContent = newCategory; // Update category label text
                }
            }
        });

        // Update localStorage with new category name
        let buttons = JSON.parse(localStorage.getItem('buttons')) || [];
        buttons = buttons.map((button) => {
            if (button.category === oldCategory) {
                return { ...button, category: newCategory }; // Update category in saved buttons
            }
            return button;
        });
        localStorage.setItem('buttons', JSON.stringify(buttons));

        // Update UI
        updateCategoryUI();
        filterButtons(currentCategory); // Refresh display with the new category filter

        // Remove the buttons after saving
        enterButton.remove();
        cancelButton.remove();
    };

    // Attach event listeners to buttons
    enterButton.addEventListener('click', saveNewCategory);
    cancelButton.addEventListener('click', cancelNewCategory);

    // Save on pressing Enter key
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            saveNewCategory();
        }
    });
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

function addButton(title = '', url = '', category = '',isEdit = false) {
    console.log("Add button:", title, url, category);
    const maxTitleLength = 12;
    if (!title) title = document.getElementById('buttonTitle').value;
    if (!url) url = document.getElementById('buttonUrl').value;
    if (!category) category = document.getElementById('buttonCategory').value;
    if (!title.trim() || !url.trim() || !category.trim()) {
        showCustomAlert('Please fill all fields (Title, URL, Category)');
        return;
    }

    if (title.length > maxTitleLength) {
        showCustomAlert(`Title must not exceed ${maxTitleLength} characters.`);
        return;
    }

    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*$/i;
    if (!urlRegex.test(url.trim())) {
        showCustomAlert('Please enter a valid URL');
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

    document.getElementById('buttonTitle').value = '';
    document.getElementById('buttonUrl').value = '';
    document.getElementById('buttonCategory').value = '';
    selectedIcon = '';
    tempSelectedIcon = '';
    const iconPreview = document.getElementById('iconPreview');
    iconPreview.src = '';
    iconPreview.style.display = 'none';
    console.log('Icon selection reset.');


    if(isEdit) {
        setTimeout(() => {
            chrome.runtime.reload();
        }, 2000);
    }
    closePopup();
    return div;
}

function saveButtonToLocal(buttonData) {
    let buttons = JSON.parse(localStorage.getItem('buttons')) || [];

    // Find the index of the button to update
    const existingIndex = buttons.findIndex(b =>
        b.title.trim().toLowerCase() === buttonData.title.trim().toLowerCase() &&
        b.url.trim().toLowerCase() === buttonData.url.trim().toLowerCase()
    );

    if (existingIndex > -1) {
        // Update the existing button
        buttons[existingIndex] = buttonData;
        console.log("Updated existing button:", buttonData);
    } else {
        // Add new button
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
            image: iconPath,
        };

        console.log("Saving button data:", buttonData);
        buttons.push(buttonData);
    });

    localStorage.setItem('buttons', JSON.stringify(buttons));
    console.log("All buttons saved:", buttons);
    closePopup();
}

function deleteButtonFromLocalStorage(title, url) {
    try {
        let buttons = JSON.parse(localStorage.getItem("buttons")) || [];
        console.log("Before deletion:", buttons);

        buttons = buttons.filter(button =>
            !(button.title.trim().toLowerCase() === title.trim().toLowerCase() &&
                button.url.trim().toLowerCase() === url.trim().toLowerCase())
        );

        localStorage.setItem("buttons", JSON.stringify(buttons));
        console.log("After deletion:", buttons);
    } catch (error) {
        console.error("Error in deleteButtonFromLocalStorage:", error);
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

    const allButtons = document.querySelectorAll('.button-entry');

    if (editMode) {
        // Add edit and remove buttons to all entries
        allButtons.forEach((entry) => {
            const buttonControls = document.createElement('div');
            buttonControls.className = 'button-controls';

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✎     .    .      .';
            //editBtn.className = 'editInButton';
            editBtn.style.backgroundColor = "transparent";
            editBtn.style.color = "#c91f28";
            editBtn.style.border = "none";
            editBtn.style.padding = "0px";
            editBtn.style.fontSize = "18px";
            editBtn.onclick = () => editLink(entry);

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×     .    .      .';
            //removeBtn.className = 'editInButton';
            removeBtn.style.backgroundColor = "transparent";
            removeBtn.style.color = "#c91f28";
            removeBtn.style.border = "none";
            removeBtn.style.padding = "0px";
            removeBtn.style.fontSize = "18px";
            removeBtn.onclick = () => removeLink(entry);

            buttonControls.appendChild(editBtn);
            buttonControls.appendChild(removeBtn);
            entry.appendChild(buttonControls);
        });

        document.getElementById('editToggle').style.display = 'none';
        document.getElementById('cancelEdit').style.display = 'block';
    } else {
        // Remove edit and remove buttons from all entries
        const controls = document.querySelectorAll('.button-controls');
        controls.forEach(control => control.remove());

        document.getElementById('editToggle').style.display = 'block';
        document.getElementById('cancelEdit').style.display = 'none';
    }
}

function exportData() {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allData[key] = JSON.parse(localStorage.getItem(key));
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'button_manager_data.json';
    a.click();

    showCustomAlert('Data exported successfully!');
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
    const iconPreview = document.getElementById("iconPreview");
    if (selectedIcon) {
        iconPreview.src = selectedIcon;
        iconPreview.style.display = "block";
    } else {
        iconPreview.src = "";
        iconPreview.style.display = "none";
    }

    // Show the popup
    popup.style.display = "block";
}

function closePopup() {
    const popup = document.getElementById('linkPopup');
    popup.style.display = 'none';

    // Only reset these if we're not in edit mode
    if (popupMode !== "edit") {
        document.getElementById('buttonTitle').value = '';
        document.getElementById('buttonUrl').value = '';
        document.getElementById('buttonCategory').value = '';
    }

    // Reset icon selection and preview
    selectedIcon = '';
    tempSelectedIcon = '';
    const iconPreview = document.getElementById('iconPreview');
    if (iconPreview) {
        iconPreview.src = '';
        iconPreview.style.display = 'none';
    }

    console.log('Popup closed and icon selection reset.');
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
        'icons/i13.png', 'icons/i15.png', 'icons/i16.png',
        'icons/i17.png', 'icons/i18.png', 'icons/i19.png',
        'icons/i20.png', 'icons/i21.png', 'icons/i22.png',
        'icons/i23.png', 'icons/i24.png', 'icons/i26.png', 'icons/i27.png',
        'icons/i28.png', 'icons/i29.png', 'icons/i30.png', 'icons/i31.png',
        'icons/i32.png', 'icons/i33.png', 'icons/i34.png', 'icons/i35.png',

        'icons/i36.png', 'icons/i37.png', 'icons/i38.png', 'icons/i39.png','icons/i40.png',

        'icons/i41.png', 'icons/i42.png', 'icons/i43.png', 'icons/i44.png', 'icons/i45.png',
        'icons/i46.png', 'icons/i47.png', 'icons/i48.png', 'icons/i49.png','icons/i50.png',

        'icons/i51.png', 'icons/i52.png', 'icons/i53.png', 'icons/i54.png', 'icons/i55.png',
        'icons/i56.png', 'icons/i57.png', 'icons/i58.png', 'icons/i59.png','icons/i60.png',

        'icons/i62.png', 'icons/i63.png', 'icons/i64.png', 'icons/i65.png',
        'icons/i66.png', 'icons/i67.png', 'icons/i68.png', 'icons/i69.png','icons/i70.png',

        'icons/i71.png', 'icons/i72.png', 'icons/i73.png', 'icons/i74.png', 'icons/i80.png',

        'icons/i81.png', 'icons/i82.png', 'icons/i83.png', 'icons/i84.png', 'icons/i85.png',
        'icons/i86.png', 'icons/i87.png', 'icons/i88.png',
        'icons/i89.png', 'icons/i90.png', 'icons/i91.png', 'icons/i92.png', 'icons/i93.png',
        'icons/i94.png', 'icons/i95.png', 'icons/i96.png'

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

function editLink(entry) {
    const button = entry.querySelector('button');
    const title = button.textContent.trim();
    const url = button.getAttribute('data-url');
    const category = button.getAttribute('data-category');
    console.log(url);
    // Open the popup or directly enable inline editing

    console.log("button: " + button +  " entry: " + entry + " title: " + title+ " url: " + url+ " category: " + category);

    showEditPopup(button, entry, title, url, category);
}

function removeLink(entry) {
    if (confirm('Are you sure you want to delete this link?')) {
        entry.remove();
        saveButtons(); // Save updated buttons to local storage
    }
}








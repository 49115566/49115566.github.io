document.addEventListener('DOMContentLoaded', () => {
    const dropdownInput = document.getElementById('dropdownInput');
    const dropdownOptions = document.getElementById('dropdownOptions');
    const dropdownItems = dropdownOptions.querySelectorAll('.dropdown-item');
    const dropdownArrow = document.querySelector('.dropdown-arrow');

    const topics = {
        "Anxiety": "chat/index.html?topic=Anxiety",
        "Depression": "chat/index.html?topic=Depression",
        "Stress": "chat/index.html?topic=Stress"
    };

    let activeItemIndex = -1;

    function showDropdown() {
        dropdownOptions.classList.add('show');
        dropdownArrow.classList.add('rotated');
        filterDropdown(''); // Show all options when dropdown is opened
    }

    function hideDropdown() {
        dropdownOptions.classList.remove('show');
        dropdownArrow.classList.remove('rotated');
        activeItemIndex = -1; // Reset active item
        updateActiveItem();
    }

    function filterDropdown(searchText) {
        let hasVisibleItems = false;
        dropdownItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchText.toLowerCase())) {
                item.style.display = 'block';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });
        if (hasVisibleItems) {
            dropdownOptions.classList.add('show');
        } else {
            dropdownOptions.classList.remove('show');
        }
        activeItemIndex = -1; // Reset active item on filter
        updateActiveItem();
    }

    function updateActiveItem() {
        dropdownItems.forEach((item, index) => {
            item.classList.remove('active');
            if (item.style.display === 'block' && index === activeItemIndex) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    dropdownInput.addEventListener('focus', () => {
        showDropdown();
    });

    dropdownInput.addEventListener('input', (e) => {
        filterDropdown(e.target.value);
    });

    dropdownInput.addEventListener('keydown', (e) => {
        const visibleItems = Array.from(dropdownItems).filter(item => item.style.display === 'block');
        if (visibleItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeItemIndex = (activeItemIndex + 1) % visibleItems.length;
            updateActiveItem();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeItemIndex = (activeItemIndex - 1 + visibleItems.length) % visibleItems.length;
            updateActiveItem();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeItemIndex !== -1) {
                const selectedItem = visibleItems[activeItemIndex];
                dropdownInput.value = selectedItem.textContent;
                const topic = selectedItem.dataset.value;
                if (topics[topic]) {
                    window.location.href = topics[topic];
                }
                hideDropdown();
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
            dropdownInput.blur();
        }
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            dropdownInput.value = item.textContent;
            const topic = item.dataset.value;
            if (topics[topic]) {
                window.location.href = topics[topic];
            }
            hideDropdown();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownInput.parentNode.contains(e.target)) {
            hideDropdown();
        }
    });
});

const STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];

document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById("form");
    const submitSearch = document.getElementById("searchBook");

    submitForm.addEventListener("submit", function(event) {
        event.preventDefault();
        getDataForm();
    });

    submitSearch.addEventListener("submit", function(event) {
        event.preventDefault();
        getSearchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener("ondatasaved", () => {
    console.log("Data berhasil disimpan!");
});

document.addEventListener("ondataloaded", () => {
    refreshDataFromSaves();
});

function getDataForm() {
    const id = new Date().getTime();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const year = document.getElementById('year').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const bookData = makeBook(title, author, year, isComplete);
    let target;

    const bookObject = composeBookObject(title, author, year, isComplete);

    bookData['bookId'] = bookObject.id;
    books.push(bookObject);

    if (isComplete) {
        target = 'completeBookshelfList';
    } else {
        target = 'uncompleteBookshelfList';
    }

    document.getElementById(target).appendChild(bookData);
    updateDataToStorage();
}

function makeBook(title, author, year, isComplete) {
    const textTitle = document.createElement("h1");
    textTitle.innerText = title;

    const textParagraph = document.createElement("h2");
    textParagraph.innerText = author;

    const textYear = document.createElement("h3");
    textYear.innerText = year;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner")
    textContainer.append(textTitle, textParagraph, textYear);

    const container = document.createElement("div");
    container.classList.add("item", "shadow")
    container.append(textContainer);

    if (isComplete) {
        container.append(
            createUndoButton(),
            createTrashButton()
        );
    } else {
        container.append(
            createCheckButton(),
            createTrashButton()
        );
    }

    return container;
}

function createUndoButton() {
    return createButton("undo-button", function(event) {
        uncomplete(event.target.parentElement);
    });
}

function createTrashButton() {
    return createButton("trash-button", function(event) {
        deleteDataBook(event.target.parentElement);
    });
}

function createCheckButton() {
    return createButton("check-button", function(event) {
        complete(event.target.parentElement);
    });
}

function createButton(buttonTypeClass, eventListener) {
    const button = document.createElement("button");
    button.classList.add(buttonTypeClass);
    button.addEventListener("click", function(event) {
        eventListener(event);
        event.stopPropagation();
    });
    return button;
}

function complete(taskElement) {
    const completeBook = document.getElementById('completeBookshelfList');

    const title = taskElement.querySelector(".inner > h1").innerText;
    const author = taskElement.querySelector(".inner > h2").innerText;
    const year = taskElement.querySelector(".inner > h3").innerText;

    const book = makeBook(title, author, year, true);
    completeBook.append(book);

    const findsBook = findBook(taskElement['bookId']);
    findsBook.isComplete = true;
    book['bookId'] = findsBook.id;

    taskElement.remove();
    updateDataToStorage();
}

function uncomplete(taskElement) {
    const uncompleteBook = document.getElementById('uncompleteBookshelfList');

    const title = taskElement.querySelector(".inner > h1").innerText;
    const author = taskElement.querySelector(".inner > h2").innerText;
    const year = taskElement.querySelector(".inner > h3").innerText;

    const book = makeBook(title, author, year, false);
    uncompleteBook.append(book);

    const findsBook = findBook(taskElement['bookId']);
    findsBook.isComplete = false;
    book['bookId'] = findsBook.id;

    taskElement.remove();
    updateDataToStorage();
}

function deleteDataBook(taskElement) {
    const bookPosition = findBookIndex(taskElement['bookId']);
    books.splice(bookPosition, 1);

    taskElement.remove();
    updateDataToStorage();
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert("Browser kamu tidak mendukung local storage");
        return false
    }
    return true;
}

function saveData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null) {
        books = data;
    }

    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if (isStorageExist()) {
        saveData();
    }
}

function composeBookObject(title, author, year, isComplete) {
    return {
        id: +new Date(),
        title,
        author,
        year,
        isComplete
    };
}

function findBook(bookId) {
    for (book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function refreshDataFromSaves() {
    const uncomplete = document.getElementById('uncompleteBookshelfList');
    let complete = document.getElementById('completeBookshelfList');

    for (itemBook of books) {
        const book = makeBook(itemBook.title, itemBook.author, itemBook.year, itemBook.isComplete);
        book['bookId'] = itemBook.id;

        if (itemBook.isComplete) {
            complete.append(book);
        } else {
            uncomplete.append(book);
        }
    }
}

function findBookIndex(bookId) {
    let index = 0
    for (book of books) {
        if (book.id === bookId) {
            return index;
        }
        index++;
    }
    return -1;
}

function getSearchBook() {
    let search = document.getElementById('search').value;

    let getData = document.getElementsByClassName('inner');
    for (itemBook of getData) {
        let textInBook = itemBook.innerText.toUpperCase();
        let checkSearchBook = textInBook.search(search.toUpperCase());

        if (checkSearchBook == -1) {
            itemBook.style.display = "none";
        } else {
            itemBook.style.display = "";
        }
    }
}

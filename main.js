const books = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id, title, author, year, isComplete
  }
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
 
  return -1;
}

function insertBooks(booksObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = booksObject.title;

  const textAuthor = document.createElement('h4');
  textAuthor.innerText = 'Penulis: ' + booksObject.author;

  const textYear = document.createElement('p');
  textYear.innerText = booksObject.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('item-list');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('item');
  container.append(textContainer);
  container.setAttribute('id', `book-${booksObject.id}`);

  if (booksObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
 
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(booksObject.id);
    });
 
    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
 
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(booksObject.id);
    });
 
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    
    checkButton.addEventListener('click', function () {
      snackBar();
      addBookToCompleted(booksObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
 
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(booksObject.id);
    });
    
    container.append(checkButton, trashButton);
  }
 
  return container;

}

function addBooks() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;

  const generateID = generateId();
  const booksObject = generateBookObject(generateID, title, author, year, isComplete, false);
  books.push(booksObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted (bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  dialogPromptRemove(bookTarget);
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.getElementById('searchBook').addEventListener('submit', function(e) {
  e.preventDefault();

  const searchByTitle = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookList = document.querySelectorAll('.item');

  for (const book of bookList) {
    const bookTitle = book.firstElementChild.innerText.toLowerCase();
    if (bookTitle.includes(searchByTitle)) {
      book.parentElement.style.display = 'block';
    } else {
      book.style.display = 'none';
    }
  }
});

function snackBar() {
  const message = document.getElementById('snackbar');
  message.className = 'show';
  setTimeout(function() {
    message.className = message.className.replace('show', '');
  }, 3000);
}

function dialogPromptRemove(bookTarget) {
  const sure = confirm('Anda ingin menghapus buku ini?');

  if (sure == true) {
   if (bookTarget === -1) return;

   books.splice(bookTarget, 1);
   document.dispatchEvent(new Event(RENDER_EVENT));
   saveData();
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBooks();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = insertBooks(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});
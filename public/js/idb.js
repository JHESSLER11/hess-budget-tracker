//const { response } = require("express");

let db;

const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    
    db.createObjectStore('new_transaction', { autoIncrement: true })
};

request.onsuccess = function (event) {
    db = event.target.request;
    console.log(db)

    if (navigator.onLine) {
        uploadTransaction()
    }
};
request.onerror = function(event) {
    console.log(event.target.errorCode);
}

function saveRecord(record) {
    console.log('RECORD ', record)
    console.log('DB ', db)
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    console.log('TRANSACTION ', transaction)
    const store = transaction.objectStore('new_transaction');

    store.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const store = transaction.objectStore('new_transaction');

    const getAll = store.getAll()

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'Post',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_transaction');
                transactionObjectStore.clear();
                
                alert('All saved transactions have been submitted')
            })
            .catch(err => {
                console.log(err)
            });
        }
    }
}

window.addEventListener('online', uploadTransaction)


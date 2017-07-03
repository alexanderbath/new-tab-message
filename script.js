function loadMessage(textField) {
    chrome.storage.sync.get(null, function(items) {
        console.log(items)
        var msg = items['message'];
        textField.value = msg === undefined ? 'edit this message' : msg;
    });
}

function storeMessage(message) {
    var items = {};
    items['message'] = message;
    chrome.storage.sync.set(items);
    console.log('saved');
}

function textFieldInputEventHandler(event) {
    storeMessage(event.target.value);
}

function debounce(callback, ms) {
    var id = null;
    return function(event) {
        clearTimeout(id);
        id = setTimeout(callback.bind(window, event), ms);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var textField = document.getElementById('message');
    loadMessage(textField);

    // Debounce listener to prevent exceeding chrome MAX_WRITE_OPERATIONS_PER_MINUTE for storage.sync
    // 500ms is the min delay to prevent exceeding on any possible input
    // but closing the tab within the window of 500ms after typing will result in data loss
    // 200ms is a compromise
    textField.addEventListener('input', debounce(textFieldInputEventHandler, 200));

    chrome.storage.onChanged.addListener(function() {
        // If you load while the user is typing – it can potentially erase recent input,
        // since input listener is debounced.
        // If the textField is not active, then there is no input there.
        // Like in another window / tab.
        if (textField === document.activeElement) return;
        loadMessage(textField);
    });
})